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
import { GNServer } from "../../GNServer";
import { GNServerSettingsOptions } from "@xmobitea/gn-typescript-client";
import { StringUtility } from "../../GN-common/helper/StringUtility";
import { OperationEvent } from "../../GN-common/entity/operationEvent/OperationEvent";
import { GNParameterCode } from "../../GN-common/constant/parameterCode/GNParameterCode";
import { GNHashtable } from "../../GN-common/common/GNData";
import { MatchmakingTicketCanMatch } from "../handler/controller/handler/multiplayer/MatchmakingHandler";
import { ServerDetail } from "../../GN-library/xdatabase/lib/entity/pro/ServerDetail";

enum EventCallbackType {
	Pre = 0,
	Post = 1,
	System = 2,
	Event = 3,
}

interface CloudScriptRequest {
	requestId: string;
	eventType: EventCallbackType;
	eventName: string;
	request: { [k: string]: any };
	secretInfo: {
		secretKey: string;
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
		encrypted: boolean;
	};
	operationResponse?: {
		returnCode: number;
		debugMessage: string;
		parameters: {};
		encrypted: boolean;
	};
}

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
			encrypted: boolean;
		} | null;
		request: { [k: string]: any };
		errorMessage: any;
	};
	responseId: string;
	logs: string[];
}

enum CloudScriptEventType {
	SendToUser = 0,
	SendToMore = 1,
	SendToAll = 2,
}

interface CloudScriptEvent {
	eventType: CloudScriptEventType;
	operationEvent: {
		eventCode: string;
		parameters: {};
		encrypted: boolean;
	};
	receiver: string[] | string | null;
}

interface DbConnection {
	url: string;
	dbName: string;
	options?: { [k: string]: any };
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
			operationRequest: null,
			request: null,
			secretInfo: null,
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
			eventType: EventCallbackType.System,
			operationRequest: null,
			request: {
				gameId: gameId,
				matchmakingTicketCanMatch: matchmakingTicketCanMatch,
			},
			secretInfo: null,
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
			eventType: EventCallbackType.Event,
			operationRequest: {
				operationCode: operationEvent.getEventCode(),
				encrypted: operationEvent.isEncrypted(),
				parameters: operationEvent.getParameters(),
				requestId: 0,
			},
			request: request,
			secretInfo: null,
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
			operationEvent.setEncrypted(cloudScriptResponse.response.result.encrypted);
			(operationEvent as any).eventCode = cloudScriptResponse.response.result.returnCode;

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
				encrypted: operationRequest.isEncrypted(),
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
				let responseOperationResponse = cloudScriptResponse.response.result;

				let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());

				operationResponse.setReturnCode(responseOperationResponse.returnCode);
				operationResponse.setDebugMessage(responseOperationResponse.debugMessage);

				if (responseOperationResponse.parameters) operationResponse.setParameters(GNHashtable.builder().addAll(responseOperationResponse.parameters).build());

				return operationResponse;
			}
		}

		return null;
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
			eventType: EventCallbackType.System,
			operationRequest: {
				operationCode: operationRequest.getOperationCode(),
				encrypted: operationRequest.isEncrypted(),
				parameters: operationRequest.getParameters()?.toData(),
				requestId: operationRequest.getRequestId(),
			},
			operationResponse: {
				debugMessage: operationResponse.getDebugMessage(),
				encrypted: operationResponse.isEncrypted(),
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
				let responseOperationResponse = cloudScriptResponse.response.result;

				operationResponse.setReturnCode(responseOperationResponse.returnCode);
				operationResponse.setDebugMessage(responseOperationResponse.debugMessage);
				operationResponse.setEncrypted(responseOperationResponse.encrypted);

				if (responseOperationResponse.parameters) operationResponse.setParameters(GNHashtable.builder().addAll(responseOperationResponse.parameters).build());
			}
		} else if (cloudScriptResponse.response.status == ExecuteResponseStatus.FunctionNameNotFound) {
		} else {
			operationResponse.setParameter(GNParameterCode.Message, cloudScriptResponse.response.errorMessage);
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
				encrypted: operationRequest.isEncrypted(),
				parameters: operationRequest.getParameters()?.toData(),
				requestId: operationRequest.getRequestId(),
			},
			operationResponse: {
				debugMessage: operationResponse.getDebugMessage(),
				encrypted: operationResponse.isEncrypted(),
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
				let responseOperationResponse = cloudScriptResponse.response.result;

				operationResponse.setReturnCode(responseOperationResponse.returnCode);
				operationResponse.setDebugMessage(responseOperationResponse.debugMessage);
				operationResponse.setEncrypted(responseOperationResponse.encrypted);

				if (responseOperationResponse.parameters) operationResponse.setParameters(GNHashtable.builder().addAll(responseOperationResponse.parameters).build());
			}
		} else if (cloudScriptResponse.response.status == ExecuteResponseStatus.FunctionNameNotFound) {
		} else {
			operationResponse.setParameter(GNParameterCode.Message, cloudScriptResponse.response.errorMessage);
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

				let operationEvent = new OperationEvent(
					cloudScriptEvent.operationEvent.eventCode,
					cloudScriptEvent.operationEvent.parameters != null ? GNHashtable.builder().addAll(cloudScriptEvent.operationEvent.parameters).build() : null,
					cloudScriptEvent.operationEvent.encrypted
				);

				if (cloudScriptEvent.eventType == CloudScriptEventType.SendToUser) {
					thiz.gnServer.sendEventTo(cloudScriptEvent.receiver as string, operationEvent);
				} else if (cloudScriptEvent.eventType == CloudScriptEventType.SendToMore) {
					thiz.gnServer.sendEventToMoreUser(cloudScriptEvent.receiver as string[], operationEvent);
				} else if (cloudScriptEvent.eventType == CloudScriptEventType.SendToAll) {
					thiz.gnServer.sendEventToAllPlayer(operationEvent);
				}
				else {
					let eventTypeAny = cloudScriptEvent.eventType as any;

					if (eventTypeAny == 10) {
						let parameters: {
							gameId: string,
							matchmakingTicketCanMatch: MatchmakingTicketCanMatch,
							serverDetail: ServerDetail,
						} = cloudScriptEvent.operationEvent.parameters as any;

						thiz.gnServer.setMatchServerDetail(parameters.gameId, parameters.matchmakingTicketCanMatch.matchId, parameters.serverDetail, parameters.matchmakingTicketCanMatch.ticketIds);
					}
					else if (eventTypeAny == 20) {
						let parameters: {
							email: string,
							subject: string,
							contentHtml: string,
						} = cloudScriptEvent.operationEvent.parameters as any;

						thiz.gnServer.getEmailService().sendMail(parameters.email, parameters.subject, parameters.contentHtml);
					}
					else if (eventTypeAny == 21) {
						let parameters: {
							emails: string[],
							subject: string,
							contentHtml: string,
						} = cloudScriptEvent.operationEvent.parameters as any;

						thiz.gnServer.getEmailService().sendMailToMore(parameters.emails, parameters.subject, parameters.contentHtml);
					}
					else if (eventTypeAny == 30) {
						let parameters: {
							token: string,
							title: string,
							body: string,
							badge?: number,
							sound?: string,
							icon?: string,
							data?: { [k: string]: any },
						} = cloudScriptEvent.operationEvent.parameters as any;

						thiz.gnServer.getPushNotificationService().sendNotification(parameters.token, parameters.title, parameters.body, parameters.badge, parameters.sound, parameters.icon, parameters.data);
					}
					else if (eventTypeAny == 31) {
						let parameters: {
							tokens: string[],
							title: string,
							body: string,
							badge?: number,
							sound?: string,
							icon?: string,
							data?: { [k: string]: any },
						} = cloudScriptEvent.operationEvent.parameters as any;

						thiz.gnServer.getPushNotificationService().sendNotificationToMore(parameters.tokens, parameters.title, parameters.body, parameters.badge, parameters.sound, parameters.icon, parameters.data);
					}
					else if (eventTypeAny == 32) {
						let parameters: {
							topic: string,
							title: string,
							body: string,
							badge?: number,
							sound?: string,
							icon?: string,
							data?: { [k: string]: any },
						} = cloudScriptEvent.operationEvent.parameters as any;

						thiz.gnServer.getPushNotificationService().sendNotificationToTopic(parameters.topic, parameters.title, parameters.body, parameters.badge, parameters.sound, parameters.icon, parameters.data);
					}
					else if (eventTypeAny == 33) {
						let parameters: {
							tokens: string[],
							topic: string,
						} = cloudScriptEvent.operationEvent.parameters as any;

						thiz.gnServer.getPushNotificationService().subscribeToTopic(parameters.tokens, parameters.topic);
					}
					else if (eventTypeAny == 34) {
						let parameters: {
							tokens: string[],
							topic: string,
						} = cloudScriptEvent.operationEvent.parameters as any;

						thiz.gnServer.getPushNotificationService().unsubscribeFromTopic(parameters.tokens, parameters.topic);
					}
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

	private eventCallbackCollection: mongoDB.Collection<mongoDB.Document>;
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

	public setEventCallbackCollection(eventCallbackCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.eventCallbackCollection = eventCallbackCollection;
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

		this.eventCallbackCollection.insertOne({
			eventName: eventName,
			tsCreate: xDatetime.getCurrentMilliseconds(),
			request: request,
			operationRequest: OperationHelper.toDataOperationRequest(operationRequest),
			originRequest: OperationHelper.toDataFromRequest((operationRequest as any).originRequest),
			operationResponse: operationResponseToData,
			customTags: operationRequest.getParameters().getGNHashtable("CustomTags"),
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
			let response = await this.cloudScriptService.executePre(eventName, request, secretInfo, operationRequest);

			if (response) return response;
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
