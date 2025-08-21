import { OperationHelper } from "./../../GN-common/entity/operationHelper/OperationHelper";
import { SecretInfo, SecretPermissionItem } from "./../../GN-common/entity/SecretInfo";
import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../GN-common/entity/operationResponse/OperationResponse";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { IPostEventCallbackService, IPreEventCallbackService, OnPostCallbackFunction, OnPreCallbackFunction } from "./IEventCallbackService";
import * as mongoDB from "mongodb";
import fs from "fs";
import { ExecuteResponseStatus } from "./ICloudScriptService";
import { ChildProcess, fork, execSync } from "child_process";
import { GNServer } from "./../../GNServer";
import { GNServerSettingsOptions } from "@xmobitea/gn-typescript-client";
import { StringUtility } from "./../../GN-common/helper/StringUtility";
import { OperationEvent } from "./../../GN-common/entity/operationEvent/OperationEvent";
import { ParameterCode } from "./../../GN-common/constant/parameterCode/ParameterCode";
import { GNHashtable } from "./../../GN-common/common/GNData";
import { MatchmakingTicketCanMatch } from "./../handler/controller/handler/multiplayer/MatchmakingHandler";
import { ServerDetail } from "./../../GN-library/xdatabase/lib/entity/pro/ServerDetail";

enum EventCallbackType {
	Pre = 0,
	Post = 1,
	System = 2,
	SystemRequestServerDetail = 3,
	SystemVerifyGenericService = 4,
	SystemAuthenticate = 5,
	SystemEvent = 6,
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

interface CloudScriptRequestSystemRequestServerDetail {
	requestId: string;
	eventType: EventCallbackType.SystemRequestServerDetail;
	eventName: string;
	request: {
		gameId: string;
		matchmakingTicketCanMatch: MatchmakingTicketCanMatch;
	};
}

interface CloudScriptRequestSystemVerifyGenericService {
	requestId: string;
	eventType: EventCallbackType.SystemVerifyGenericService;
	eventName: string;
	request: {
		serviceName: string;
		serviceData: { [k: string]: any; };
	};
}

interface CloudScriptRequestSystemAuthenticate {
	requestId: string;
	eventType: EventCallbackType.SystemAuthenticate;
	eventName: string;
	request: { [k: string]: any };
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
}

interface CloudScriptRequestSystemEvent {
	requestId: string;
	eventType: EventCallbackType.SystemEvent;
	eventName: string;
	request: { [k: string]: any };
	operationEvent: {
		eventCode: string;
		parameters: {};
	};
}

type CloudScriptRequest = CloudScriptRequestPre | CloudScriptRequestPost | CloudScriptRequestSystem | CloudScriptRequestSystemRequestServerDetail | CloudScriptRequestSystemVerifyGenericService | CloudScriptRequestSystemAuthenticate | CloudScriptRequestSystemEvent;

interface CloudScriptResponse {
	stats: {
		memoryUsedInBytes: number;
		executeTimeInMs: number;
	};
	response: {
		status: ExecuteResponseStatus;
		result: {
			returnCode: number;
			debugMessage: string;
			parameters?: {};
		} | {
			eventCode: string;
			parameters?: {};
		} | null;
		request: { [k: string]: any };
		errorMessage: string;
	};
	responseId: string;
	logs: string[];
}

enum CloudScriptEventType {
	SendEventToOne = 0,
	SendEventToMore = 1,
	SendEventToAll = 2,

	ConfirmServerDetail = 10,

	SendMailToOne = 20,
	SendMailToMore = 21,

	SendPushNotificationToOne = 30,
	SendPushNotificationToMore = 31,
	SendPushNotificationToTopic = 32,
	SubscribeToTopic = 33,
	UnsubscribeFromTopic = 34,

}

interface CloudScriptEventSendEventToOne {
	eventType: CloudScriptEventType.SendEventToOne;
	operationEvent: {
		eventCode: string;
		parameters: {};
	};
	userId: string;
}

interface CloudScriptEventSendEventToMore {
	eventType: CloudScriptEventType.SendEventToMore;
	operationEvent: {
		eventCode: string;
		parameters: {};
	};
	userIds: string[];
}

interface CloudScriptEventSendEventToAll {
	eventType: CloudScriptEventType.SendEventToAll;
	operationEvent: {
		eventCode: string;
		parameters: {};
	};
}

interface CloudScriptEventConfirmServerDetail {
	eventType: CloudScriptEventType.ConfirmServerDetail;
	gameId: string;
	matchmakingTicketCanMatch: MatchmakingTicketCanMatch;
	serverDetail: ServerDetail;
}

interface CloudScriptEventSendMailToOne {
	eventType: CloudScriptEventType.SendMailToOne;
	mailData: {
		subject: string;
		contentHtml: string;
	};
	email: string;
}

interface CloudScriptEventSendMailToMore {
	eventType: CloudScriptEventType.SendMailToMore;
	mailData: {
		subject: string;
		contentHtml: string;
	};
	emails: string[];
}

interface CloudScriptEventSendPushNotificationToOne {
	eventType: CloudScriptEventType.SendPushNotificationToOne;
	pushData: {
		title: string;
		body: string;
		badge?: number;
		sound?: string;
		icon?: string;
		data?: { [k: string]: any };
	};
	token: string;
}

interface CloudScriptEventSendPushNotificationToMore {
	eventType: CloudScriptEventType.SendPushNotificationToMore;
	pushData: {
		title: string;
		body: string;
		badge?: number;
		sound?: string;
		icon?: string;
		data?: { [k: string]: any };
	};
	tokens: string[];
}

interface CloudScriptEventSendPushNotificationToTopic {
	eventType: CloudScriptEventType.SendPushNotificationToTopic;
	pushData: {
		title: string;
		body: string;
		badge?: number;
		sound?: string;
		icon?: string;
		data?: { [k: string]: any };
	};
	topic: string;
}

interface CloudScriptEventSubscribeToTopic {
	eventType: CloudScriptEventType.SubscribeToTopic;
	tokens: string[];
	topic: string;
}

interface CloudScriptEventUnsubscribeFromTopic {
	eventType: CloudScriptEventType.UnsubscribeFromTopic;
	tokens: string[];
	topic: string;
}

type CloudScriptEvent = CloudScriptEventSendEventToOne | CloudScriptEventSendEventToMore | CloudScriptEventSendEventToAll
	| CloudScriptEventConfirmServerDetail
	| CloudScriptEventSendMailToOne
	| CloudScriptEventSendMailToMore
	| CloudScriptEventSendPushNotificationToOne
	| CloudScriptEventSendPushNotificationToMore
	| CloudScriptEventSendPushNotificationToTopic
	| CloudScriptEventSubscribeToTopic
	| CloudScriptEventUnsubscribeFromTopic;

interface DbConnection {
	url: string,
	dbName: string,
	logUrl: string,
	logDbName: string,
	options?: { [k: string]: any },
}

export interface EventCallbackCloudScriptFunction {
	type: string;
	version: string;
	fullScript: string;
	tsLastUpdate: number;
	childScripts: {
		eventName: string;
		script: string;
		hasEdit: boolean;
	}[];
}

export interface IEventCallbackCloudScriptService {
	executeRequestServerDetailSystem(gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch): Promise<{ success: boolean }>;
	executePost(
		eventName: string,
		request: { [k: string]: any },
		secretInfo: SecretInfo,
		operationRequest: OperationRequest,
		operationResponse: OperationResponse
	): Promise<void>;
	executeEvent(eventName: string, request: { [k: string]: any }, operationEvent: OperationEvent): Promise<void>;
	executePre(eventName: string, request: { [k: string]: any }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse>;
	executeAuthenticate(eventName: string, request: { userId: string, ipAddress: string, isNewUser: boolean, authenticationType: string, }, secretInfo: SecretInfo, operationRequest: OperationRequest, operationResponse: OperationResponse): Promise<void>;
	executeVerifyGenericService(serviceName: string, serviceData: { [k: string]: any; }): Promise<{ success: boolean, serviceId: string, someDatas?: any, errorMessage?: string }>;

	addCloudScriptFunction(eventName: string, script: string): Promise<{ success: boolean; errorMessage?: string; version?: string }>;
	getAllCloudScriptFunction(): Promise<
		{
			type: string;
			version: string;
			fullScript: string;
			tsLastUpdate: number;
			childScripts: {
				eventName: string;
				script: string;
				hasEdit: boolean;
			}[];
		}[]
	>;
}

export class EventCallbackCloudScriptService implements IEventCallbackCloudScriptService {

	private static readonly SystemExecuteTimeoutInMs = 12000000;
	private static readonly OnEveryMinute = "system_OnEveryMinute";
	private static readonly OnEveryHour = "system_OnEveryHour";
	private static readonly OnEveryDay = "system_OnEveryDay";

	private cloudScriptWorkerDict: Map<string, ChildProcess>;
	private cloudScriptWaitingResponseCallbackDict: Map<string, (cloudScriptResponse: CloudScriptResponse) => void>;

	private cloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>;
	private backupCloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>;

	private gnServer: GNServer;
	private gnServerSettingsOptions: GNServerSettingsOptions;
	private dbConnection: DbConnection;
	private executeTimeoutInMs: number;

	private cloudScriptFunctionDict = new Map<string, EventCallbackCloudScriptFunction>();

	constructor() {
		this.cloudScriptFunctionDict = new Map();

		this.cloudScriptWorkerDict = new Map();
		this.cloudScriptWaitingResponseCallbackDict = new Map();
	}

	public async getAllCloudScriptFunction(): Promise<
		{
			type: string;
			version: string;
			fullScript: string;
			tsLastUpdate: number;
			childScripts: {
				eventName: string;
				script: string;
				hasEdit: boolean;
			}[];
		}[]
	> {
		let answer: {
			type: string;
			version: string;
			fullScript: string;
			tsLastUpdate: number;
			childScripts: {
				eventName: string;
				script: string;
				hasEdit: boolean;
			}[];
		}[] = [];

		let values = Array.from(this.cloudScriptFunctionDict.values());

		for (let i = 0; i < values.length; i++) {
			let cloudFunction = values[i];

			answer.push(cloudFunction);
		}

		return answer;
	}

	public init(gnServerSettingsOptions: GNServerSettingsOptions, dbConnection: DbConnection, gnServer: GNServer, executeTimeoutInMs: number): void {
		this.gnServerSettingsOptions = gnServerSettingsOptions;
		this.dbConnection = dbConnection;
		this.gnServer = gnServer;
		this.executeTimeoutInMs = executeTimeoutInMs;

		let thiz = this;

		this.gnServer.getTimerService().subscriberEveryMinute(() => {
			if (thiz.gnServer.isPrimary())
				thiz.executeSystem(EventCallbackCloudScriptService.OnEveryMinute);
		});

		this.gnServer.getTimerService().subscriberEveryHour(() => {
			if (thiz.gnServer.isPrimary())
				thiz.executeSystem(EventCallbackCloudScriptService.OnEveryHour);
		});

		this.gnServer.getTimerService().subscriberEveryDay(() => {
			if (thiz.gnServer.isPrimary())
				thiz.executeSystem(EventCallbackCloudScriptService.OnEveryDay);
		});
	}

	public setCloudScriptFunctionCollection(cloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.cloudScriptFunctionCollection = cloudScriptFunctionCollection;
	}

	public setBackupCloudScriptFunctionCollection(cloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.backupCloudScriptFunctionCollection = cloudScriptFunctionCollection;
	}

	public run(): void {
		this.loadVersion();

		let thiz = this;

		this.gnServer.getHttpApp().getClusterHandler().onEvent("addEventCloudScriptFunction", data => {
			thiz.remoteAddCloudScriptFunction(data);
		});
	}

	private async loadVersion(): Promise<void> {
		let cloudScriptFunctionResults = await this.cloudScriptFunctionCollection.find();

		while (await cloudScriptFunctionResults.hasNext()) {
			let cloudScriptFunctionResult = await cloudScriptFunctionResults.next();

			let cloudScriptFunction: EventCallbackCloudScriptFunction = {
				type: cloudScriptFunctionResult["type"],
				version: cloudScriptFunctionResult["version"],
				fullScript: cloudScriptFunctionResult["fullScript"],
				tsLastUpdate: cloudScriptFunctionResult["tsLastUpdate"],
				childScripts: cloudScriptFunctionResult["childScripts"],
			};

			if (!this.cloudScriptFunctionDict.has(cloudScriptFunction.type)) {
				this.cloudScriptFunctionDict.set(cloudScriptFunction.type, cloudScriptFunction);
				this.loadCloudScriptFunctionWorker(cloudScriptFunction.type, cloudScriptFunction.version, cloudScriptFunction.fullScript);
			}
		}
	}

	private async executeSystem(eventName: string) {
		let cloudFunction = this.cloudScriptFunctionDict.get("system");
		if (cloudFunction == null) {
			Debug.logError("[GearN] [SystemEventCallback] system not found");
			return;
		}
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return;
		}

		Debug.log("[GearN] [SystemEventCallback] auto call " + eventName);

		let requestId = StringUtility.generateRandomString(10, 0);

		let cloudScriptRequest: CloudScriptRequest = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.System,
		};

		cloudScriptWorker.send(cloudScriptRequest);

		let thiz = this;

		let isResolved = false;
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			let timeout = setTimeout(() => {
				if (isResolved) return;
				isResolved = true;

				resolve({
					responseId: requestId,
					response: {
						status: ExecuteResponseStatus.Timeout,
						errorMessage: "function execute timeout",
						result: null,
						request: null,
					},
					stats: null,
					logs: [],
				});
			}, EventCallbackCloudScriptService.SystemExecuteTimeoutInMs);

			thiz.cloudScriptWaitingResponseCallbackDict.set(requestId, (cloudScriptResponse: CloudScriptResponse) => {
				if (isResolved) return;
				isResolved = true;

				clearTimeout(timeout);
				resolve(cloudScriptResponse);
			});
		});

		this.cloudScriptWaitingResponseCallbackDict.delete(requestId);

		if (cloudScriptResponse.logs.length != 0) Debug.log(JSON.stringify(cloudScriptResponse.logs));

		if (cloudScriptResponse.response.status == ExecuteResponseStatus.Ok) {
			Debug.log("[GearN] [SystemEventCallback] auto call success " + eventName);
		} else {
			Debug.log("[GearN] [SystemEventCallback] auto call failed " + eventName + " " + cloudScriptResponse.response.errorMessage);
		}
	}

	public async executeRequestServerDetailSystem(gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch): Promise<{ success: boolean }> {
		let cloudFunction = this.cloudScriptFunctionDict.get("system");
		if (cloudFunction == null) {
			Debug.logError("[GearN] [SystemEventCallback] system not found");
			return { success: false };
		}
		let eventName = "system_RequestServerDetail";
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return { success: false };
		}

		let requestId = StringUtility.generateRandomString(10, 0);

		let cloudScriptRequest: CloudScriptRequest = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.SystemRequestServerDetail,
			request: {
				gameId: gameId,
				matchmakingTicketCanMatch: matchmakingTicketCanMatch,
			},
		};

		cloudScriptWorker.send(cloudScriptRequest);

		let thiz = this;

		let isResolved = false;
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			let timeout = setTimeout(() => {
				if (isResolved) return;
				isResolved = true;

				resolve({
					responseId: requestId,
					response: {
						status: ExecuteResponseStatus.Timeout,
						errorMessage: "function execute timeout",
						result: null,
						request: null,
					},
					stats: null,
					logs: [],
				});
			}, EventCallbackCloudScriptService.SystemExecuteTimeoutInMs);

			thiz.cloudScriptWaitingResponseCallbackDict.set(requestId, (cloudScriptResponse: CloudScriptResponse) => {
				if (isResolved) return;
				isResolved = true;

				clearTimeout(timeout);
				resolve(cloudScriptResponse);
			});
		});

		this.cloudScriptWaitingResponseCallbackDict.delete(requestId);

		if (cloudScriptResponse.logs.length != 0) Debug.log(JSON.stringify(cloudScriptResponse.logs));

		if (cloudScriptResponse.response.status == ExecuteResponseStatus.Ok) {
			return {
				success: cloudScriptResponse.response.request?.success ?? false,
			}
		}

		return {
			success: false
		};
	}

	public async executeEvent(eventName: string, request: { [k: string]: any }, operationEvent: OperationEvent) {
		let cloudFunction = this.cloudScriptFunctionDict.get("system");
		if (cloudFunction == null) {
			Debug.logError("[GearN] [SystemEventCallback] system not found");
			return;
		}
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return;
		}

		let requestId = StringUtility.generateRandomString(10, 0);

		let cloudScriptRequest: CloudScriptRequest = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.SystemEvent,
			operationEvent: {
				eventCode: operationEvent.getEventCode(),
				parameters: operationEvent.getParameters(),
			},
			request: request,
		};

		cloudScriptWorker.send(cloudScriptRequest);

		let thiz = this;

		let isResolved = false;
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			let timeout = setTimeout(() => {
				if (isResolved) return;
				isResolved = true;

				resolve({
					responseId: requestId,
					response: {
						status: ExecuteResponseStatus.Timeout,
						errorMessage: "function execute timeout",
						result: null,
						request: null,
					},
					stats: null,
					logs: [],
				});
			}, EventCallbackCloudScriptService.SystemExecuteTimeoutInMs);

			thiz.cloudScriptWaitingResponseCallbackDict.set(requestId, (cloudScriptResponse: CloudScriptResponse) => {
				if (isResolved) return;
				isResolved = true;

				clearTimeout(timeout);
				resolve(cloudScriptResponse);
			});
		});

		this.cloudScriptWaitingResponseCallbackDict.delete(requestId);

		if (cloudScriptResponse.logs.length != 0) Debug.log(JSON.stringify(cloudScriptResponse.logs));

		if (cloudScriptResponse.response.status == ExecuteResponseStatus.Ok) {
			operationEvent.setParameters(cloudScriptResponse.response.result.parameters ? GNHashtable.builder().addAll(cloudScriptResponse.response.result.parameters).build() : null);
			(operationEvent as any).eventCode = (cloudScriptResponse.response.result as {
				eventCode: string;
				parameters?: {};
			}).eventCode;

			if (cloudScriptResponse.response.request.userId) request.userId = cloudScriptResponse.response.request.userId;
			if (cloudScriptResponse.response.request.userIds) request.userIds = cloudScriptResponse.response.request.userIds;
			if (cloudScriptResponse.response.request.roomId) request.roomId = cloudScriptResponse.response.request.roomId;
		}
	}

	public async executePre(
		eventName: string,
		request: { [k: string]: any },
		secretInfo: SecretInfo,
		operationRequest: OperationRequest
	): Promise<OperationResponse> {
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(eventName.split("_")[0], eventName);

		if (cloudScriptWorker == null) {
			return null;
		}

		let requestId = StringUtility.generateRandomString(10, 0);

		let finalSecretInfo: {
			secretKey: string;
			description: string;
			role: number;
			remove: boolean;
			tsExpire: number;
			permission: SecretPermissionItem;
			gameId: string;
			isDefault: boolean;
			onlyMasterAdmin: boolean;
		} = null as any;

		if (secretInfo) {
			finalSecretInfo = {
				gameId: secretInfo.getGameId(),
				description: secretInfo.getDescription(),
				isDefault: secretInfo.getIsDefault(),
				onlyMasterAdmin: secretInfo.getIsOnlyMasterAdmin(),
				permission: secretInfo.getPermission(),
				remove: secretInfo.isRemove(),
				role: secretInfo.getRole(),
				secretKey: secretInfo.getSecretKey(),
				tsExpire: secretInfo.getTsExpire(),
			};
		}

		let cloudScriptRequest: CloudScriptRequest = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.Pre,
			operationRequest: {
				operationCode: operationRequest.getOperationCode(),
				parameters: operationRequest.getParameters()?.toData(),
				requestId: operationRequest.getRequestId(),
			},
			request: request,
			secretInfo: finalSecretInfo,
		};

		cloudScriptWorker.send(cloudScriptRequest);

		let thiz = this;

		let isResolved = false;
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			let timeout = setTimeout(() => {
				if (isResolved) return;
				isResolved = true;

				resolve({
					responseId: requestId,
					response: {
						status: ExecuteResponseStatus.Timeout,
						errorMessage: "function execute timeout",
						result: null,
						request: null,
					},
					stats: null,
					logs: [],
				});
			}, thiz.executeTimeoutInMs);

			thiz.cloudScriptWaitingResponseCallbackDict.set(requestId, (cloudScriptResponse: CloudScriptResponse) => {
				if (isResolved) return;
				isResolved = true;

				clearTimeout(timeout);
				resolve(cloudScriptResponse);
			});
		});

		this.cloudScriptWaitingResponseCallbackDict.delete(requestId);

		if (cloudScriptResponse.logs.length != 0) Debug.log(JSON.stringify(cloudScriptResponse.logs));

		if (cloudScriptResponse.response.status == ExecuteResponseStatus.Ok) {
			if (cloudScriptResponse.response.request) {
				let responseRequest = cloudScriptResponse.response.request;
				let keys = Object.keys(responseRequest);

				for (let i = 0; i < keys.length; i++) {
					let key = keys[i];

					request[key] = responseRequest[key];
				}
			}

			if (cloudScriptResponse.response.result) {
				let responseOperationResponse = cloudScriptResponse.response.result as {
					returnCode: number;
					debugMessage: string;
					parameters?: {};
				};

				let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());

				operationResponse.setReturnCode(responseOperationResponse.returnCode);
				operationResponse.setDebugMessage(responseOperationResponse.debugMessage);

				if (responseOperationResponse.parameters) operationResponse.setParameters(GNHashtable.builder().addAll(responseOperationResponse.parameters).build());

				return operationResponse;
			}
		}

		return null;
	}

	public async executeVerifyGenericService(serviceName: string, serviceData: { [k: string]: any; }): Promise<{ success: boolean, serviceId: string, someDatas?: any, errorMessage?: string }> {
		let cloudFunction = this.cloudScriptFunctionDict.get("system");
		if (cloudFunction == null) {
			Debug.logError("[GearN] [SystemEventCallback] system not found");
			return { success: false, serviceId: null, };
		}
		let eventName = "system_VerifyGenericService";
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return { success: false, serviceId: null, };
		}

		let requestId = StringUtility.generateRandomString(10, 0);

		let cloudScriptRequest: CloudScriptRequest = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.SystemVerifyGenericService,
			request: {
				serviceName: serviceName,
				serviceData: serviceData,
			},
		};

		cloudScriptWorker.send(cloudScriptRequest);

		let thiz = this;

		let isResolved = false;
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			let timeout = setTimeout(() => {
				if (isResolved) return;
				isResolved = true;

				resolve({
					responseId: requestId,
					response: {
						status: ExecuteResponseStatus.Timeout,
						errorMessage: "function execute timeout",
						result: null,
						request: null,
					},
					stats: null,
					logs: [],
				});
			}, thiz.executeTimeoutInMs);

			thiz.cloudScriptWaitingResponseCallbackDict.set(requestId, (cloudScriptResponse: CloudScriptResponse) => {
				if (isResolved) return;
				isResolved = true;

				clearTimeout(timeout);
				resolve(cloudScriptResponse);
			});
		});

		this.cloudScriptWaitingResponseCallbackDict.delete(requestId);

		if (cloudScriptResponse.logs.length != 0) Debug.log(JSON.stringify(cloudScriptResponse.logs));

		if (cloudScriptResponse.response.status == ExecuteResponseStatus.Ok) {
			return {
				success: cloudScriptResponse.response.request?.success ?? false,
				serviceId: cloudScriptResponse.response.request?.serviceId,
				someDatas: cloudScriptResponse.response.request?.someDatas,
				errorMessage: cloudScriptResponse.response.request?.errorMessage,
			}
		}

		return {
			success: false,
			serviceId: null,
		};
	}

	public async executeAuthenticate(
		eventName: string,
		request: { userId: string, ipAddress: string, isNewUser: boolean, authenticationType: string, },
		secretInfo: SecretInfo,
		operationRequest: OperationRequest,
		operationResponse: OperationResponse
	): Promise<void> {
		let cloudFunction = this.cloudScriptFunctionDict.get("system");
		if (cloudFunction == null) {
			return;
		}
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return;
		}

		let requestId = StringUtility.generateRandomString(10, 0);

		let finalSecretInfo: {
			secretKey: string;
			description: string;
			role: number;
			remove: boolean;
			tsExpire: number;
			permission: SecretPermissionItem;
			gameId: string;
			isDefault: boolean;
			onlyMasterAdmin: boolean;
		} = null as any;
		if (secretInfo) {
			finalSecretInfo = {
				gameId: secretInfo.getGameId(),
				description: secretInfo.getDescription(),
				isDefault: secretInfo.getIsDefault(),
				onlyMasterAdmin: secretInfo.getIsOnlyMasterAdmin(),
				permission: secretInfo.getPermission(),
				remove: secretInfo.isRemove(),
				role: secretInfo.getRole(),
				secretKey: secretInfo.getSecretKey(),
				tsExpire: secretInfo.getTsExpire(),
			};
		}

		let cloudScriptRequest: CloudScriptRequest = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.SystemAuthenticate,
			operationRequest: {
				operationCode: operationRequest.getOperationCode(),
				parameters: operationRequest.getParameters()?.toData(),
				requestId: operationRequest.getRequestId(),
			},
			operationResponse: {
				debugMessage: operationResponse.getDebugMessage(),
				parameters: operationResponse.getParameters()?.toData(),
				returnCode: operationResponse.getReturnCode(),
			},
			request: request,
			secretInfo: finalSecretInfo,
		};

		cloudScriptWorker.send(cloudScriptRequest);

		let thiz = this;

		let isResolved = false;
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			let timeout = setTimeout(() => {
				if (isResolved) return;
				isResolved = true;

				resolve({
					responseId: requestId,
					response: {
						status: ExecuteResponseStatus.Timeout,
						errorMessage: "function execute timeout",
						result: null,
						request: null,
					},
					stats: null,
					logs: [],
				});
			}, thiz.executeTimeoutInMs);

			thiz.cloudScriptWaitingResponseCallbackDict.set(requestId, (cloudScriptResponse: CloudScriptResponse) => {
				if (isResolved) return;
				isResolved = true;

				clearTimeout(timeout);
				resolve(cloudScriptResponse);
			});
		});

		this.cloudScriptWaitingResponseCallbackDict.delete(requestId);

		if (cloudScriptResponse.logs.length != 0) Debug.log(JSON.stringify(cloudScriptResponse.logs));

		if (cloudScriptResponse.response.status == ExecuteResponseStatus.Ok) {
			if (cloudScriptResponse.response.result) {
				let responseOperationResponse = cloudScriptResponse.response.result as {
					returnCode: number;
					debugMessage: string;
					parameters?: {};
				};

				operationResponse.setReturnCode(responseOperationResponse.returnCode);
				operationResponse.setDebugMessage(responseOperationResponse.debugMessage);

				if (responseOperationResponse.parameters) operationResponse.setParameters(GNHashtable.builder().addAll(responseOperationResponse.parameters).build());
			}
		} else if (cloudScriptResponse.response.status == ExecuteResponseStatus.FunctionNameNotFound) {
		} else {
			operationResponse.setParameter(ParameterCode.ErrorMessage, cloudScriptResponse.response.errorMessage);
		}
	}

	public async executePost(
		eventName: string,
		request: { [k: string]: any },
		secretInfo: SecretInfo,
		operationRequest: OperationRequest,
		operationResponse: OperationResponse
	): Promise<void> {
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(eventName.split("_")[0], eventName);

		if (cloudScriptWorker == null) {
			return;
		}

		let requestId = StringUtility.generateRandomString(10, 0);

		let finalSecretInfo: {
			secretKey: string;
			description: string;
			role: number;
			remove: boolean;
			tsExpire: number;
			permission: SecretPermissionItem;
			gameId: string;
			isDefault: boolean;
			onlyMasterAdmin: boolean;
		} = null as any;
		if (secretInfo) {
			finalSecretInfo = {
				gameId: secretInfo.getGameId(),
				description: secretInfo.getDescription(),
				isDefault: secretInfo.getIsDefault(),
				onlyMasterAdmin: secretInfo.getIsOnlyMasterAdmin(),
				permission: secretInfo.getPermission(),
				remove: secretInfo.isRemove(),
				role: secretInfo.getRole(),
				secretKey: secretInfo.getSecretKey(),
				tsExpire: secretInfo.getTsExpire(),
			};
		}

		let cloudScriptRequest: CloudScriptRequest = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.Post,
			operationRequest: {
				operationCode: operationRequest.getOperationCode(),
				parameters: operationRequest.getParameters()?.toData(),
				requestId: operationRequest.getRequestId(),
			},
			operationResponse: {
				debugMessage: operationResponse.getDebugMessage(),
				parameters: operationResponse.getParameters()?.toData(),
				returnCode: operationResponse.getReturnCode(),
			},
			request: request,
			secretInfo: finalSecretInfo,
		};

		cloudScriptWorker.send(cloudScriptRequest);

		let thiz = this;

		let isResolved = false;
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			let timeout = setTimeout(() => {
				if (isResolved) return;
				isResolved = true;

				resolve({
					responseId: requestId,
					response: {
						status: ExecuteResponseStatus.Timeout,
						errorMessage: "function execute timeout",
						result: null,
						request: null,
					},
					stats: null,
					logs: [],
				});
			}, thiz.executeTimeoutInMs);

			thiz.cloudScriptWaitingResponseCallbackDict.set(requestId, (cloudScriptResponse: CloudScriptResponse) => {
				if (isResolved) return;
				isResolved = true;

				clearTimeout(timeout);
				resolve(cloudScriptResponse);
			});
		});

		this.cloudScriptWaitingResponseCallbackDict.delete(requestId);

		if (cloudScriptResponse.logs.length != 0) Debug.log(JSON.stringify(cloudScriptResponse.logs));

		if (cloudScriptResponse.response.status == ExecuteResponseStatus.Ok) {
			if (cloudScriptResponse.response.result) {
				let responseOperationResponse = cloudScriptResponse.response.result as {
					returnCode: number;
					debugMessage: string;
					parameters?: {};
				};

				operationResponse.setReturnCode(responseOperationResponse.returnCode);
				operationResponse.setDebugMessage(responseOperationResponse.debugMessage);

				if (responseOperationResponse.parameters) operationResponse.setParameters(GNHashtable.builder().addAll(responseOperationResponse.parameters).build());
			}
		} else if (cloudScriptResponse.response.status == ExecuteResponseStatus.FunctionNameNotFound) {
		} else {
			operationResponse.setParameter(ParameterCode.ErrorMessage, cloudScriptResponse.response.errorMessage);
		}
	}

	private loadCloudScriptFunctionWorkerFromCache(type: string, eventName: string): ChildProcess {
		let cloudFunction = this.cloudScriptFunctionDict.get(type);
		if (cloudFunction == null) return null;

		let childScript = cloudFunction.childScripts.find((x) => x.eventName == eventName);
		if (childScript == null || !childScript.hasEdit) return null;

		let finalVersion = cloudFunction.type + "_" + cloudFunction.version;

		let cloudScriptWorker = this.cloudScriptWorkerDict.get(finalVersion);
		if (cloudScriptWorker == null) {
			return this.loadCloudScriptFunctionWorker(cloudFunction.type, cloudFunction.version, cloudFunction.fullScript);
		}

		return cloudScriptWorker;
	}

	public async addCloudScriptFunction(eventName: string, script: string): Promise<{ success: boolean; errorMessage?: string; version?: string }> {
		let type = eventName.split("_")[0];
		let version = StringUtility.generateRandomString(7, 0);

		let filePathTempTs = __dirname + "/./GN-startup/cloudScript/temp2.ts";

		if (type == "system") {
			let leftEventName = eventName.split("_")[1];

			if (leftEventName == "SendEventTo" || leftEventName == "SendEventToRoom" || leftEventName == "SendEventToMoreUser" || leftEventName == "SendEventToAllPlayer") {
				type = "systemEvent";
			}
			else if (leftEventName == "VerifyGenericService") {
				type = "systemGenericService";
			}
			else if (leftEventName == "OnAuthenticateSuccess") {
				type = "systemAuthenticate";
			}
			else if (leftEventName == "RequestServerDetail") {
				type = "systemMatchmaking"
			}
		}

		let cloudFunction = this.cloudScriptFunctionDict.get(type);
		if (cloudFunction == null)
			return {
				success: false,
				errorMessage: "eventName invalid",
			};

		let childScript = cloudFunction.childScripts.find((x) => x.eventName == eventName);
		if (childScript == null) {
			return {
				success: false,
				errorMessage: "eventName invalid",
			};
		}

		let finalScript: string = "";

		for (let i = 0; i < cloudFunction.childScripts.length; i++) {
			let thisChildScript = cloudFunction.childScripts[i];

			if (thisChildScript.eventName == eventName) {
				finalScript += script;
				finalScript += "\n";
			} else if (thisChildScript.hasEdit) {
				finalScript += thisChildScript.script;
				finalScript += "\n";
			}
		}

		let fullScriptJs: string;

		try {
			let templateFullScriptPathTs = __dirname + "/./GN-startup/cloudScript/templateEventCallback.ts";
			let fullScriptTs = fs.readFileSync(templateFullScriptPathTs).toString().replace("//$replaceScript", finalScript);

			fs.writeFileSync(filePathTempTs, fullScriptTs);

			let filePathTemp = __dirname + "/./GN-startup/cloudScript";

			await execSync("npx tsc " + filePathTempTs + " --allowJs --skipLibCheck --esModuleInterop --outDir " + filePathTemp);

			let filePathTempJs = __dirname + "/./GN-startup/cloudScript/temp2.js";
			fullScriptJs = fs.readFileSync(filePathTempJs).toString();

		} catch (err) {
			if (fs.existsSync(filePathTempTs)) fs.rmSync(filePathTempTs);

			let errorMessage = "Unknown error occurred";

			if (err instanceof Error) {
				errorMessage = err.message;
			} else if (typeof err === "string") {
				errorMessage = err;
			} else if (typeof err === "object" && err !== null) {
				errorMessage = JSON.stringify(err);
			}

			return {
				success: false,
				errorMessage: errorMessage,
			};
		}

		this.gnServer.getHttpApp().getClusterHandler().sendEvent("addEventCloudScriptFunction", { type: type, eventName: eventName, version: version, fullScriptJs: fullScriptJs, script: script, }, false);

		let finalVersion = cloudFunction.type + "_" + cloudFunction.version;
		setTimeout(() => {
			let cloudScriptWorker = this.cloudScriptWorkerDict.get(finalVersion);
			if (cloudScriptWorker != null) {
				cloudScriptWorker.kill("SIGKILL");
			}
		}, this.executeTimeoutInMs + 10000);

		this.loadCloudScriptFunctionWorker(type, version, fullScriptJs);

		await this.backupCloudScriptFunctionCollection.insertOne({
			type: cloudFunction.type,
			version: cloudFunction.version,
			fullScript: cloudFunction.fullScript,
			tsLastUpdate: cloudFunction.tsLastUpdate,
			childScripts: cloudFunction.childScripts,
		});

		childScript.script = script;
		childScript.hasEdit = true;

		cloudFunction.version = version;
		cloudFunction.tsLastUpdate = xDatetime.getCurrentMilliseconds();
		cloudFunction.fullScript = fullScriptJs;

		this.cloudScriptFunctionCollection.updateOne(
			{
				type: cloudFunction.type,
			},
			{
				$set: {
					version: version,
					fullScript: fullScriptJs,
					tsLastUpdate: cloudFunction.tsLastUpdate,
					childScripts: cloudFunction.childScripts,
				},
			}
		);

		return {
			success: true,
			version: version,
		};
	}

	private async remoteAddCloudScriptFunction(request: { type: string, eventName: string, version: string, fullScriptJs: string, script: string, }) {
		let type = request.type;
		let eventName = request.eventName;
		let version = request.version;
		let fullScriptJs = request.fullScriptJs;
		let script = request.script;

		let cloudFunction = this.cloudScriptFunctionDict.get(type);
		if (cloudFunction == null)
			return;

		let childScript = cloudFunction.childScripts.find((x) => x.eventName == eventName);
		if (childScript == null) {
			return;
		}

		let finalVersion = cloudFunction.type + "_" + cloudFunction.version;
		setTimeout(() => {
			let cloudScriptWorker = this.cloudScriptWorkerDict.get(finalVersion);
			if (cloudScriptWorker != null) {
				cloudScriptWorker.kill("SIGKILL");
			}
		}, this.executeTimeoutInMs + 10000);

		this.loadCloudScriptFunctionWorker(type, version, fullScriptJs);

		childScript.script = script;
		childScript.hasEdit = true;

		cloudFunction.version = version;
		cloudFunction.tsLastUpdate = xDatetime.getCurrentMilliseconds();
		cloudFunction.fullScript = fullScriptJs;
	}

	private loadCloudScriptFunctionWorker(type: string, version: string, fullScript: string): ChildProcess {
		let finalVersion = type + "_" + version;

		let filePath = __dirname + "/./GN-startup/cloudScript/" + finalVersion + ".js";
		fs.writeFileSync(filePath, fullScript);

		return this.loadCloudScriptWorker(type, version);
	}

	private loadCloudScriptWorker(type: string, version: string): ChildProcess {
		let finalVersion = type + "_" + version;
		let filePath = __dirname + "/./GN-startup/cloudScript/" + finalVersion + ".js";

		Debug.log("[GearN] [EventCallback] run cloudScript " + finalVersion);

		let cloudScriptWorker = fork(filePath, {
			env: {
				gnServerSettingsOptions: JSON.stringify(this.gnServerSettingsOptions),
				dbConnection: JSON.stringify(this.dbConnection),
			},
		});

		let thiz = this;
		cloudScriptWorker.on("message", (cloudScriptResponse: CloudScriptResponse) => {
			if (cloudScriptResponse.responseId) {
				let callback = thiz.cloudScriptWaitingResponseCallbackDict.get(cloudScriptResponse.responseId);
				if (callback != null) {
					callback(cloudScriptResponse);
				}
			} else {
				let cloudScriptEvent: CloudScriptEvent = cloudScriptResponse as any;

				if (cloudScriptEvent.eventType == CloudScriptEventType.SendEventToOne || cloudScriptEvent.eventType == CloudScriptEventType.SendEventToMore || cloudScriptEvent.eventType == CloudScriptEventType.SendEventToAll) {
					let operationEvent = new OperationEvent(
						cloudScriptEvent.operationEvent.eventCode,
						cloudScriptEvent.operationEvent.parameters != null ? GNHashtable.builder().addAll(cloudScriptEvent.operationEvent.parameters).build() : null
					);

					if (cloudScriptEvent.eventType == CloudScriptEventType.SendEventToOne) {
						thiz.gnServer.sendEventTo(cloudScriptEvent.userId, operationEvent);
					} else if (cloudScriptEvent.eventType == CloudScriptEventType.SendEventToMore) {
						thiz.gnServer.sendEventToMoreUser(cloudScriptEvent.userIds, operationEvent);
					} else if (cloudScriptEvent.eventType == CloudScriptEventType.SendEventToAll) {
						thiz.gnServer.sendEventToAllPlayer(operationEvent);
					}
				}
				else if (cloudScriptEvent.eventType == CloudScriptEventType.ConfirmServerDetail) {
					thiz.gnServer.setMatchServerDetail(cloudScriptEvent.gameId, cloudScriptEvent.matchmakingTicketCanMatch.matchId, cloudScriptEvent.serverDetail, cloudScriptEvent.matchmakingTicketCanMatch.ticketIds);
				}
				else if (cloudScriptEvent.eventType == CloudScriptEventType.SendMailToOne) {
					let mailData = cloudScriptEvent.mailData;

					thiz.gnServer.getEmailService().sendMail(cloudScriptEvent.email, mailData.subject, mailData.contentHtml);
				}
				else if (cloudScriptEvent.eventType == CloudScriptEventType.SendMailToMore) {
					let mailData = cloudScriptEvent.mailData;

					thiz.gnServer.getEmailService().sendMailToMore(cloudScriptEvent.emails, mailData.subject, mailData.contentHtml);
				}
				else if (cloudScriptEvent.eventType == CloudScriptEventType.SendPushNotificationToOne) {
					let pushData = cloudScriptEvent.pushData;

					thiz.gnServer.getPushNotificationService().sendNotification(cloudScriptEvent.token, pushData.title, pushData.body, pushData.badge, pushData.sound, pushData.icon, pushData.data);
				}
				else if (cloudScriptEvent.eventType == CloudScriptEventType.SendPushNotificationToMore) {
					let pushData = cloudScriptEvent.pushData;

					thiz.gnServer.getPushNotificationService().sendNotificationToMore(cloudScriptEvent.tokens, pushData.title, pushData.body, pushData.badge, pushData.sound, pushData.icon, pushData.data);
				}
				else if (cloudScriptEvent.eventType == CloudScriptEventType.SendPushNotificationToTopic) {
					let pushData = cloudScriptEvent.pushData;

					thiz.gnServer.getPushNotificationService().sendNotificationToTopic(cloudScriptEvent.topic, pushData.title, pushData.body, pushData.badge, pushData.sound, pushData.icon, pushData.data);
				}
				else if (cloudScriptEvent.eventType == CloudScriptEventType.SubscribeToTopic) {
					thiz.gnServer.getPushNotificationService().subscribeToTopic(cloudScriptEvent.tokens, cloudScriptEvent.topic);
				}
				else if (cloudScriptEvent.eventType == CloudScriptEventType.UnsubscribeFromTopic) {
					thiz.gnServer.getPushNotificationService().unsubscribeFromTopic(cloudScriptEvent.tokens, cloudScriptEvent.topic);
				}
			}
		});

		cloudScriptWorker.on("exit", (code) => {
			Debug.log("[GearN] [EventCallback] terminal cloudScript " + finalVersion + " with code " + code);

			thiz.cloudScriptWorkerDict.delete(finalVersion);
		});

		this.cloudScriptWorkerDict.set(finalVersion, cloudScriptWorker);

		return cloudScriptWorker;
	}
}

export class PostEventCallbackService implements IPostEventCallbackService {
	private eventLstDict: Map<string, Array<OnPostCallbackFunction>>;

	constructor() {
		this.eventLstDict = new Map();
	}

	private eventCallbackLogCollection: mongoDB.Collection<mongoDB.Document>;
	private cloudScriptService: IEventCallbackCloudScriptService;

	public subscriberEvent(eventName: string, callbackFunction: OnPostCallbackFunction) {
		if (!this.eventLstDict.has(eventName)) {
			this.eventLstDict.set(eventName, []);
		}

		let eventLst = this.eventLstDict.get(eventName);
		eventLst.push(callbackFunction);
	}

	public unSubscriberEvent(eventName: string, callbackFunction: OnPostCallbackFunction) {
		if (!this.eventLstDict.has(eventName)) {
			this.eventLstDict.set(eventName, []);
		}

		let eventLst = this.eventLstDict.get(eventName);

		let indexOf = eventLst.indexOf(callbackFunction);

		if (indexOf != -1) {
			eventLst.splice(indexOf, 1);
		}
	}

	public setEventCallbackLogCollection(eventCallbackLogCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.eventCallbackLogCollection = eventCallbackLogCollection;
	}

	public setCloudScriptService(cloudScriptService: IEventCallbackCloudScriptService): void {
		this.cloudScriptService = cloudScriptService;
	}

	public async onEvent(
		eventName: string,
		request: {},
		secretInfo: SecretInfo,
		operationRequest: OperationRequest,
		operationResponse: OperationResponse
	): Promise<void> {
		let operationResponseToData = OperationHelper.toDataOperationResponse(operationResponse)

		this.eventCallbackLogCollection.insertOne({
			eventName: eventName,
			tsCreate: xDatetime.getCurrentMilliseconds(),
			request: request,
			operationRequest: OperationHelper.toDataOperationRequest(operationRequest),
			originRequest: OperationHelper.toDataFromRequest((operationRequest as any).originRequest),
			operationResponse: operationResponseToData,
			customTags: operationRequest.getParameters().getGNHashtable("customTags"),
			responseSize: Buffer.byteLength(JSON.stringify(operationResponseToData), "utf-8"),
		});

		if (this.cloudScriptService) {
			await this.cloudScriptService.executePost(eventName, request, secretInfo, operationRequest, operationResponse);
		}

		if (!this.eventLstDict.has(eventName)) {
			return;
		}

		let eventLst = this.eventLstDict.get(eventName);

		for (let i = 0; i < eventLst.length; i++) {
			try {
				await eventLst[i](request, secretInfo, operationRequest, operationResponse);
			} catch (err) {
				Debug.logException(err);
			}
		}
	}

	public async onAuthenticateEvent(eventName: string, request: { userId: string, ipAddress: string, isNewUser: boolean, authenticationType: string, }, secretInfo: SecretInfo, operationRequest: OperationRequest, operationResponse: OperationResponse): Promise<void> {
		if (this.cloudScriptService) {
			await this.cloudScriptService.executeAuthenticate(eventName, request, secretInfo, operationRequest, operationResponse);
		}
	}

	public async onVerifyGenericService(serviceName: string, serviceData: { [k: string]: any; }): Promise<{ success: boolean, serviceId: string, someDatas?: any, errorMessage?: string }> {
		if (this.cloudScriptService) {
			let response = await this.cloudScriptService.executeVerifyGenericService(serviceName, serviceData);

			if (response) return response;
		}

		return {
			success: false,
			serviceId: null,
			errorMessage: "Service not ready",
		};
	}

}

export class PreEventCallbackService implements IPreEventCallbackService {
	private eventDict: Map<string, OnPreCallbackFunction>;
	private cloudScriptService: IEventCallbackCloudScriptService;

	constructor() {
		this.eventDict = new Map();
	}

	public subscriberEvent(eventName: string, callbackFunction: OnPreCallbackFunction) {
		this.eventDict.set(eventName, callbackFunction);
	}

	public unSubscriberEvent(eventName: string) {
		this.eventDict.delete(eventName);
	}

	public setCloudScriptService(cloudScriptService: IEventCallbackCloudScriptService): void {
		this.cloudScriptService = cloudScriptService;
	}

	public async onEvent(eventName: string, request: {}, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		if (this.cloudScriptService) {
			let operationResponse = await this.cloudScriptService.executePre(eventName, request, secretInfo, operationRequest);

			if (operationResponse) return operationResponse;
		}

		if (!this.eventDict.has(eventName)) {
			return null;
		}

		try {
			return this.eventDict.get(eventName)(request, secretInfo, operationRequest);
		} catch (err) {
			Debug.logException(err);
		}

		return null;
	}

}
