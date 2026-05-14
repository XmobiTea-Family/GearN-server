# CLOUDSCRIPT ADMIN

## 1. Mục đích

File này chỉ tập trung vào `admin` trong cloud script.

Nếu bạn cần tài liệu tổng quan cloud script, xem:

- [docs/cloudScript/CLOUDSCRIPT_USAGE.md](/docs/cloudScript/CLOUDSCRIPT_USAGE.md)

## 2. `admin` thực chất là gì

Trong cloud script, `admin` là CloudScript-safe wrapper cho public SDK `GNNetwork`.

Lý do tồn tại:

- Submitted script không được chứa literal `GNNetwork`.
- Nhưng runtime vẫn cần một cách gọi lại official GearN API.
- `CloudScriptAdmin.ts` bọc lại các API cần dùng để script gọi được mà không đụng trực tiếp `GNNetwork`.
- Không cần gọi `GNNetwork.init()` vì khi cloudScript đã chạy thì đã bootstrap hàm này rồi.
- Không cần truyền `secretKey` từ phía client vì `cloudScript` đã có đầy đủ quyền để gọi bất kỳ hàm nào phía `GearN Server`.

Mapping chính:

- `admin.characterPlayer` → `GNNetwork.characterPlayer.admin`
- `admin.content` → `GNNetwork.content.admin`
- `admin.gamePlayer` → `GNNetwork.gamePlayer.admin`
- `admin.group` → `GNNetwork.group.admin`
- `admin.inventory` → `GNNetwork.inventory.admin`
- `admin.masterPlayer` → `GNNetwork.masterPlayer.admin`
- `admin.storeInventory` → `GNNetwork.storeInventory.admin`
- `admin.multiplayer` → `GNNetwork.multiplayer.admin`
- `admin.cloudScript` → `GNNetwork.cloudScript.admin`
- `admin.dashboard` → map thủ công từ top-level `GNNetwork.dashboard` (xem §7)

Ngoài ra còn có:

- `admin.send(...)`
- `admin.sendAsync(...)`

<!-- prettier-ignore -->
| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `send(requestType: RequestType, role: RequestRole, request: OperationRequest, onResponse: Action1<OperationResponse>, overrideAuthToken: string, overrideSecretKey: string, customTags: GNHashtable): void` | `admin.send(requestType, role, request, onResponse, overrideAuthToken, overrideSecretKey, customTags)` |
| `sendAsync(requestType: RequestType, role: RequestRole, request: OperationRequest, overrideAuthToken: string, overrideSecretKey: string, customTags: GNHashtable): Promise<OperationResponse>` | `admin.sendAsync(requestType, role, request, overrideAuthToken, overrideSecretKey, customTags)` |

## 3. Khi nào dùng `admin`

Dùng `admin` khi:

- Behavior bạn cần đã tồn tại trong official GearN API.
- Bạn muốn reuse validation, permission flow, request/response model, business rule có sẵn.
- Bạn đang làm việc theo mindset backoffice/GM/tooling/migration, không phải raw database patch.
- Bạn đang thao tác với domain như `gamePlayer`, `characterPlayer`, `group`, `inventory`, `masterPlayer`, `storeInventory`, `multiplayer`, `cloudScript`, `content`, `dashboard`.

Không nên dùng `admin` khi:

- Official API không cover behavior bạn cần và bạn cố ý thao tác raw DB.
- Bạn chỉ cần gọi API ngoài hệ thống → dùng `http`.
- Bạn chỉ cần side effect delivery như socket, mail, push → dùng helper tương ứng.

## 4. Signature pattern (dùng cho tất cả domain)

```ts
// Preferred (async)
const response = await admin.<domain>.<method>Async(requestData);

// Full signature (optional params hiếm khi cần)
const response = await admin.<domain>.<method>Async(requestData, overrideAuthToken?, overrideSecretKey?, customTags?, timeout?);
```

Rule:

- Trong đa số case bạn chỉ cần truyền `requestData`.
- Chỉ truyền optional params khi thật sự cần override context hoặc tracing.
- Luôn check `response.hasReturnCodeError()` trước, rồi kiểm tra `response.errorCode === ErrorCode.Ok`.
- Với route `admin`, phần lớn method yêu cầu `userId` (hoặc entity id) rõ ràng — không bỏ trống như route `client`.
- **KHÔNG dùng `any` cho `response` / item array / `args`** — base type cho helper là `CustomOperationResponse`; item array dùng `GenericModels.CurrencyItem[]` / `StatisticsItem[]` / `DataItem[]` …; `args` dùng `unknown` rồi narrow. Đầy đủ pattern + bảng mapping: [CLOUDSCRIPT_USAGE.md § 5](/docs/cloudScript/CLOUDSCRIPT_USAGE.md#5-typing--không-dùng-any-vô-tội-vạ).

```ts
// Helper chuẩn cho mọi ví dụ
const assertResponseOk = (response: any, actionName: string): void => {
    if (response.hasReturnCodeError()) {
        throw new Error(actionName + " return-code error: " + (response.debugMessage ?? response.toString()));
    }
    if (response.errorCode !== ErrorCode.Ok) {
        throw new Error(actionName + " business error: " + response.errorCode + (response.debugMessage ? " - " + response.debugMessage : ""));
    }
};
```

## 5. Các hàm tồn tại trong `admin`

- nếu cần cloudScript gọi hàm tương tác với `MasterPlayer`, đọc [CLOUDSCRIPT_admin_MASTER_PLAYER.md](/docs/cloudScript/CLOUDSCRIPT_admin_MASTER_PLAYER.md)
- nếu cần cloudScript gọi hàm tương tác với `GamePlayer`, đọc [CLOUDSCRIPT_admin_GAME_PLAYER.md](/docs/cloudScript/CLOUDSCRIPT_admin_GAME_PLAYER.md)
- nếu cần cloudScript gọi hàm tương tác với `CharacterPlayer`, đọc [CLOUDSCRIPT_admin_CHARACTER_PLAYER.md](/docs/cloudScript/CLOUDSCRIPT_admin_CHARACTER_PLAYER.md)
- nếu cần cloudScript gọi hàm tương tác với `Inventory`, đọc [CLOUDSCRIPT_admin_INVENTORY.md](/docs/cloudScript/CLOUDSCRIPT_admin_INVENTORY.md)
- nếu cần cloudScript gọi hàm tương tác với `Group`, đọc [CLOUDSCRIPT_admin_GROUP.md](/docs/cloudScript/CLOUDSCRIPT_admin_GROUP.md)
- nếu cần cloudScript gọi hàm tương tác với `StoreInventory`, đọc [CLOUDSCRIPT_admin_STORE_INVENTORY.md](/docs/cloudScript/CLOUDSCRIPT_admin_STORE_INVENTORY.md)
- nếu cần cloudScript gọi hàm tương tác với `Content`, đọc [CLOUDSCRIPT_admin_CONTENT.md](/docs/cloudScript/CLOUDSCRIPT_admin_CONTENT.md)
- nếu cần cloudScript gọi hàm tương tác với `Multiplayer`, đọc [CLOUDSCRIPT_admin_MULTIPLAYER.md](/docs/cloudScript/CLOUDSCRIPT_admin_MULTIPLAYER.md)
- nếu cần cloudScript gọi hàm tương tác với `CloudScript`, đọc [CLOUDSCRIPT_admin_CLOUDSCRIPT.md](/docs/cloudScript/CLOUDSCRIPT_admin_CLOUDSCRIPT.md)
- nếu cần cloudScript gọi hàm tương tác với `Dashboard`, đọc [CLOUDSCRIPT_admin_DASHBOARD.md](/docs/cloudScript/CLOUDSCRIPT_admin_DASHBOARD.md)

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

- đọc lại [README.MD của SDK](/node_modules/@xmobitea/gearn-typescript-client-sdk/README.MD)
- đọc lại [DASHBOARD guide của SDK](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/DASHBOARD.md)
- tra thêm [API_DASHBOARD.md của SDK](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/API_DASHBOARD.md)

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

Nếu cần hiểu semantics sâu hơn từng domain, đọc doc tương ứng trong client SDK repo:

- [MASTER_PLAYER guide](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/MASTER_PLAYER.md)
- [GAME_PLAYER guide](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/GAME_PLAYER.md)
- [CHARACTER_PLAYER guide](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/CHARACTER_PLAYER.md)
- [INVENTORY guide](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/INVENTORY.md)
- [GROUP guide](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/GROUP.md)
- [STORE_INVENTORY guide](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/STORE_INVENTORY.md)
- [MULTIPLAYER guide](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/MULTIPLAYER.md)
- [CLOUDSCRIPT guide](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/CLOUDSCRIPT.md)
- [API index](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/API_INDEX.md)

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

const assertResponseOk = (response: CustomOperationResponse, actionName: string): void => {
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
    const request = new DashboardModels.GetGameInformationRequestData();
    request.gameId = gameId;

    const response = await admin.dashboard.getGameInformationAsync(request);

    assertResponseOk(response, "admin.dashboard.getGameInformationAsync");

    return response.responseData;
};
```

Điểm chính:

- Build request bằng `new DashboardModels.GetGameInformationRequestData()` rồi set field — giống mọi domain khác (xem §5.3 trong USAGE).
- `dashboard` là case đặc biệt về mapping (xem §7), nhưng **không** phải exception về cách build request DTO.

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
        playerInventories: inventoryResponse.responseData.infoResponseParameters.playerInventories,
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
            value: request.value,
        },
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
        requestedBy: context.userId,
    };

    const customTags = GNHashtable.builder()
        .add("traceId", args?.traceId ?? "cloudscript-admin-chain")
        .add("source", "admin.cloudScript.executeFunctionAsync")
        .build();

    const response = await admin.cloudScript.executeFunctionAsync(request, undefined, undefined, customTags);

    assertResponseOk(response, "admin.cloudScript.executeFunctionAsync");

    return {
        status: response.responseData.status,
        functionResult: response.responseData.functionResult,
        functionLogs: response.responseData.functionLogs,
        errorMessage: response.responseData.errorMessage,
    };
};
```

Điểm chính:

- Nếu không truyền `version`, runtime sẽ chạy theo rule live version hiện tại.
- `customTags` ở đây sẽ đi tiếp xuống function được execute, phù hợp cho trace và correlation id.

### 10.8. Lấy analytics với payload tối giản

```ts
handlers["adminGetLeanAnalytics"] = async (args: any, context, log) => {
    const request = new DashboardModels.GetAnalyticsRequestData();
    request.timestamp = typeof args?.timestamp === "number" ? args.timestamp : undefined;
    request.country = true;
    request.requestComplete = true;
    request.monthlyCost = true;

    const response = await admin.dashboard.getAnalyticsAsync(request);

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
    const itemId = requireString(args?.itemId, "itemId");

    const request = new DashboardModels.DeleteInDatabaseRequestData();
    request.gameId = gameId;
    request.type = OwnerType.Inventory;
    request.id = itemId;
    request.log = "manual cleanup from cloudscript, requestedBy=" + (context.userId ?? "system");

    const response = await admin.dashboard.deleteInDatabaseAsync(request);

    assertResponseOk(response, "admin.dashboard.deleteInDatabaseAsync");

    return {
        deleted: true,
        type: request.type,
        id: request.id,
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

1. [CloudScriptAdmin.ts](/dist/GN-startup/cloudScript/CloudScriptAdmin.ts)
2. [templateCloudScript.ts](/dist/GN-startup/cloudScript/templateCloudScript.ts)
3. [AddFunctionRequestHandler.ts](/src/GN-app-api/handler/controller/handler/cloudScript/AddFunctionRequestHandler.ts)
4. [ExecuteFunctionRequestHandler.ts](/src/GN-app-api/handler/controller/handler/cloudScript/ExecuteFunctionRequestHandler.ts)

Source từ client SDK repo:

1. [README.MD](/node_modules/@xmobitea/gearn-typescript-client-sdk/README.MD)
2. [docs/guides/DASHBOARD.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/DASHBOARD.md)
3. [docs/guides/MASTER_PLAYER.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/MASTER_PLAYER.md)
4. [docs/guides/GAME_PLAYER.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/GAME_PLAYER.md)
5. [docs/guides/CHARACTER_PLAYER.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/CHARACTER_PLAYER.md)
6. [docs/guides/GROUP.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/GROUP.md)
7. [docs/guides/INVENTORY.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/INVENTORY.md)
8. [docs/guides/STORE_INVENTORY.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/STORE_INVENTORY.md)
9. [docs/guides/CONTENT.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/CONTENT.md)
10. [docs/guides/CLOUDSCRIPT.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/CLOUDSCRIPT.md)
11. [docs/guides/MULTIPLAYER.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/guides/MULTIPLAYER.md)
12. [docs/reference/API_DASHBOARD.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/API_DASHBOARD.md)
13. [docs/reference/API_MASTER_PLAYER.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/API_MASTER_PLAYER.md)
14. [docs/reference/API_GAME_PLAYER.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/API_GAME_PLAYER.md)
15. [docs/reference/API_CHARACTER_PLAYER.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/API_CHARACTER_PLAYER.md)
16. [docs/reference/API_GROUP.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/API_GROUP.md)
17. [docs/reference/API_INVENTORY.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/API_INVENTORY.md)
18. [docs/reference/API_STORE_INVENTORY.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/API_STORE_INVENTORY.md)
19. [docs/reference/API_CONTENT.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/API_CONTENT.md)
20. [docs/reference/API_CLOUDSCRIPT.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/API_CLOUDSCRIPT.md)
21. [docs/reference/API_MULTIPLAYER.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/API_MULTIPLAYER.md)
22. [docs/reference/DTO_INDEX.md](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/DTO_INDEX.md)
23. [GenericModels.ts](/node_modules/@xmobitea/gearn-typescript-client-sdk/dist/runtime/entity/models/GenericModels.d.ts)
24. [DashboardModels.ts](/node_modules/@xmobitea/gearn-typescript-client-sdk/dist/runtime/entity/models/DashboardModels.d.ts)
25. [MasterPlayerModels.ts](/node_modules/@xmobitea/gearn-typescript-client-sdk/dist/runtime/entity/models/MasterPlayerModels.d.ts)
26. [GamePlayerModels.ts](/node_modules/@xmobitea/gearn-typescript-client-sdk/dist/runtime/entity/models/GamePlayerModels.d.ts)
27. [CharacterModels.ts](/node_modules/@xmobitea/gearn-typescript-client-sdk/dist/runtime/entity/models/CharacterModels.d.ts)
28. [GroupModels.ts](/node_modules/@xmobitea/gearn-typescript-client-sdk/dist/runtime/entity/models/GroupModels.d.ts)
29. [InventoryModels.ts](/node_modules/@xmobitea/gearn-typescript-client-sdk/dist/runtime/entity/models/InventoryModels.d.ts)
30. [StoreInventoryModels.ts](/node_modules/@xmobitea/gearn-typescript-client-sdk/dist/runtime/entity/models/StoreInventoryModels.d.ts)
31. [ContentModels.ts](/node_modules/@xmobitea/gearn-typescript-client-sdk/dist/runtime/entity/models/ContentModels.d.ts)
32. [CloudScriptModels.ts](/node_modules/@xmobitea/gearn-typescript-client-sdk/dist/runtime/entity/models/CloudScriptModels.d.ts)
33. [MultiplayerModels.ts](/node_modules/@xmobitea/gearn-typescript-client-sdk/dist/runtime/entity/models/MultiplayerModels.d.ts)

## 13. Kết luận ngắn

Muốn AI dùng `admin` đúng, chỉ cần nhớ 6 ý:

1. `admin` là wrapper an toàn cho official SDK API, không phải raw DB.
2. Route `admin` là privileged caller boundary, không phải “target là user khác”.
3. Với nhiều domain, payload `admin` yêu cầu field rõ ràng hơn route `client`, đặc biệt là `userId`.
4. `dashboard` là ngoại lệ tương đối lớn; khi đụng nó hãy đọc semantics riêng trước.
5. `request.log` của operation và callback `log(value)` của CloudScript là hai thứ khác nhau.
6. Nếu flow cần audit, provisioning, hoặc destructive operation, hãy viết ví dụ theo hướng explicit và traceable thay vì “đoán là backend sẽ tự hiểu”.
