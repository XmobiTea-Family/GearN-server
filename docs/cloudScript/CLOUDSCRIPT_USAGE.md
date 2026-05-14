# CLOUDSCRIPT USAGE

Sử dụng script trong CloudScript để viết các đoạn cần server authorize
- script chỉ sử dụng ngôn ngữ `typescript`, không thể sử dụng bất kỳ ngôn ngữ nào khác

- ví dụ về tính năng đổi tên cho một gamePlayer cần tốn 50 gem, nhưng hàm gốc của đổi tên không trừ 50 gem, chúng ta có thể sử dụng cloudScript như sau:

```ts
const GEM_COST_CHANGE_NAME = 50;

const requireString = (value: unknown, fieldName: string): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(fieldName + " is required");
    }
    return value.trim();
};

handlers["changeDisplayName"] = async (args: any, context, log) => {
    const userId = context.userId;
    const displayName = requireString(args?.displayName, "displayName");

    // Bước 1: Kiểm tra số dư gem
    const currencyRequest = new GamePlayerModels.AdminGetPlayerCurrencyRequestData();
    currencyRequest.userId = userId;
    currencyRequest.playerCurrencyKeys = ["gem"];

    const currencyResponse = await admin.gamePlayer.getPlayerCurrencyAsync(currencyRequest);
    if (currencyResponse.hasReturnCodeError()) {
        throw new Error("admin.gamePlayer.getPlayerCurrencyAsync" + " return-code error: " + (currencyResponse.debugMessage ?? currencyResponse.toString()));
    }
    if (currencyResponse.errorCode !== ErrorCode.Ok) {
        throw new Error("admin.gamePlayer.getPlayerCurrencyAsync" + " business error: " + currencyResponse.errorCode + (currencyResponse.debugMessage ? " - " + currencyResponse.debugMessage : ""));
    }

    const currencies = currencyResponse.responseData.playerCurrencies ?? [];
    const gemEntry = currencies.find((c: CurrencyItem) => c.key === "gem");
    const currentGem = gemEntry?.value ?? 0;

    if (currentGem < GEM_COST_CHANGE_NAME) {
        throw new Error("not_enough_gem: required=" + GEM_COST_CHANGE_NAME + ", current=" + currentGem);
    }

    // Bước 2: Trừ 50 gem trước khi đổi tên (delta âm = trừ)
    const gem = new GamePlayerModels.PlayerCurrencyParam();
    gem.key = "gem";
    gem.value = -GEM_COST_CHANGE_NAME;

    const deductRequest = new GamePlayerModels.AdminChangePlayerCurrencyRequestData();
    deductRequest.userId = userId;
    deductRequest.playerCurrencies = [gem];
    deductRequest.log = "changeDisplayName gem cost, userId=" + userId;

    const deductResponse = await admin.gamePlayer.changePlayerCurrencyAsync(deductRequest);
    if (deductResponse.hasReturnCodeError()) {
        throw new Error("admin.gamePlayer.changePlayerCurrencyAsync" + " return-code error: " + (deductResponse.debugMessage ?? deductResponse.toString()));
    }
    if (deductResponse.errorCode !== ErrorCode.Ok) {
        throw new Error("admin.gamePlayer.changePlayerCurrencyAsync" + " business error: " + deductResponse.errorCode + (deductResponse.debugMessage ? " - " + deductResponse.debugMessage : ""));
    }

    // Bước 3: Đổi tên
    const renameRequest = new GamePlayerModels.AdminSetDisplayNameRequestData();
    renameRequest.userId = userId;
    renameRequest.displayName = displayName;

    const renameResponse = await admin.gamePlayer.setDisplayNameAsync(renameRequest);
    if (renameResponse.hasReturnCodeError()) {
        throw new Error("admin.gamePlayer.setDisplayNameAsync" + " return-code error: " + (renameResponse.debugMessage ?? renameResponse.toString()));
    }
    if (renameResponse.errorCode !== ErrorCode.Ok) {
        throw new Error("admin.gamePlayer.setDisplayNameAsync" + " business error: " + renameResponse.errorCode + (renameResponse.debugMessage ? " - " + renameResponse.debugMessage : ""));
    }

    return {
        displayName: displayName,
        gemRemaining: currentGem - GEM_COST_CHANGE_NAME,
    };
};
```

phía client dùng như sau:

```ts
import { GNNetwork, ErrorCode, CloudScriptModels, ExecuteResponseStatus } from "@xmobitea/gearn-typescript-client-sdk";

async function changeDisplayName(newName: string) {
    const request = new CloudScriptModels.ExecuteFunctionRequestData();
    request.functionName = "changeDisplayName";
    request.functionParameters = { displayName: newName };

    const res = await GNNetwork.cloudScript.executeFunctionAsync(request);

    // Transport-level failure (network, decode, return code).
    if (res.hasReturnCodeError()) {
        throw new Error("request failed: " + (res.debugMessage ?? res.toString()));
    }
    // Business-level failure on the request envelope.
    if (res.errorCode !== ErrorCode.Ok) {
        throw new Error("request failed: errorCode=" + res.errorCode);
    }

    const exec = res.responseData; // CloudScriptModels.ExecuteFunctionResponseData

    // `exec.status` là `number` trên DTO; so sánh với enum `ExecuteResponseStatus` vẫn hợp lệ vì enum này là numeric.
    if (exec.status !== ExecuteResponseStatus.Ok) {
        // exec.errorMessage chứa message từ throw new Error(...) trong CloudScript
        throw new Error("execute failed: " + exec.errorMessage);
    }

    // exec.functionResult là { displayName, gemRemaining } mà handler return
    return exec.functionResult;
}
```

SDK reference cho path phía client:

- Source: [`../../src/runtime/GNNetworkCloudScriptApi.ts`](../../src/runtime/GNNetworkCloudScriptApi.ts) — class `CloudScriptApi` (route client) và `AdminCloudScriptApi`.
- Guide: [`guides/CLOUDSCRIPT.md`](/docs/guides/CLOUDSCRIPT.md)
- API reference: [`reference/API_CLOUDSCRIPT.md`](/docs/reference/API_CLOUDSCRIPT.md)
- DTO reference: [`reference/dto/CLOUDSCRIPT.md`](/docs/reference/dto/CLOUDSCRIPT.md)
- Error handling: [`reference/ERROR_HANDLING.md`](/docs/reference/ERROR_HANDLING.md)

## 1. Mục đích

Đây là file tổng quan cho AI Agent.

Đọc file này trước để hiểu:

- CloudScript của GearN chạy theo flow nào.
- Những rule nào bắt buộc.
- Nên chọn `database`, `http`, `socket`, `mail`, `pushNotification`, hay `admin`.
- Cần mở file chi tiết nào tiếp theo.

Nếu bạn cần chi tiết theo từng helper, đọc các file trong `docs/` thay vì nhồi mọi thứ vào đây.

## 2. Flow runtime

Flow thực tế (xem `AddFunctionRequestHandler.ts` trong GearN Server repo):

1. Client gọi `addFunction`.
2. Server nhận `script`, `canExecute`, `isLive`.
3. Script bị từ chối ngay nếu chứa chuỗi `GNNetwork`.
4. Script được nhúng vào `templateCloudScript.ts` (GearN Server repo).
5. Server compile TypeScript.
6. Nếu compile pass, server lưu thành version mới.
7. Khi execute, server gọi `handlers[functionName]`.

Kết luận: script hợp lệ không phải file TypeScript hoàn chỉnh. Nó chỉ là phần code được chèn vào template, và bắt buộc phải tự đăng ký function vào `handlers`.

## 3. Rule bắt buộc

- Luôn đăng ký function theo dạng `handlers["functionName"] = async (args, context, log) => { ... }` hoặc `handlers.functionName = (args, context, log) => { ... }`.
- Top-level có thể khai báo helper bằng `function`, `class`, `type`, `interface`, hoặc `const`; `class` được phép dùng `extends` và `static`.
- Event callback qua `setEventCallbackCloudScript` dùng registry theo `eventName`: request operation được phép đăng ký `preHandlers.eventName`, `postHandlers.eventName`, hoặc cả hai; system/event/socket callback chỉ đăng ký đúng một handler tương ứng.
- Không dùng trực tiếp chuỗi `GNNetwork` trong submitted script.
- `functionName` phải nằm trong giới hạn `3..30` ký tự.
- Khi pin version để execute, `version` phải đúng 7 ký tự.
- Nếu không truyền `version`, runtime hiện tại sẽ dùng version đang `isLive`.
- `args` là `functionParameters` từ request execute.
- `context.userId` là `string` đã authenticate, luôn tồn tại — KHÔNG cần check `typeof` hay `length`. `context.customTags` là optional (`Record<string, any> | undefined`), tuỳ client có gắn hay không.
- `log` là tham số thứ 3 của handler, không phải global logger và không phải `console.log`.
- Không bắt buộc gọi `log` trong mỗi function. Chỉ dùng khi cần debug số liệu, trace luồng đi, hoặc kiểm tra payload tạm thời.
- Gọi `log(value)` chỉ để append debug log cho lần execute hiện tại. Runtime sẽ lưu `JSON.stringify(value)` vào `logs` và trả về client qua `functionLogs`.
- Nếu `value` không stringify được, ví dụ object vòng tham chiếu, function sẽ lỗi. Chỉ log dữ liệu JSON-safe.
- `return` chỉ nên là dữ liệu serialize an toàn: `null`, `boolean`, `number`, `string`, JSON object, JSON array, `GNHashtable`, `GNArray`.
- Nếu cần fail rõ ràng, dùng `throw new Error("message")`.
- Khi security policy từ chối script, `errorMessage` sẽ kèm `line`, `column`, và nội dung dòng source liên quan để debug nhanh hơn.

Về `context.customTags`:

- Đây là metadata đi kèm request execute từ phía caller.
- Dùng cho trace, correlation id, source, feature flag, campaign, hoặc thông tin phụ trợ khác.
- Không dùng `customTags` cho authorization, permission, hoặc secret.
- Hãy coi `customTags` là input phụ trợ, có thể không tồn tại.

Khuyến nghị deploy:

1. Add version mới với `canExecute = true`, `isLive = false`.
2. Test bằng đúng `version` vừa tạo.
3. Chỉ promote live sau khi test pass.
4. Chỉ omit `version` khi bạn thực sự muốn execute vào version đang `isLive`.

## 4. Runtime object có sẵn

Template inject sẵn các symbol này:

- `gameId`
- `handlers`
- `database`
- `http`
- `socket`
- `mail`
- `pushNotification`
- `admin`
- `mongodb`
- `axios`
- `OperationEvent`
- `GNHashtable`
- `GNArray`
- `GNHashtableBuilder`
- `GNArrayBuilder`
- `ExecuteResponseStatus`
- các enum/constants từ package `@xmobitea/gearn-typescript-client-sdk` như sau:

### Các enum/constant từ package `@xmobitea/gearn-typescript-client-sdk`:

- `Action0`
- `Action1`
- `Action2`
- `Action3`
- `Action4`
- `ConverterService`
- `OwnerType`
- `ErrorCode`
- `ParameterCode`
- `Commands`
- `EventCode`
- `OperationCode`
- `ReturnCode`
- `CodeHelper`
- `DataMember`
- `StringDataMember`
- `BooleanDataMember`
- `GNHashtableDataMember`
- `GNArrayDataMember`
- `NumberDataMember`
- `GNHashtableBuilder`
- `GNHashtable`
- `GNArrayBuilder`
- `GNArray`
- `InvalidMemberType`
- `InvalidMember`
- `RequestType`
- `RequestRole`
- `CustomOperationRequest`
- `CustomOperationRequestAbstract`
- `CustomOperationResponse`
- `Constructor`
- `AbstractConstructor`
- `FieldDataType`
- `GNObjectFieldMetadata`
- `GNObjectMetadata`
- `CustomOperationResponseAbstract`
- `IServerEventHandler`
- `OperationEvent`
- `OperationRequest`
- `OperationResponse`
- `GenericModels`
- `CharacterPlayerModels`
- `ContentModels`
- `GamePlayerModels`
- `GroupModels`
- `InventoryModels`
- `MasterPlayerModels`
- `StoreInventoryModels`
- `MultiplayerModels`
- `CloudScriptModels`
- `GNServerSettingsOptions`
- `GNServerSettings`
- `PermissionDataItem`
- `FriendStatus`
- `GoogleLoginType`
- `GroupStatus`
- `GNDebug`
- `ItemType`
- `StoreItemType`
- `LogType`
- `GNSupport`
- `PostType`
- `GetAuthInfoResponse`
- `PushPlatformType`
- `StoreReceiveType`
- `GNUtils`
- `MatchStatus`

Source cần đọc khi cần verify (trong GearN Server repo, không public trong package này):

- `dist/GN-startup/cloudScript/templateCloudScript.ts`
- `dist/GN-startup/cloudScript/CloudScriptDatabase.ts`
- `dist/GN-startup/cloudScript/CloudScriptHttp.ts`
- `dist/GN-startup/cloudScript/CloudScriptSocket.ts`
- `dist/GN-startup/cloudScript/CloudScriptMail.ts`
- `dist/GN-startup/cloudScript/CloudScriptPushNotification.ts`
- `dist/GN-startup/cloudScript/CloudScriptAdmin.ts`

## 5. Typing — KHÔNG dùng `any` vô tội vạ

Script là TypeScript thật, có toàn bộ class trong [§4](#4-runtime-object-có-sẵn) inject sẵn. AI Agent hay rơi vào `response: any` / `items: any[]` / `args: any` vì không biết type nào có sẵn. Bảng dưới đây là pattern bắt buộc.

### 5.1 Helper `ensureOk` / log / retry → `CustomOperationResponse`

Mọi typed response trả về từ `admin.<group>.<method>Async(...)` đều extend `CustomOperationResponse`. Helper generic nhận đúng base này, KHÔNG dùng `any`:

```ts
const ensureOk = (operationName: string, response: CustomOperationResponse) => {
    if (response.hasReturnCodeError()) {
        throw new Error(operationName + " return-code error: " + (response.debugMessage ?? response.toString()));
    }
    if (response.errorCode !== ErrorCode.Ok) {
        throw new Error(operationName + " business error: " + response.errorCode + (response.debugMessage ? " - " + response.debugMessage : ""));
    }
};
```

- KHÔNG dùng `OperationResponse` (raw, không có `hasReturnCodeError()` / `errorCode` field — chỉ có getter `getReturnCode()`).
- KHÔNG dùng `CustomOperationResponseAbstract<T>` cho helper generic — chỉ dùng khi cần `responseData` typed cụ thể.

### 5.2 Array `key/value` (currency, statistics, data, tag, friend, …) → `GenericModels.*`

Mọi item array trên response đều có class chuẩn trong `GenericModels` (đã inject). Map field → item type:

<!-- prettier-ignore -->
| Field trên response | Item type | Shape |
| --- | --- | --- |
| `playerCurrencies` / `groupCurrencies` / `itemCurrencies` | `GenericModels.CurrencyItem` | `key: string`, `value: number` |
| `playerStatistics` / `groupStatistics` / `itemStatistics` | `GenericModels.StatisticsItem` | `key: string`, `value: number` |
| `playerDatas` / `groupDatas` / `customDatas` / `itemDatas` / `storeDatas` | `GenericModels.DataItem` | `key: string`, `value: any` (primitive / GNHashtable / GNArray / object) |
| `playerTags` / `groupTags` | `GenericModels.TagItem` | `key: string`, `value: string` |
| `playerBan` / `bans` | `GenericModels.BanItem` | `tsExpire: number`, `reason: string` |
| `friends` | `GenericModels.FriendItem` | `userId`, `status`, … |
| `members` | `GenericModels.MemberItem` | `userId`, `role`, … |
| `inventoryItems` (relation) | `GenericModels.InventoryItem` | `itemId`, `catalogId`, `classId` |
| `groups` (relation) | `GenericModels.GroupItem` | `groupId`, … |
| `characters` (relation) | `GenericModels.CharacterItem` | `characterId`, `catalogId` |
| `owner` (inventory) | `GenericModels.OwnerItem` | `type: number` (map với `OwnerType`), `id: string` |
| `avatars` | `GenericModels.AvatarItem` | `type: number`, `value: string` |

Generic finder pattern — dùng đúng item type, callback `(c) => ...` sẽ auto-infer, KHÔNG cần `(c: any)`:

```ts
const findCurrency = (items: GenericModels.CurrencyItem[] | undefined, key: string): number => {
    return (items ?? []).find((c) => c.key === key)?.value ?? 0;
};

const findStatistic = (items: GenericModels.StatisticsItem[] | undefined, key: string): number => {
    return (items ?? []).find((s) => s.key === key)?.value ?? 0;
};

// DataItem.value là `any` (backend trả primitive | GNHashtable | GNArray) — narrow ở call-site
const findData = (items: GenericModels.DataItem[] | undefined, key: string): unknown => {
    return (items ?? []).find((d) => d.key === key)?.value;
};

const findBool = (items: GenericModels.DataItem[] | undefined, key: string): boolean => {
    const raw = findData(items, key);
    return raw === true || raw === "true";
};
```

### 5.3 Build request DTO → class `<Group>Models.*Param` / `*RequestData`

Set field trên instance, KHÔNG cast object literal (sẽ skip constructor + decorator metadata, payload serialize thiếu shape):

```ts
// ĐÚNG
const currency = new GamePlayerModels.PlayerCurrencyParam();
currency.key = "gem";
currency.value = -50;

const request = new GamePlayerModels.AdminChangePlayerCurrencyRequestData();
request.userId = userId;
request.playerCurrencies = [currency];

// SAI
const request = { userId, playerCurrencies: [{ key: "gem", value: -50 }] } as GamePlayerModels.AdminChangePlayerCurrencyRequestData;
```

Field name cần `value` hay `amount` tùy DTO — tra [reference/dto/GAME_PLAYER.md](/docs/reference/dto/GAME_PLAYER.md) (hoặc domain tương ứng), không suy diễn.

### 5.4 Handler signature

```ts
handlers["fnName"] = async (args: any, context, log) => {
    /* ... */
};
```

- **`context.userId: string`** — **luôn tồn tại và luôn là string** trong handler context (runtime đã authenticate trước khi gọi handler). KHÔNG cần `typeof context.userId !== "string"` check, KHÔNG cần `userId.length === 0` check, KHÔNG cần throw `"missing_authenticated_user"`. Dùng thẳng:
    ```ts
    handlers["fnName"] = async (args: any, context, log) => {
        const userId = context.userId; // string, sẵn sàng dùng
        /* ... */
    };
    ```
- **`context.customTags: Record<string, any> | undefined`** — optional, tuỳ client có truyền `customTags` vào request execute hay không. Dùng `?.` hoặc null-check khi đọc.
- Không annotate type cho `context` / `log` — runtime không export shape, chỉ cần dùng đúng field.
- **`log`**: `(value: unknown) => void`. Không annotate, không gọi `console.log`.

### 5.5 Anti-pattern tóm tắt

<!-- prettier-ignore -->
| Code AI hay sinh | Vấn đề | Fix |
| --- | --- | --- |
| `response: any` | Mất check `hasReturnCodeError()` ở compile, typo `errorrCode` không bị catch | `response: CustomOperationResponse` |
| `items: any[]` | Mất shape `.key` / `.value` / `.userId`, dễ truy field không tồn tại | `GenericModels.<Item>Type[]` đúng theo bảng § 5.2 |
| `(c: any) => c.key === key` | Annotation đè type inference đã đúng | Bỏ annotation, để TS infer từ array type |
| `args: any` rồi `args.displayName.trim()` | Không validate user input — crash khi missing/wrong type | `args: any` + narrow / `requireString(args?.displayName, ...)` |
| `if (typeof context.userId !== "string") throw ...` | Defensive check vô nghĩa — `context.userId` đã guaranteed `string` ở runtime | Dùng thẳng `const userId = context.userId;` |
| Object literal cast sang `*RequestData` | Skip constructor/decorator, MsgPack/JSON serialize sai shape | `new <Group>Models.<Method>RequestData()` rồi set field |
| `response: OperationResponse` cho helper | `hasReturnCodeError()` / `errorCode` không tồn tại trên base raw | `CustomOperationResponse` (typed wrapper) |

## 6. Chọn helper nào

- `http`: dùng khi cần gọi REST API hoặc webhook bên ngoài. Docs: [CLOUDSCRIPT_http.md](/docs/cloudScript/CLOUDSCRIPT_http.md)
- `socket`: dùng khi cần realtime event cho user online hoặc room. Docs: [CLOUDSCRIPT_socket.md](/docs/cloudScript/CLOUDSCRIPT_socket.md)
- `mail`: dùng khi cần gửi email qua mail service của server. Docs: [CLOUDSCRIPT_mail.md](/docs/cloudScript/CLOUDSCRIPT_mail.md)
- `pushNotification`: dùng khi cần gửi push tới token hoặc topic. Docs: [CLOUDSCRIPT_pushNotification.md](/docs/cloudScript/CLOUDSCRIPT_pushNotification.md)
- `admin`: dùng khi behavior đã tồn tại trong official GearN admin API. Ưu tiên `admin` trước `database` nếu business rule đã có sẵn. Docs: [CLOUDSCRIPT_admin.md](/docs/cloudScript/CLOUDSCRIPT_admin.md)
- `database`: dùng khi cần đọc hoặc ghi MongoDB nội bộ của GearN, hoặc cần helper domain của `xDatabase`. Docs: [CLOUDSCRIPT_database.md](/docs/cloudScript/CLOUDSCRIPT_database.md)

CloudScript không bị giới hạn 1 helper cho 1 handler. Có thể kết hợp nhiều runtime object trong cùng function, ví dụ:

- Dùng `admin` để thực hiện operation chính, rồi dùng `socket` để notify user online.
- Dùng `database` để đọc state nội bộ, rồi dùng `admin` để gọi official API ghi log/currency/inventory.
- Dùng `http` gọi webhook bên ngoài, sau đó dùng `mail` hoặc `pushNotification` để gửi side effect.

Khi kết hợp nhiều helper, vẫn ưu tiên rule chọn nhanh bên dưới: official API thì dùng `admin`, raw data thì dùng `database`, delivery bên ngoài thì dùng helper delivery tương ứng. Không trộn helper chỉ vì tiện; trộn khi workflow thật sự cần nhiều bước khác loại.

Rule chọn nhanh:

- Có official API rồi thì ưu tiên `admin`.
- Chỉ đụng raw DB khi official API không cover hoặc bạn cố ý thao tác trực tiếp collection.
- Side effect ra ngoài hệ thống thì chọn `http`, `mail`, `socket`, `pushNotification` đúng theo mục tiêu delivery.

## 7. Script tối thiểu hợp lệ

```ts
handlers["pingCloudScript"] = async (args: any, context, log) => {
    const input = (args ?? {}) as { message?: string };
    const message = typeof input.message === "string" && input.message.length > 0 ? input.message : "pong";

    return {
        gameId: gameId,
        userId: context.userId,
        message: message,
    };
};
```

Nếu cần debug luồng đi hoặc số liệu runtime, có thể gọi `log(value)`:

```ts
handlers["pingCloudScriptDebug"] = async (args: any, context, log) => {
    const input = (args ?? {}) as { message?: string };
    const message = typeof input.message === "string" && input.message.length > 0 ? input.message : "pong";

    // Use this only for temporary debug data or execution tracing.
    // `log` chỉ nhận đúng 1 tham số (`value: unknown`). Để gắn nhãn, đưa nhãn vào chính object payload.
    log({
        action: "pingCloudScriptDebug",
        userId: context.userId,
        message: message,
    });

    return {
        message: message,
    };
};
```

Khi có gọi `log`, `functionLogs` nhận về sẽ là mảng string, ví dụ:

```ts
['{"action":"pingCloudScriptDebug","userId":"0123456789","message":"hello"}'];
```

Nếu bạn cần ví dụ thật theo từng helper, xem file chi tiết trong `docs/`.

## 8. Add và execute nhanh

### Ví dụ add script:

#### Cách 1: dùng Script.

```ts
import { GNNetwork, CloudScriptModels } from "@xmobitea/gearn-typescript-client-sdk";

const secretKey = process.env.GN_SECRET_KEY ?? "";
const script = `handlers["pingCloudScript"] = async (args, context, log) => ({ ok: true, userId: context.userId });`;

const addRequest = new CloudScriptModels.AdminAddFunctionRequestData();
addRequest.script = script;
addRequest.canExecute = true;
addRequest.isLive = false;

const addResponse = await GNNetwork.cloudScript.admin.addFunctionAsync(
    addRequest,
    undefined, // overrideAuthToken
    secretKey, // overrideSecretKey
);

if (addResponse.hasReturnCodeError()) {
    throw new Error(addResponse.toString());
}

const version = addResponse.responseData.version;
```

> Lưu ý: build instance bằng `new <Group>Models.<Method>RequestData()` rồi set field. Truyền object literal `as ...RequestData` sẽ bỏ qua decorator metadata, payload serialize sai shape (xem § 5.3).

#### Cách 2: dùng GearN Dashboard

vào tab CloudScript/Function, nhập script vào và bấm save

### Ví dụ execute đúng version vừa add:

```ts
import { GNNetwork, CloudScriptModels } from "@xmobitea/gearn-typescript-client-sdk";

const executeRequest = new CloudScriptModels.AdminExecuteFunctionRequestData();
executeRequest.userId = "0123456789";
executeRequest.functionName = "pingCloudScript";
executeRequest.version = version;
executeRequest.functionParameters = { message: "hello" };

const executeResponse = await GNNetwork.cloudScript.admin.executeFunctionAsync(executeRequest);

if (executeResponse.hasReturnCodeError()) {
    throw new Error(executeResponse.toString());
}
```

Ví dụ execute không truyền `version`:

```ts
import { GNNetwork, CloudScriptModels } from "@xmobitea/gearn-typescript-client-sdk";

const executeRequest = new CloudScriptModels.AdminExecuteFunctionRequestData();
executeRequest.userId = "0123456789";
executeRequest.functionName = "pingCloudScript";
executeRequest.functionParameters = { message: "hello" };

const executeResponse = await GNNetwork.cloudScript.admin.executeFunctionAsync(executeRequest);

if (executeResponse.hasReturnCodeError()) {
    throw new Error(executeResponse.toString());
}
```

Case này sẽ chạy vào version đang `isLive`, không phải version mới nhất vừa add nếu version đó chưa được promote live.

## 9. Những lỗi hay dính

- Dùng `any` cho `response` / `items` / `args` thay vì type chuẩn ở [§5](#5-typing--không-dùng-any-vô-tội-vạ).
- Defensive-check `context.userId` (`typeof !== "string"`, `length === 0`, throw `"missing_authenticated_user"`) — không cần, runtime đảm bảo `userId` là string đã authenticate.
- Quên đăng ký function vào `handlers`.
- Viết code như một file TypeScript hoàn chỉnh thay vì chỉ viết phần body được inject.
- Để literal `GNNetwork` trong script.
- Tưởng rằng cần truyền `secretKey` trong script của CloudScript cần dùng `admin`, nhưng điều này là không cần thiết và vô nghĩa vì CloudScript đã có sẵn `secretKey` role `admin`.
- Tưởng rằng bỏ `version` sẽ chạy vào version mới add gần nhất. Runtime hiện tại chạy vào version đang `isLive`.
- Dùng class instance phức tạp làm `return`, dẫn đến serialize lỗi hoặc mất field.
- Tưởng function nào cũng phải gọi `log`. Không cần. Chỉ dùng `log` cho debug số liệu hoặc trace luồng.
- Tưởng `console.log` hoặc global `log` sẽ đi vào `functionLogs`. Runtime chỉ capture tham số `log` được truyền vào handler.
- Truyền object vòng tham chiếu vào `log(value)`, làm `JSON.stringify(value)` lỗi.
- Dùng `database` để làm việc mà `admin` đã có official API sẵn.
- Tưởng `socket`, `mail`, `pushNotification` sẽ trả ACK delivery chi tiết. Không có.

## 10. Thứ tự đọc khuyến nghị

1. [docs/cloudScript/CLOUDSCRIPT_USAGE.md](/docs/cloudScript/CLOUDSCRIPT_USAGE.md)
2. [docs/cloudScript/CLOUDSCRIPT_admin.md](/docs/cloudScript/CLOUDSCRIPT_admin.md) nếu cần official admin API
3. [docs/cloudScript/CLOUDSCRIPT_http.md](/docs/cloudScript/CLOUDSCRIPT_http.md) nếu gọi API ngoài
4. [docs/cloudScript/CLOUDSCRIPT_socket.md](/docs/cloudScript/CLOUDSCRIPT_socket.md) nếu cần realtime
5. [docs/cloudScript/CLOUDSCRIPT_mail.md](/docs/cloudScript/CLOUDSCRIPT_mail.md) nếu gửi email
6. [docs/cloudScript/CLOUDSCRIPT_pushNotification.md](/docs/cloudScript/CLOUDSCRIPT_pushNotification.md) nếu gửi push
7. [docs/cloudScript/CLOUDSCRIPT_database.md](/docs/cloudScript/CLOUDSCRIPT_database.md) nếu đụng dữ liệu nội bộ
8. [docs/cloudScript/CLOUDSCRIPT_security_policy.md](/docs/cloudScript/CLOUDSCRIPT_security_policy.md) khi script bị reject (xem error line/column để debug)

Reference SDK phía client (call-site dùng `executeFunction*`):

- [docs/guides/CLOUDSCRIPT.md](/docs/guides/CLOUDSCRIPT.md)
- [docs/reference/API_CLOUDSCRIPT.md](/docs/reference/API_CLOUDSCRIPT.md)
- [docs/reference/dto/CLOUDSCRIPT.md](/docs/reference/dto/CLOUDSCRIPT.md)
- [docs/reference/ERROR_HANDLING.md](/docs/reference/ERROR_HANDLING.md)
- Source: [`dist/runtime/GNNetworkCloudScriptApi.d.ts`](/dist/runtime/GNNetworkCloudScriptApi.d.ts)
