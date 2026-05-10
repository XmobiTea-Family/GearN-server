# Matchmaking Test Plan

## Scope

Test trực tiếp logic tạo candidate match từ queue settings và danh sách ticket.

Method under test:

```ts
let matchmakingService = new MatchmakingService();
let candidates = matchmakingService.getMatchmakingTicketCanMatchs(queueSettings, matchmakingTickets);
```

Không nằm trong scope:

- Give-up timeout.
- MongoDB persistence.
- `createMatch`.
- Server allocation.
- API handler validation.

## Common Test Setup

- Tạo `queueSettings` bằng helper `createQueueSettings(...)`.
- Tạo ticket bằng helper `singleMemberTicket(...)` hoặc `partyTicket(...)`.
- Ticket trong test phải có `status = MatchmakingTicketStatus.WaitingForMatch`.
- Member trong ticket phải có `status = MatchmakingMemberStatus.Joined`.
- Rule data phải nằm trong `member.attributeForQueue`, vì matcher dùng field này để so rule.

Mỗi test cần assert output thật của candidate:

- `ticketIds`.
- `memberIds`.
- `matchmakingTicketTeams`.
- `status == MatchmakingTicketStatus.Matched`.
- Không vượt `matchSize.max`.
- Không vượt từng `teamSize.max`.

## Baseline Without Rules

## Attribute Fixture Requirements

Nếu test có dùng attribute, attribute không được quá đơn giản. Test data phải có nested object, array, missing field, default fallback, party nhiều member, và nhiều field không liên quan để chắc chắn matcher đọc đúng rule key.

Matcher hiện tại so rule bằng `member.attributeForQueue[rules.name]`. Vì vậy mỗi rule test phải tạo `attributeForQueue` rõ ràng theo rule name, đồng thời tạo thêm raw `attribute` và noise data để bắt lỗi đọc nhầm field.

Recommended raw attribute shape:

```ts
{
    profile: {
        rank: {
            tier: "gold",
            division: 2,
            mmr: 1540
        },
        region: {
            primary: "sg",
            fallback: "hk"
        }
    },
    matchmaking: {
        mode: "ranked-duo",
        skill: 1540,
        latency: {
            region: "sg",
            ping: 42,
            jitter: 5,
            packetLoss: 0.01
        },
        maps: ["temple", "harbor", "metro"],
        roles: ["tank", "support"],
        score: 6
    },
    noise: {
        modeRule: "casual",
        skillRule: 9999,
        mapRule: ["wrong-map"],
        regionRule: {
            region: "wrong",
            ping: 999
        },
        matchScoreRule: 9999
    }
}
```

Recommended `attributeForQueue` shape:

```ts
{
    modeRule: "ranked-duo:sg",
    skillRule: 1540,
    regionRule: {
        region: "sg",
        ping: 42,
        jitter: 5
    },
    mapRule: ["temple", "harbor", "metro"],
    teamSkillRule: 1540,
    matchScoreRule: 6,
    unrelatedMode: "casual",
    unrelatedSkill: 9999,
    unrelatedMaps: ["wrong-map"]
}
```

Mandatory attribute expectations:

- Mỗi rule đọc attribute phải có ít nhất một case chứng minh matcher không đọc nhầm `noise` hoặc `unrelated*`.
- Mỗi rule đọc attribute phải có ít nhất một case missing rule key để kiểm tra `defaultValue` hoặc behavior missing hiện tại.
- Party ticket phải có ít nhất một case nhiều member có attribute khác nhau để xác nhận rule nào chỉ đọc `members[0]`, rule nào cộng tất cả member.
- Array attribute phải có duplicate value, empty array, và value không liên quan.
- Region attribute phải có field phụ như `jitter`/`packetLoss`; matcher chỉ được dùng `region` và `ping`.
- Numeric attribute phải có noise value rất lớn để bắt lỗi đọc sai key.

Per-rule attribute complexity:

- `StringRule`: dung string co namespace ro rang nhu `ranked-duo:sg`, them `noise.modeRule` khac value, va test missing key fallback ve `defaultValue`.
- `DifferenceRule`: dung number gan nhau va xa nhau, them `noise.skillRule = 9999` de bat loi doc nham.
- `RegionSelectionRule`: dung object `{ region, ping }`, them `jitter`, `packetLoss`, va nested raw region khac.
- `SetIntersectionRule`: dung array co nhieu value, duplicate value, empty array, va wrong/noise array.
- `MatchTotalRule`: dung score tren nhieu member, co member thieu score, co noise score lon de chac chan tong chi lay rule key.
- `TeamDifferenceRule`: dung team score tren party nhieu member, moi member co score khac nhau, va co default fallback.
- `TeamSizeBalanceRule`: rule khong doc attribute, nhung ticket van phai co complex attribute de chac chan balance logic khong bi attribute anh huong.
- `TeamTicketSizeSimilarityRule`: rule khong doc attribute, nhung party members phai co attribute khac nhau de chac chan rule chi dua vao ticket size.

## Mandatory Rule Coverage Matrix

Moi rule type phai co dung it nhat 20 test case rieng. Moi rule phai bao phu du 3 nhom ket qua:

- Full match: tat ca ticket trong input duoc ghep dung theo expected candidate.
- No match: khong co candidate hop le nao.
- Partial match: chi mot phan ticket trong input duoc ghep, cac ticket con lai bi loai bo do rule, size, team, hoac capacity.

Moi test case phai tao `queueSettings`, tao `matchmakingTickets`, goi truc tiep `new MatchmakingService().getMatchmakingTicketCanMatchs(queueSettings, matchmakingTickets)`, sau do assert output candidate that: `ticketIds`, `memberIds`, `matchmakingTicketTeams`, `status`, va size/capacity.

### StringRule 20 Cases

1. Full match: `Equals`, 2 solo tickets cung value.
2. No match: `Equals`, 2 solo tickets khac value.
3. Partial match: 3 solo tickets, A/B cung value, C khac value; chi A/B match.
4. Full match: `NotEquals`, 2 solo tickets khac value.
5. No match: `NotEquals`, 2 solo tickets cung value.
6. Partial match: `NotEquals`, A khac B, A cung C; chi A/B match.
7. Full match: ca hai ticket thieu attribute, rule dung cung `defaultValue`.
8. Full match: mot ticket thieu attribute, ticket con lai bang `defaultValue`.
9. No match: mot ticket thieu attribute, ticket con lai khac `defaultValue`.
10. Partial match: 4 tickets chia thanh 2 cap cung string value; moi cap tao candidate rieng, khong cross-match.
11. Full match: party ticket va solo ticket co `members[0].attributeForQueue` cung value.
12. No match: party ticket va solo ticket co `members[0].attributeForQueue` khac value.
13. Partial match: party A match solo B, solo C cung queue nhung khac value bi loai.
14. Full match: custom expansion override seed value de match ticket tiep theo.
15. No match: custom expansion chua den thoi diem override, value van khac.
16. Full match: custom expansion vuot index thi dung override cuoi cung va match.
17. Full match: `secondsUntilOptional` da qua, hai ticket khac value van match.
18. No match: `secondsUntilOptional` chua qua, hai ticket khac value bi reject.
19. Partial match: nhieu ticket cung value nhung `matchSize.max` chi cho phep mot subset duoc add.
20. Partial match: nhieu team, ticket cung string value nhung mot ticket bi loai do `teamSize.max`.

### DifferenceRule 20 Cases

1. Full match: chenh lech nho hon `allowedDifference`.
2. Full match: chenh lech bang dung `allowedDifference`.
3. No match: chenh lech lon hon `allowedDifference` mot don vi.
4. Partial match: A/B trong delta, C ngoai delta; chi A/B match.
5. Full match: ca hai ticket thieu attribute, cung dung `defaultValue`.
6. Full match: mot ticket thieu attribute, ticket con lai nam trong delta so voi `defaultValue`.
7. No match: mot ticket thieu attribute, ticket con lai vuot delta so voi `defaultValue`.
8. Partial match: 4 tickets tao 2 cum skill rieng, chi match trong tung cum.
9. Full match: party ticket va solo ticket nam trong delta theo member dau tien.
10. No match: party ticket va solo ticket vuot delta theo member dau tien.
11. Partial match: party A match solo B, solo C vuot delta bi loai.
12. Full match: linear expansion tang delta du de match.
13. No match: linear expansion chua tang du, van reject.
14. No match: linear expansion bi chan boi `limit`, van khong du delta.
15. Full match: custom expansion override delta du de match.
16. No match: custom expansion override delta van thieu.
17. Full match: custom expansion vuot index thi dung override cuoi cung.
18. Full match: `secondsUntilOptional` da qua, chenh lech lon van match.
19. No match: `secondsUntilOptional` chua qua, chenh lech lon bi reject.
20. Partial match: nhieu ticket trong delta nhung `matchSize.max` chi cho phep mot subset.

### RegionSelectionRule 20 Cases

1. Full match: cung region, ping ca hai <= `max`.
2. No match: khac region, ping hop le.
3. No match: cung region, seed ping > `max`.
4. No match: cung region, next ping > `max`.
5. No match: seed thieu region data.
6. No match: next thieu region data.
7. Partial match: A/B cung region va ping hop le, C khac region bi loai.
8. Partial match: A/B cung region, C cung region nhung ping cao bi loai.
9. Full match: ping bang dung `max`.
10. Full match: linear expansion tang latency limit du de match.
11. No match: linear expansion chua tang du, ping van qua cao.
12. No match: linear expansion dat `limit` nhung ping van cao hon limit.
13. Full match: custom expansion override latency du de match.
14. No match: custom expansion override latency van thieu.
15. Full match: custom expansion vuot index thi dung override cuoi cung.
16. Full match: `secondsUntilOptional` da qua, khac region van match.
17. Full match: `secondsUntilOptional` da qua, ping rat cao van match.
18. No match: `secondsUntilOptional` chua qua, khac region bi reject.
19. Partial match: nhieu ticket cung region nhung `matchSize.max` chi cho phep mot subset.
20. Partial match: nhieu team, ticket hop region nhung mot ticket bi loai do `teamSize.max`.

### SetIntersectionRule 20 Cases

1. Full match: overlap lon hon `min`.
2. Full match: overlap bang dung `min`.
3. No match: overlap nho hon `min`.
4. No match: khong co overlap.
5. Partial match: A/B du overlap, C khong du overlap; chi A/B match.
6. Full match: ca hai ticket thieu attribute va `defaultValue` co du overlap.
7. Full match: mot ticket thieu attribute, ticket con lai overlap du voi `defaultValue`.
8. No match: mot ticket thieu attribute, `defaultValue` khong du overlap.
9. Partial match: 4 tickets tao 2 cum map rieng, chi match trong tung cum.
10. Full match: party ticket va solo ticket du overlap theo member dau tien.
11. No match: party ticket va solo ticket khong du overlap theo member dau tien.
12. Partial match: party A match solo B, solo C thieu overlap bi loai.
13. Full match: linear expansion giam `min` du de match.
14. No match: linear expansion chua giam du, van reject.
15. Full match: linear expansion giam `min` xuong 0, bat ky set nao cung match.
16. Full match: custom expansion override `min` du de match.
17. No match: custom expansion override `min` van qua cao.
18. Full match: custom expansion vuot index thi dung override cuoi cung.
19. Full match: `secondsUntilOptional` da qua, khong overlap van match.
20. Partial match: nhieu ticket du overlap nhung `matchSize.max` chi cho phep mot subset.

### MatchTotalRule 20 Cases

1. Full match: tong score nam trong `[min, max]`.
2. Full match: tong score bang dung `min`.
3. Full match: tong score bang dung `max`.
4. No match: tong score nho hon `min`.
5. No match: tong score lon hon `max`.
6. Partial match: A/B tao tong hop le, them C lam vuot `max`; chi A/B match.
7. Partial match: A/B tao tong hop le, C khong duoc add do lam tong vuot max.
8. No match: moi candidate co tong duoi `min`.
9. Full match: party ticket gom nhieu member, tong tat ca member nam trong bound.
10. No match: party ticket gom nhieu member, tong vuot `max`.
11. Full match: member thieu attribute khong duoc cong, tong con lai van hop le.
12. No match: member thieu attribute khong duoc cong lam tong duoi `min`.
13. Full match: custom `overrideMin` ha min du de match.
14. No match: custom `overrideMin` van cao, khong match.
15. Full match: custom `overrideMax` nang max du de match.
16. No match: custom `overrideMax` van thap, khong match.
17. Full match: override min/max vuot index thi dung gia tri cuoi cung.
18. Full match: `secondsUntilOptional` da qua, tong ngoai bound van match.
19. No match: `secondsUntilOptional` chua qua, tong ngoai bound bi reject.
20. Partial match: nhieu team co tong hop le nhung mot ticket bi loai do `teamSize.max`.

### TeamSizeBalanceRule 20 Cases

1. Full match: 2 team co cung so member, `allowedDifference = 0`.
2. Full match: 2 team lech dung `allowedDifference`.
3. No match: 2 team lech hon `allowedDifference`.
4. Partial match: A/B tao team balance, C lam unbalance nen bi loai.
5. Full match: 3 team co cung so member.
6. Full match: 3 team lech max-min bang dung `allowedDifference`.
7. No match: 3 team lech max-min vuot `allowedDifference`.
8. Partial match: 3 team, chi subset ticket tao duoc spread hop le.
9. Full match: party size 2 vs party size 2.
10. No match: party size 2 vs solo size 1 voi `allowedDifference = 0`.
11. Full match: party size 2 vs solo size 1 voi `allowedDifference = 1`.
12. Partial match: nhieu solo tickets, matcher fill du 2 team balance, ticket du bi loai do `matchSize.max`.
13. No match: mot team khong dat `teamSize.min`.
14. No match: mot team vuot `teamSize.max`.
15. Full match: linear expansion tang allowed difference du de match.
16. No match: linear expansion chua tang du, van reject.
17. No match: linear expansion bi chan boi `limit`, van reject.
18. Full match: custom expansion override allowed difference du de match.
19. No match: custom expansion override van thieu.
20. Full match: `secondsUntilOptional` da qua, team size unbalance van match.

### TeamDifferenceRule 20 Cases

1. Full match: tong score giua 2 team bang nhau.
2. Full match: tong score lech dung `allowedDifference`.
3. No match: tong score lech hon `allowedDifference`.
4. Partial match: A/B tao team score hop le, C lam lech qua muc bi loai.
5. Full match: 3 team co tong score bang nhau.
6. Full match: 3 team co max-min bang dung `allowedDifference`.
7. No match: 3 team co max-min vuot `allowedDifference`.
8. Partial match: 3 team, chi subset ticket tao score spread hop le.
9. Full match: party ticket nhieu member, score team la tong tat ca member.
10. No match: party ticket nhieu member lam team score vuot delta.
11. Full match: member thieu attribute dung `defaultValue`, tong van hop le.
12. No match: member thieu attribute dung `defaultValue`, tong vuot delta.
13. Partial match: mot ticket thieu attribute match duoc voi B, ticket C co score qua cao bi loai.
14. Full match: linear expansion tang allowed difference du de match.
15. No match: linear expansion chua tang du.
16. No match: linear expansion dat `limit` nhung van khong du.
17. Full match: custom expansion override allowed difference du de match.
18. No match: custom expansion override van thieu.
19. Full match: custom expansion vuot index thi dung override cuoi cung.
20. Full match: `secondsUntilOptional` da qua, team score unbalance van match.

### TeamTicketSizeSimilarityRule 20 Cases

1. Full match: 1v1, solo vs solo.
2. Full match: 2v2, party size 2 vs party size 2.
3. Full match: 3v3, party size 3 vs party size 3.
4. No match: party size 2 vs solo size 1.
5. No match: party size 3 vs party size 2.
6. Partial match: A party size 2 match B party size 2, C solo bi loai.
7. Partial match: A solo match B solo, C party size 2 bi loai.
8. Full match: 2 teams moi team nhan nhieu tickets co pattern ticket size giong nhau.
9. No match: 2 teams co tong member bang nhau nhung ticket-size pattern khac nhau.
10. Partial match: nhieu tickets co cung size nhung `matchSize.max` chi cho phep mot subset.
11. No match: ticket size hop rule nhung mot team khong dat `teamSize.min`.
12. No match: ticket size hop rule nhung mot team vuot `teamSize.max`.
13. Full match: queue 3 team, moi team nhan party cung size.
14. No match: queue 3 team, mot team nhan ticket khac size.
15. Partial match: queue 3 team, hai team match duoc, ticket cho team thu ba khac size bi loai nen candidate fail neu thieu team min.
16. Full match: seed team co last ticket size duoc so voi ticket sang team khac va bang nhau.
17. No match: seed team co last ticket size khac ticket sang team khac.
18. Full match: `secondsUntilOptional` da qua, party size khac nhau van match neu size/team bounds hop le.
19. No match: `secondsUntilOptional` chua qua, party size khac nhau bi reject.
20. Partial match: sau optional timeout, mot subset ticket khac size match duoc, ticket con lai bi loai do `matchSize.max`.

### FullRuleSet 20 Cases

1. Full match: 2 party tickets pass tat ca rules cung luc.
2. No match: fail rieng `StringRule`, cac rule con lai deu hop le.
3. No match: fail rieng `DifferenceRule`, cac rule con lai deu hop le.
4. No match: fail rieng `RegionSelectionRule`, cac rule con lai deu hop le.
5. No match: fail rieng `SetIntersectionRule`, cac rule con lai deu hop le.
6. No match: fail `MatchTotalRule` do tong diem nho hon `min`.
7. No match: fail `MatchTotalRule` do tong diem lon hon `max`.
8. No match: fail `TeamSizeBalanceRule` sau khi `TeamTicketSizeSimilarityRule` da optional.
9. No match: fail `TeamDifferenceRule`, cac rule pairwise deu hop le.
10. No match: fail `TeamTicketSizeSimilarityRule`, cac rule team/score con lai deu hop le.
11. Partial match: A/B hop le, C fail string nen bi loai.
12. Partial match: nhieu party hop le nhung `matchSize.max` chi cho phep mot subset.
13. Full match: 3 team can bang, tat ca rules cung bat.
14. No match: 3 team fail spread diem team.
15. Full match: nhieu expansion cung luc lam candidate hop le.
16. No match: chua du thoi gian de cac expansion co hieu luc.
17. Full match: tat ca rules co optional timeout da qua, du lieu sai van match.
18. No match: optional timeout chua qua, du lieu sai bi reject.
19. Full match: dung default value cua string/difference/set/team-difference trong setup full rules.
20. Partial match: 2 cluster hop le rieng biet, khong cross-match sai cluster.

## Baseline Without Rules

### Match Simple Tickets

Input:

- `matchSize = { min: 2, max: 2 }`.
- 3 single-member tickets.

Expected:

- Có candidate chứa ticket đầu và ticket thứ hai.
- Candidate có đúng 2 members.
- Ticket thứ ba không bị nhét vào cùng candidate.

### Match Size Minimum

Input:

- `matchSize.min = 2`.
- Chỉ có 1 single-member ticket.

Expected:

- Không có candidate hợp lệ.

### Match Size Maximum

Input:

- `matchSize.max = 2`.
- 3 single-member tickets.

Expected:

- Không candidate nào vượt 2 members.

### Team Capacity

Input:

- Queue có nhiều team.
- Ticket party có size lớn hơn `teamSize.max` của một team.

Expected:

- Ticket chỉ được đưa vào team còn đủ capacity.
- Nếu không team nào đủ capacity thì không tạo candidate từ ticket đó.

## StringRule

### Equals Match

Input:

- Rule `String`, `compairType = Equals`.
- Ticket A và ticket B cùng value.

Expected:

- Có candidate chứa A và B.

### Equals Reject

Input:

- Rule `String`, `compairType = Equals`.
- Ticket A và ticket B khác value.

Expected:

- Không có candidate chứa A và B.

### NotEquals Match

Input:

- Rule `String`, `compairType = NotEquals`.
- Ticket A và ticket B khác value.

Expected:

- Có candidate chứa A và B.

### NotEquals Reject

Input:

- Rule `String`, `compairType = NotEquals`.
- Ticket A và ticket B cùng value.

Expected:

- Không có candidate chứa A và B.

### Default Value

Input:

- Một hoặc cả hai ticket thiếu attribute.
- Rule có `defaultValue`.

Expected:

- Matcher dùng `defaultValue` để so sánh.

### Optional After Timeout

Input:

- Ticket seed đã chờ lâu hơn `secondsUntilOptional`.
- Hai ticket vi phạm string rule.

Expected:

- Rule không chặn candidate nữa.

### Custom Expansion

Input:

- Rule có `advancedSettings.expansionType = Custom`.
- `overrideValue` thay đổi theo thời gian chờ.

Expected:

- Value so sánh của ticket seed được override theo expansion.

## DifferenceRule

### Difference Within Delta

Input:

- Chênh lệch attribute giữa hai ticket bằng hoặc nhỏ hơn `allowedDifference`.

Expected:

- Có candidate chứa hai ticket.

### Difference Exceeds Delta

Input:

- Chênh lệch lớn hơn `allowedDifference`.

Expected:

- Không có candidate chứa hai ticket.

### Default Value

Input:

- Ticket thiếu numeric attribute.
- Rule có `defaultValue`.

Expected:

- Matcher dùng `defaultValue`.

### Linear Expansion

Input:

- Ban đầu chênh lệch vượt `allowedDifference`.
- Ticket seed đã chờ đủ để delta tăng theo `linearExpansions`.

Expected:

- Candidate được tạo sau khi delta đã được mở rộng.

### Linear Limit

Input:

- Linear expansion có `limit`.
- Thời gian chờ rất lớn.

Expected:

- Delta không vượt `limit`.

### Custom Expansion

Input:

- Rule dùng `customExpansions.overrideValue`.

Expected:

- Delta lấy theo index expansion hiện tại.

### Optional After Timeout

Input:

- Ticket seed đã chờ lâu hơn `secondsUntilOptional`.
- Hai ticket vi phạm difference rule.

Expected:

- Rule không chặn candidate nữa.

## RegionSelectionRule

### Same Region And Valid Ping

Input:

- Hai ticket cùng `region`.
- Ping của cả hai nhỏ hơn hoặc bằng `max`.

Expected:

- Có candidate chứa hai ticket.

### Different Region

Input:

- Hai ticket khác `region`.

Expected:

- Không có candidate chứa hai ticket.

### Ping Too High

Input:

- Cùng region.
- Một ticket có ping lớn hơn `max`.

Expected:

- Không có candidate chứa hai ticket.

### Missing Region Data

Input:

- Một ticket thiếu region attribute.

Expected:

- Không có candidate chứa hai ticket.

### Linear Expansion

Input:

- Ping ban đầu vượt `max`.
- Ticket seed đã chờ đủ để `maximumLatency` tăng.

Expected:

- Candidate được tạo khi latency limit đã mở rộng đủ.

### Custom Expansion

Input:

- Rule dùng `customExpansions.overrideValue`.

Expected:

- `maximumLatency` lấy theo expansion hiện tại.

### Optional After Timeout

Input:

- Ticket seed đã chờ lâu hơn `secondsUntilOptional`.
- Hai ticket khác region hoặc ping quá cao.

Expected:

- Rule không chặn candidate nữa.

## SetIntersectionRule

### Enough Overlap

Input:

- Hai ticket có số phần tử giao nhau lớn hơn hoặc bằng `min`.

Expected:

- Có candidate chứa hai ticket.

### Not Enough Overlap

Input:

- Số phần tử giao nhau nhỏ hơn `min`.

Expected:

- Không có candidate chứa hai ticket.

### Default Value

Input:

- Ticket thiếu array attribute.
- Rule có `defaultValue`.

Expected:

- Matcher dùng `defaultValue`.

### Linear Expansion

Input:

- Ban đầu overlap không đủ.
- Ticket seed đã chờ đủ để `min` giảm theo linear expansion.

Expected:

- Candidate được tạo khi `min` đã giảm đủ.

### Custom Expansion

Input:

- Rule dùng `customExpansions.overrideValue`.

Expected:

- `min` lấy theo expansion hiện tại.

### Optional After Timeout

Input:

- Ticket seed đã chờ lâu hơn `secondsUntilOptional`.
- Hai ticket không đủ overlap.

Expected:

- Rule không chặn candidate nữa.

## MatchTotalRule

### Total Within Bounds

Input:

- Tổng attribute của toàn bộ members nằm trong `[min, max]`.

Expected:

- Có candidate hợp lệ.

### Total Below Min

Input:

- Tổng attribute nhỏ hơn `min`.

Expected:

- Không có candidate.

### Total Above Max

Input:

- Tổng attribute lớn hơn `max`.

Expected:

- Không có candidate.

### Missing Attribute

Input:

- Một member thiếu attribute.

Expected:

- Theo code hiện tại, missing value không được cộng vào tổng.

### Custom Override Min

Input:

- Rule có `customExpansions.overrideMin`.
- Ticket seed đã chờ đủ thời gian expansion.

Expected:

- `min` được thay đổi theo expansion.

### Custom Override Max

Input:

- Rule có `customExpansions.overrideMax`.
- Ticket seed đã chờ đủ thời gian expansion.

Expected:

- `max` được thay đổi theo expansion.

### Optional After Timeout

Input:

- Ticket seed đã chờ lâu hơn `secondsUntilOptional`.
- Candidate vi phạm total bound.

Expected:

- Rule không chặn candidate nữa.

## TeamSizeBalanceRule

### Team Size Balanced

Input:

- Chênh lệch số member giữa team nhỏ hơn hoặc bằng `allowedDifference`.

Expected:

- Có candidate hợp lệ.

### Team Size Unbalanced

Input:

- Chênh lệch số member giữa team lớn hơn `allowedDifference`.

Expected:

- Không có candidate.

### Two Teams With 3 Members

Input:

- Team Red có 2 members.
- Team Blue có 1 member.
- `allowedDifference = 1`.

Expected:

- Candidate hợp lệ.

### Strict Balance Reject

Input:

- Team Red có 2 members.
- Team Blue có 1 member.
- `allowedDifference = 0`.

Expected:

- Không có candidate.

### Linear Expansion

Input:

- Ban đầu team size lệch quá mức.
- Ticket seed đã chờ đủ để allowed difference tăng.

Expected:

- Candidate được tạo sau expansion.

### Custom Expansion

Input:

- Rule dùng `customExpansions.overrideValue`.

Expected:

- Allowed difference lấy theo expansion hiện tại.

### Optional After Timeout

Input:

- Ticket seed đã chờ lâu hơn `secondsUntilOptional`.
- Team size vi phạm rule.

Expected:

- Rule không chặn candidate nữa.

## TeamDifferenceRule

### Team Score Balanced

Input:

- Tổng score giữa các team lệch nhỏ hơn hoặc bằng `allowedDifference`.

Expected:

- Có candidate hợp lệ.

### Team Score Unbalanced

Input:

- Tổng score giữa các team lệch lớn hơn `allowedDifference`.

Expected:

- Không có candidate.

### Party Score Sum

Input:

- Một ticket có nhiều members trong cùng team.

Expected:

- Team score phải cộng tất cả members trong team.

### Default Value

Input:

- Member thiếu attribute.
- Rule có `defaultValue`.

Expected:

- Matcher dùng `defaultValue`.

### Linear Expansion

Input:

- Ban đầu team score lệch quá mức.
- Ticket seed đã chờ đủ để allowed difference tăng.

Expected:

- Candidate được tạo sau expansion.

### Custom Expansion

Input:

- Rule dùng `customExpansions.overrideValue`.

Expected:

- Allowed difference lấy theo expansion hiện tại.

### Optional After Timeout

Input:

- Ticket seed đã chờ lâu hơn `secondsUntilOptional`.
- Team score vi phạm rule.

Expected:

- Rule không chặn candidate nữa.

## TeamTicketSizeSimilarityRule

### Same Ticket Size Across Teams

Input:

- Team Red nhận party size 2.
- Team Blue nhận party size 2.

Expected:

- Có candidate hợp lệ.

### Different Ticket Size Across Teams

Input:

- Team Red nhận party size 2.
- Team Blue nhận solo size 1.

Expected:

- Không có candidate.

### Optional After Timeout

Input:

- Ticket seed đã chờ lâu hơn `secondsUntilOptional`.
- Hai team nhận ticket khác size.

Expected:

- Rule không chặn candidate nữa.

## Regression Cases

### Rule-Based Candidate Must Not Overfill

Input:

- Queue có rule bất kỳ.
- `matchSize.max = 2`.
- Có 3 ticket đều pass rule.

Expected:

- Candidate không được vượt 2 members.
- Candidate đầu vẫn hợp lệ với 2 ticket đầu.

### Team Candidate Must Not Overfill

Input:

- Queue có teams.
- Team đã có committed members và temp members.
- Ticket tiếp theo làm vượt `teamSize.max`.

Expected:

- Ticket đó không được thêm vào team.

### Overlapping Candidates

Input:

- Hai candidate cùng chứa một ticket.

Expected:

- Sau bước remove overlap, chỉ candidate đầu được giữ.

## Done Definition

- Tất cả rule types có ít nhất một accept case và một reject case.
- Expansion và optional timeout được test cho rule có hỗ trợ.
- Output candidate được assert theo dữ liệu thật, không chỉ assert số lượng.
- `npm test` pass.
- `npx tsc -p tsconfig.json --noEmit` pass.
