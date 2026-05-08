# CLOUDSCRIPT PUSH NOTIFICATION

## 1. Mục đích

File này chỉ tập trung vào `pushNotification` trong cloud script.

Nếu bạn cần tài liệu tổng quan cloud script, xem:

- [CLOUDSCRIPT_USAGE.md](/CLOUDSCRIPT_USAGE.md)

## 2. Khi nào dùng `pushNotification`

Dùng `pushNotification` khi:

- Bạn cần gửi thông báo đẩy (push notification) tới thiết bị mobile.
- Bạn cần gửi tới một token, nhiều token, hoặc một topic.
- Bạn cần subscribe hoặc unsubscribe token vào topic.
- GearN Server đã setup thành công pushNotificationSettings, setup tại GearN Dashboard => Settings/PushNotification/PushNotificationSettings.

Không nên dùng `pushNotification` khi:

- User đang online và bạn chỉ cần realtime event trong session hiện tại. Trường hợp đó dùng `socket`.
- Bạn cần email HTML hoặc email report. Trường hợp đó dùng `mail`.
- Bạn cần đọc/ghi dữ liệu nội bộ. Trường hợp đó dùng `database`.

## 3. Reference source

Đọc theo thứ tự này:

1. [CloudScriptPushNotification.ts](/dist/GN-startup/cloudScript/CloudScriptPushNotification.ts)

## 4. `pushNotification` có gì

Wrapper `pushNotification` đang expose:

| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `send(token: string, title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }): Promise<void>` | `pushNotification.pushNotification.send(token, title, body, badge?, sound?, icon?, data?)` |
| `sendToMore(tokens: string[], title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }): Promise<void>` | `pushNotification.sendToMore(tokens, title, body, badge?, sound?, icon?, data?)` |
| `sendToTopic(topic: string, title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }): Promise<void>` | `pushNotification.sendToTopic(topic, title, body, badge?, sound?, icon?, data?)` |
| `subscribeToTopic(tokens: string[], topic: string): Promise<void>` | `pushNotification.subscribeToTopic(tokens, topic)` |
| `unsubscribeFromTopic(tokens: string[], topic: string): Promise<void>` | `pushNotification.unsubscribeFromTopic(tokens, topic)` |

## 5. Lưu ý thực tế

- Đây là server-side bridge, không phải SDK push chạy trực tiếp trong cloud script.
- Không nên return toàn bộ token ra ngoài nếu không cần.
- Dữ liệu `data` nên là object JSON gọn.
- Nếu cần trace business, tự ghi log vào DB.

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
