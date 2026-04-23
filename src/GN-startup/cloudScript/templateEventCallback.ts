import { SecretInfo, SecretPermissionItem, SecretRole } from "./../../index";
import { AuthInfo } from "./../../index";
import { authenticate_InfoRequestParam as authenticate_InfoRequestParam } from "./../../index";
import { characterPlayer_InfoRequestParam as characterPlayer_InfoRequestParam } from "./../../index";
import { gamePlayer_InfoRequestParam as gamePlayer_InfoRequestParam } from "./../../index";
import { group_InfoRequestParam as group_InfoRequestParam } from "./../../index";
import { inventory_InfoRequestParam as inventory_InfoRequestParam } from "./../../index";
import { masterPlayer_InfoRequestParam as masterPlayer_InfoRequestParam } from "./../../index";
import { storeInventory_InfoRequestParam as storeInventory_InfoRequestParam } from "./../../index";
import { PermissionParam } from "./../../index";

import { ContentDataParam } from "./../../index";

import { CustomDataParam } from "./../../index";
// import { GroupMemberParam } from "./../../index";
import { PlayerCurrencyParam } from "./../../index";
import { PlayerDataParam } from "./../../index";
import { PlayerStatisticsParam } from "./../../index";

import { GroupCurrencyParam } from "./../../index";
import { GroupDataParam } from "./../../index";
import { GroupMemberParam } from "./../../index";
import { GroupMessageItem } from "./../../index";
import { GroupStatisticsParam } from "./../../index";

import { ItemDataParam } from "./../../index";
import { ItemStatisticsParam } from "./../../index";

import { AvatarParam } from "./../../index";
import { CurrencyParam } from "./../../index";
import { InAppPurchaseParam } from "./../../index";
import { StoreDataParam } from "./../../index";
import { StoreItemParam } from "./../../index";
import { TagParam } from "./../../index";

import { AuthenticatePermissionRulesParam } from "./../../index";
import { CharacterCatalogSettingsParam } from "./../../index";
import { CharacterPlayerPermissionRulesParam } from "./../../index";
import { CharacterPlayerSettingsParam } from "./../../index";
import { CloudScriptPermissionRulesParam } from "./../../index";
import { ContentPermissionRulesParam } from "./../../index";
import { CurrencySettingsParam } from "./../../index";
import { DataSettingsParam } from "./../../index";
import { FriendCatalogSettingsParam } from "./../../index";
import { GamePlayerPermissionRulesParam } from "./../../index";
import { GamePlayerSettingsParam } from "./../../index";
import { GameSettingsParam } from "./../../index";
import { GenericServiceSettingsParam } from "./../../index";
import { GroupCatalogSettingsParam } from "./../../index";
import { GroupPermissionRulesParam } from "./../../index";
import { GroupSettingsParam } from "./../../index";
import { InventoryPermissionRulesParam } from "./../../index";
import { InventorySettingsParam } from "./../../index";
import { ItemCatalogSettingsParam } from "./../../index";
import { ItemClassSettingsParam } from "./../../index";
import { MasterAdminPermissionRulesParam } from "./../../index";
import { MasterPlayerPermissionRulesParam } from "./../../index";
import { MasterPlayerSettingsParam } from "./../../index";
import { MatchmakingQueueSettingsParam } from "./../../index";
import { MultiplayerPermissionRulesParam } from "./../../index";
import { PermissionRulesParam } from "./../../index";
import { StatisticsSettingsParam } from "./../../index";
import { StoreInventoryPermissionRulesParam } from "./../../index";
import { TagSettingsParam } from "./../../index";
import { ThirtPartyAppleSettingsParam } from "./../../index";
import { ThirtPartyFacebookSettingsParam } from "./../../index";
import { ThirtPartyGameCenterSettingsParam } from "./../../index";
import { ThirtPartyGooglePlayGameSettingsParam } from "./../../index";
import { ThirtPartyParam } from "./../../index";
import { EmailSettingsParam } from "./../../index";
import { PushNotificationSettingsParam } from "./../../index";
import { AnalyticsRequestParams } from "./../../index";
import { ServerGameDataRequestParams } from "./../../index";
import { MatchmakingTicketCanMatch } from "./../../index";
import { ServerDetail } from "./../../index";

import {
	GNNetwork,
	Action0,
	Action1,
	Action2,
	Action3,
	Action4,
	ConverterService,
	OwnerType,
	ErrorCode,
	ParameterCode,
	Commands,
	EventCode,
	OperationCode,
	ReturnCode,
	CodeHelper,
	DataMember,
	StringDataMember,
	BooleanDataMember,
	GNHashtableDataMember,
	GNArrayDataMember,
	NumberDataMember,
	GNHashtableBuilder,
	GNHashtable,
	GNArrayBuilder,
	GNArray,
	InvalidMemberType,
	InvalidMember,
	RequestType,
	RequestRole,
	CustomOperationRequest,
	CustomOperationRequestAbstract,
	CustomOperationResponse,
	Constructor,
	AbstractConstructor,
	FieldDataType,
	GNObjectFieldMetadata,
	GNObjectMetadata,
	CustomOperationResponseAbstract,
	IServerEventHandler,
	OperationEvent,
	OperationRequest,
	OperationResponse,
	GenericModels,
	CharacterPlayerModels,
	ContentModels,
	GamePlayerModels,
	GroupModels,
	InventoryModels,
	MasterPlayerModels,
	StoreInventoryModels,
	MultiplayerModels,
	CloudScriptModels,
	GNServerSettingsOptions,
	GNServerSettings,
	PermissionDataItem,
	FriendStatus,
	GoogleLoginType,
	GroupStatus,
	GNDebug,
	ItemType,
	StoreItemType,
	LogType,
	GNSupport,
	PostType,
	GetAuthInfoResponse,
	PushPlatformType,
	StoreReceiveType,
	GNUtils,
} from "@xmobitea/gn-typescript-client";

import * as mongodb from "mongodb";
import * as axios from "axios";

import { CloudScriptAdmin } from "./CloudScriptAdmin";
import { CloudScriptDatabase } from "./CloudScriptDatabase";
import { CloudScriptHttp } from "./CloudScriptHttp";
import { CloudScriptSocket } from "./CloudScriptSocket";
import { CloudScriptMatchmaking } from "./CloudScriptMatchmaking";
import { CloudScriptMail } from "./CloudScriptMail";
import { CloudScriptPushNotification } from "./CloudScriptPushNotification";

enum EventCallbackType {
	Pre = 0,
	Post = 1,
	System = 2,
	SystemMatchmaking = 3,
	SystemAuthenticate = 5,
	Event = 6,
	Socket = 7,
}

interface CloudScriptRequestPre {
	// Stores the request ID value used by this contract.
	requestId: string;
	// Stores the event type value used by this contract.
	eventType: EventCallbackType.Pre;
	// Stores the event name value used by this contract.
	eventName: string;
	// Stores the request collection used by this contract.
	request: { [k: string]: any };
	// Stores the role value used by this contract.
	role: SecretRole;
	// Stores the secret info value used by this contract.
	secretInfo: {
		// Stores the secret key value used by this contract.
		secretKey: string;
		// Stores the description value used by this contract.
		description: string;
		// Stores the role value used by this contract.
		role: number;
		// Indicates whether remove.
		remove: boolean;
		// Stores the timestamp expire value used by this contract.
		tsExpire: number;
		// Stores the permission value used by this contract.
		permission: SecretPermissionItem;
		// Stores the game ID value used by this contract.
		gameId: string;
		// Indicates whether default.
		isDefault: boolean;
		// Indicates whether only master admin should be allowed.
		onlyMasterAdmin: boolean;
	};
	// Stores the operation request value used by this contract.
	operationRequest: {
		// Stores the operation code value used by this contract.
		operationCode: string;
		// Stores the request ID value used by this contract.
		requestId: number;
		// Stores the parameters value used by this contract.
		parameters: {};
	};
}

interface CloudScriptRequestPost {
	// Stores the request ID value used by this contract.
	requestId: string;
	// Stores the event type value used by this contract.
	eventType: EventCallbackType.Post;
	// Stores the event name value used by this contract.
	eventName: string;
	// Stores the request collection used by this contract.
	request: { [k: string]: any };
	// Stores the role value used by this contract.
	role: SecretRole;
	// Stores the secret info value used by this contract.
	secretInfo: {
		// Stores the secret key value used by this contract.
		secretKey: string;
		// Stores the description value used by this contract.
		description: string;
		// Stores the role value used by this contract.
		role: number;
		// Indicates whether remove.
		remove: boolean;
		// Stores the timestamp expire value used by this contract.
		tsExpire: number;
		// Stores the permission value used by this contract.
		permission: SecretPermissionItem;
		// Stores the game ID value used by this contract.
		gameId: string;
		// Indicates whether default.
		isDefault: boolean;
		// Indicates whether only master admin should be allowed.
		onlyMasterAdmin: boolean;
	};
	// Stores the operation request value used by this contract.
	operationRequest: {
		// Stores the operation code value used by this contract.
		operationCode: string;
		// Stores the request ID value used by this contract.
		requestId: number;
		// Stores the parameters value used by this contract.
		parameters: {};
	};
	// Stores the operation response value used by this contract.
	operationResponse: {
		// Stores the return code value used by this contract.
		returnCode: number;
		// Stores the debug message value used by this contract.
		debugMessage: string;
		// Stores the parameters value used by this contract.
		parameters: {};
	};
}

interface CloudScriptRequestSystem {
	// Stores the request ID value used by this contract.
	requestId: string;
	// Stores the event type value used by this contract.
	eventType: EventCallbackType.System;
	// Stores the event name value used by this contract.
	eventName: string;
}

interface CloudScriptRequestSystemMatchmaking {
	// Stores the request ID value used by this contract.
	requestId: string;
	// Stores the event type value used by this contract.
	eventType: EventCallbackType.SystemMatchmaking;
	// Stores the event name value used by this contract.
	eventName: string;
	// Stores the request value used by this contract.
	request: {
		// Stores the game ID value used by this contract.
		gameId: string;
		// Stores the matchmaking ticket can match value used by this contract.
		matchmakingTicketCanMatch: MatchmakingTicketCanMatch;
	};
}

interface CloudScriptRequestSystemAuthenticate {
	// Stores the request ID value used by this contract.
	requestId: string;
	// Stores the event type value used by this contract.
	eventType: EventCallbackType.SystemAuthenticate;
	// Stores the event name value used by this contract.
	eventName: string;
	// Stores the request collection used by this contract.
	request: { [k: string]: any };
	// Stores the operation request value used by this contract.
	operationRequest?: {
		// Stores the operation code value used by this contract.
		operationCode: string;
		// Stores the request ID value used by this contract.
		requestId: number;
		// Stores the parameters value used by this contract.
		parameters: {};
	};
	// Stores the operation response value used by this contract.
	operationResponse?: {
		// Stores the return code value used by this contract.
		returnCode: number;
		// Stores the debug message value used by this contract.
		debugMessage: string;
		// Stores the parameters value used by this contract.
		parameters: {};
	};
	// Stores the secret info value used by this contract.
	secretInfo?: {
		// Stores the secret key value used by this contract.
		secretKey: string;
		// Stores the description value used by this contract.
		description: string;
		// Stores the role value used by this contract.
		role: number;
		// Indicates whether remove.
		remove: boolean;
		// Stores the timestamp expire value used by this contract.
		tsExpire: number;
		// Stores the permission value used by this contract.
		permission: SecretPermissionItem;
		// Stores the game ID value used by this contract.
		gameId: string;
		// Indicates whether default.
		isDefault: boolean;
		// Indicates whether only master admin should be allowed.
		onlyMasterAdmin: boolean;
	};
};

interface CloudScriptRequestEvent {
	// Stores the request ID value used by this contract.
	requestId: string;
	// Stores the event type value used by this contract.
	eventType: EventCallbackType.Event;
	// Stores the event name value used by this contract.
	eventName: string;
	// Stores the request collection used by this contract.
	request: { [k: string]: any };
	// Stores the operation event value used by this contract.
	operationEvent: {
		// Stores the event code value used by this contract.
		eventCode: string;
		// Stores the parameters value used by this contract.
		parameters: {};
	};
}

interface CloudScriptRequestSocket {
	// Stores the request ID value used by this contract.
	requestId: string;
	// Stores the event type value used by this contract.
	eventType: EventCallbackType.Socket;
	// Stores the event name value used by this contract.
	eventName: string;
	// Stores the request collection used by this contract.
	request: { [k: string]: any };
}

interface CloudScriptRequestVerifyGenericService {
	requestId: string,
	eventName: string,
	eventType: EventCallbackType.SystemAuthenticate,
	request: {
		serviceName: string,
		serviceData: {
			[k: string]: any;
		},
	},
};

type CloudScriptRequest = CloudScriptRequestPre | CloudScriptRequestPost | CloudScriptRequestSystem | CloudScriptRequestSystemMatchmaking | CloudScriptRequestSystemAuthenticate | CloudScriptRequestEvent | CloudScriptRequestSocket | CloudScriptRequestVerifyGenericService;

interface CloudScriptResponse {
	// Stores the stats value used by this contract.
	stats: {
		// Stores the memory used in bytes value used by this contract.
		memoryUsedInBytes: number;
		// Stores the execute time in milliseconds value used by this contract.
		executeTimeInMs: number;
	};
	// Stores the response value used by this contract.
	response: FunctionResponse;
	// Stores the response ID value used by this contract.
	responseId: string;
	// Stores the logs list used by this contract.
	logs: string[];
}

interface FunctionRequestPre {
	// Stores the request collection used by this contract.
	request: { [k: string]: any };
	// Stores the role value used by this contract.
	role: SecretRole;
	// Stores the secret info value used by this contract.
	secretInfo: SecretInfo;
	// Stores the operation request value used by this contract.
	operationRequest: OperationRequest;
	// Stores the log value used by this contract.
	log: (log: any) => void;
}

interface FunctionRequestPost {
	// Stores the request collection used by this contract.
	request: { [k: string]: any };
	// Stores the role value used by this contract.
	role: SecretRole;
	// Stores the secret info value used by this contract.
	secretInfo: SecretInfo;
	// Stores the operation request value used by this contract.
	operationRequest: OperationRequest;
	// Stores the operation response value used by this contract.
	operationResponse: OperationResponse;
	// Stores the log value used by this contract.
	log: (log: any) => void;
}

interface FunctionRequestSystem {
	// Stores the log value used by this contract.
	log: (log: any) => void;
}

interface FunctionRequestEvent {
	// Stores the request collection used by this contract.
	request: { [k: string]: any };
	// Stores the operation event value used by this contract.
	operationEvent: OperationEvent;
	// Stores the log value used by this contract.
	log: (log: any) => void;
}

interface FunctionRequestSystemMatchmaking {
	// Stores the request value used by this contract.
	request: { gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch };
	// Stores the log value used by this contract.
	log: (log: any) => void;
}

interface FunctionRequestSystemAuthenticate {
	// Stores the request collection used by this contract.
	request: { userId: string, ipAddress: string, isNewUser: boolean, authenticationType: string, subData: { [k: string]: any } };
	// Stores the secret info value used by this contract.
	secretInfo: SecretInfo;
	// Stores the operation request value used by this contract.
	operationRequest: OperationRequest;
	// Stores the operation response value used by this contract.
	operationResponse: OperationResponse;
	// Stores the log value used by this contract.
	log: (log: any) => void;
};

interface FunctionRequestSystemVerifyGenericService {
	// Stores the request value used by this contract.
	request: {
		// Stores the service name value used by this contract.
		serviceName: string;
		// Stores the service data value used by this contract.
		serviceData: {
			[k: string]: any;
		};
	};

	// Stores the log value used by this contract.
	log: (log: any) => void;
}

interface FunctionRequestSocket {
	// Stores the request value used by this contract.
	request: {
		[k: string]: any;
	};

	// Stores the log value used by this contract.
	log: (log: any) => void;
}

enum ExecuteResponseStatus {
	Ok = 1,
	Exception = 2,
	FunctionNameNotFound = 3,
}

interface FunctionResponse {
	// Stores the status value used by this contract.
	status: ExecuteResponseStatus;
	// Stores the result value used by this contract.
	result: {
		// Stores the return code value used by this contract.
		returnCode: number;
		// Stores the debug message value used by this contract.
		debugMessage: string;
		// Stores the parameters value used by this contract.
		parameters?: {};
	} | {
		// Stores the event code value used by this contract.
		eventCode: string;
		// Stores the parameters value used by this contract.
		parameters?: {};
	} | null;
	// Stores the request value used by this contract.
	request: {
		[k: string]: any;
	} | null;
	// Stores the error message value used by this contract.
	errorMessage: any;
}

process?.on("message", async (request: CloudScriptRequest) => {
	// Stores the start time value used in the current execution flow.
	let startTime = performance.now();
	// Stores the start memory usage value used in the current execution flow.
	let startMemoryUsage = process.memoryUsage();

	// Stores the logs value used in the current execution flow.
	let logs: string[] = [];

	// Stores the handle response value used in the current execution flow.
	let handleResponse: FunctionResponse = null as any;

	if (request.eventType == EventCallbackType.System) {
		// Stores the function request value used in the current execution flow.
		let functionRequest: FunctionRequestSystem = {
			/**
			 * Executes the log workflow.
			 * @param log Provides the log value used by this operation.
			 */
			log(log: any) {
				logs.push(JSON.stringify(log));
			},
		};

		handleResponse = await ___handleSystemFunction(request.eventName, functionRequest);
	}
	else if (request.eventType == EventCallbackType.Pre || request.eventType == EventCallbackType.Post) {
		// Stores the origin operation request value used in the current execution flow.
		let originOperationRequest = request.operationRequest;
		// Stores the operation request value used in the current execution flow.
		let operationRequest = new OperationRequest(originOperationRequest.operationCode);
		if (originOperationRequest.parameters) {
			operationRequest.setParameters(GNHashtable.builder().addAll(originOperationRequest.parameters).build());
		}

		// Stores the origin secret info value used in the current execution flow.
		let originSecretInfo = request.secretInfo;
		// Stores the secret info value used in the current execution flow.
		let secretInfo: SecretInfo = null as any;
		if (originSecretInfo) {
			secretInfo = SecretInfo.Builder()
				.setSecretKey(originSecretInfo.secretKey)
				.setDescription(originSecretInfo.description)
				.setRole(originSecretInfo.role)
				.setIsRemove(originSecretInfo.remove)
				.setTsExpire(originSecretInfo.tsExpire)
				.setPermission(originSecretInfo.permission)
				.setGameId(originSecretInfo.gameId)
				.setIsDefault(originSecretInfo.isDefault)
				.setIsOnlyMasterAdmin(originSecretInfo.onlyMasterAdmin)
				.build();
		}

		if (request.eventType == EventCallbackType.Pre) {
			// Stores the function request value used in the current execution flow.
			let functionRequest: FunctionRequestPre = {
				operationRequest: operationRequest,
				secretInfo: secretInfo,
				request: request.request,
				role: request.role,
				/**
				 * Executes the log workflow.
				 * @param log Provides the log value used by this operation.
				 */
				log(log: any) {
					logs.push(JSON.stringify(log));
				},
			};

			handleResponse = await ___handlePreFunction(request.eventName, functionRequest);
		}
		else if (request.eventType == EventCallbackType.Post) {
			// Stores the origin operation response value used in the current execution flow.
			let originOperationResponse = request.operationResponse;
			// Stores the operation response value used in the current execution flow.
			let operationResponse: OperationResponse = null as any;

			if (originOperationResponse) {
				operationResponse = new OperationResponse(originOperationRequest.operationCode, originOperationRequest.requestId);
				operationResponse.setReturnCode(originOperationResponse.returnCode);
				operationResponse.setDebugMessage(originOperationResponse.debugMessage);

				if (originOperationResponse.parameters) {
					operationResponse.setParameters(GNHashtable.builder().addAll(originOperationResponse.parameters).build());
				}
			}

			// Stores the function request value used in the current execution flow.
			let functionRequest: FunctionRequestPost = {
				operationRequest: operationRequest,
				operationResponse: operationResponse,
				secretInfo: secretInfo,
				request: request.request,
				role: request.role,
				/**
				 * Executes the log workflow.
				 * @param log Provides the log value used by this operation.
				 */
				log(log: any) {
					logs.push(JSON.stringify(log));
				},
			};

			handleResponse = await ___handlePostFunction(request.eventName, functionRequest);
		}
	}
	else if (request.eventType == EventCallbackType.Event) {
		// Stores the origin operation event value used in the current execution flow.
		let originOperationEvent = request.operationEvent;

		// Stores the operation event value used in the current execution flow.
		let operationEvent = new OperationEvent(originOperationEvent.eventCode, (originOperationEvent.parameters ? GNHashtable.builder().addAll(originOperationEvent.parameters).build() : null as any));

		// Stores the function request value used in the current execution flow.
		let functionRequest: FunctionRequestEvent = {
			operationEvent: operationEvent,
			request: request.request,
			/**
			 * Executes the log workflow.
			 * @param log Provides the log value used by this operation.
			 */
			log(log: any) {
				logs.push(JSON.stringify(log));
			},
		};

		handleResponse = await ___handleEventFunction(request.eventName, functionRequest);
	}
	else if (request.eventType == EventCallbackType.SystemMatchmaking) {
		// Stores the function request value used in the current execution flow.
		let functionRequest: FunctionRequestSystemMatchmaking = {
			request: request.request,
			/**
			 * Executes the log workflow.
			 * @param log Provides the log value used by this operation.
			 */
			log(log: any) {
				logs.push(JSON.stringify(log));
			},
		};

		handleResponse = await ___handleSystemMatchmakingFunction(request.eventName, functionRequest);
	}
	else if (request.eventType == EventCallbackType.SystemAuthenticate) {
		if ("operationRequest" in request) {
			// Stores the origin operation request value used in the current execution flow.
			let originOperationRequest = request.operationRequest;
			// Stores the operation request value used in the current execution flow.
			let operationRequest = new OperationRequest(originOperationRequest.operationCode);
			if (originOperationRequest.parameters) {
				operationRequest.setParameters(GNHashtable.builder().addAll(originOperationRequest.parameters).build());
			}

			// Stores the origin secret info value used in the current execution flow.
			let originSecretInfo = request.secretInfo;
			// Stores the secret info value used in the current execution flow.
			let secretInfo: SecretInfo = null as any;
			if (originSecretInfo) {
				secretInfo = SecretInfo.Builder()
					.setSecretKey(originSecretInfo.secretKey)
					.setDescription(originSecretInfo.description)
					.setRole(originSecretInfo.role)
					.setIsRemove(originSecretInfo.remove)
					.setTsExpire(originSecretInfo.tsExpire)
					.setPermission(originSecretInfo.permission)
					.setGameId(originSecretInfo.gameId)
					.setIsDefault(originSecretInfo.isDefault)
					.setIsOnlyMasterAdmin(originSecretInfo.onlyMasterAdmin)
					.build();
			}

			// Stores the origin operation response value used in the current execution flow.
			let originOperationResponse = request.operationResponse;
			// Stores the operation response value used in the current execution flow.
			let operationResponse: OperationResponse = null as any;

			if (originOperationResponse) {
				operationResponse = new OperationResponse(originOperationRequest.operationCode, originOperationRequest.requestId);
				operationResponse.setReturnCode(originOperationResponse.returnCode);
				operationResponse.setDebugMessage(originOperationResponse.debugMessage);

				if (originOperationResponse.parameters) {
					operationResponse.setParameters(GNHashtable.builder().addAll(originOperationResponse.parameters).build());
				}
			}

			// Stores the function request value used in the current execution flow.
			let functionRequest: FunctionRequestSystemAuthenticate = {
				operationRequest: operationRequest,
				operationResponse: operationResponse,
				secretInfo: secretInfo,
				request: {
					userId: request.request.userId,
					ipAddress: request.request.ipAddress,
					isNewUser: request.request.isNewUser,
					authenticationType: request.request.authenticationType,
					subData: request.request.subData
				},
				/**
				 * Executes the log workflow.
				 * @param log Provides the log value used by this operation.
				 */
				log(log: any) {
					logs.push(JSON.stringify(log));
				},
			};

			handleResponse = await ___handleSystemAuthenticateFunction(request.eventName, functionRequest);
		}
		else {
			// Stores the function request value used in the current execution flow.
			let functionRequest: FunctionRequestSystemVerifyGenericService = {
				request: {
					serviceData: request.request.serviceData,
					serviceName: request.request.serviceName,
				},
				/**
				 * Executes the log workflow.
				 * @param log Provides the log value used by this operation.
				 */
				log(log: any) {
					logs.push(JSON.stringify(log));
				},
			};

			handleResponse = await ___handleSystemGenericServiceFunction(request.eventName, functionRequest);
		}
	}
	else if (request.eventType == EventCallbackType.Socket) {
		// Stores the function request value used in the current execution flow.
		let functionRequest: FunctionRequestSocket = {
			request: request.request,
			/**
			 * Executes the log workflow.
			 * @param log Provides the log value used by this operation.
			 */
			log(log: any) {
				logs.push(JSON.stringify(log));
			},
		};

		handleResponse = await ___handleSocketFunction(request.eventName, functionRequest);
	}

	// Stores the end time value used in the current execution flow.
	let endTime = performance.now();
	// Stores the end memory usage value used in the current execution flow.
	let endMemoryUsage = process.memoryUsage();

	// Stores the memory used in bytes value used in the current execution flow.
	let memoryUsedInBytes = endMemoryUsage.heapUsed - startMemoryUsage.heapUsed;
	if (memoryUsedInBytes <= 0) memoryUsedInBytes = 8192;
	// Stores the execute time in milliseconds value used in the current execution flow.
	let executeTimeInMs = endTime - startTime;

	//let cost = (memoryUsedInGb * executeTime) / 1000 * 0.022;

	let response: CloudScriptResponse = {
		responseId: request.requestId,
		response: handleResponse as any,
		stats: {
			executeTimeInMs: executeTimeInMs,
			memoryUsedInBytes: memoryUsedInBytes,
		},
		logs: logs,
	};

	if (process?.send)
		process.send(response);
});

/**
 * Handles the system matchmaking function.
 * @param name Provides the name value used by this operation.
 * @param request Provides the request value used by this operation.
 * @returns Resolves with the operation result.
 */
async function ___handleSystemMatchmakingFunction(name: string, request: FunctionRequestSystemMatchmaking): Promise<FunctionResponse> {
	// Stores the handler value used in the current execution flow.
	let handler = systemMatchmakingHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			request: null,
			errorMessage: null,
		};
	}

	// Stores the answer value used in the current execution flow.
	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
		request: null,
	};

	try {
		// Stores the result value used in the current execution flow.
		let result = await handler(request.request.gameId, request.request.matchmakingTicketCanMatch, request.log);

		if (result != null)
			answer.request = result;
	} catch (err: any) {
		answer.status = ExecuteResponseStatus.Exception;
		answer.errorMessage = err.message;
	}

	return answer;
}

/**
 * Handles the system generic service function.
 * @param name Provides the name value used by this operation.
 * @param request Provides the request value used by this operation.
 * @returns Resolves with the operation result.
 */
async function ___handleSystemGenericServiceFunction(name: string, request: FunctionRequestSystemVerifyGenericService): Promise<FunctionResponse> {
	// Stores the handler value used in the current execution flow.
	let handler = systemGenericServiceHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			request: null,
			errorMessage: null,
		};
	}

	// Stores the answer value used in the current execution flow.
	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
		request: null,
	};

	try {
		// Stores the result value used in the current execution flow.
		let result = await handler(request.request.serviceName, request.request.serviceData, request.log);

		if (result != null)
			answer.request = result;
	} catch (err: any) {
		answer.status = ExecuteResponseStatus.Exception;
		answer.errorMessage = err.message;
	}

	return answer;
}

/**
 * Handles the socket function.
 * @param name Provides the name value used by this operation.
 * @param request Provides the request value used by this operation.
 * @returns Resolves with the operation result.
 */
async function ___handleSocketFunction(name: string, request: FunctionRequestSocket): Promise<FunctionResponse> {
	// Stores the handler value used in the current execution flow.
	let handler = socketHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			request: null,
			errorMessage: null,
		};
	}

	// Stores the answer value used in the current execution flow.
	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
		request: null,
	};

	try {
		await handler(request.request.userId, request.request.socketId, request.log);
	} catch (err: any) {
		answer.status = ExecuteResponseStatus.Exception;
		answer.errorMessage = err.message;
	}

	return answer;
}

/**
 * Handles the system authenticate function.
 * @param name Provides the name value used by this operation.
 * @param request Provides the request value used by this operation.
 * @returns Resolves with the operation result.
 */
async function ___handleSystemAuthenticateFunction(name: string, request: FunctionRequestSystemAuthenticate): Promise<FunctionResponse> {
	// Stores the handler value used in the current execution flow.
	let handler = systemAuthenticateHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			errorMessage: null,
			request: null,
		};
	}

	// Stores the answer value used in the current execution flow.
	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
		request: null,
	};

	try {
		// Stores the result value used in the current execution flow.
		let result = await handler(request.request as any, request.secretInfo, request.operationRequest, request.operationResponse as any, request.log);

		if (result) {
			answer.result = {
				returnCode: result.getReturnCode(),
				debugMessage: result.getDebugMessage(),
				parameters: result.getParameters()?.toData(),
			};
		}

	} catch (err: any) {
		answer.status = ExecuteResponseStatus.Exception;
		answer.errorMessage = err.message;
	}

	return answer;
}

/**
 * Handles the system function.
 * @param name Provides the name value used by this operation.
 * @param request Provides the request value used by this operation.
 * @returns Resolves with the operation result.
 */
async function ___handleSystemFunction(name: string, request: FunctionRequestSystem): Promise<FunctionResponse> {
	// Stores the handler value used in the current execution flow.
	let handler = systemHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			request: null,
			errorMessage: null,
		};
	}

	// Stores the answer value used in the current execution flow.
	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
		request: null,
	};

	try {
		await handler(request.log);
	} catch (err: any) {
		answer.status = ExecuteResponseStatus.Exception;
		answer.errorMessage = err.message;
	}

	return answer;
}

/**
 * Handles the event function.
 * @param name Provides the name value used by this operation.
 * @param request Provides the request value used by this operation.
 * @returns Resolves with the operation result.
 */
async function ___handleEventFunction(name: string, request: FunctionRequestEvent): Promise<FunctionResponse> {
	// Stores the handler value used in the current execution flow.
	let handler = eventHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			request: null,
			errorMessage: null,
		};
	}

	// Stores the answer value used in the current execution flow.
	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
		request: null,
	};

	try {
		await handler(request.request, request.operationEvent, request.log);

		// Stores the operation event value used in the current execution flow.
		let operationEvent = request.operationEvent;

		answer.result = {
			eventCode: operationEvent.getEventCode(),
			parameters: operationEvent.getParameters()?.toData(),
		};

		answer.request = request.request.request;
	} catch (err: any) {
		answer.status = ExecuteResponseStatus.Exception;
		answer.errorMessage = err.message;
	}

	return answer;
}

/**
 * Handles the pre function.
 * @param name Provides the name value used by this operation.
 * @param request Provides the request value used by this operation.
 * @returns Resolves with the operation result.
 */
async function ___handlePreFunction(name: string, request: FunctionRequestPre): Promise<FunctionResponse> {
	// Stores the handler value used in the current execution flow.
	let handler = preHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			request: null,
			errorMessage: null,
		};
	}

	// Stores the answer value used in the current execution flow.
	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
		request: null,
	};

	try {
		// Stores the result value used in the current execution flow.
		let result = await handler(request.request, request.role, request.secretInfo, request.operationRequest, request.log);

		if (result)
			answer.result = {
				returnCode: result.getReturnCode(),
				debugMessage: result.getDebugMessage(),
				parameters: result.getParameters()?.toData(),
			};

		answer.request = request.request;
	} catch (err: any) {
		answer.status = ExecuteResponseStatus.Exception;
		answer.errorMessage = err.message;
	}

	return answer;
}

/**
 * Handles the post function.
 * @param name Provides the name value used by this operation.
 * @param request Provides the request value used by this operation.
 * @returns Resolves with the operation result.
 */
async function ___handlePostFunction(name: string, request: FunctionRequestPost): Promise<FunctionResponse> {
	// Stores the handler value used in the current execution flow.
	let handler = postHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			errorMessage: null,
			request: null,
		};
	}

	// Stores the answer value used in the current execution flow.
	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
		request: null,
	};

	try {
		// Stores the result value used in the current execution flow.
		let result = await handler(request.request, request.role, request.secretInfo, request.operationRequest, request.operationResponse as any, request.log);

		if (result) {
			answer.result = {
				returnCode: result.getReturnCode(),
				debugMessage: result.getDebugMessage(),
				parameters: result.getParameters()?.toData(),
			};
		}
	} catch (err: any) {
		answer.status = ExecuteResponseStatus.Exception;
		answer.errorMessage = err.message;
	}

	return answer;
}

{
	// Stores the GearN server settings options value used in the current execution flow.
	let gnServerSettingsOptions: GNServerSettingsOptions = JSON.parse(process.env.gnServerSettingsOptions ?? "");

	// Stores the resolved GearN server settings instance for the current execution flow.
	let gnServerSettings = new GNServerSettings();
	gnServerSettings.config(gnServerSettingsOptions);

	GNNetwork.init(gnServerSettings);
}

// Stores the admin value used by this module.
const admin = new CloudScriptAdmin();
// Stores the database value used by this module.
const database = new CloudScriptDatabase();
// Stores the HTTP value used by this module.
const http = new CloudScriptHttp();
// Stores the socket value used by this module.
const socket = new CloudScriptSocket();
// Stores the matchmaking value used by this module.
const matchmaking = new CloudScriptMatchmaking();
// Stores the mail value used by this module.
const mail = new CloudScriptMail();
// Stores the push notification value used by this module.
const pushNotification = new CloudScriptPushNotification();

{
	// Stores the database connection value used in the current execution flow.
	let dbConnection = JSON.parse(process.env.dbConnection ?? "");
	database.init(dbConnection.url, dbConnection.dbName, dbConnection.logUrl, dbConnection.logDbName, dbConnection.options);
}

// release after init success
process.env.dbConnection = "";
process.env.gnServerSettingsOptions = "";

// Stores the pre handlers value used by this module.
const preHandlers: Record<string, (request: any, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest, log: (log: any) => void) => Promise<OperationResponse | null>> = {};

// Stores the post handlers value used by this module.
const postHandlers: Record<string, (request: any, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest, operationResponse: OperationResponse, log: (log: any) => void) => Promise<OperationResponse>> = {};

// Stores the system handlers value used by this module.
const systemHandlers: Record<string, (log: (log: any) => void) => Promise<void>> = {};

// Stores the event handlers value used by this module.
const eventHandlers: Record<string, (request: any, operationEvent: OperationEvent, log: (log: any) => void) => Promise<void>> = {};

// Stores the system matchmaking handlers value used by this module.
const systemMatchmakingHandlers: Record<string, (gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch, log: (log: any) => void) => Promise<{ success: boolean }>> = {};

// Stores the system authenticate handlers value used by this module.
const systemAuthenticateHandlers: Record<string, (request: { userId: string, ipAddress: string, isNewUser: boolean, authenticationType: string, subData: { [k: string]: any; } }, secretInfo: SecretInfo, operationRequest: OperationRequest, operationResponse: OperationResponse, log: (log: any) => void) => Promise<OperationResponse>> = {};

// Stores the system generic service handlers value used by this module.
const systemGenericServiceHandlers: Record<string, (serviceName: string, serviceData: { [k: string]: any; }, log: (log: any) => void) => Promise<{ success: boolean, serviceId: string, someDatas?: any, errorMessage?: string }>> = {};

// Stores the socket handlers value used by this module.
const socketHandlers: Record<string, (userId: string, socketId: string, log: (log: any) => void) => Promise<void>> = {};

//$replaceScript
