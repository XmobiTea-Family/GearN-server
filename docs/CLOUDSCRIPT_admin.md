# CLOUDSCRIPT ADMIN

## 1. Mục đích

File này chỉ tập trung vào `admin` trong cloud script.

Nếu bạn cần tài liệu tổng quan cloud script, xem:

- [CLOUDSCRIPT_USAGE.md](../CLOUDSCRIPT_USAGE.md)

## 2. `admin` thực chất là gì

Trong cloud script, `admin` là CloudScript-safe wrapper cho public SDK `GNNetwork`.

Lý do tồn tại:

- Submitted script không được chứa literal `GNNetwork`.
- Nhưng runtime vẫn cần một cách gọi lại official GearN API.
- `CloudScriptAdmin.ts` bọc lại các API cần dùng để script gọi được mà không đụng trực tiếp `GNNetwork`.

Mapping chính:

- `admin.characterPlayer` -> `GNNetwork.characterPlayer.admin`
- `admin.content` -> `GNNetwork.content.admin`
- `admin.gamePlayer` -> `GNNetwork.gamePlayer.admin`
- `admin.group` -> `GNNetwork.group.admin`
- `admin.inventory` -> `GNNetwork.inventory.admin`
- `admin.masterPlayer` -> `GNNetwork.masterPlayer.admin`
- `admin.storeInventory` -> `GNNetwork.storeInventory.admin`
- `admin.multiplayer` -> `GNNetwork.multiplayer.admin`
- `admin.cloudScript` -> `GNNetwork.cloudScript.admin`
- `admin.dashboard` -> map tay từ `GNNetwork.dashboard.<method>`

Ngoài ra còn có:

- `admin.send(...)`
- `admin.sendAsync(...)`

## 3. Khi nào dùng `admin`

Dùng `admin` khi:

- Behavior bạn cần đã tồn tại trong official GearN API.
- Bạn muốn reuse validation, permission flow, request/response model, business rule có sẵn.
- Bạn đang làm việc theo mindset backoffice/GM/tooling/migration, không phải raw database patch.
- Bạn đang thao tác với domain như `gamePlayer`, `characterPlayer`, `group`, `inventory`, `masterPlayer`, `storeInventory`, `multiplayer`, `cloudScript`, `content`, `dashboard`.

Không nên dùng `admin` khi:

- Official API không cover behavior bạn cần và bạn cố ý thao tác raw DB.
- Bạn chỉ cần gọi API ngoài hệ thống. Trường hợp đó dùng `http`.
- Bạn chỉ cần side effect delivery như socket, mail, push. Trường hợp đó dùng helper tương ứng.
- Bạn định dùng `admin.cloudScript` để tự sửa hoặc tự publish script từ business flow bình thường. Chỉ làm vậy khi đây là thiết kế có chủ đích.

## 4. Rule dùng chính xác cho AI

Theo SDK README:

- `client`, `server`, `admin` là trust boundary của bên gọi, không phải cách phân biệt target là của mình hay của người khác.
- Không chọn `admin` chỉ vì target là user khác. Chỉ chọn `admin` khi caller thực sự đang là privileged caller.

Trong cloud script, nghĩa là:

- Khi bạn gọi `admin.*`, bạn đang chọn privileged route có chủ đích.
- Đừng dùng `admin` chỉ để “đi đường tắt” nếu `database` hoặc helper khác mới là abstraction đúng.

Rule thực tế:

- Với hầu hết typed async method, signature chuẩn là:
  `methodAsync(requestData, overrideAuthToken?, overrideSecretKey?, customTags?, timeout?)`
- Trong đa số case bạn chỉ cần `requestData`.
- Chỉ truyền `overrideAuthToken` hoặc `overrideSecretKey` khi thật sự cần override context.
- Luôn check `response.hasReturnCodeError()` trước khi tin `response.responseData`.
- Không hard-code `secretKey` trong script. Nếu cần secret, truyền từ caller qua `functionParameters` hoặc inject từ nguồn an toàn hơn.

## 5. Rule log trong ví dụ

- `log` là tham số thứ 3 của handler: `async (args, context, log) => { ... }`.
- Đây không phải global logger và không phải `console.log`.
- Không bắt buộc gọi `log` trong mỗi function. Chỉ dùng khi cần debug số liệu, trace luồng đi, hoặc kiểm tra payload tạm thời.
- Runtime chỉ capture khi gọi đúng tham số này: `log(value)`.
- Giá trị log được lưu bằng `JSON.stringify(value)` và trả về caller qua `functionLogs` dưới dạng mảng string.
- Chỉ log dữ liệu JSON-safe. Object vòng tham chiếu sẽ làm function lỗi.

## 6. Rule request model rất quan trọng

Từ SDK runtime và model:

- Nhiều `Admin*RequestData` kế thừa từ `Server*RequestData`.
- Vì vậy field optional ở route `client` thường trở thành bắt buộc ở route `admin`.

Ví dụ thực tế từ `GamePlayerModels`:

- `AdminGetDisplayNameRequestData` yêu cầu `userId`
- `AdminGetPlayerInformationRequestData` yêu cầu `userId`
- `AdminGetPlayerInformationRequestData` còn yêu cầu `infoRequestParam`

Kết luận:

- Khi AI thấy một method `admin.<domain>.*Async(...)`, đừng copy payload từ ví dụ `client` một cách máy móc.
- Luôn kiểm tra request model tương ứng nếu method có vẻ “self route” ở client nhưng “explicit target” ở admin.

## 7. `dashboard` là case đặc biệt

Đây là điểm dễ gây hiểu nhầm nhất.

Theo SDK README và source SDK:

- `GNNetwork.dashboard` có method public ở top-level.
- `GNNetwork.dashboard.server` và `GNNetwork.dashboard.admin` hiện tồn tại như class nhưng không expose operation public hữu ích.
- Vì vậy trong `CloudScriptAdmin.ts`, `admin.dashboard` không map tới `GNNetwork.dashboard.admin`.
- Nó map thủ công từng method từ top-level `GNNetwork.dashboard`.

Điều này kéo theo 2 rule:

- Không suy luận `admin.dashboard` giống hệt các namespace `.admin` khác.
- Nếu đụng `dashboard`, hãy verify kỹ auth/secret flow bằng SDK docs trước khi viết logic nhạy cảm.

Khi dùng `admin.dashboard`, ưu tiên:

- đọc lại [README.MD của SDK](../../GearN-typescript-client-sdk/README.MD)
- đọc lại [DASHBOARD_API_README.md của SDK](../../GearN-typescript-client-sdk/docs/DASHBOARD_API_README.md)

## 8. `admin` hiện có những domain nào

- `admin.characterPlayer`: social/gameplay theo character, thường cần `characterId` rõ ràng
- `admin.content`: content config, upload metadata, file info
- `admin.gamePlayer`: gameplay/profile/player data ở cấp game player
- `admin.group`: group metadata, member, message, currency, statistics
- `admin.inventory`: inventory/item metadata và log
- `admin.masterPlayer`: account/profile/identity ở cấp master player
- `admin.storeInventory`: store/ecommerce, receipt, used/remove state
- `admin.multiplayer`: matchmaking, ticket, match query
- `admin.cloudScript`: publish/edit/execute/list version cloud script
- `admin.dashboard`: dashboard/maintenance/admin account/game settings/analytics

Nếu cần hiểu semantics sâu hơn từng domain, đọc doc tương ứng trong SDK repo:

- [GAME_PLAYER_API_README.md](../../GearN-typescript-client-sdk/docs/GAME_PLAYER_API_README.md)
- [CHARACTER_PLAYER_API_README.md](../../GearN-typescript-client-sdk/docs/CHARACTER_PLAYER_API_README.md)
- [GROUP_API_README.md](../../GearN-typescript-client-sdk/docs/GROUP_API_README.md)
- [INVENTORY_API_README.md](../../GearN-typescript-client-sdk/docs/INVENTORY_API_README.md)
- [MASTER_PLAYER_API_README.md](../../GearN-typescript-client-sdk/docs/MASTER_PLAYER_API_README.md)
- [STORE_INVENTORY_API_README.md](../../GearN-typescript-client-sdk/docs/STORE_INVENTORY_API_README.md)
- [MULTIPLAYER_API_README.md](../../GearN-typescript-client-sdk/docs/MULTIPLAYER_API_README.md)
- [CLOUDSCRIPT_API_README.md](../../GearN-typescript-client-sdk/docs/CLOUDSCRIPT_API_README.md)
- [DASHBOARD_API_README.md](../../GearN-typescript-client-sdk/docs/DASHBOARD_API_README.md)

## 9. Ví dụ cơ bản: `admin.dashboard`

```ts
const requireString = (value: unknown, fieldName: string): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(fieldName + " is required");
    }

    return value.trim();
};

handlers["adminGetGameInfo"] = async (args: any, context, log) => {
    const secretKey = requireString(args?.secretKey, "secretKey");

    const response = await admin.dashboard.getGameInformationAsync(
        { gameId: gameId },
        undefined,
        secretKey
    );

    if (response.hasReturnCodeError()) {
        throw new Error(response.toString());
    }

    return {
        errorCode: response.errorCode,
        responseData: response.responseData
    };
};
```

Ý chính của ví dụ này:

- `dashboard` là case đặc biệt nên tôi truyền `overrideSecretKey` rõ ràng.
- Không hard-code secret vào script.
- Luôn check `hasReturnCodeError()`.

## 10. Ví dụ domain thường dùng: `admin.gamePlayer`

```ts
const requireString = (value: unknown, fieldName: string): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(fieldName + " is required");
    }

    return value.trim();
};

handlers["adminGetPlayerDisplayName"] = async (args: any, context, log) => {
    const targetUserId = requireString(args?.userId, "userId");

    const response = await admin.gamePlayer.getDisplayNameAsync({
        userId: targetUserId
    });

    if (response.hasReturnCodeError()) {
        throw new Error(response.toString());
    }

    return {
        errorCode: response.errorCode,
        responseData: response.responseData
    };
};
```

Điểm quan trọng:

- Đây là route `admin`, nên `userId` được truyền rõ ràng.
- Không copy thói quen của route `client` là bỏ `userId`.

## 11. Khi nào dùng `admin.sendAsync(...)`

Chỉ dùng `admin.sendAsync(...)` khi:

- Bạn biết rất rõ `RequestType`, `RequestRole`, request model và payload wire format.
- Typed facade method bạn cần chưa được expose thuận tiện.

Không nên ưu tiên `admin.sendAsync(...)` nếu:

- `admin.<domain>.<method>Async(...)` đã có sẵn.
- Bạn chưa chắc request model nào cần dùng.

Với cloud script, đây là low-level escape hatch. AI không nên chọn đường này trước.

## 11. Reference source

Source local trong repo này:

1. [CloudScriptAdmin.ts](../src/GN-startup/cloudScript/CloudScriptAdmin.ts)
2. [templateCloudScript.ts](../src/GN-startup/cloudScript/templateCloudScript.ts)
3. [AddFunctionRequestHandler.ts](../src/GN-app-api/handler/controller/handler/cloudScript/AddFunctionRequestHandler.ts)
4. [ExecuteFunctionRequestHandler.ts](../src/GN-app-api/handler/controller/handler/cloudScript/ExecuteFunctionRequestHandler.ts)

Source từ SDK repo:

1. [README.MD](../../GearN-typescript-client-sdk/README.MD)
2. [GNNetworkDashboardApi.ts](../../GearN-typescript-client-sdk/src/runtime/GNNetworkDashboardApi.ts)
3. [GNNetworkGamePlayerApi.ts](../../GearN-typescript-client-sdk/src/runtime/GNNetworkGamePlayerApi.ts)
4. [GNNetworkCloudScriptApi.ts](../../GearN-typescript-client-sdk/src/runtime/GNNetworkCloudScriptApi.ts)
5. [GamePlayerModels.ts](../../GearN-typescript-client-sdk/src/runtime/entity/models/GamePlayerModels.ts)

## 12. Kết luận ngắn

Muốn AI dùng `admin` đúng, chỉ cần nhớ 4 ý:

1. `admin` là wrapper an toàn cho official SDK API, không phải raw DB.
2. Route `admin` là privileged caller boundary, không phải “target là user khác”.
3. Với nhiều domain, payload `admin` yêu cầu field rõ ràng hơn route `client`, đặc biệt là `userId`.
4. `dashboard` là ngoại lệ, phải đọc kỹ semantics riêng thay vì suy luận giống các namespace `.admin` khác.
