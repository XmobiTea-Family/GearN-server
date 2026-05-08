# CLOUDSCRIPT USAGE

## 1. Mục đích

Đây là file tổng quan cho AI Agent.

Đọc file này trước để hiểu:

- CloudScript của GearN chạy theo flow nào.
- Những rule nào bắt buộc.
- Nên chọn `database`, `http`, `socket`, `mail`, `pushNotification`, hay `admin`.
- Cần mở file chi tiết nào tiếp theo.

Nếu bạn cần chi tiết theo từng helper, đọc các file trong `docs/` thay vì nhồi mọi thứ vào đây.

## 2. Flow runtime

Từ [AddFunctionRequestHandler.ts](./src/GN-app-api/handler/controller/handler/cloudScript/AddFunctionRequestHandler.ts), flow thực tế là:

1. Client gọi `addFunction`.
2. Server nhận `script`, `canExecute`, `isLive`.
3. Script bị từ chối ngay nếu chứa chuỗi `GNNetwork`.
4. Script được nhúng vào [templateCloudScript.ts](./src/GN-startup/cloudScript/templateCloudScript.ts).
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
- `context` có `userId` và `customTags`.
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
- các enum/constants từ `@xmobitea/gn-typescript-client`

Source cần đọc khi cần verify:

- [templateCloudScript.ts](/dist/GN-startup/cloudScript/templateCloudScript.ts)
- [CloudScriptDatabase.ts](/dist/GN-startup/cloudScript/CloudScriptDatabase.ts)
- [CloudScriptHttp.ts](/dist/GN-startup/cloudScript/CloudScriptHttp.ts)
- [CloudScriptSocket.ts](/dist/GN-startup/cloudScript/CloudScriptSocket.ts)
- [CloudScriptMail.ts](/dist/GN-startup/cloudScript/CloudScriptMail.ts)
- [CloudScriptPushNotification.ts](/dist/GN-startup/cloudScript/CloudScriptPushNotification.ts)
- [CloudScriptAdmin.ts](/dist/GN-startup/cloudScript/CloudScriptAdmin.ts)

## 5. Chọn helper nào

- `database`: dùng khi cần đọc hoặc ghi MongoDB nội bộ của GearN, hoặc cần helper domain của `xDatabase`. Docs: [docs/CLOUDSCRIPT_database.md](./docs/CLOUDSCRIPT_database.md)
- `http`: dùng khi cần gọi REST API hoặc webhook bên ngoài. Docs: [docs/CLOUDSCRIPT_http.md](./docs/CLOUDSCRIPT_http.md)
- `socket`: dùng khi cần realtime event cho user online hoặc room. Docs: [docs/CLOUDSCRIPT_socket.md](./docs/CLOUDSCRIPT_socket.md)
- `mail`: dùng khi cần gửi email qua mail service của server. Docs: [docs/CLOUDSCRIPT_mail.md](./docs/CLOUDSCRIPT_mail.md)
- `pushNotification`: dùng khi cần gửi push tới token hoặc topic. Docs: [docs/CLOUDSCRIPT_pushNotification.md](./docs/CLOUDSCRIPT_pushNotification.md)
- `admin`: dùng khi behavior đã tồn tại trong official GearN admin API. Ưu tiên `admin` trước `database` nếu business rule đã có sẵn. Docs: [docs/CLOUDSCRIPT_admin.md](./docs/CLOUDSCRIPT_admin.md)

Rule chọn nhanh:

- Có official API rồi thì ưu tiên `admin`.
- Chỉ đụng raw DB khi official API không cover hoặc bạn cố ý thao tác trực tiếp collection.
- Side effect ra ngoài hệ thống thì chọn `http`, `mail`, `socket`, `pushNotification` đúng theo mục tiêu delivery.

## 6. Script tối thiểu hợp lệ

```ts
handlers["pingCloudScript"] = async (args: any, context, log) => {
    const message = typeof args?.message === "string" && args.message.length > 0 ? args.message : "pong";

    return {
        gameId: gameId,
        userId: context.userId,
        message: message
    };
};
```

Nếu cần debug luồng đi hoặc số liệu runtime, có thể gọi `log(value)`:

```ts
handlers["pingCloudScriptDebug"] = async (args: any, context, log) => {
    const message = typeof args?.message === "string" && args.message.length > 0 ? args.message : "pong";

    // Use this only for temporary debug data or execution tracing.
    log("pingCloudScriptDebug", {
        userId: context.userId,
        message: message
    });

    return {
        message: message
    };
};
```

Khi có gọi `log`, `functionLogs` nhận về sẽ là mảng string, ví dụ:

```ts
[
    "{\"action\":\"pingCloudScriptDebug\",\"userId\":\"0123456789\",\"message\":\"hello\"}"
]
```

Nếu bạn cần ví dụ thật theo từng helper, xem file chi tiết trong `docs/`.

## 7. Add và execute nhanh

Ví dụ add script:

```ts
import { GNNetwork } from "@xmobitea/gn-typescript-client";

const secretKey = process.env.GN_SECRET_KEY ?? "";
const script = `handlers["pingCloudScript"] = async (args, context, log) => ({ ok: true, userId: context.userId });`;

const addResponse = await GNNetwork.cloudScript.admin.addFunctionAsync(
    {
        script: script,
        canExecute: true,
        isLive: false
    },
    undefined,
    secretKey
);

if (addResponse.hasReturnCodeError()) {
    throw new Error(addResponse.toString());
}

const version = addResponse.responseData.version;
```

Ví dụ execute đúng version vừa add:

```ts
import { GNNetwork } from "@xmobitea/gn-typescript-client";

const secretKey = process.env.GN_SECRET_KEY ?? "";

const executeResponse = await GNNetwork.cloudScript.admin.executeFunctionAsync(
    {
        userId: "0123456789",
        functionName: "pingCloudScript",
        version: version,
        functionParameters: {
            message: "hello"
        }
    },
    undefined,
    secretKey
);

if (executeResponse.hasReturnCodeError()) {
    throw new Error(executeResponse.toString());
}
```

Ví dụ execute không truyền `version`:

```ts
import { GNNetwork } from "@xmobitea/gn-typescript-client";

const secretKey = process.env.GN_SECRET_KEY ?? "";

const executeResponse = await GNNetwork.cloudScript.admin.executeFunctionAsync(
    {
        userId: "0123456789",
        functionName: "pingCloudScript",
        functionParameters: {
            message: "hello"
        }
    },
    undefined,
    secretKey
);

if (executeResponse.hasReturnCodeError()) {
    throw new Error(executeResponse.toString());
}
```

Case này sẽ chạy vào version đang `isLive`, không phải version mới nhất vừa add nếu version đó chưa được promote live.

## 8. Những lỗi hay dính

- Quên đăng ký function vào `handlers`.
- Viết code như một file TypeScript hoàn chỉnh thay vì chỉ viết phần body được inject.
- Để literal `GNNetwork` trong script.
- Hard-code `secretKey` vào script.
- Tưởng rằng bỏ `version` sẽ chạy vào version mới add gần nhất. Runtime hiện tại chạy vào version đang `isLive`.
- Dùng class instance phức tạp làm `return`, dẫn đến serialize lỗi hoặc mất field.
- Tưởng function nào cũng phải gọi `log`. Không cần. Chỉ dùng `log` cho debug số liệu hoặc trace luồng.
- Tưởng `console.log` hoặc global `log` sẽ đi vào `functionLogs`. Runtime chỉ capture tham số `log` được truyền vào handler.
- Truyền object vòng tham chiếu vào `log(value)`, làm `JSON.stringify(value)` lỗi.
- Dùng `database` để làm việc mà `admin` đã có official API sẵn.
- Tưởng `socket`, `mail`, `pushNotification` sẽ trả ACK delivery chi tiết. Không có.

## 9. Thứ tự đọc khuyến nghị

1. [CLOUDSCRIPT_USAGE.md](./CLOUDSCRIPT_USAGE.md)
2. [docs/CLOUDSCRIPT_admin.md](./docs/CLOUDSCRIPT_admin.md) nếu cần official admin API
3. [docs/CLOUDSCRIPT_http.md](./docs/CLOUDSCRIPT_http.md) nếu gọi API ngoài
4. [docs/CLOUDSCRIPT_socket.md](./docs/CLOUDSCRIPT_socket.md) nếu cần realtime
5. [docs/CLOUDSCRIPT_mail.md](./docs/CLOUDSCRIPT_mail.md) nếu gửi email
6. [docs/CLOUDSCRIPT_pushNotification.md](./docs/CLOUDSCRIPT_pushNotification.md) nếu gửi push
7. [docs/CLOUDSCRIPT_database.md](./docs/CLOUDSCRIPT_database.md) nếu đụng dữ liệu nội bộ
