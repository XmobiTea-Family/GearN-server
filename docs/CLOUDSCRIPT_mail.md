# CLOUDSCRIPT MAIL

## 1. Mục đích

File này chỉ tập trung vào `mail` trong cloud script.

Nếu bạn cần tài liệu tổng quan cloud script, xem:

- [CLOUDSCRIPT_USAGE.md](../CLOUDSCRIPT_USAGE.md)

## 2. Khi nào dùng `mail`

Dùng `mail` khi:

- Bạn cần gửi email transactional.
- Bạn cần gửi email HTML cho user hoặc admin.
- Bạn cần gửi một email hoặc nhiều email cùng lúc.

Không nên dùng `mail` khi:

- Bạn chỉ cần thông báo nhanh cho client app. Trường hợp đó dùng `pushNotification` hoặc `socket`.
- Bạn cần delivery tracking chi tiết ngay trong cloud script. `mail` ở đây chỉ bridge sang email service của server.

## 3. Reference source

Đọc theo thứ tự này:

1. [CloudScriptMail.ts](../src/GN-startup/cloudScript/CloudScriptMail.ts)

## 4. `mail` có gì

Wrapper `mail` đang expose:

- `mail.send(email, subject, contentHtml)`
- `mail.sendToMore(emails, subject, contentHtml)`

## 5. Lưu ý thực tế

- Nội dung body là HTML string.
- Đây là server-side bridge, không phải SMTP client trực tiếp trong cloud script.
- Không nên hard-code danh sách email nhạy cảm trong script.
- Nếu cần audit, bạn nên tự ghi log business vào DB.
- `log` là tham số thứ 3 của handler, không phải global logger hoặc `console.log`.
- Không bắt buộc gọi `log` trong mỗi function. Chỉ dùng khi cần debug số liệu, trace luồng đi, hoặc kiểm tra payload tạm thời.
- Runtime lưu `log(value)` bằng `JSON.stringify(value)` và trả về caller qua `functionLogs` dưới dạng mảng string.
- Chỉ log dữ liệu JSON-safe. Không đưa nội dung email nhạy cảm vào `functionLogs`.

## 6. Ví dụ cơ bản

```ts
const requireString = (value: unknown, fieldName: string): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(fieldName + " is required");
    }

    return value.trim();
};

handlers["mailSendDemo"] = async (args: any, context, log) => {
    const email = requireString(args?.email, "email");
    const subject = typeof args?.subject === "string" && args.subject.length > 0 ? args.subject : "CloudScript Demo Mail";

    await mail.send(
        email,
        subject,
        "<h1>CloudScript Demo</h1><p>UserId: " + context.userId + "</p><p>GameId: " + gameId + "</p>"
    );

    return {
        queued: true,
        email: email
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

handlers["mailSendBatch"] = async (args: any, context, log) => {
    if (!Array.isArray(args?.emails) || args.emails.length === 0) {
        throw new Error("emails is required");
    }

    const subject = typeof args?.subject === "string" && args.subject.length > 0 ? args.subject : "CloudScript Batch Mail";
    const contentHtml = typeof args?.contentHtml === "string" && args.contentHtml.length > 0
        ? args.contentHtml
        : "<p>Batch mail from cloud script</p><p>GameId: " + gameId + "</p>";

    await mail.sendToMore(args.emails, subject, contentHtml);

    return {
        queued: true,
        count: args.emails.length
    };
};

handlers["mailSendReport"] = async (args: any, context, log) => {
    const email = requireString(args?.email, "email");
    const title = typeof args?.title === "string" && args.title.length > 0 ? args.title : "CloudScript Report";

    const rows = Array.isArray(args?.rows) ? args.rows : [];
    const rowHtml = rows.map((row: any) => {
        return "<tr><td>" + String(row?.label ?? "") + "</td><td>" + String(row?.value ?? "") + "</td></tr>";
    }).join("");

    const contentHtml =
        "<h2>" + title + "</h2>" +
        "<p>UserId: " + context.userId + "</p>" +
        "<table border=\"1\" cellpadding=\"6\" cellspacing=\"0\">" +
        "<tr><th>Label</th><th>Value</th></tr>" +
        rowHtml +
        "</table>";

    await mail.send(email, title, contentHtml);

    return {
        queued: true,
        email: email,
        rowCount: rows.length
    };
};
```

## 8. Kết luận ngắn

Nếu bạn cần gửi email từ cloud script, dùng `mail`.

Nếu bạn chỉ cần nhắn nhanh tới user mobile/client đang online, `mail` không phải lựa chọn đúng.
