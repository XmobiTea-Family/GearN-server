const fs = require("fs");
const path = require("path");

let docs = [];

let tsLastUpdate = 1736498427663;

docs.push(
    {
        type: "system",
        version: "M0kf3tA",
        fullScript: "\"use strict\";\nObject.defineProperty(exports, \"__esModule\", { value: true });\nconst gearn_typescript_client_sdk_1 = require(\"@xmobitea/gearn-typescript-client-sdk\");\nconst CloudScriptAdmin_1 = require(\"./CloudScriptAdmin\");\nconst CloudScriptDatabase_1 = require(\"./CloudScriptDatabase\");\nconst CloudScriptHttp_1 = require(\"./CloudScriptHttp\");\nconst CloudScriptSocket_1 = require(\"./CloudScriptSocket\");\nconst CloudScriptMatchmaking_1 = require(\"./CloudScriptMatchmaking\");\nconst CloudScriptMail_1 = require(\"./CloudScriptMail\");\nconst CloudScriptPushNotification_1 = require(\"./CloudScriptPushNotification\");\nvar EventCallbackType;\n(function (EventCallbackType) {\n    EventCallbackType[EventCallbackType[\"Pre\"] = 0] = \"Pre\";\n    EventCallbackType[EventCallbackType[\"Post\"] = 1] = \"Post\";\n    EventCallbackType[EventCallbackType[\"System\"] = 2] = \"System\";\n    EventCallbackType[EventCallbackType[\"SystemMatchmaking\"] = 3] = \"SystemMatchmaking\";\n    EventCallbackType[EventCallbackType[\"SystemAuthenticate\"] = 5] = \"SystemAuthenticate\";\n    EventCallbackType[EventCallbackType[\"Event\"] = 6] = \"Event\";\n    EventCallbackType[EventCallbackType[\"Socket\"] = 7] = \"Socket\";\n    EventCallbackType[EventCallbackType[\"AuthToken\"] = 100] = \"AuthToken\";\n})(EventCallbackType || (EventCallbackType = {}));\nvar ExecuteResponseStatus;\n(function (ExecuteResponseStatus) {\n    ExecuteResponseStatus[ExecuteResponseStatus[\"Ok\"] = 1] = \"Ok\";\n    ExecuteResponseStatus[ExecuteResponseStatus[\"Exception\"] = 2] = \"Exception\";\n    ExecuteResponseStatus[ExecuteResponseStatus[\"FunctionNameNotFound\"] = 3] = \"FunctionNameNotFound\";\n})(ExecuteResponseStatus || (ExecuteResponseStatus = {}));\nprocess?.on(\"message\", async (request) => {\n    if (request.eventType == EventCallbackType.AuthToken) {\n        gearn_typescript_client_sdk_1.GNNetwork.getAuthenticateStatus().setAuthToken(request.gnAuthToken);\n        return;\n    }\n    // Stores the start time value used in the current execution flow.\n    let startTime = performance.now();\n    // Stores the start memory usage value used in the current execution flow.\n    let startMemoryUsage = process.memoryUsage();\n    // Stores the logs value used in the current execution flow.\n    let logs = [];\n    // Stores the handle response value used in the current execution flow.\n    let handleResponse = null;\n    if (request.eventType == EventCallbackType.System) {\n        // Stores the function request value used in the current execution flow.\n        let functionRequest = {\n            /**\n             * Executes the log workflow.\n             * @param log Provides the log value used by this operation.\n             */\n            log(log) {\n                logs.push(JSON.stringify(log));\n            },\n        };\n        handleResponse = await ___handleSystemFunction(request.eventName, functionRequest);\n    }\n    else if (request.eventType == EventCallbackType.Pre || request.eventType == EventCallbackType.Post) {\n        // Stores the origin operation request value used in the current execution flow.\n        let originOperationRequest = request.operationRequest;\n        // Stores the operation request value used in the current execution flow.\n        let operationRequest = new gearn_typescript_client_sdk_1.OperationRequest(originOperationRequest.operationCode);\n        if (originOperationRequest.parameters) {\n            operationRequest.setParameters(gearn_typescript_client_sdk_1.GNHashtable.builder().addAll(originOperationRequest.parameters).build());\n        }\n        if (request.eventType == EventCallbackType.Pre) {\n            // Stores the function request value used in the current execution flow.\n            let functionRequest = {\n                operationRequest: operationRequest,\n                customTags: request.customTags == null ? null : gearn_typescript_client_sdk_1.GNHashtable.builder().addAll(request.customTags).build(),\n                request: request.request,\n                role: request.role,\n                /**\n                 * Executes the log workflow.\n                 * @param log Provides the log value used by this operation.\n                 */\n                log(log) {\n                    logs.push(JSON.stringify(log));\n                },\n            };\n            handleResponse = await ___handlePreFunction(request.eventName, functionRequest);\n        }\n        else if (request.eventType == EventCallbackType.Post) {\n            // Stores the origin operation response value used in the current execution flow.\n            let originOperationResponse = request.operationResponse;\n            // Stores the operation response value used in the current execution flow.\n            let operationResponse = null;\n            if (originOperationResponse) {\n                operationResponse = new gearn_typescript_client_sdk_1.OperationResponse(originOperationRequest.operationCode, originOperationRequest.requestId);\n                operationResponse.setReturnCode(originOperationResponse.returnCode);\n                operationResponse.setDebugMessage(originOperationResponse.debugMessage);\n                if (originOperationResponse.parameters) {\n                    operationResponse.setParameters(gearn_typescript_client_sdk_1.GNHashtable.builder().addAll(originOperationResponse.parameters).build());\n                }\n            }\n            // Stores the function request value used in the current execution flow.\n            let functionRequest = {\n                operationRequest: operationRequest,\n                operationResponse: operationResponse,\n                customTags: request.customTags == null ? null : gearn_typescript_client_sdk_1.GNHashtable.builder().addAll(request.customTags).build(),\n                request: request.request,\n                role: request.role,\n                /**\n                 * Executes the log workflow.\n                 * @param log Provides the log value used by this operation.\n                 */\n                log(log) {\n                    logs.push(JSON.stringify(log));\n                },\n            };\n            handleResponse = await ___handlePostFunction(request.eventName, functionRequest);\n        }\n    }\n    else if (request.eventType == EventCallbackType.Event) {\n        // Stores the origin operation event value used in the current execution flow.\n        let originOperationEvent = request.operationEvent;\n        // Stores the operation event value used in the current execution flow.\n        let operationEvent = new gearn_typescript_client_sdk_1.OperationEvent(originOperationEvent.eventCode, originOperationEvent.parameters ? gearn_typescript_client_sdk_1.GNHashtable.builder().addAll(originOperationEvent.parameters).build() : null);\n        // Stores the function request value used in the current execution flow.\n        let functionRequest = {\n            operationEvent: operationEvent,\n            request: request.request,\n            /**\n             * Executes the log workflow.\n             * @param log Provides the log value used by this operation.\n             */\n            log(log) {\n                logs.push(JSON.stringify(log));\n            },\n        };\n        handleResponse = await ___handleEventFunction(request.eventName, functionRequest);\n    }\n    else if (request.eventType == EventCallbackType.SystemMatchmaking) {\n        // Stores the function request value used in the current execution flow.\n        let functionRequest = {\n            request: request.request,\n            /**\n             * Executes the log workflow.\n             * @param log Provides the log value used by this operation.\n             */\n            log(log) {\n                logs.push(JSON.stringify(log));\n            },\n        };\n        handleResponse = await ___handleSystemMatchmakingFunction(request.eventName, functionRequest);\n    }\n    else if (request.eventType == EventCallbackType.SystemAuthenticate) {\n        if (\"operationRequest\" in request) {\n            // Stores the origin operation request value used in the current execution flow.\n            let originOperationRequest = request.operationRequest;\n            // Stores the operation request value used in the current execution flow.\n            let operationRequest = new gearn_typescript_client_sdk_1.OperationRequest(originOperationRequest.operationCode);\n            if (originOperationRequest.parameters) {\n                operationRequest.setParameters(gearn_typescript_client_sdk_1.GNHashtable.builder().addAll(originOperationRequest.parameters).build());\n            }\n            // Stores the origin operation response value used in the current execution flow.\n            let originOperationResponse = request.operationResponse;\n            // Stores the operation response value used in the current execution flow.\n            let operationResponse = null;\n            if (originOperationResponse) {\n                operationResponse = new gearn_typescript_client_sdk_1.OperationResponse(originOperationRequest.operationCode, originOperationRequest.requestId);\n                operationResponse.setReturnCode(originOperationResponse.returnCode);\n                operationResponse.setDebugMessage(originOperationResponse.debugMessage);\n                if (originOperationResponse.parameters) {\n                    operationResponse.setParameters(gearn_typescript_client_sdk_1.GNHashtable.builder().addAll(originOperationResponse.parameters).build());\n                }\n            }\n            // Stores the function request value used in the current execution flow.\n            let functionRequest = {\n                operationRequest: operationRequest,\n                operationResponse: operationResponse,\n                customTags: request.customTags == null ? null : gearn_typescript_client_sdk_1.GNHashtable.builder().addAll(request.customTags).build(),\n                request: {\n                    userId: request.request.userId,\n                    ipAddress: request.request.ipAddress,\n                    isNewUser: request.request.isNewUser,\n                    authenticationType: request.request.authenticationType,\n                    subData: request.request.subData,\n                },\n                /**\n                 * Executes the log workflow.\n                 * @param log Provides the log value used by this operation.\n                 */\n                log(log) {\n                    logs.push(JSON.stringify(log));\n                },\n            };\n            handleResponse = await ___handleSystemAuthenticateFunction(request.eventName, functionRequest);\n        }\n        else {\n            // Stores the function request value used in the current execution flow.\n            let functionRequest = {\n                request: {\n                    serviceData: request.request.serviceData,\n                    serviceName: request.request.serviceName,\n                },\n                /**\n                 * Executes the log workflow.\n                 * @param log Provides the log value used by this operation.\n                 */\n                log(log) {\n                    logs.push(JSON.stringify(log));\n                },\n            };\n            handleResponse = await ___handleSystemGenericServiceFunction(request.eventName, functionRequest);\n        }\n    }\n    else if (request.eventType == EventCallbackType.Socket) {\n        // Stores the function request value used in the current execution flow.\n        let functionRequest = {\n            request: request.request,\n            /**\n             * Executes the log workflow.\n             * @param log Provides the log value used by this operation.\n             */\n            log(log) {\n                logs.push(JSON.stringify(log));\n            },\n        };\n        handleResponse = await ___handleSocketFunction(request.eventName, functionRequest);\n    }\n    // Stores the end time value used in the current execution flow.\n    let endTime = performance.now();\n    // Stores the end memory usage value used in the current execution flow.\n    let endMemoryUsage = process.memoryUsage();\n    // Stores the memory used in bytes value used in the current execution flow.\n    let memoryUsedInBytes = endMemoryUsage.heapUsed - startMemoryUsage.heapUsed;\n    if (memoryUsedInBytes <= 0)\n        memoryUsedInBytes = 8192;\n    // Stores the execute time in milliseconds value used in the current execution flow.\n    let executeTimeInMs = endTime - startTime;\n    //let cost = (memoryUsedInGb * executeTime) / 1000 * 0.022;\n    let response = {\n        responseId: request.requestId,\n        response: handleResponse,\n        stats: {\n            executeTimeInMs: executeTimeInMs,\n            memoryUsedInBytes: memoryUsedInBytes,\n        },\n        logs: logs,\n    };\n    if (process?.send)\n        process.send(response);\n});\n/**\n * Handles the system matchmaking function.\n * @param name Provides the name value used by this operation.\n * @param request Provides the request value used by this operation.\n * @returns Resolves with the operation result.\n */\nasync function ___handleSystemMatchmakingFunction(name, request) {\n    // Stores the handler value used in the current execution flow.\n    let handler = systemMatchmakingHandlers[name];\n    if (handler == null) {\n        return {\n            status: ExecuteResponseStatus.FunctionNameNotFound,\n            result: null,\n            request: null,\n            errorMessage: null,\n        };\n    }\n    // Stores the answer value used in the current execution flow.\n    let answer = {\n        status: ExecuteResponseStatus.Ok,\n        errorMessage: null,\n        result: null,\n        request: null,\n    };\n    try {\n        // Stores the result value used in the current execution flow.\n        let result = await handler(request.request.gameId, request.request.matchmakingTicketCanMatch, request.log);\n        if (result != null)\n            answer.request = result;\n    }\n    catch (err) {\n        answer.status = ExecuteResponseStatus.Exception;\n        answer.errorMessage = err.message;\n    }\n    return answer;\n}\n/**\n * Handles the system generic service function.\n * @param name Provides the name value used by this operation.\n * @param request Provides the request value used by this operation.\n * @returns Resolves with the operation result.\n */\nasync function ___handleSystemGenericServiceFunction(name, request) {\n    // Stores the handler value used in the current execution flow.\n    let handler = systemGenericServiceHandlers[name];\n    if (handler == null) {\n        return {\n            status: ExecuteResponseStatus.FunctionNameNotFound,\n            result: null,\n            request: null,\n            errorMessage: null,\n        };\n    }\n    // Stores the answer value used in the current execution flow.\n    let answer = {\n        status: ExecuteResponseStatus.Ok,\n        errorMessage: null,\n        result: null,\n        request: null,\n    };\n    try {\n        // Stores the result value used in the current execution flow.\n        let result = await handler(request.request.serviceName, request.request.serviceData, request.log);\n        if (result != null)\n            answer.request = result;\n    }\n    catch (err) {\n        answer.status = ExecuteResponseStatus.Exception;\n        answer.errorMessage = err.message;\n    }\n    return answer;\n}\n/**\n * Handles the socket function.\n * @param name Provides the name value used by this operation.\n * @param request Provides the request value used by this operation.\n * @returns Resolves with the operation result.\n */\nasync function ___handleSocketFunction(name, request) {\n    // Stores the handler value used in the current execution flow.\n    let handler = socketHandlers[name];\n    if (handler == null) {\n        return {\n            status: ExecuteResponseStatus.FunctionNameNotFound,\n            result: null,\n            request: null,\n            errorMessage: null,\n        };\n    }\n    // Stores the answer value used in the current execution flow.\n    let answer = {\n        status: ExecuteResponseStatus.Ok,\n        errorMessage: null,\n        result: null,\n        request: null,\n    };\n    try {\n        await handler(request.request.userId, request.request.socketId, request.log);\n    }\n    catch (err) {\n        answer.status = ExecuteResponseStatus.Exception;\n        answer.errorMessage = err.message;\n    }\n    return answer;\n}\n/**\n * Handles the system authenticate function.\n * @param name Provides the name value used by this operation.\n * @param request Provides the request value used by this operation.\n * @returns Resolves with the operation result.\n */\nasync function ___handleSystemAuthenticateFunction(name, request) {\n    // Stores the handler value used in the current execution flow.\n    let handler = systemAuthenticateHandlers[name];\n    if (handler == null) {\n        return {\n            status: ExecuteResponseStatus.FunctionNameNotFound,\n            result: null,\n            errorMessage: null,\n            request: null,\n        };\n    }\n    // Stores the answer value used in the current execution flow.\n    let answer = {\n        status: ExecuteResponseStatus.Ok,\n        errorMessage: null,\n        result: null,\n        request: null,\n    };\n    try {\n        // Stores the result value used in the current execution flow.\n        let result = await handler(request.request, request.customTags, request.operationRequest, request.operationResponse, request.log);\n        if (result) {\n            answer.result = {\n                returnCode: result.getReturnCode(),\n                debugMessage: result.getDebugMessage(),\n                parameters: result.getParameters()?.toData(),\n            };\n        }\n    }\n    catch (err) {\n        answer.status = ExecuteResponseStatus.Exception;\n        answer.errorMessage = err.message;\n    }\n    return answer;\n}\n/**\n * Handles the system function.\n * @param name Provides the name value used by this operation.\n * @param request Provides the request value used by this operation.\n * @returns Resolves with the operation result.\n */\nasync function ___handleSystemFunction(name, request) {\n    // Stores the handler value used in the current execution flow.\n    let handler = systemHandlers[name];\n    if (handler == null) {\n        return {\n            status: ExecuteResponseStatus.FunctionNameNotFound,\n            result: null,\n            request: null,\n            errorMessage: null,\n        };\n    }\n    // Stores the answer value used in the current execution flow.\n    let answer = {\n        status: ExecuteResponseStatus.Ok,\n        errorMessage: null,\n        result: null,\n        request: null,\n    };\n    try {\n        await handler(request.log);\n    }\n    catch (err) {\n        answer.status = ExecuteResponseStatus.Exception;\n        answer.errorMessage = err.message;\n    }\n    return answer;\n}\n/**\n * Handles the event function.\n * @param name Provides the name value used by this operation.\n * @param request Provides the request value used by this operation.\n * @returns Resolves with the operation result.\n */\nasync function ___handleEventFunction(name, request) {\n    // Stores the handler value used in the current execution flow.\n    let handler = eventHandlers[name];\n    if (handler == null) {\n        return {\n            status: ExecuteResponseStatus.FunctionNameNotFound,\n            result: null,\n            request: null,\n            errorMessage: null,\n        };\n    }\n    // Stores the answer value used in the current execution flow.\n    let answer = {\n        status: ExecuteResponseStatus.Ok,\n        errorMessage: null,\n        result: null,\n        request: null,\n    };\n    try {\n        await handler(request.request, request.operationEvent, request.log);\n        // Stores the operation event value used in the current execution flow.\n        let operationEvent = request.operationEvent;\n        answer.result = {\n            eventCode: operationEvent.getEventCode(),\n            parameters: operationEvent.getParameters()?.toData(),\n        };\n        answer.request = request.request.request;\n    }\n    catch (err) {\n        answer.status = ExecuteResponseStatus.Exception;\n        answer.errorMessage = err.message;\n    }\n    return answer;\n}\n/**\n * Handles the pre function.\n * @param name Provides the name value used by this operation.\n * @param request Provides the request value used by this operation.\n * @returns Resolves with the operation result.\n */\nasync function ___handlePreFunction(name, request) {\n    // Stores the handler value used in the current execution flow.\n    let handler = preHandlers[name];\n    if (handler == null) {\n        return {\n            status: ExecuteResponseStatus.FunctionNameNotFound,\n            result: null,\n            request: null,\n            errorMessage: null,\n        };\n    }\n    // Stores the answer value used in the current execution flow.\n    let answer = {\n        status: ExecuteResponseStatus.Ok,\n        errorMessage: null,\n        result: null,\n        request: null,\n    };\n    try {\n        // Stores the result value used in the current execution flow.\n        let result = await handler(request.request, request.role, request.customTags, request.operationRequest, request.log);\n        if (result)\n            answer.result = {\n                returnCode: result.getReturnCode(),\n                debugMessage: result.getDebugMessage(),\n                parameters: result.getParameters()?.toData(),\n            };\n        answer.request = request.request;\n    }\n    catch (err) {\n        answer.status = ExecuteResponseStatus.Exception;\n        answer.errorMessage = err.message;\n    }\n    return answer;\n}\n/**\n * Handles the post function.\n * @param name Provides the name value used by this operation.\n * @param request Provides the request value used by this operation.\n * @returns Resolves with the operation result.\n */\nasync function ___handlePostFunction(name, request) {\n    // Stores the handler value used in the current execution flow.\n    let handler = postHandlers[name];\n    if (handler == null) {\n        return {\n            status: ExecuteResponseStatus.FunctionNameNotFound,\n            result: null,\n            errorMessage: null,\n            request: null,\n        };\n    }\n    // Stores the answer value used in the current execution flow.\n    let answer = {\n        status: ExecuteResponseStatus.Ok,\n        errorMessage: null,\n        result: null,\n        request: null,\n    };\n    try {\n        // Stores the result value used in the current execution flow.\n        let result = await handler(request.request, request.role, request.customTags, request.operationRequest, request.operationResponse, request.log);\n        if (result) {\n            answer.result = {\n                returnCode: result.getReturnCode(),\n                debugMessage: result.getDebugMessage(),\n                parameters: result.getParameters()?.toData(),\n            };\n        }\n    }\n    catch (err) {\n        answer.status = ExecuteResponseStatus.Exception;\n        answer.errorMessage = err.message;\n    }\n    return answer;\n}\n{\n    // Stores the GearN server settings options value used in the current execution flow.\n    let gnServerSettingsOptions = JSON.parse(process.env.gnServerSettingsOptions ?? \"\");\n    // Stores the resolved GearN server settings instance for the current execution flow.\n    let gnServerSettings = new gearn_typescript_client_sdk_1.GNServerSettings();\n    gnServerSettings.config(gnServerSettingsOptions);\n    gearn_typescript_client_sdk_1.GNNetwork.init(gnServerSettings);\n    gearn_typescript_client_sdk_1.GNNetwork.getAuthenticateStatus().setAuthToken(process.env.gnAuthToken);\n    gearn_typescript_client_sdk_1.GNNetwork.getAuthenticateStatus().setUserId(\"cloudScript\");\n}\n// Stores the admin value used by this module.\nconst admin = new CloudScriptAdmin_1.CloudScriptAdmin();\n// Stores the database value used by this module.\nconst database = new CloudScriptDatabase_1.CloudScriptDatabase();\n// Stores the HTTP value used by this module.\nconst http = new CloudScriptHttp_1.CloudScriptHttp();\n// Stores the socket value used by this module.\nconst socket = new CloudScriptSocket_1.CloudScriptSocket();\n// Stores the matchmaking value used by this module.\nconst matchmaking = new CloudScriptMatchmaking_1.CloudScriptMatchmaking();\n// Stores the mail value used by this module.\nconst mail = new CloudScriptMail_1.CloudScriptMail();\n// Stores the push notification value used by this module.\nconst pushNotification = new CloudScriptPushNotification_1.CloudScriptPushNotification();\n{\n    // Stores the database connection value used in the current execution flow.\n    let dbConnection = JSON.parse(process.env.dbConnection ?? \"\");\n    database.init(dbConnection.url, dbConnection.dbName, dbConnection.logUrl, dbConnection.logDbName, dbConnection.options);\n}\n// release after init success\nprocess.env.dbConnection = \"\";\nprocess.env.gnServerSettingsOptions = \"\";\nprocess.env.gnAuthToken = \"\";\n// Stores the pre handlers value used by this module.\nconst preHandlers = {};\n// Stores the post handlers value used by this module.\nconst postHandlers = {};\n// Stores the system handlers value used by this module.\nconst systemHandlers = {};\n// Stores the event handlers value used by this module.\nconst eventHandlers = {};\n// Stores the system matchmaking handlers value used by this module.\nconst systemMatchmakingHandlers = {};\n// Stores the system authenticate handlers value used by this module.\nconst systemAuthenticateHandlers = {};\n// Stores the system generic service handlers value used by this module.\nconst systemGenericServiceHandlers = {};\n// Stores the socket handlers value used by this module.\nconst socketHandlers = {};\nsystemHandlers[\"system_OnEveryMinute\"] = async (log) => {\n};\nsystemHandlers[\"system_OnEveryHour\"] = async (log) => {\n};\nsystemHandlers[\"system_OnEveryDay\"] = async (log) => {\n};\n",
        tsLastUpdate: tsLastUpdate,
        childScripts: [
            {
                eventName: "system_OnEveryMinute",
                script: "\nsystemHandlers[\"system_OnEveryMinute\"] = async (log: (message: any) => void) => {\n\n}\n",
                hasEdit: true,
            },
            {
                eventName: "system_OnEveryHour",
                script: "\nsystemHandler[\"system_OnEveryHour\"] = async (log: (message: any) => void) => {\n\n}\n",
                hasEdit: true,
            },
            {
                eventName: "system_OnEveryDay",
                script: "\nsystemHandlers[\"system_OnEveryDay\"] = async (log: (message: any) => void) => {\n\n}\n",
                hasEdit: true,
            },
        ],
    },
    {
        type: "systemMatchmaking",
        version: "FIRSTVER",
        fullScript: "// first full script",
        tsLastUpdate: tsLastUpdate,
        childScripts: [
            {
                eventName: "systemMatchmaking_RequestServerDetail",
                script: "\nsystemMatchmakingHandlers[\"systemMatchmaking_RequestServerDetail\"] = async (gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch, log: (message: any) => void): Promise<{ success: boolean }> => {\n\t//call matchmaking.confirmServerDetail(gameId, matchmakingTicketCanMatch, { ipV4Address: '127.0.0.1', ports: [{ name: 'GamePort', publicPort: 2202, privatePort: 3000, protocol: 1 }] }); // after setup success a dedicated server;\n\treturn { success: false };\n}\n",
                hasEdit: false,
            },
        ],
    },
    {
        type: "systemAuthenticate",
        version: "FIRSTVER",
        fullScript: "// first full script",
        tsLastUpdate: tsLastUpdate,
        childScripts: [
            {
                eventName: "systemAuthenticate_OnAuthenticateSuccess",
                script: "\nsystemAuthenticateHandlers[\"systemAuthenticate_OnAuthenticateSuccess\"] = async (request: { userId: string, ipAddress: string, isNewUser: boolean, authenticationType: string, subData: { [k: string]: any; } }, secretInfo: SecretInfo, operationRequest: OperationRequest, operationResponse: OperationResponse, log: (message: any) => void) => {\n\n\treturn operationResponse;\n}\n",
                hasEdit: false,
            },
            {
                eventName: "systemAuthenticate_VerifyGenericService",
                script: "\nsystemGenericServiceHandlers[\"systemAuthenticate_VerifyGenericService\"] = async (serviceName: string, serviceData: { [k: string]: any; }, log: (message: any) => void): Promise<{ success: boolean, serviceId: string, someDatas?: any, errorMessage?: string }> => {\n\n\treturn { success: false, serviceId: null, };\n}\n",
                hasEdit: false,
            },
        ],
    },
    {
        type: "event",
        version: "FIRSTVER",
        fullScript: "// first full script",
        tsLastUpdate: tsLastUpdate,
        childScripts: [
            {
                eventName: "event_SendEventTo",
                script: "\neventHandlers[\"event_SendEventTo\"] = async (request: { userId: string }, operationEvent: OperationEvent, log: (message: any) => void) => {\n\n}\n",
                hasEdit: false,
            },
            {
                eventName: "event_SendEventToRoom",
                script: "\neventHandlers[\"event_SendEventToRoom\"] = async (request: { roomId: string }, operationEvent: OperationEvent, log: (message: any) => void) => {\n\n}\n",
                hasEdit: false,
            },
            {
                eventName: "event_SendEventToMoreUser",
                script: "\neventHandlers[\"event_SendEventToMoreUser\"] = async (request: { userIds: string[] }, operationEvent: OperationEvent, log: (message: any) => void) => {\n\n}\n",
                hasEdit: false,
            },
            {
                eventName: "event_SendEventToAllPlayer",
                script: "\neventHandlers[\"event_SendEventToAllPlayer\"] = async (request: {}, operationEvent: OperationEvent, log: (message: any) => void) => {\n\n}\n",
                hasEdit: false,
            },
        ],
    },
    {
        type: "socket",
        version: "FIRSTVER",
        fullScript: "// first full script",
        tsLastUpdate: tsLastUpdate,
        childScripts: [
            {
                eventName: "socket_OnSocketConnected",
                script: "\nsocketHandlers[\"socket_OnSocketConnected\"] = async (userId: string, socketId: string, log: (message: any) => void) => {\n\n}\n",
                hasEdit: false,
            },
            {
                eventName: "socket_OnSocketDisconnected",
                script: "\nsocketHandlers[\"socket_OnSocketDisconnected\"] = async (userId: string, socketId: string, log: (message: any) => void) => {\n\n}\n",
                hasEdit: false,
            },
        ],
    },
);

docs.push(readAllTsFiles("authenticate"));
docs.push(readAllTsFiles("characterPlayer"));
docs.push(readAllTsFiles("cloudScript"));
docs.push(readAllTsFiles("content"));
docs.push(readAllTsFiles("dashboard"));
docs.push(readAllTsFiles("gamePlayer"));
docs.push(readAllTsFiles("group"));
docs.push(readAllTsFiles("inventory"));
docs.push(readAllTsFiles("masterPlayer"));
docs.push(readAllTsFiles("multiplayer"));
docs.push(readAllTsFiles("storeInventory"));

writeJson(docs);

function readAllTsFiles(name) {
    let directory = "./src/GN-app-api/handler/controller/handler/" + name;

    let answer = {
        type: name,
        version: "FIRSTVER",
        fullScript: "// first full script",
        tsLastUpdate: tsLastUpdate,
        childScripts: [],
    };

    try {
        // Lấy danh sách tất cả các file và folder trong thư mục
        const files = fs.readdirSync(directory, { withFileTypes: true });

        for (const file of files) {
            const filePath = path.join(directory, file.name);

            if (file.isDirectory()) {
            } else if (file.isFile() && !file.name.endsWith("BaseRequestHandler.ts") && file.name != "MatchmakingHandler.ts" && file.name.endsWith(".ts")) {
                // Nếu là file .ts, đọc nội dung file
                const content = fs.readFileSync(filePath, "utf-8");

                let lines = content.split("\n");

                let line2;

                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i];

                    let trim = line.trimStart();
                    if (trim.startsWith("private async execute(")) {
                        line2 = line;
                        break;
                    }
                }

                if (!line2) {
                    console.log("filePath not has data " + filePath);
                } else {
                    // line2 =     private async execute(request: { userId: string, eventCode: string, eventParameters: { [k: string]: any } }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {

                    // line2.split("(")[1] = request: { userId: string, eventCode: string, eventParameters: { [k: string]: any } }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {

                    // line2 = private async execute(request: { serviceName: string, serviceData: { [k: string]: any }, createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {

                    // line2s[0] = private async execute
                    // line2s[1] = request: { serviceName: string, serviceData: { [k: string]: any }, createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
                    // finalLine2 = request: { serviceName: string, serviceData: { [k: string]: any }, createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {

                    // line3s[0] = request: { serviceName: string, serviceData: { [k: string]: any }, createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest
                    // line3s[1] = : Promise<OperationResponse> {
                    // finalLine3 = request: { serviceName: string, serviceData: { [k: string]: any }, createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest

                    // line4s[0] = request: { serviceName: string, serviceData: { [k: string]: any
                    // line4s[1] = , createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string
                    // line4s[2] = , secretInfo: SecretInfo, operationRequest: OperationRequest

                    let line2s = line2.split("(");
                    let finalLine2 = "";
                    for (let i = 1; i < line2s.length; i++) {
                        finalLine2 += line2s[i];
                        if (i < line2s.length - 1) finalLine2 += "(";
                    }

                    let line3s = finalLine2.split(")");
                    let finalLine3 = "";
                    for (let i = 0; i < line3s.length - 1; i++) {
                        finalLine3 += line3s[i];

                        if (i < line3s.length - 2) finalLine3 += ")";
                    }

                    //async (request: { androidDeviceId: string, createPlayerIfNotExists: boolean, infoRequestParam: authenticate_InfoRequestParam, ipAddress: string }, secretInfo: SecretInfo, operationRequest: OperationRequest)
                    //async (request: { gameId: string, requestParams: ServerGameDataRequestParams }, secretInfo: SecretInfo, operationRequest: OperationRequest)
                    let line4s = finalLine3.split("}");
                    let finalLine4 = "";
                    for (let i = 0; i < line4s.length - 1; i++) {
                        finalLine4 += line4s[i];

                        if (i < line4s.length - 2) finalLine4 += "}";
                    }

                    let spls2 = finalLine4 + "}";

                    spls2 = spls2.replace("infoRequestParam: InfoRequestParam", "infoRequestParam: " + name + "_InfoRequestParam");

                    let childScript = {
                        eventName: name + "_" + file.name.replace("RequestHandler.ts", ""),
                        script: "",
                        hasEdit: false,
                    };

                    let script = "\n";
                    script += "preHandlers[\"" + childScript.eventName + "\"] = async (" + spls2 + ", role: SecretRole, customTags: GNHashtable, operationRequest: OperationRequest, log: (message: any) => void) => {\n";
                    script += "\n";
                    script += "\treturn null;\n";
                    script += "}\n";
                    script += "\n";

                    script += "postHandlers[\"" + childScript.eventName + "\"] = async (" + spls2 + ", role: SecretRole, customTags: GNHashtable, operationRequest: OperationRequest, operationResponse: OperationResponse, log: (message: any) => void) => {\n";
                    script += "\n";
                    script += "\treturn operationResponse;\n";
                    script += "}\n";

                    childScript.script = script;

                    answer.childScripts.push(childScript);
                }
            }
        }
    } catch (error) {
        console.error("Error reading files:", error);
    }

    return answer;
}

function writeJson(docs) {
    fs.writeFileSync("./src/GN-startup/cloudScript/eventCallbackCloudScriptData.json", JSON.stringify(docs, null, 4));
}
