import { SecretInfo, SecretPermissionItem } from "../../index";
import { AuthInfo } from "../../index";
import { authenticate_InfoRequestParam as authenticate_InfoRequestParam } from "../../index";
import { characterPlayer_InfoRequestParam as characterPlayer_InfoRequestParam } from "../../index";
import { gamePlayer_InfoRequestParam as gamePlayer_InfoRequestParam } from "../../index";
import { group_InfoRequestParam as group_InfoRequestParam } from "../../index";
import { inventory_InfoRequestParam as inventory_InfoRequestParam } from "../../index";
import { masterPlayer_InfoRequestParam as masterPlayer_InfoRequestParam } from "../../index";
import { storeInventory_InfoRequestParam as storeInventory_InfoRequestParam } from "../../index";
import { PermissionParam } from "../../index";

import { ContentDataParam } from "../../index";

import { CustomDataParam } from "../../index";
// import { GroupMemberParam } from "./../../index";
import { PlayerCurrencyParam } from "../../index";
import { PlayerDataParam } from "../../index";
import { PlayerStatisticsParam } from "../../index";

import { GroupCurrencyParam } from "../../index";
import { GroupDataParam } from "../../index";
import { GroupMemberParam } from "../../index";
import { GroupMessageItem } from "../../index";
import { GroupStatisticsParam } from "../../index";

import { ItemDataParam } from "../../index";
import { ItemStatisticsParam } from "../../index";

import { AvatarParam } from "../../index";
import { CurrencyParam } from "../../index";
import { InAppPurchaseParam } from "../../index";
import { StoreDataParam } from "../../index";
import { StoreItemParam } from "../../index";
import { TagParam } from "../../index";

import { AuthenticatePermissionRulesParam } from "../../index";
import { CharacterCatalogSettingsParam } from "../../index";
import { CharacterPlayerPermissionRulesParam } from "../../index";
import { CharacterPlayerSettingsParam } from "../../index";
import { CloudScriptPermissionRulesParam } from "../../index";
import { ContentPermissionRulesParam } from "../../index";
import { CurrencySettingsParam } from "../../index";
import { DataSettingsParam } from "../../index";
import { FriendCatalogSettingsParam } from "../../index";
import { GamePlayerPermissionRulesParam } from "../../index";
import { GamePlayerSettingsParam } from "../../index";
import { GameSettingsParam } from "../../index";
import { GenericServiceSettingsParam } from "../../index";
import { GroupCatalogSettingsParam } from "../../index";
import { GroupPermissionRulesParam } from "../../index";
import { GroupSettingsParam } from "../../index";
import { InventoryPermissionRulesParam } from "../../index";
import { InventorySettingsParam } from "../../index";
import { ItemCatalogSettingsParam } from "../../index";
import { ItemClassSettingsParam } from "../../index";
import { MasterAdminPermissionRulesParam } from "../../index";
import { MasterPlayerPermissionRulesParam } from "../../index";
import { MasterPlayerSettingsParam } from "../../index";
import { MatchmakingQueueSettingsParam } from "../../index";
import { MultiplayerPermissionRulesParam } from "../../index";
import { PermissionRulesParam } from "../../index";
import { StatisticsSettingsParam } from "../../index";
import { StoreInventoryPermissionRulesParam } from "../../index";
import { TagSettingsParam } from "../../index";
import { ThirtPartyAppleSettingsParam } from "../../index";
import { ThirtPartyFacebookSettingsParam } from "../../index";
import { ThirtPartyGameCenterSettingsParam } from "../../index";
import { ThirtPartyGooglePlayGameSettingsParam } from "../../index";
import { ThirtPartyParam } from "../../index";
import { EmailSettingsParam } from "../../index";
import { PushNotificationSettingsParam } from "../../index";
import { AnalyticsRequestParams } from "../../index";
import { ServerGameDataRequestParams } from "../../index";
import { MatchmakingTicketCanMatch } from "../../index";
import { ServerDetail } from "../../index";

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
	requestId: string;
	eventType: EventCallbackType.Pre;
	eventName: string;
	request: { [k: string]: any };
	secretInfo: {
		secretKey: string;
		description: string;
		role: number;
		remove: boolean;
		tsExpire: number;
		permission: SecretPermissionItem;
		gameId: string;
		isDefault: boolean;
		onlyMasterAdmin: boolean;
	};
	operationRequest: {
		operationCode: string;
		requestId: number;
		parameters: {};
	};
}

interface CloudScriptRequestPost {
	requestId: string;
	eventType: EventCallbackType.Post;
	eventName: string;
	request: { [k: string]: any };
	secretInfo: {
		secretKey: string;
		description: string;
		role: number;
		remove: boolean;
		tsExpire: number;
		permission: SecretPermissionItem;
		gameId: string;
		isDefault: boolean;
		onlyMasterAdmin: boolean;
	};
	operationRequest: {
		operationCode: string;
		requestId: number;
		parameters: {};
	};
	operationResponse: {
		returnCode: number;
		debugMessage: string;
		parameters: {};
	};
}

interface CloudScriptRequestSystem {
	requestId: string;
	eventType: EventCallbackType.System;
	eventName: string;
}

interface CloudScriptRequestSystemMatchmaking {
	requestId: string;
	eventType: EventCallbackType.SystemMatchmaking;
	eventName: string;
	request: {
		gameId: string;
		matchmakingTicketCanMatch: MatchmakingTicketCanMatch;
	};
}

interface CloudScriptRequestSystemAuthenticate {
	requestId: string;
	eventType: EventCallbackType.SystemAuthenticate;
	eventName: string;
	request: { [k: string]: any };
	operationRequest?: {
		operationCode: string;
		requestId: number;
		parameters: {};
	};
	operationResponse?: {
		returnCode: number;
		debugMessage: string;
		parameters: {};
	};
	secretInfo?: {
		secretKey: string;
		description: string;
		role: number;
		remove: boolean;
		tsExpire: number;
		permission: SecretPermissionItem;
		gameId: string;
		isDefault: boolean;
		onlyMasterAdmin: boolean;
	};
};

interface CloudScriptRequestEvent {
	requestId: string;
	eventType: EventCallbackType.Event;
	eventName: string;
	request: { [k: string]: any };
	operationEvent: {
		eventCode: string;
		parameters: {};
	};
}

interface CloudScriptRequestSocket {
	requestId: string;
	eventType: EventCallbackType.Socket;
	eventName: string;
	request: { [k: string]: any };
}

type CloudScriptRequest = CloudScriptRequestPre | CloudScriptRequestPost | CloudScriptRequestSystem | CloudScriptRequestSystemMatchmaking | CloudScriptRequestSystemAuthenticate | CloudScriptRequestEvent | CloudScriptRequestSocket;

interface CloudScriptResponse {
	stats: {
		memoryUsedInBytes: number;
		executeTimeInMs: number;
	};
	response: FunctionResponse;
	responseId: string;
	logs: string[];
}

interface FunctionRequestPre {
	request: { [k: string]: any };
	secretInfo: SecretInfo;
	operationRequest: OperationRequest;
	log: (log: any) => void;
}

interface FunctionRequestPost {
	request: { [k: string]: any };
	secretInfo: SecretInfo;
	operationRequest: OperationRequest;
	operationResponse: OperationResponse;
	log: (log: any) => void;
}

interface FunctionRequestSystem {
	log: (log: any) => void;
}

interface FunctionRequestEvent {
	request: { [k: string]: any };
	operationEvent: OperationEvent;
	log: (log: any) => void;
}

interface FunctionRequestSystemMatchmaking {
	request: { gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch };
	log: (log: any) => void;
}

interface FunctionRequestSystemAuthenticate {
	request: { userId: string, ipAddress: string, isNewUser: boolean, authenticationType: string, subData: { [k: string]: any } };
	secretInfo: SecretInfo;
	operationRequest: OperationRequest;
	operationResponse: OperationResponse;
	log: (log: any) => void;
};

interface FunctionRequestSystemVerifyGenericService {
	request: {
		serviceName: string;
		serviceData: {
			[k: string]: any;
		};
	};

	log: (log: any) => void;
}

interface FunctionRequestSocket {
	request: {
		[k: string]: any;
	};

	log: (log: any) => void;
}

enum ExecuteResponseStatus {
	Ok = 1,
	Exception = 2,
	FunctionNameNotFound = 3,
}

interface FunctionResponse {
	status: ExecuteResponseStatus;
	result: {
		returnCode: number;
		debugMessage: string;
		parameters?: {};
	} | {
		eventCode: string;
		parameters?: {};
	} | null;
	request: {
		[k: string]: any;
	} | null;
	errorMessage: any;
}

process?.on("message", async (request: CloudScriptRequest) => {
	let startTime = performance.now();
	let startMemoryUsage = process.memoryUsage();

	let logs: string[] = [];

	let handleResponse: FunctionResponse = null as any;

	if (request.eventType == EventCallbackType.System) {
		let functionRequest: FunctionRequestSystem = {
			log(log: any) {
				logs.push(JSON.stringify(log));
			},
		};

		handleResponse = await ___handleSystemFunction(request.eventName, functionRequest);
	}
	else if (request.eventType == EventCallbackType.Pre || request.eventType == EventCallbackType.Post) {
		let originOperationRequest = request.operationRequest;
		let operationRequest = new OperationRequest(originOperationRequest.operationCode);
		if (originOperationRequest.parameters) {
			operationRequest.setParameters(GNHashtable.builder().addAll(originOperationRequest.parameters).build());
		}

		let originSecretInfo = request.secretInfo;
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
			let functionRequest: FunctionRequestPre = {
				operationRequest: operationRequest,
				secretInfo: secretInfo,
				request: request.request,
				log(log: any) {
					logs.push(JSON.stringify(log));
				},
			};

			handleResponse = await ___handlePreFunction(request.eventName, functionRequest);
		}
		else if (request.eventType == EventCallbackType.Post) {
			let originOperationResponse = request.operationResponse;
			let operationResponse: OperationResponse = null as any;

			if (originOperationResponse) {
				operationResponse = new OperationResponse(originOperationRequest.operationCode, originOperationRequest.requestId);
				operationResponse.setReturnCode(originOperationResponse.returnCode);
				operationResponse.setDebugMessage(originOperationResponse.debugMessage);

				if (originOperationResponse.parameters) {
					operationResponse.setParameters(GNHashtable.builder().addAll(originOperationResponse.parameters).build());
				}
			}

			let functionRequest: FunctionRequestPost = {
				operationRequest: operationRequest,
				operationResponse: operationResponse,
				secretInfo: secretInfo,
				request: request.request,
				log(log: any) {
					logs.push(JSON.stringify(log));
				},
			};

			handleResponse = await ___handlePostFunction(request.eventName, functionRequest);
		}
	}
	else if (request.eventType == EventCallbackType.Event) {
		let originOperationEvent = request.operationEvent;

		let operationEvent = new OperationEvent(originOperationEvent.eventCode, (originOperationEvent.parameters ? GNHashtable.builder().addAll(originOperationEvent.parameters).build() : null as any));

		let functionRequest: FunctionRequestEvent = {
			operationEvent: operationEvent,
			request: request.request,
			log(log: any) {
				logs.push(JSON.stringify(log));
			},
		};

		handleResponse = await ___handleEventFunction(request.eventName, functionRequest);
	}
	else if (request.eventType == EventCallbackType.SystemMatchmaking) {
		let functionRequest: FunctionRequestSystemMatchmaking = {
			request: request.request,
			log(log: any) {
				logs.push(JSON.stringify(log));
			},
		};

		handleResponse = await ___handleSystemMatchmakingFunction(request.eventName, functionRequest);
	}
	else if (request.eventType == EventCallbackType.SystemAuthenticate) {
		if (request.operationRequest != null) {
			let originOperationRequest = request.operationRequest;
			let operationRequest = new OperationRequest(originOperationRequest.operationCode);
			if (originOperationRequest.parameters) {
				operationRequest.setParameters(GNHashtable.builder().addAll(originOperationRequest.parameters).build());
			}

			let originSecretInfo = request.secretInfo;
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

			let originOperationResponse = request.operationResponse;
			let operationResponse: OperationResponse = null as any;

			if (originOperationResponse) {
				operationResponse = new OperationResponse(originOperationRequest.operationCode, originOperationRequest.requestId);
				operationResponse.setReturnCode(originOperationResponse.returnCode);
				operationResponse.setDebugMessage(originOperationResponse.debugMessage);

				if (originOperationResponse.parameters) {
					operationResponse.setParameters(GNHashtable.builder().addAll(originOperationResponse.parameters).build());
				}
			}

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
				log(log: any) {
					logs.push(JSON.stringify(log));
				},
			};

			handleResponse = await ___handleSystemAuthenticateFunction(request.eventName, functionRequest);
		}
		else {
			let functionRequest: FunctionRequestSystemVerifyGenericService = {
				request: {
					serviceData: request.request.serviceData,
					serviceName: request.request.serviceName,
				},
				log(log: any) {
					logs.push(JSON.stringify(log));
				},
			};

			handleResponse = await ___handleSystemGenericServiceFunction(request.eventName, functionRequest);
		}
	}
	else if (request.eventType == EventCallbackType.Socket) {
		let functionRequest: FunctionRequestSocket = {
			request: request.request,
			log(log: any) {
				logs.push(JSON.stringify(log));
			},
		};

		handleResponse = await ___handleSocketFunction(request.eventName, functionRequest);
	}

	let endTime = performance.now();
	let endMemoryUsage = process.memoryUsage();

	let memoryUsedInBytes = endMemoryUsage.heapUsed - startMemoryUsage.heapUsed;
	if (memoryUsedInBytes <= 0) memoryUsedInBytes = 8192;
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

async function ___handleSystemMatchmakingFunction(name: string, request: FunctionRequestSystemMatchmaking): Promise<FunctionResponse> {
	let handler = systemMatchmakingHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			request: null,
			errorMessage: null,
		};
	}

	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
		request: null,
	};

	try {
		let result = await handler(request.request.gameId, request.request.matchmakingTicketCanMatch, request.log);

		if (result != null)
			answer.request = result;
	} catch (err: any) {
		answer.status = ExecuteResponseStatus.Exception;
		answer.errorMessage = err.message;
	}

	return answer;
}

async function ___handleSystemGenericServiceFunction(name: string, request: FunctionRequestSystemVerifyGenericService): Promise<FunctionResponse> {
	let handler = systemGenericServiceHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			request: null,
			errorMessage: null,
		};
	}

	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
		request: null,
	};

	try {
		let result = await handler(request.request.serviceName, request.request.serviceData, request.log);

		if (result != null)
			answer.request = result;
	} catch (err: any) {
		answer.status = ExecuteResponseStatus.Exception;
		answer.errorMessage = err.message;
	}

	return answer;
}

async function ___handleSocketFunction(name: string, request: FunctionRequestSocket): Promise<FunctionResponse> {
	let handler = socketHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			request: null,
			errorMessage: null,
		};
	}

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

async function ___handleSystemAuthenticateFunction(name: string, request: FunctionRequestSystemAuthenticate): Promise<FunctionResponse> {
	let handler = systemAuthenticateHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			errorMessage: null,
			request: null,
		};
	}

	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
		request: null,
	};

	try {
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

async function ___handleSystemFunction(name: string, request: FunctionRequestSystem): Promise<FunctionResponse> {
	let handler = systemHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			request: null,
			errorMessage: null,
		};
	}

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

async function ___handleEventFunction(name: string, request: FunctionRequestEvent): Promise<FunctionResponse> {
	let handler = eventHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			request: null,
			errorMessage: null,
		};
	}

	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
		request: null,
	};

	try {
		await handler(request.request, request.operationEvent, request.log);

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

async function ___handlePreFunction(name: string, request: FunctionRequestPre): Promise<FunctionResponse> {
	let handler = preHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			request: null,
			errorMessage: null,
		};
	}

	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
		request: null,
	};

	try {
		let result = await handler(request.request, request.secretInfo, request.operationRequest, request.log);

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

async function ___handlePostFunction(name: string, request: FunctionRequestPost): Promise<FunctionResponse> {
	let handler = postHandlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			errorMessage: null,
			request: null,
		};
	}

	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
		request: null,
	};

	try {
		let result = await handler(request.request, request.secretInfo, request.operationRequest, request.operationResponse as any, request.log);

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
	let gnServerSettingsOptions: GNServerSettingsOptions = JSON.parse(process.env.gnServerSettingsOptions ?? "");

	let gnServerSettings = new GNServerSettings();
	gnServerSettings.config(gnServerSettingsOptions);

	GNNetwork.init(gnServerSettings);
}

const admin = new CloudScriptAdmin();
const database = new CloudScriptDatabase();
const http = new CloudScriptHttp();
const socket = new CloudScriptSocket();
const matchmaking = new CloudScriptMatchmaking();
const mail = new CloudScriptMail();
const pushNotification = new CloudScriptPushNotification();

{
	let dbConnection = JSON.parse(process.env.dbConnection ?? "");
	database.init(dbConnection.url, dbConnection.dbName, dbConnection.logUrl, dbConnection.logDbName, dbConnection.options);
}

// release after init success
process.env.dbConnection = "";
process.env.gnServerSettingsOptions = "";

const preHandlers: Record<string, (request: any, secretInfo: SecretInfo, operationRequest: OperationRequest, log: (log: any) => void) => Promise<OperationResponse | null>> = {};

const postHandlers: Record<string, (request: any, secretInfo: SecretInfo, operationRequest: OperationRequest, operationResponse: OperationResponse, log: (log: any) => void) => Promise<OperationResponse>> = {};

const systemHandlers: Record<string, (log: (log: any) => void) => Promise<void>> = {};

const eventHandlers: Record<string, (request: any, operationEvent: OperationEvent, log: (log: any) => void) => Promise<void>> = {};

const systemMatchmakingHandlers: Record<string, (gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch, log: (log: any) => void) => Promise<{ success: boolean }>> = {};

const systemAuthenticateHandlers: Record<string, (request: { userId: string, ipAddress: string, isNewUser: boolean, authenticationType: string, subData: { [k: string]: any; } }, secretInfo: SecretInfo, operationRequest: OperationRequest, operationResponse: OperationResponse, log: (log: any) => void) => Promise<OperationResponse>> = {};

const systemGenericServiceHandlers: Record<string, (serviceName: string, serviceData: { [k: string]: any; }, log: (log: any) => void) => Promise<{ success: boolean, serviceId: string, someDatas?: any, errorMessage?: string }>> = {};

const socketHandlers: Record<string, (userId: string, socketId: string, log: (log: any) => void) => Promise<void>> = {};

//$replaceScript
