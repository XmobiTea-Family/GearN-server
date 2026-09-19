# CLOUDSCRIPT ADMIN CLOUDSCRIPT

## 1. Mục đích

File này chỉ tập trung vào `admin.cloudScript` trong cloud script.

> Lưu ý: `admin.cloudScript` chỉ expose 2 hàm (`executeFunction`, `executeFunctionAsync`) để tránh recursive execution.

Mapping chính:

- `admin.cloudScript` → `GNNetwork.cloudScript.admin`

## 2. Ví dụ sử dụng

```ts
const requireString = (value: unknown, fieldName: string): string => {
    if (typeof value !== "string" || value.trim().length === 0) throw new Error(fieldName + " is required");
    return value.trim();
};

const assertResponseOk = (response: CustomOperationResponse, actionName: string): void => {
    if (response.hasReturnCodeError()) throw new Error(actionName + " return-code error: " + (response.debugMessage ?? response.toString()));
    if (response.errorCode !== ErrorCode.Ok) throw new Error(actionName + " business error: " + response.errorCode);
};

// Gọi một CloudScript function khác từ bên trong CloudScript
handlers["chainCloudScript"] = async (args: any, context, log) => {
    const functionName = requireString(args?.functionName, "functionName");

    const request = new CloudScriptModels.AdminExecuteFunctionRequestData();
    request.userId = context.userId;
    request.functionName = functionName;
    // Không truyền version → runtime dùng version đang isLive
    request.functionParameters = args?.functionParameters ?? {};

    const response = await admin.cloudScript.executeFunctionAsync(request);
    assertResponseOk(response, "executeFunctionAsync");

    return {
        status: response.responseData.status,
        functionResult: response.responseData.functionResult,
        errorMessage: response.responseData.errorMessage,
    };
};
```

## 3. Các hàm

<!-- prettier-ignore -->
| Hàm gốc | Code trong cloudScript như thế nào | Request Data DTO | Response DTO |
| --- | --- | --- | --- |
| `executeFunction(requestData: CloudScriptModels.AdminExecuteFunctionRequestData, onResponse?: Action1<CloudScriptResponseModels.ExecuteFunctionOperationResponse>, overrideAuthToken?: string, overrideSecretKey?: string, overrideGameId?: string, customTags?: GNHashtable, timeout?: number): void` | `admin.cloudScript.executeFunction(requestData, onResponse?, overrideAuthToken?, overrideSecretKey?, overrideGameId?, customTags?, timeout?)` | [AdminExecuteFunctionRequestData](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/dto/CLOUDSCRIPT.md#adminexecutefunctionrequestdata) | [ExecuteFunctionOperationResponse](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/dto/CLOUDSCRIPT.md#executefunctionoperationresponse) |
| `executeFunctionAsync(requestData: CloudScriptModels.AdminExecuteFunctionRequestData, overrideAuthToken?: string, overrideSecretKey?: string, overrideGameId?: string, customTags?: GNHashtable, timeout?: number): Promise<CloudScriptResponseModels.ExecuteFunctionOperationResponse>` | `admin.cloudScript.executeFunctionAsync(requestData, overrideAuthToken?, overrideSecretKey?, overrideGameId?, customTags?, timeout?)` | [AdminExecuteFunctionRequestData](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/dto/CLOUDSCRIPT.md#adminexecutefunctionrequestdata) | [ExecuteFunctionOperationResponse](/node_modules/@xmobitea/gearn-typescript-client-sdk/docs/reference/dto/CLOUDSCRIPT.md#executefunctionoperationresponse) |
