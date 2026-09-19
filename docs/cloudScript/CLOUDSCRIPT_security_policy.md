# CLOUDSCRIPT SECURITY POLICY

## 1. Mục đích

Policy này định nghĩa rule bảo mật cho CloudScript trong GearN Server với threat model:

- `player` là untrusted input.
- `dev tenant` là untrusted code author.
- host, database, secret vận hành, và dữ liệu tenant khác phải được bảo vệ khỏi CloudScript.

CloudScript phải được coi là `tenant code`, không phải trusted server code.

## 2. Nguyên tắc bắt buộc

- `Default deny`: cái gì không được cho phép rõ ràng thì bị cấm.
- Chỉ cho phép `capability` qua wrapper do server kiểm soát.
- Không cho CloudScript nạp thêm module, truy cập process runtime, hay gọi primitive của Node trực tiếp.
- Không cho CloudScript nạp capability ngoài các object được template inject sẵn.
- Validation phải chạy ở service layer trước `compileCloudScript()`, không chỉ ở request handler.
- Validation phải chạy trên đúng source cuối cùng sẽ được compile.

## 3. Phạm vi áp dụng

Policy này áp dụng cho cả:

- CloudScript function được add qua [AddFunctionRequestHandler.ts](/src/GN-app-api/handler/controller/handler/cloudScript/AddFunctionRequestHandler.ts)
- Event callback CloudScript được set qua [SetEventCallbackCloudScriptRequestHandler.ts](/src/GN-app-api/handler/controller/handler/dashboard/SetEventCallbackCloudScriptRequestHandler.ts)

## 4. Danh sách syntax bị cấm

Validator phải parse TypeScript AST và reject ngay nếu gặp bất kỳ syntax hoặc pattern nào sau đây.

### 4.1 Module loading và code loading

- `ImportDeclaration`
- `ImportEqualsDeclaration`
- `ImportExpression`
- `ExportDeclaration`
- `ExportAssignment`
- `NamespaceExport`
- `require(...)`
- `module.require(...)`
- `process.mainModule.require(...)`
- `createRequire(...)`

### 4.2 Dynamic code execution

- `eval(...)`
- `WebAssembly.compile(...)`
- `WebAssembly.instantiate(...)`

### 4.3 Runtime escape và host access

Lưu ý: các pattern dưới đây là Node.js built-in module và global runtime của Node, không liên quan đến CloudScript wrapper `http` được inject sẵn. CloudScript wrapper `http` vẫn được phép dùng theo section 6.4.

- Bất kỳ call hoặc member access nào chạm tới:
    - `process.binding(...)`
    - `process.dlopen(...)`
    - `child_process.*`
    - `worker_threads.*`
    - `vm.*`
    - `inspector.*`
    - `v8.*`
    - `fs.*`
    - `fs/promises.*`
    - `net.*`
    - `tls.*`
    - `dns.*`
    - `os.*`
    - `path.*`
    - `https.*` — Node.js built-in `https` module, không phải CloudScript wrapper `http`
    - `undici.*`

### 4.4 Prototype, reflection và constructor escape

- Member chain chứa một trong các pattern:
    - `.constructor.constructor`
    - `.__proto__`
    - `.prototype`
- `Object.defineProperty(...)` khi target là global object hoặc capability object
- `Object.setPrototypeOf(...)`
- `Reflect.construct(...)`
- `Proxy(...)`

### 4.5 Top-level executable statement

Ở top-level của submitted script, chỉ cho phép:

- `FunctionDeclaration`
- `EnumDeclaration`
- `VariableStatement` với `const`
- `ExpressionStatement` để đăng ký handler vào đúng registry
- `TypeAliasDeclaration`
- `InterfaceDeclaration`

Top-level sau đây bị cấm:

- `CallExpression`
- `NewExpression`
- `AwaitExpression`
- `IfStatement`
- `ForStatement`
- `ForInStatement`
- `ForOfStatement`
- `WhileStatement`
- `DoStatement`
- `TryStatement`
- `SwitchStatement`
- `WithStatement`
- `DebuggerStatement`

Lý do: worker process tồn tại lâu, top-level side effect có thể biến CloudScript thành background job trái phép.

### 4.6 Timer và async scheduling primitive

- `setTimeout(...)`
- `setInterval(...)`
- `setImmediate(...)`
- `queueMicrotask(...)`

## 5. Danh sách identifier bị cấm

Các tên sau đây bị cấm khi xuất hiện như free identifier, callee, base object, hoặc tên biến top-level.

Lưu ý: `https` trong danh sách này là Node.js built-in `https` module — khác hoàn toàn với CloudScript wrapper `http` được inject sẵn. Identifier `http` không bị cấm; nó vẫn được phép dùng theo section 6.4.

- `require`
- `module`
- `exports`
- `process`
- `global`
- `globalThis`
- `Function`
- `AsyncFunction`
- `GeneratorFunction`
- `Buffer`
- `__dirname`
- `__filename`
- `eval`
- `Proxy`
- `Reflect`
- `WebAssembly`
- `fetch`
- `Headers`
- `Request`
- `Response`
- `AbortController`
- `AbortSignal`
- `GNNetwork`
- `child_process`
- `worker_threads`
- `vm`
- `fs`
- `net`
- `tls`
- `dns`
- `https` — Node.js built-in `https` module, không phải CloudScript wrapper `http`
- `os`
- `path`
- `inspector`
- `v8`
- `setTimeout`
- `setInterval`
- `setImmediate`
- `queueMicrotask`

## 6. Capability được phép

Policy mặc định chỉ cho phép capability hẹp sau đây.

### 6.1 Pure logic

- Tính toán thuần
- Thao tác string, number, boolean
- Tạo object JSON và array JSON
- `if`, `switch`, loop, `try/catch`, `async/await` bên trong handler
- Helper function cục bộ

### 6.2 Runtime context

- `gameId`
- `args`
- `context.userId`
- `context.customTags`
- `log`

### 6.3 Handler registry được phép

#### CloudScript function

Chỉ được đăng ký vào:

- `handlers["functionName"] = async (...) => { ... }`

Rule:

- Phải có ít nhất 1 handler
- Mỗi handler name dài `3..30`
- Không trùng tên trong cùng script

#### Event callback CloudScript

Chỉ được đăng ký vào đúng một registry map theo prefix của `eventName`:

- `preHandlers["pre_*"]`
- `postHandlers["post_*"]`
- `systemHandlers["system_*"]`
- `eventHandlers["event_*"]`
- `systemMatchmakingHandlers["systemMatchmaking_*"]`
- `systemAuthenticateHandlers["systemAuthenticate_*"]`
- `systemGenericServiceHandlers["systemGenericService_*"]`
- `socketHandlers["socket_*"]`

Rule:

- Submitted child script chỉ được đăng ký đúng `1` handler
- Tên key phải khớp chính xác `eventName` request gửi lên
- Registry map phải khớp chính xác prefix của `eventName`

### 6.4 Side-effect capability được phép

#### `socket`

Cho phép dùng các method ở [CloudScriptSocket.ts](/dist/GN-startup/cloudScript/CloudScriptSocket.ts):

- `sendEventTo`
- `sendEventToMoreUser`
- `sendEventToAllPlayer`
- `joinRoom`
- `leaveRoom`
- `sendEventToRoom`

#### `mail`

Cho phép dùng các method ở [CloudScriptMail.ts](/dist/GN-startup/cloudScript/CloudScriptMail.ts):

- `send`
- `sendToMore`

#### `pushNotification`

Cho phép dùng các method ở [CloudScriptPushNotification.ts](/dist/GN-startup/cloudScript/CloudScriptPushNotification.ts):

- `send`
- `sendToMore`
- `sendToTopic`
- `subscribeToTopic`
- `unsubscribeFromTopic`

#### `http`

Chỉ cho phép qua wrapper [CloudScriptHttp.ts](/dist/GN-startup/cloudScript/CloudScriptHttp.ts):

- `get`
- `delete`
- `head`
- `options`
- `post`
- `put`
- `patch`

#### Raw injected objects

Theo runtime policy hiện tại, CloudScript được phép dùng các object inject sẵn sau:

- `database`
- `admin`
- `mongodb`
- `axios`

Runtime rule bắt buộc:

- Chỉ gọi được hostname trong allowlist của tenant hoặc global allowlist
- Cấm IP literal
- Cấm loopback
- Cấm private CIDR
- Cấm metadata endpoint
- Cấm custom proxy/agent
- Áp timeout, body size limit, response size limit

### 6.5 Capability vẫn bị cấm

Các capability sau vẫn phải bị cấm:

- Nạp module mới bằng `import` hoặc `require`
- Direct network qua `fetch`
- Bất kỳ host primitive nào của Node runtime ngoài object inject sẵn

## 7. Flow validate trước `compileCloudScript()`

## 7.1 Điểm tích hợp bắt buộc

Phải tạo validator trung tâm, ví dụ:

- `src/GN-app-api/service/CloudScriptSecurityValidator.ts`

Validator này phải được gọi tại:

- [CloudScriptService.ts](/src/GN-app-api/service/CloudScriptService.ts) trong `addCloudScriptFunction(...)`
- [EventCallbackService.ts](/src/GN-app-api/service/EventCallbackService.ts) trong `addCloudScriptFunction(...)`

Không được chỉ validate ở request handler, vì service layer mới là source of truth trước `compileCloudScript()`.

## 7.2 Flow chuẩn cho CloudScript function

1. Nhận `script` từ request.
2. Normalize line ending sang `\n`.
3. Reject nếu:
    - script rỗng
    - size vượt `64 KiB`
    - chứa byte null
4. Chạy lexical denylist fail-fast với token rõ ràng:
    - `GNNetwork`
    - `require`
    - `import`
    - `process`
    - `globalThis`
    - `fetch`
5. Parse AST bằng TypeScript compiler API.
6. Nếu parse error thì reject.
7. Walk AST với scope tracking:
    - reject syntax bị cấm
    - reject identifier bị cấm
    - reject top-level executable statement
    - collect handler registration
8. Validate handler rule:
    - ít nhất 1 handler
    - name hợp lệ
    - không trùng
9. Chỉ nếu pass toàn bộ bước trên mới gọi `compileCloudScript(script, version)`.
10. Transpile riêng submitted script bằng TypeScript compiler API và scan lại emitted JS:

- `require(`
- `process.`
- `module.exports`
- `exports.`
- `import(`
- `fetch(`

11. Nếu emitted JS chứa token cấm thì reject.
12. Chỉ sau đó mới lưu version và spawn worker.

## 7.3 Flow chuẩn cho Event callback CloudScript

1. Nhận `eventName` và `script`.
2. Normalize line ending sang `\n`.
3. Reject nếu:
    - `eventName` không đúng prefix được hỗ trợ
    - script rỗng
    - size vượt `40 KiB`
    - chứa byte null
4. Chạy lexical denylist fail-fast như function mode.
5. Parse AST.
6. Walk AST:
    - reject syntax bị cấm
    - reject identifier bị cấm
    - collect registration target
7. Validate callback rule:
    - đúng `1` registration
    - đúng registry map theo prefix
    - key phải đúng `eventName`
8. Rebuild source cuối cùng sẽ compile.
9. Chạy validator thêm một lần trên chính source cuối cùng đó.
10. Chỉ nếu pass mới gọi `compileCloudScript(finalScript, version)`.
11. Transpile riêng source cuối cùng và scan emitted JS như function mode.
12. Chỉ sau đó mới hot-swap worker.

## 7.4 Lưu ý bắt buộc cho code hiện tại

Trong [EventCallbackService.ts](/src/GN-app-api/service/EventCallbackService.ts), flow hiện tại đang build `finalScript` nhưng lại gọi `compileCloudScript(script, version)`.

Policy bắt buộc:

- Phải validate và compile trên `finalScript`
- Không validate trên source khác với source thật sự sẽ chạy

## 8. Hành vi khi validation fail

- Fail closed
- Không compile
- Không lưu DB
- Không broadcast cluster event
- Trả về message kỹ thuật ngắn, ví dụ:
    - `CloudScript security policy violation: forbidden identifier "process"`
    - `CloudScript security policy violation: top-level call expression is not allowed`
    - `CloudScript security policy violation: event handler key must equal eventName`

Không trả stack trace nội bộ.

## 9. Rule triển khai tối thiểu

Ngay cả khi đã có validator ở trên, vẫn phải làm thêm:

- Chỉ cho CloudScript dùng các object inject sẵn của template, không mở thêm capability khác
- Thêm allowlist runtime cho `http`
- Giảm secret truyền vào worker xuống mức tối thiểu

Validator chỉ là lớp phòng thủ đầu tiên, không phải sandbox thật.
