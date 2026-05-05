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
- đọc lại [DASHBOARD guide của SDK](../../GearN-typescript-client-sdk/docs/guides/DASHBOARD.md)
- tra thêm [API_DASHBOARD.md của SDK](../../GearN-typescript-client-sdk/docs/reference/API_DASHBOARD.md)

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

- [GAME_PLAYER guide](../../GearN-typescript-client-sdk/docs/guides/GAME_PLAYER.md)
- [CHARACTER_PLAYER guide](../../GearN-typescript-client-sdk/docs/guides/CHARACTER_PLAYER.md)
- [GROUP guide](../../GearN-typescript-client-sdk/docs/guides/GROUP.md)
- [INVENTORY guide](../../GearN-typescript-client-sdk/docs/guides/INVENTORY.md)
- [MASTER_PLAYER guide](../../GearN-typescript-client-sdk/docs/guides/MASTER_PLAYER.md)
- [STORE_INVENTORY guide](../../GearN-typescript-client-sdk/docs/guides/STORE_INVENTORY.md)
- [MULTIPLAYER guide](../../GearN-typescript-client-sdk/docs/guides/MULTIPLAYER.md)
- [CLOUDSCRIPT guide](../../GearN-typescript-client-sdk/docs/guides/CLOUDSCRIPT.md)
- [API index](../../GearN-typescript-client-sdk/docs/reference/API_INDEX.md)

## 9. Pattern chung cho ví dụ

Các ví dụ dưới đây giả sử script đang chạy trong template CloudScript hiện tại, nên bạn có sẵn:

- `GamePlayerModels`
- `MasterPlayerModels`
- `GroupModels`
- `DashboardModels`
- `CloudScriptModels`
- `GNHashtable`
- `OwnerType`
- `ErrorCode`

Nên chuẩn bị 2 helper nhỏ để ví dụ ngắn mà vẫn an toàn:

```ts
const requireString = (value: unknown, fieldName: string): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(fieldName + " is required");
    }

    return value.trim();
};

const assertResponseOk = (response: any, actionName: string): void => {
    if (response.hasReturnCodeError()) {
        throw new Error(actionName + " return-code error: " + (response.debugMessage ?? response.toString()));
    }

    if (response.errorCode !== ErrorCode.Ok) {
        throw new Error(actionName + " business error: " + response.errorCode + (response.debugMessage ? " - " + response.debugMessage : ""));
    }
};
```

## 10. Nhiều ví dụ thực chiến

### 10.1. Đọc game info qua `admin.dashboard.getGameInformationAsync`

```ts
handlers["adminGetGameInfo"] = async (args: any, context, log) => {
    const secretKey = requireString(args?.secretKey, "secretKey");

    const response = await admin.dashboard.getGameInformationAsync(
        { gameId: gameId },
        undefined,
        secretKey
    );

    assertResponseOk(response, "admin.dashboard.getGameInformationAsync");

    return response.responseData;
};
```

Điểm chính:

- `dashboard` là case đặc biệt nên truyền `overrideSecretKey` rõ ràng là cách dễ hiểu nhất.
- Không hard-code secret vào script.

### 10.2. Đọc snapshot game player và tự tạo nếu chưa có

```ts
handlers["adminGetOrCreateGamePlayerProfile"] = async (args: any, context, log) => {
    const targetUserId = requireString(args?.userId, "userId");

    const infoRequestParam = new GamePlayerModels.InfoRequestParam();
    infoRequestParam.displayName = true;
    infoRequestParam.playerCurrencies = true;
    infoRequestParam.playerCurrencyKeys = ["gold", "gem"];
    infoRequestParam.playerInventories = true;
    infoRequestParam.itemCatalogIds = ["weapon", "consumable"];
    infoRequestParam.playerStatistics = true;
    infoRequestParam.playerStatisticsKeys = ["rankScore"];

    const request = new GamePlayerModels.AdminGetPlayerInformationRequestData();
    request.userId = targetUserId;
    request.infoRequestParam = infoRequestParam;
    request.createPlayerIfNotExists = true;

    const response = await admin.gamePlayer.getPlayerInformationAsync(request);
    assertResponseOk(response, "admin.gamePlayer.getPlayerInformationAsync");

    return response.responseData.infoResponseParameters;
};
```

Điểm chính:

- Route `admin` phải truyền `userId` rõ ràng.
- `createPlayerIfNotExists` phù hợp cho backend provisioning, không nên bật một cách vô thức.

### 10.3. Cộng hoặc trừ currency cho game player

```ts
handlers["adminAdjustGamePlayerCurrency"] = async (args: any, context, log) => {
    const targetUserId = requireString(args?.userId, "userId");

    const gold = new GamePlayerModels.PlayerCurrencyParam();
    gold.key = "gold";
    gold.value = typeof args?.goldDelta === "number" ? args.goldDelta : 100;

    const gem = new GamePlayerModels.PlayerCurrencyParam();
    gem.key = "gem";
    gem.value = typeof args?.gemDelta === "number" ? args.gemDelta : 0;

    const request = new GamePlayerModels.AdminChangePlayerCurrencyRequestData();
    request.userId = targetUserId;
    request.playerCurrencies = [gold, gem];
    request.log = "cloudscript adminAdjustGamePlayerCurrency, requestedBy=" + (context.userId ?? "system");

    const response = await admin.gamePlayer.changePlayerCurrencyAsync(request);
    assertResponseOk(response, "admin.gamePlayer.changePlayerCurrencyAsync");

    return response.responseData.infoResponseParameters;
};
```

Điểm chính:

- Đây là delta change, không phải set tuyệt đối.
- `request.log` là field audit của operation, khác với callback `log(value)` của CloudScript handler.

### 10.4. Tạo item cho player rồi re-query inventory relation

```ts
handlers["adminGrantStarterSword"] = async (args: any, context, log) => {
    const targetUserId = requireString(args?.userId, "userId");

    const createRequest = new GamePlayerModels.AdminCreatePlayerItemRequestData();
    createRequest.userId = targetUserId;
    createRequest.catalogId = "weapon";
    createRequest.classId = "sword";
    createRequest.displayName = "Starter Sword";
    createRequest.amount = 1;

    const createResponse = await admin.gamePlayer.createPlayerItemAsync(createRequest);
    assertResponseOk(createResponse, "admin.gamePlayer.createPlayerItemAsync");

    const inventoryRequest = new GamePlayerModels.AdminGetPlayerInventoryRequestData();
    inventoryRequest.userId = targetUserId;
    inventoryRequest.itemCatalogIds = ["weapon"];

    const inventoryResponse = await admin.gamePlayer.getPlayerInventoryAsync(inventoryRequest);
    assertResponseOk(inventoryResponse, "admin.gamePlayer.getPlayerInventoryAsync");

    return {
        createResponseData: createResponse.responseData,
        playerInventories: inventoryResponse.responseData.infoResponseParameters.playerInventories
    };
};
```

Điểm chính:

- Đừng giả định `createPlayerItemAsync` luôn trả thẳng `itemId` vừa tạo.
- Nếu flow cần relation item sau khi grant, re-query là cách rõ ràng hơn.

### 10.5. Đọc profile account-level qua `admin.masterPlayer`

```ts
handlers["adminGetMasterPlayerProfile"] = async (args: any, context, log) => {
    const targetUserId = requireString(args?.userId, "userId");

    const infoRequestParam = new MasterPlayerModels.InfoRequestParam();
    infoRequestParam.displayName = true;
    infoRequestParam.email = true;
    infoRequestParam.playerCurrencies = true;
    infoRequestParam.playerCurrencyKeys = ["gold"];
    infoRequestParam.tags = true;
    infoRequestParam.tagKeys = ["vipTier", "region"];

    const request = new MasterPlayerModels.AdminGetPlayerInformationRequestData();
    request.userId = targetUserId;
    request.infoRequestParam = infoRequestParam;

    const response = await admin.masterPlayer.getPlayerInformationAsync(request);
    assertResponseOk(response, "admin.masterPlayer.getPlayerInformationAsync");

    return response.responseData.infoResponseParameters;
};
```

Điểm chính:

- `masterPlayer` là account/profile level.
- Nếu bạn đang thao tác dữ liệu gameplay trong từng game, `gamePlayer` mới là domain đúng.

### 10.6. Gắn tag cho group qua `admin.group.setTagAsync`

```ts
handlers["adminMarkGroupQueue"] = async (args: any, context, log) => {
    const groupId = requireString(args?.groupId, "groupId");

    const request = new GroupModels.AdminSetTagRequestData();
    request.groupId = groupId;
    request.key = "queue";
    request.value = "ranked";

    const response = await admin.group.setTagAsync(request);
    assertResponseOk(response, "admin.group.setTagAsync");

    return {
        groupId: groupId,
        tag: {
            key: request.key,
            value: request.value
        }
    };
};
```

Điểm chính:

- `groupId` là bắt buộc và là explicit target.
- `setTagAsync` là upsert một cặp `key/value`, không phải merge cả object tags lớn.

### 10.7. Gọi một CloudScript function khác bằng `admin.cloudScript.executeFunctionAsync`

```ts
handlers["adminExecuteAnotherCloudScript"] = async (args: any, context, log) => {
    const targetUserId = requireString(args?.userId, "userId");
    const functionName = requireString(args?.functionName, "functionName");

    const request = new CloudScriptModels.AdminExecuteFunctionRequestData();
    request.userId = targetUserId;
    request.functionName = functionName;
    request.version = typeof args?.version === "string" ? args.version : undefined;
    request.functionParameters = args?.functionParameters ?? {
        source: "adminExecuteAnotherCloudScript",
        requestedBy: context.userId
    };

    const customTags = GNHashtable.builder()
        .add("traceId", args?.traceId ?? "cloudscript-admin-chain")
        .add("source", "admin.cloudScript.executeFunctionAsync")
        .build();

    const response = await admin.cloudScript.executeFunctionAsync(
        request,
        undefined,
        undefined,
        customTags
    );

    assertResponseOk(response, "admin.cloudScript.executeFunctionAsync");

    return {
        status: response.responseData.status,
        functionResult: response.responseData.functionResult,
        functionLogs: response.responseData.functionLogs,
        errorMessage: response.responseData.errorMessage
    };
};
```

Điểm chính:

- Nếu không truyền `version`, runtime sẽ chạy theo rule live version hiện tại.
- `customTags` ở đây sẽ đi tiếp xuống function được execute, phù hợp cho trace và correlation id.

### 10.8. Lấy analytics với payload tối giản

```ts
handlers["adminGetLeanAnalytics"] = async (args: any, context, log) => {
    const secretKey = requireString(args?.secretKey, "secretKey");

    const request = new DashboardModels.GetAnalyticsRequestData();
    request.timestamp = typeof args?.timestamp === "number" ? args.timestamp : undefined;
    request.country = true;
    request.requestComplete = true;
    request.monthlyCost = true;

    const response = await admin.dashboard.getAnalyticsAsync(
        request,
        undefined,
        secretKey
    );

    assertResponseOk(response, "admin.dashboard.getAnalyticsAsync");

    return response.responseData;
};
```

Điểm chính:

- Chỉ bật đúng các flag cần lấy.
- Với analytics/snapshot lớn, payload tối giản giúp giảm noise và cost đọc dữ liệu.

### 10.9. Hard delete trực tiếp trong DB qua `admin.dashboard.deleteInDatabaseAsync`

```ts
handlers["adminDeleteInventoryRow"] = async (args: any, context, log) => {
    const secretKey = requireString(args?.secretKey, "secretKey");
    const itemId = requireString(args?.itemId, "itemId");

    const request = new DashboardModels.DeleteInDatabaseRequestData();
    request.gameId = gameId;
    request.type = OwnerType.Inventory;
    request.id = itemId;
    request.log = "manual cleanup from cloudscript, requestedBy=" + (context.userId ?? "system");

    const response = await admin.dashboard.deleteInDatabaseAsync(
        request,
        undefined,
        secretKey
    );

    assertResponseOk(response, "admin.dashboard.deleteInDatabaseAsync");

    return {
        deleted: true,
        type: request.type,
        id: request.id
    };
};
```

Điểm chính:

- Đây là operation phá hủy dữ liệu thật, không phải soft remove.
- Chỉ dùng khi đã có xác nhận vận hành rõ ràng.
- Nên luôn đi kèm `request.log` để giữ dấu vết audit.

## 11. Khi nào dùng `admin.sendAsync(...)`

Chỉ dùng `admin.sendAsync(...)` khi:

- Bạn biết rất rõ `RequestType`, `RequestRole`, request model và payload wire format.
- Typed facade method bạn cần chưa được expose thuận tiện.

Không nên ưu tiên `admin.sendAsync(...)` nếu:

- `admin.<domain>.<method>Async(...)` đã có sẵn.
- Bạn chưa chắc request model nào cần dùng.
- Bạn mới chỉ suy đoán operation code từ tên handler phía server.

Với CloudScript, đây là low-level escape hatch. AI không nên chọn đường này trước.

## 12. Reference source

Source local trong repo này:

1. [CloudScriptAdmin.ts](../src/GN-startup/cloudScript/CloudScriptAdmin.ts)
2. [templateCloudScript.ts](../src/GN-startup/cloudScript/templateCloudScript.ts)
3. [AddFunctionRequestHandler.ts](../src/GN-app-api/handler/controller/handler/cloudScript/AddFunctionRequestHandler.ts)
4. [ExecuteFunctionRequestHandler.ts](../src/GN-app-api/handler/controller/handler/cloudScript/ExecuteFunctionRequestHandler.ts)

Source từ SDK repo:

1. [README.MD](../../GearN-typescript-client-sdk/README.MD)
2. [docs/guides/DASHBOARD.md](../../GearN-typescript-client-sdk/docs/guides/DASHBOARD.md)
3. [docs/guides/GAME_PLAYER.md](../../GearN-typescript-client-sdk/docs/guides/GAME_PLAYER.md)
4. [docs/guides/MASTER_PLAYER.md](../../GearN-typescript-client-sdk/docs/guides/MASTER_PLAYER.md)
5. [docs/guides/GROUP.md](../../GearN-typescript-client-sdk/docs/guides/GROUP.md)
6. [docs/reference/API_DASHBOARD.md](../../GearN-typescript-client-sdk/docs/reference/API_DASHBOARD.md)
7. [docs/reference/API_GAME_PLAYER.md](../../GearN-typescript-client-sdk/docs/reference/API_GAME_PLAYER.md)
8. [docs/reference/API_MASTER_PLAYER.md](../../GearN-typescript-client-sdk/docs/reference/API_MASTER_PLAYER.md)
9. [docs/reference/API_GROUP.md](../../GearN-typescript-client-sdk/docs/reference/API_GROUP.md)
10. [docs/reference/API_CLOUDSCRIPT.md](../../GearN-typescript-client-sdk/docs/reference/API_CLOUDSCRIPT.md)
11. [GamePlayerModels.ts](../../GearN-typescript-client-sdk/src/runtime/entity/models/GamePlayerModels.ts)
12. [MasterPlayerModels.ts](../../GearN-typescript-client-sdk/src/runtime/entity/models/MasterPlayerModels.ts)
13. [DashboardModels.ts](../../GearN-typescript-client-sdk/src/runtime/entity/models/DashboardModels.ts)

## 13. Kết luận ngắn

Muốn AI dùng `admin` đúng, chỉ cần nhớ 6 ý:

1. `admin` là wrapper an toàn cho official SDK API, không phải raw DB.
2. Route `admin` là privileged caller boundary, không phải “target là user khác”.
3. Với nhiều domain, payload `admin` yêu cầu field rõ ràng hơn route `client`, đặc biệt là `userId`.
4. `dashboard` là ngoại lệ tương đối lớn; khi đụng nó hãy đọc semantics riêng trước.
5. `request.log` của operation và callback `log(value)` của CloudScript là hai thứ khác nhau.
6. Nếu flow cần audit, provisioning, hoặc destructive operation, hãy viết ví dụ theo hướng explicit và traceable thay vì “đoán là backend sẽ tự hiểu”.
