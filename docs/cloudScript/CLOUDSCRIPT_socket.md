# CLOUDSCRIPT SOCKET

## 1. Mục đích

File này chỉ tập trung vào `socket` trong cloud script.

Nếu bạn cần tài liệu tổng quan cloud script, xem:

- [docs/cloudScript/CLOUDSCRIPT_USAGE.md](/docs/cloudScript/CLOUDSCRIPT_USAGE.md)

## 2. Khi nào dùng `socket`

Dùng `socket` khi:

- Bạn cần gửi realtime event cho một user.
- Bạn cần gửi realtime event cho nhiều user hoặc toàn bộ player online.
- Bạn cần join room, leave room, hoặc broadcast vào room.

Không nên dùng `socket` khi:

- Người nhận có thể offline và bạn cần cách báo tin bền hơn. Trường hợp đó cân nhắc `pushNotification` hoặc lưu DB.
- Bạn cần response business detail từ client. `socket` trong cloud script chỉ là server-side bridge.
- Bạn chỉ cần xử lý DB nội bộ. Trường hợp đó dùng `database`.

## 3. Reference source

Đọc theo thứ tự này:

1. [CloudScriptSocket.ts](/dist/GN-startup/cloudScript/CloudScriptSocket.ts)

## 4. `socket` có gì

Wrapper `socket` đang expose:

<!-- prettier-ignore -->
| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `sendEventTo(userId: string, operationEvent: OperationEvent): Promise<void>` | `socket.sendEventTo(userId, operationEvent)` |
| `sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent): Promise<void>` | `socket.sendEventToMoreUser(userIds, operationEvent)` |
| `sendEventToAllPlayer(operationEvent: OperationEvent): Promise<void>` | `socket.sendEventToAllPlayer(operationEvent)` |
| `joinRoom(userId: string, roomId: string): Promise<void>` | `socket.joinRoom(userId, roomId)` |
| `leaveRoom(userId: string, roomId: string): Promise<void>` | `socket.leaveRoom(userId, roomId)` |
| `sendEventToRoom(roomId: string, operationEvent: OperationEvent): Promise<void>` | `socket.sendEventToRoom(roomId, operationEvent)` |

## 5. Lưu ý thực tế

- Đây là fire-and-forget side effect.
- `await` ở đây chỉ chờ event bridge phía server, không phải client ACK.
- Payload event nên giữ gọn.
- Dữ liệu event nên là JSON plain hoặc `GNHashtable`.
- Client phải tự subscribe socket event tương ứng. Xem thêm [docs/reference/EVENTS.md](/docs/reference/EVENTS.md#custom-operationevent).
- Nếu client parse payload bằng DTO decorator, xem [docs/reference/DATAMEMBER.md](/docs/reference/DATAMEMBER.md).
- Nếu CloudScript runtime/wrapper của project expose helper dạng `event.send(operationEvent)` hoặc tên tương tự, cách viết event code/payload và cách client lắng nghe vẫn giống `socket.sendEventTo*`: client filter bằng `operationEvent.getEventCode()`.

## 6. Ví dụ cơ bản

```ts
const requireString = (value: unknown, fieldName: string): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(fieldName + " is required");
    }

    return value.trim();
};

const createDemoOperationEvent = (message: string, userId: string) => {
    return new OperationEvent("cloudScriptDemo", GNHashtable.builder().add("message", message).add("sourceUserId", userId).add("ts", Date.now()).build());
};

handlers["socketNotifyUser"] = async (args: any, context, log) => {
    const targetUserId = typeof args?.userId === "string" && args.userId.length > 0 ? args.userId : context.userId;
    const operationEvent = createDemoOperationEvent("Hello from cloud script", context.userId);

    await socket.sendEventTo(targetUserId, operationEvent);

    return {
        sent: true,
        targetUserId: targetUserId,
    };
};
```

<a id="socket-operationevent-end-to-end"></a>

### 6.1. Ví dụ end-to-end: server gửi `OperationEvent`, client nhận typed

**Server / CloudScript gửi event**

Ví dụ này tạo event code `cloudScriptRewardGranted` và payload có 4 field: `rewardId`, `amount`, `reason`, `ts`.

```ts
const EVENT_CLOUDSCRIPT_REWARD_GRANTED = "cloudScriptRewardGranted";

const createRewardGrantedEvent = (rewardId: string, amount: number, reason: string) => {
    return new OperationEvent(
        EVENT_CLOUDSCRIPT_REWARD_GRANTED,
        GNHashtable.builder()
            .add("rewardId", rewardId)
            .add("amount", amount)
            .add("reason", reason)
            .add("ts", Date.now())
            .build()
    );
};

handlers["grantDailyRewardAndNotify"] = async (args: any, context, log) => {
    const targetUserId = typeof args?.userId === "string" && args.userId.length > 0 ? args.userId : context.userId;

    // TODO: xử lý business grant reward / ghi DB trước khi notify.
    const operationEvent = createRewardGrantedEvent("daily-login", 100, "dailyLogin");

    await socket.sendEventTo(targetUserId, operationEvent);

    return {
        sent: true,
        targetUserId: targetUserId,
        eventCode: EVENT_CLOUDSCRIPT_REWARD_GRANTED,
    };
};
```

**Client nhận event bằng `IServerEventHandler`**

Client tạo DTO decorator khớp với key server gửi, rồi parse `OperationEvent.getParameters()` bằng `ConverterService.deserializeObject(...)`. Chi tiết decorator và ví dụ đủ 6 dạng DataMember: [DATAMEMBER.md](/docs/reference/DATAMEMBER.md); rule event custom: [EVENTS.md](/docs/reference/EVENTS.md#custom-operationevent).

```ts
import {
    Action1,
    ConverterService,
    GNNetwork,
    IServerEventHandler,
    NumberDataMember,
    OperationEvent,
    ParameterCode,
    StringDataMember,
} from "@xmobitea/gearn-typescript-client-sdk";

const EVENT_CLOUDSCRIPT_REWARD_GRANTED = "cloudScriptRewardGranted";

export class CloudScriptRewardGrantedEvent {
    @StringDataMember({ code: "rewardId" })
    public rewardId: string;

    @NumberDataMember({ code: ParameterCode.Amount })
    public amount: number;

    @StringDataMember({ code: ParameterCode.Reason })
    public reason: string;

    @NumberDataMember({ code: ParameterCode.Ts })
    public ts: number;
}

export class CloudScriptRewardGrantedEventHandler implements IServerEventHandler {
    public static onUpdate: Action1<CloudScriptRewardGrantedEvent>;

    public getEventCode(): string {
        return EVENT_CLOUDSCRIPT_REWARD_GRANTED;
    }

    public handle(operationEvent: OperationEvent): void {
        if (CloudScriptRewardGrantedEventHandler.onUpdate != null) {
            CloudScriptRewardGrantedEventHandler.onUpdate(
                ConverterService.deserializeObject(operationEvent.getParameters(), CloudScriptRewardGrantedEvent)
            );
        }
    }
}

GNNetwork.subscriberServerEventHandler(new CloudScriptRewardGrantedEventHandler());

CloudScriptRewardGrantedEventHandler.onUpdate = (payload) => {
    console.log("reward granted", payload.rewardId, payload.amount, payload.reason, payload.ts);
};

// Sau khi login HTTP thành công và đã setup handler:
GNNetwork.connectSocket();
```

Điểm bắt buộc phải khớp:

- Server gửi `new OperationEvent("cloudScriptRewardGranted", ...)` thì client `getEventCode()` cũng phải trả `"cloudScriptRewardGranted"`.
- Server `.add("rewardId", ...)` thì client DTO phải dùng `@StringDataMember({ code: "rewardId" })`.
- Server `.add("amount", ...)`, `.add("reason", ...)`, `.add("ts", ...)` có thể map bằng `ParameterCode.Amount`, `ParameterCode.Reason`, `ParameterCode.Ts`.

## 7. Client lắng nghe event custom từ CloudScript

CloudScript gửi `OperationEvent("cloudScriptDemo", parameters)` thì client lắng nghe bằng `GNNetwork.setOnEventHandler(...)` và filter đúng `eventCode`.

```ts
import { GNNetwork } from "@xmobitea/gearn-typescript-client-sdk";

GNNetwork.setOnEventHandler((operationEvent) => {
    if (operationEvent.getEventCode() !== "cloudScriptDemo") return;

    const p = operationEvent.getParameters();
    if (p == null) return;

    const message = p.getString("message", "");
    const sourceUserId = p.getString("sourceUserId", "");
    const ts = p.getNumber("ts", 0);

    // Update UI/cache. Không block socket loop bằng xử lý nặng ở đây.
    console.log("cloudScriptDemo", message, sourceUserId, ts);
});

// Cleanup type-safe khi teardown scene/session
GNNetwork.setOnEventHandler(() => {});
```

Nếu app có nhiều module cùng nghe custom event, đừng gọi `setOnEventHandler` ở nhiều nơi vì đây là single-slot callback. Tạo dispatcher riêng hoặc dùng custom `IServerEventHandler` theo hướng dẫn trong [EVENTS.md](/docs/reference/EVENTS.md#custom-operationevent).

### 7.1. Client handler typed giống built-in `On*EventHandler`

Nếu muốn viết chuẩn như `OnCharacterPlayerGroupUpdateEventHandler`, hãy tạo payload DTO có decorator và một handler implement `IServerEventHandler`. `handle()` sẽ parse `OperationEvent.getParameters()` bằng `ConverterService.deserializeObject(...)`; xem [DATAMEMBER.md](/docs/reference/DATAMEMBER.md) để chọn đúng decorator cho từng field.

```ts
import {
    Action1,
    ConverterService,
    GNNetwork,
    IServerEventHandler,
    NumberDataMember,
    OperationEvent,
    ParameterCode,
    StringDataMember,
} from "@xmobitea/gearn-typescript-client-sdk";

const EVENT_CLOUDSCRIPT_DEMO = "cloudScriptDemo";

export class CloudScriptDemoEvent {
    @StringDataMember({ code: ParameterCode.Message })
    public message: string;

    @StringDataMember({ code: "sourceUserId" })
    public sourceUserId: string;

    @NumberDataMember({ code: ParameterCode.Ts })
    public ts: number;
}

export class CloudScriptDemoEventHandler implements IServerEventHandler {
    public static onUpdate: Action1<CloudScriptDemoEvent>;

    public getEventCode(): string {
        return EVENT_CLOUDSCRIPT_DEMO;
    }

    public handle(operationEvent: OperationEvent): void {
        if (CloudScriptDemoEventHandler.onUpdate != null) {
            CloudScriptDemoEventHandler.onUpdate(
                ConverterService.deserializeObject(operationEvent.getParameters(), CloudScriptDemoEvent)
            );
        }
    }
}

GNNetwork.subscriberServerEventHandler(new CloudScriptDemoEventHandler());

CloudScriptDemoEventHandler.onUpdate = (payload) => {
    console.log(payload.message, payload.sourceUserId, payload.ts);
};
```

Điểm cần khớp:

- `getEventCode()` phải bằng event code CloudScript gửi: `new OperationEvent("cloudScriptDemo", ...)`.
- Decorator `code` phải bằng key trong payload: `message`, `sourceUserId`, `ts`.
- Key đã có sẵn trong SDK thì dùng `ParameterCode.*`; key custom như `sourceUserId` dùng string literal.
- Subscribe handler trước `GNNetwork.connectSocket()`.

## 8. Gửi cùng loại event từ SDK qua `masterPlayer.sendSocketOperationEvent`

Không phải event nào cũng cần CloudScript. Trusted backend hoặc admin tool cũng có thể bắn cùng `eventCode` qua API `masterPlayer.sendSocketOperationEvent`. Client vẫn nghe bằng cùng code ở mục 7.

```ts
import {
    ErrorCode,
    GNHashtable,
    GNNetwork,
    MasterPlayerModels,
    ReturnCode,
} from "@xmobitea/gearn-typescript-client-sdk";

const request = new MasterPlayerModels.ServerSendSocketOperationEventRequestData();
request.userId = targetUserId;
request.eventCode = "cloudScriptDemo";
request.eventParameters = GNHashtable.builder()
    .add("message", "Hello from trusted backend")
    .add("sourceUserId", "server")
    .add("ts", Date.now())
    .build();

const res = await GNNetwork.masterPlayer.server.sendSocketOperationEventAsync(request);
if (res.returnCode !== ReturnCode.Ok) return;
if (res.errorCode !== ErrorCode.Ok) return;
```

Route chọn theo nơi code chạy:

- App/player client: `GNNetwork.masterPlayer.sendSocketOperationEventAsync(...)` với `SendSocketOperationEventRequestData`.
- Trusted backend: `GNNetwork.masterPlayer.server.sendSocketOperationEventAsync(...)` với `ServerSendSocketOperationEventRequestData`.
- Admin/GM tool: `GNNetwork.masterPlayer.admin.sendSocketOperationEventAsync(...)` với `AdminSendSocketOperationEventRequestData`.

Nếu bị `OperationNotAllow`, check permission `masterPlayer.sendSocketOperationEvent.*Enable` theo route đang dùng.

## 9. Ví dụ nâng cao

```ts
const requireString = (value: unknown, fieldName: string): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(fieldName + " is required");
    }

    return value.trim();
};

const createDemoOperationEvent = (eventCode: string, payload: { [k: string]: any }) => {
    return new OperationEvent(eventCode, GNHashtable.builder().addAll(payload).build());
};

handlers["socketNotifyManyUsers"] = async (args: any, context, log) => {
    if (!Array.isArray(args?.userIds) || args.userIds.length === 0) {
        throw new Error("userIds is required");
    }

    const operationEvent = createDemoOperationEvent("cloudScriptMultiCast", {
        sourceUserId: context.userId,
        ts: Date.now(),
    });

    await socket.sendEventToMoreUser(args.userIds, operationEvent);

    return {
        sent: true,
        count: args.userIds.length,
    };
};

handlers["socketBroadcastAll"] = async (args: any, context, log) => {
    const operationEvent = createDemoOperationEvent("cloudScriptBroadcast", {
        message: typeof args?.message === "string" ? args.message : "Broadcast from cloud script",
        sourceUserId: context.userId,
        ts: Date.now(),
    });

    await socket.sendEventToAllPlayer(operationEvent);

    return {
        broadcasted: true,
    };
};

handlers["socketRoomWorkflow"] = async (args: any, context, log) => {
    const userId = typeof args?.userId === "string" && args.userId.length > 0 ? args.userId : context.userId;
    const roomId = requireString(args?.roomId, "roomId");
    const mode = typeof args?.mode === "string" ? args.mode : "joinAndSend";

    if (mode === "leave") {
        await socket.leaveRoom(userId, roomId);

        return {
            left: true,
            userId: userId,
            roomId: roomId,
        };
    }

    await socket.joinRoom(userId, roomId);

    const operationEvent = createDemoOperationEvent("cloudScriptRoomMessage", {
        roomId: roomId,
        sourceUserId: context.userId,
        ts: Date.now(),
    });

    await socket.sendEventToRoom(roomId, operationEvent);

    return {
        joined: true,
        roomId: roomId,
        userId: userId,
    };
};
```

## 10. Kết luận ngắn

Nếu bạn cần realtime cho client đang online, dùng `socket`.

Nếu bạn cần delivery bền hơn khi client offline, `socket` không đủ. Khi đó cân nhắc `pushNotification` hoặc ghi trạng thái vào DB.
