# CLOUDSCRIPT SOCKET

## 1. Mục đích

File này chỉ tập trung vào `socket` trong cloud script.

Nếu bạn cần tài liệu tổng quan cloud script, xem:

- [CLOUDSCRIPT_USAGE.md](../CLOUDSCRIPT_USAGE.md)

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

1. [CloudScriptSocket.ts](../src/GN-startup/cloudScript/CloudScriptSocket.ts)

## 4. `socket` có gì

Wrapper `socket` đang expose:

- `socket.sendEventTo(userId, operationEvent)`
- `socket.sendEventToMoreUser(userIds, operationEvent)`
- `socket.sendEventToAllPlayer(operationEvent)`
- `socket.joinRoom(userId, roomId)`
- `socket.leaveRoom(userId, roomId)`
- `socket.sendEventToRoom(roomId, operationEvent)`

## 5. Lưu ý thực tế

- Đây là fire-and-forget side effect.
- `await` ở đây chỉ chờ event bridge phía server, không phải client ACK.
- Payload event nên giữ gọn.
- Dữ liệu event nên là JSON plain hoặc `GNHashtable`.

## 6. Ví dụ cơ bản

```ts
const requireString = (value: unknown, fieldName: string): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(fieldName + " is required");
    }

    return value.trim();
};

const createDemoOperationEvent = (message: string, userId: string) => {
    return new OperationEvent(
        "cloudScriptDemo",
        GNHashtable.builder()
            .add("message", message)
            .add("sourceUserId", userId)
            .add("ts", Date.now())
            .build()
    );
};

handlers["socketNotifyUser"] = async (args: any, context, log) => {
    const targetUserId = typeof args?.userId === "string" && args.userId.length > 0 ? args.userId : context.userId;
    const operationEvent = createDemoOperationEvent("Hello from cloud script", context.userId);

    await socket.sendEventTo(targetUserId, operationEvent);

    log({
        action: "socketNotifyUser",
        targetUserId: targetUserId
    });

    return {
        sent: true,
        targetUserId: targetUserId
    };
};
```

## 7. Ví dụ nâng cao

```ts
const requireString = (value: unknown, fieldName: string): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(fieldName + " is required");
    }

    return value.trim();
};

const createDemoOperationEvent = (eventCode: string, payload: { [k: string]: any }) => {
    return new OperationEvent(
        eventCode,
        GNHashtable.builder().addAll(payload).build()
    );
};

handlers["socketNotifyManyUsers"] = async (args: any, context, log) => {
    if (!Array.isArray(args?.userIds) || args.userIds.length === 0) {
        throw new Error("userIds is required");
    }

    const operationEvent = createDemoOperationEvent("cloudScriptMultiCast", {
        sourceUserId: context.userId,
        ts: Date.now()
    });

    await socket.sendEventToMoreUser(args.userIds, operationEvent);

    log({
        action: "socketNotifyManyUsers",
        count: args.userIds.length
    });

    return {
        sent: true,
        count: args.userIds.length
    };
};

handlers["socketBroadcastAll"] = async (args: any, context, log) => {
    const operationEvent = createDemoOperationEvent("cloudScriptBroadcast", {
        message: typeof args?.message === "string" ? args.message : "Broadcast from cloud script",
        sourceUserId: context.userId,
        ts: Date.now()
    });

    await socket.sendEventToAllPlayer(operationEvent);

    log({
        action: "socketBroadcastAll"
    });

    return {
        broadcasted: true
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
            roomId: roomId
        };
    }

    await socket.joinRoom(userId, roomId);

    const operationEvent = createDemoOperationEvent("cloudScriptRoomMessage", {
        roomId: roomId,
        sourceUserId: context.userId,
        ts: Date.now()
    });

    await socket.sendEventToRoom(roomId, operationEvent);

    log({
        action: "socketRoomWorkflow",
        userId: userId,
        roomId: roomId
    });

    return {
        joined: true,
        roomId: roomId,
        userId: userId
    };
};
```

## 8. Kết luận ngắn

Nếu bạn cần realtime cho client đang online, dùng `socket`.

Nếu bạn cần delivery bền hơn khi client offline, `socket` không đủ. Khi đó cân nhắc `pushNotification` hoặc ghi trạng thái vào DB.
