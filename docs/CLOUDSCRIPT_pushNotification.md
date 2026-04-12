# CLOUDSCRIPT PUSH NOTIFICATION

## 1. Mục đích

File này chỉ tập trung vào `pushNotification` trong cloud script.

Nếu bạn cần tài liệu tổng quan cloud script, xem:

- [CLOUDSCRIPT_USAGE.md](../CLOUDSCRIPT_USAGE.md)

## 2. Khi nào dùng `pushNotification`

Dùng `pushNotification` khi:

- Bạn cần gửi thông báo tới thiết bị mobile.
- Bạn cần gửi tới một token, nhiều token, hoặc một topic.
- Bạn cần subscribe hoặc unsubscribe token vào topic.

Không nên dùng `pushNotification` khi:

- User đang online và bạn chỉ cần realtime event trong session hiện tại. Trường hợp đó dùng `socket`.
- Bạn cần email HTML hoặc email report. Trường hợp đó dùng `mail`.
- Bạn cần đọc/ghi dữ liệu nội bộ. Trường hợp đó dùng `database`.

## 3. Reference source

Đọc theo thứ tự này:

1. [CloudScriptPushNotification.ts](../src/GN-startup/cloudScript/CloudScriptPushNotification.ts)

## 4. `pushNotification` có gì

Wrapper `pushNotification` đang expose:

- `pushNotification.send(token, title, body, badge?, sound?, icon?, data?)`
- `pushNotification.sendToMore(tokens, title, body, badge?, sound?, icon?, data?)`
- `pushNotification.sendToTopic(topic, title, body, badge?, sound?, icon?, data?)`
- `pushNotification.subscribeToTopic(tokens, topic)`
- `pushNotification.unsubscribeFromTopic(tokens, topic)`

## 5. Lưu ý thực tế

- Đây là server-side bridge, không phải SDK push chạy trực tiếp trong cloud script.
- Không nên return toàn bộ token ra ngoài nếu không cần.
- Dữ liệu `data` nên là object JSON gọn.
- Nếu cần trace business, tự ghi log vào DB.
- `log` là tham số thứ 3 của handler, không phải global logger hoặc `console.log`.
- Không bắt buộc gọi `log` trong mỗi function. Chỉ dùng khi cần debug số liệu, trace luồng đi, hoặc kiểm tra payload tạm thời.
- Runtime lưu `log(value)` bằng `JSON.stringify(value)` và trả về caller qua `functionLogs` dưới dạng mảng string.
- Chỉ log dữ liệu JSON-safe. Không đưa token đầy đủ hoặc payload nhạy cảm vào `functionLogs`.

## 6. Ví dụ cơ bản

```ts
const requireString = (value: unknown, fieldName: string): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(fieldName + " is required");
    }

    return value.trim();
};

handlers["pushSendDemo"] = async (args: any, context, log) => {
    const token = requireString(args?.token, "token");
    const title = typeof args?.title === "string" && args.title.length > 0 ? args.title : "CloudScript Demo";
    const body = typeof args?.body === "string" && args.body.length > 0 ? args.body : "Hello from cloud script";

    await pushNotification.send(
        token,
        title,
        body,
        1,
        "default",
        "ic_notification",
        {
            source: "cloudScript",
            gameId: gameId,
            userId: context.userId
        }
    );

    return {
        queued: true,
        title: title
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

handlers["pushSendManyDemo"] = async (args: any, context, log) => {
    if (!Array.isArray(args?.tokens) || args.tokens.length === 0) {
        throw new Error("tokens is required");
    }

    const title = typeof args?.title === "string" && args.title.length > 0 ? args.title : "CloudScript Batch Push";
    const body = typeof args?.body === "string" && args.body.length > 0 ? args.body : "Hello from cloud script";

    await pushNotification.sendToMore(
        args.tokens,
        title,
        body,
        1,
        "default",
        "ic_notification",
        {
            source: "cloudScript",
            userId: context.userId
        }
    );

    return {
        queued: true,
        count: args.tokens.length
    };
};

handlers["pushTopicSendDemo"] = async (args: any, context, log) => {
    const topic = requireString(args?.topic, "topic");
    const title = typeof args?.title === "string" && args.title.length > 0 ? args.title : "Topic Notification";
    const body = typeof args?.body === "string" && args.body.length > 0 ? args.body : "CloudScript topic message";

    await pushNotification.sendToTopic(
        topic,
        title,
        body,
        1,
        "default",
        "ic_notification",
        {
            topic: topic,
            sourceUserId: context.userId
        }
    );

    return {
        queued: true,
        topic: topic
    };
};

handlers["pushTopicSubscribeDemo"] = async (args: any, context, log) => {
    const topic = requireString(args?.topic, "topic");
    if (!Array.isArray(args?.tokens) || args.tokens.length === 0) {
        throw new Error("tokens is required");
    }

    await pushNotification.subscribeToTopic(args.tokens, topic);

    return {
        subscribed: true,
        topic: topic,
        count: args.tokens.length
    };
};

handlers["pushTopicUnsubscribeDemo"] = async (args: any, context, log) => {
    const topic = requireString(args?.topic, "topic");
    if (!Array.isArray(args?.tokens) || args.tokens.length === 0) {
        throw new Error("tokens is required");
    }

    await pushNotification.unsubscribeFromTopic(args.tokens, topic);

    return {
        unsubscribed: true,
        topic: topic,
        count: args.tokens.length
    };
};
```

## 8. Kết luận ngắn

Nếu bạn cần thông báo tới thiết bị mobile, dùng `pushNotification`.

Nếu user đang online và bạn chỉ cần realtime trong session hiện tại, `socket` thường phù hợp hơn.
