# CLOUDSCRIPT HTTP

## 1. Mục đích

File này chỉ tập trung vào `http` trong cloud script.

Nếu bạn cần tài liệu tổng quan cloud script, xem:

- [CLOUDSCRIPT_USAGE.md](../CLOUDSCRIPT_USAGE.md)

## 2. Khi nào dùng `http`

Dùng `http` khi:

- Bạn cần gọi REST API hoặc webhook bên ngoài.
- Bạn cần tích hợp dịch vụ thứ ba như payment gateway, CRM, analytics, OTP, webhook nội bộ.
- Bạn cần giao tiếp HTTP chuẩn bằng `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.

Không nên dùng `http` khi:

- Dữ liệu đã nằm trong MongoDB của GearN. Trường hợp đó dùng `database`.
- Bạn cần realtime event cho client đang online. Trường hợp đó dùng `socket`.
- Bạn chỉ cần gửi email hoặc push notification. Trường hợp đó dùng `mail` hoặc `pushNotification`.

## 3. Reference source

Đọc theo thứ tự này:

1. [CloudScriptHttp.ts](../src/GN-startup/cloudScript/CloudScriptHttp.ts)

## 4. `http` có gì

Wrapper `http` đang expose trực tiếp các method:

- `http.get(url, config)`
- `http.delete(url, config)`
- `http.head(url, config)`
- `http.options(url, config)`
- `http.post(url, data, config)`
- `http.put(url, data, config)`
- `http.patch(url, data, config)`

Thực chất nó bọc Axios, nên:

- `config` là kiểu Axios request config
- response có `status`, `data`, `headers`
- khi request fail, bạn nên `try/catch`

## 5. Lưu ý thực tế

- Không nên `return` nguyên response object quá lớn nếu không cần.
- Thường chỉ nên `return` các field cần thiết như `status`, `data`, `header`.
- Nên set `timeout` rõ ràng.
- Nếu request có auth, truyền token qua header, không hard-code bí mật vào script.
- `log` là tham số thứ 3 của handler, không phải global logger hoặc `console.log`.
- Không bắt buộc gọi `log` trong mỗi function. Chỉ dùng khi cần debug số liệu, trace luồng đi, hoặc kiểm tra payload tạm thời.
- Runtime lưu `log(value)` bằng `JSON.stringify(value)` và trả về caller qua `functionLogs` dưới dạng mảng string.
- Chỉ log dữ liệu JSON-safe. Không log nguyên Axios response/error object vì có thể lớn hoặc không stringify an toàn.

## 6. Ví dụ cơ bản

```ts
const requireString = (value: unknown, fieldName: string): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(fieldName + " is required");
    }

    return value.trim();
};

handlers["httpGetTodo"] = async (args: any, context, log) => {
    const todoId = typeof args?.todoId === "number" ? args.todoId : 1;

    const response = await http.get("https://jsonplaceholder.typicode.com/todos/" + todoId, {
        timeout: 5000,
        headers: {
            "x-cloud-script-user-id": context.userId
        }
    });

    return {
        status: response.status,
        data: response.data
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

handlers["httpPostWebhook"] = async (args: any, context, log) => {
    const url = requireString(args?.url, "url");

    const payload = {
        eventName: typeof args?.eventName === "string" ? args.eventName : "cloudScriptWebhook",
        userId: context.userId,
        gameId: gameId,
        payload: args?.payload ?? null,
        ts: Date.now()
    };

    const response = await http.post(url, payload, {
        timeout: 8000,
        headers: {
            "content-type": "application/json"
        }
    });

    return {
        status: response.status,
        data: response.data
    };
};

handlers["httpPatchExternalProfile"] = async (args: any, context, log) => {
    const url = requireString(args?.url, "url");
    const bearerToken = requireString(args?.bearerToken, "bearerToken");

    const response = await http.patch(url, args?.payload ?? {}, {
        timeout: 8000,
        headers: {
            Authorization: "Bearer " + bearerToken,
            "x-user-id": context.userId
        }
    });

    return {
        status: response.status,
        data: response.data
    };
};

handlers["httpDeleteResource"] = async (args: any, context, log) => {
    const url = requireString(args?.url, "url");

    const response = await http.delete(url, {
        timeout: 8000,
        headers: {
            "x-cloud-script-user-id": context.userId
        }
    });

    return {
        status: response.status,
        data: response.data
    };
};

handlers["httpSafeRequest"] = async (args: any, context, log) => {
    const url = requireString(args?.url, "url");

    try {
        const response = await http.get(url, {
            timeout: 5000
        });

        return {
            success: true,
            status: response.status,
            data: response.data
        };
    } catch (error: any) {
        return {
            success: false,
            errorMessage: error?.message ?? "unknown error",
            status: error?.response?.status ?? null,
            data: error?.response?.data ?? null
        };
    }
};
```

## 8. Kết luận ngắn

Nếu việc của bạn là gọi service ngoài hệ thống, dùng `http`.

Nếu việc của bạn là xử lý dữ liệu nội bộ GearN, đừng lạm dụng `http`. Dùng `database` hoặc helper server-side sẵn có sẽ đúng hơn.
