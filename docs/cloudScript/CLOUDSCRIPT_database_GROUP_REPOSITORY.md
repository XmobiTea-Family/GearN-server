# CLOUDSCRIPT DATABASE GROUP_REPOSITORY

## 1. Mục đích

File này chỉ tập trung vào `database.groupRepository` trong cloud script.

## 2. Các hàm

<!-- prettier-ignore -->
| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `createGroupAsync(rawGroup: mongodb.WithId<mongodb.Document> & { groupId: string; groupType: OwnerType; catalogId: string; members: MemberItem[]; groupDatas: Record<string, DataValueType>; groupCurrencies: Record<string, CurrencyItem>; groupStatistics: Record<string, StatisticsItem>; groupInventories: InventoryItem[]; removeStatus: RemoveStatusItem; segments: string[]; customDatas: Record<string, DataValueType>; tsCreate: number; displayName: string; displayNameNormalize: string; avatar: AvatarItem; tags: Record<string, string>;}, gameId: string, session?: mongodb.ClientSession): Promise<Group>` | `database.groupRepository.createGroupAsync(rawGroup, gameId, session?)` |
| `loadGroupAsync(groupId: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Group>` | `database.groupRepository.loadGroupAsync(groupId, gameId, groupFindOptions?)` |
| `loadGroupsWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>>` | `database.groupRepository.loadGroupsWithSegmentAsync(segment, skip, limit, gameId, groupFindOptions?)` |
| `loadGroupsWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>>` | `database.groupRepository.loadGroupsWithTagAsync(key, value, skip, limit, gameId, groupFindOptions?)` |
| `loadGroupsWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>>` | `database.groupRepository.loadGroupsWithDisplayNameNormalizeRegexAsync(keyword, skip, limit, gameId, groupFindOptions?)` |
| `loadGroupsLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, direction: -1 \| 1, groupFindOptions?: GroupFindOptions): Promise<Array<Group>>` | `database.groupRepository.loadGroupsLeaderboardWithStatisticsAsync(key, skip, limit, catalogId, gameId, direction, groupFindOptions?)` |
| `loadGroupsLeaderboardWithStatisticsAllAsync(key: string, catalogId: string, gameId: string, direction: -1 \| 1, groupFindOptions?: GroupFindOptions): Promise<Array<Group>>` | `database.groupRepository.loadGroupsLeaderboardWithStatisticsAllAsync(key, catalogId, gameId, direction, groupFindOptions?)` |
| `loadGroupsLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>>` | `database.groupRepository.loadGroupsLeaderboardWithCreateAsync(skip, limit, gameId, groupFindOptions?)` |
| `loadGroupsLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>>` | `database.groupRepository.loadGroupsLeaderboardWithCurrenciesAsync(key, skip, limit, catalogId, gameId, groupFindOptions?)` |
| `loadPositionGroupLeaderboardWithStatisticsAsync(key: string, groupId: string, catalogId: string, gameId: string, initialValue: number, direction: -1 \| 1): Promise<number>` | `database.groupRepository.loadPositionGroupLeaderboardWithStatisticsAsync(key, groupId, catalogId, gameId, initialValue, direction)` |
| `loadGroupMessagesAsync(groupId: string, gameId: string, skip: number, limit: number): Promise<mongodb.FindCursor<mongodb.WithId<mongodb.Document>>>` | `database.groupRepository.loadGroupMessagesAsync(groupId, gameId, skip, limit)` |
| `createGroupMessageAsync(groupId: string, gameId: string, senderId: string, senderType: number, message: string, tsCreate: number): Promise<mongodb.Document>` | `database.groupRepository.createGroupMessageAsync(groupId, gameId, senderId, senderType, message, tsCreate)` |
| `insertGroupStatisticsLogsAsync(requests: { groupId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string;}[], gameId: string): Promise<void>` | `database.groupRepository.insertGroupStatisticsLogsAsync(requests, gameId)` |
| `insertGroupCurrencyLogsAsync(requests: { groupId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string;}[], gameId: string): Promise<void>` | `database.groupRepository.insertGroupCurrencyLogsAsync(requests, gameId)` |
| `loadGroupStatisticsLogAsync(filter: {}, gameId: string, limit: number): Promise<mongodb.FindCursor<mongodb.WithId<mongodb.Document>>>` | `database.groupRepository.loadGroupStatisticsLogAsync(filter, gameId, limit)` |
| `loadGroupCurrencyLogAsync(filter: {}, gameId: string, limit: number): Promise<mongodb.FindCursor<mongodb.WithId<mongodb.Document>>>` | `database.groupRepository.loadGroupCurrencyLogAsync(filter, gameId, limit)` |

có thể tham khảo thêm
[GroupRepository.d.ts](dist/GN-library/xdatabase/lib/GroupRepository.d.ts)
