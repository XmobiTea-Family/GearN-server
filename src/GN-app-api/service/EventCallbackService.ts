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
import { MatchmakingTicketCanMatch } from "./../service/IMatchmakingService";
import { CloudScriptEvent } from "./CloudScriptEventService";

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

type CloudScriptRequest = CloudScriptRequestPre | CloudScriptRequestPost | CloudScriptRequestSystem | CloudScriptRequestSystemMatchmaking | CloudScriptRequestSystemAuthenticate | CloudScriptRequestEvent | CloudScriptRequestSocket;

interface CloudScriptResponse {
	// Stores the stats value used by this contract.
	stats: {
		// Stores the memory used in bytes value used by this contract.
		memoryUsedInBytes: number;
		// Stores the execute time in milliseconds value used by this contract.
		executeTimeInMs: number;
	};
	// Stores the response collection used by this contract.
	response: {
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
		// Stores the request collection used by this contract.
		request: { [k: string]: any };
		// Stores the error message value used by this contract.
		errorMessage: string;
	};
	// Stores the response ID value used by this contract.
	responseId: string;
	// Stores the logs list used by this contract.
	logs: string[];
}

interface DbConnection {
	// Stores the URL value used by this contract.
	url: string,
	// Stores the database name value used by this contract.
	dbName: string,
	// Stores the log URL value used by this contract.
	logUrl: string,
	// Stores the log database name value used by this contract.
	logDbName: string,
	// Stores the options collection used by this contract.
	options?: { [k: string]: any },
}

export interface EventCallbackCloudScriptFunction {
	// Stores the type value used by this contract.
	type: string;
	// Stores the version value used by this contract.
	version: string;
	// Stores the full script value used by this contract.
	fullScript: string;
	// Stores the timestamp last update value used by this contract.
	tsLastUpdate: number;
	// Stores the child scripts list used by this contract.
	childScripts: {
		// Stores the event name value used by this contract.
		eventName: string;
		// Stores the script value used by this contract.
		script: string;
		// Indicates whether edit exists.
		hasEdit: boolean;
	}[];
}

export interface IEventCallbackCloudScriptService {
	/**
	 * Executes the request server detail system.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param matchmakingTicketCanMatch Provides the matchmaking ticket can match value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	executeRequestServerDetailSystem(gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch): Promise<{ success: boolean }>;
	/**
	 * Executes the post.
	 * @param eventName Provides the event name value used by this operation.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @param operationResponse Provides the operation response value used by this operation.
	 */
	executePost(
		eventName: string,
		request: { [k: string]: any },
		secretInfo: SecretInfo,
		operationRequest: OperationRequest,
		operationResponse: OperationResponse
	): Promise<void>;
	/**
	 * Executes the event.
	 * @param eventName Provides the event name value used by this operation.
	 * @param request Provides the request value used by this operation.
	 * @param operationEvent Provides the operation event value used by this operation.
	 */
	executeEvent(eventName: string, request: { [k: string]: any }, operationEvent: OperationEvent): Promise<void>;
	/**
	 * Executes the pre.
	 * @param eventName Provides the event name value used by this operation.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	executePre(eventName: string, request: { [k: string]: any }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse>;
	/**
	 * Executes the authenticate.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @param operationResponse Provides the operation response value used by this operation.
	 */
	executeAuthenticate(request: { userId: string, ipAddress: string, isNewUser: boolean, authenticationType: string, subData: { [k: string]: any } }, secretInfo: SecretInfo, operationRequest: OperationRequest, operationResponse: OperationResponse): Promise<void>;
	/**
	 * Executes the verify generic service.
	 * @param serviceName Provides the service name value used by this operation.
	 * @param serviceData Provides the service data value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	executeVerifyGenericService(serviceName: string, serviceData: { [k: string]: any; }): Promise<{ success: boolean, serviceId: string, someDatas?: any, errorMessage?: string }>;
	/**
	 * Executes the socket.
	 * @param eventName Provides the event name value used by this operation.
	 * @param request Provides the request value used by this operation.
	 */
	executeSocket(eventName: string, request: { [k: string]: any }): Promise<void>;

	/**
	 * Adds the cloud script function.
	 * @param eventName Provides the event name value used by this operation.
	 * @param script Provides the script value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	addCloudScriptFunction(eventName: string, script: string): Promise<{ success: boolean; errorMessage?: string; version?: string }>;
	/**
	 * Returns all cloud script function.
	 * @returns Returns all cloud script function.
	 */
	getAllCloudScriptFunction(): Promise<
		{
			// Stores the type value used by this contract.
			type: string;
			// Stores the version value used by this contract.
			version: string;
			// Stores the full script value used by this contract.
			fullScript: string;
			// Stores the timestamp last update value used by this contract.
			tsLastUpdate: number;
			// Stores the child scripts list used by this contract.
			childScripts: {
				// Stores the event name value used by this contract.
				eventName: string;
				// Stores the script value used by this contract.
				script: string;
				// Indicates whether edit exists.
				hasEdit: boolean;
			}[];
		}[]
	>;
}

export class EventCallbackCloudScriptService implements IEventCallbackCloudScriptService {

	// Stores the system execute timeout in milliseconds value used by this instance.
	private static readonly SystemExecuteTimeoutInMs = 12000000;
	// Stores the on every minute value used by this instance.
	private static readonly OnEveryMinute = "system_OnEveryMinute";
	// Stores the on every hour value used by this instance.
	private static readonly OnEveryHour = "system_OnEveryHour";
	// Stores the on every day value used by this instance.
	private static readonly OnEveryDay = "system_OnEveryDay";

	// Stores the cloud script worker dict collection used by this instance.
	private cloudScriptWorkerDict: Map<string, ChildProcess>;
	// Stores the cloud script waiting response callback dict collection used by this instance.
	private cloudScriptWaitingResponseCallbackDict: Map<string, (cloudScriptResponse: CloudScriptResponse) => void>;

	// Stores the cloud script function collection value used by this instance.
	private cloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>;
	// Stores the backup cloud script function collection value used by this instance.
	private backupCloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>;

	// Stores the GearN server value used by this instance.
	private gnServer: GNServer;
	// Stores the GearN server settings options value used by this instance.
	private gnServerSettingsOptions: GNServerSettingsOptions;
	// Stores the database connection value used by this instance.
	private dbConnection: DbConnection;
	// Stores the execute timeout in milliseconds value used by this instance.
	private executeTimeoutInMs: number;

	// Stores the cloud script function dict value used by this instance.
	private cloudScriptFunctionDict = new Map<string, EventCallbackCloudScriptFunction>();

	/**
	 * Initializes a new event callback cloud script service instance.
	 */
	constructor() {
		this.cloudScriptFunctionDict = new Map();

		this.cloudScriptWorkerDict = new Map();
		this.cloudScriptWaitingResponseCallbackDict = new Map();
	}

	/**
	 * Returns all cloud script function.
	 * @returns Returns all cloud script function.
	 */
	public async getAllCloudScriptFunction(): Promise<
		{
			// Stores the type value used by this contract.
			type: string;
			// Stores the version value used by this contract.
			version: string;
			// Stores the full script value used by this contract.
			fullScript: string;
			// Stores the timestamp last update value used by this contract.
			tsLastUpdate: number;
			// Stores the child scripts list used by this contract.
			childScripts: {
				// Stores the event name value used by this contract.
				eventName: string;
				// Stores the script value used by this contract.
				script: string;
				// Indicates whether edit exists.
				hasEdit: boolean;
			}[];
		}[]
	> {
		// Stores the answer value used in the current execution flow.
		let answer: {
			// Stores the type value used by this contract.
			type: string;
			// Stores the version value used by this contract.
			version: string;
			// Stores the full script value used by this contract.
			fullScript: string;
			// Stores the timestamp last update value used by this contract.
			tsLastUpdate: number;
			// Stores the child scripts list used by this contract.
			childScripts: {
				// Stores the event name value used by this contract.
				eventName: string;
				// Stores the script value used by this contract.
				script: string;
				// Indicates whether edit exists.
				hasEdit: boolean;
			}[];
		}[] = [];

		// Stores the values value used in the current execution flow.
		let values = Array.from(this.cloudScriptFunctionDict.values());

		for (let i = 0; i < values.length; i++) {
			// Stores the cloud function value used in the current execution flow.
			let cloudFunction = values[i];

			answer.push(cloudFunction);
		}

		return answer;
	}

	/**
	 * Executes the init workflow.
	 * @param gnServerSettingsOptions Provides the GearN server settings options value used by this operation.
	 * @param dbConnection Provides the database connection value used by this operation.
	 * @param gnServer Provides the GearN server value used by this operation.
	 * @param executeTimeoutInMs Provides the execute timeout in milliseconds value used by this operation.
	 */
	public init(gnServerSettingsOptions: GNServerSettingsOptions, dbConnection: DbConnection, gnServer: GNServer, executeTimeoutInMs: number): void {
		this.gnServerSettingsOptions = gnServerSettingsOptions;
		this.dbConnection = dbConnection;
		this.gnServer = gnServer;
		this.executeTimeoutInMs = executeTimeoutInMs;

		// Stores the thiz value used in the current execution flow.
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

	/**
	 * Sets the cloud script function collection.
	 * @param cloudScriptFunctionCollection Provides the cloud script function collection used by this operation.
	 */
	public setCloudScriptFunctionCollection(cloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.cloudScriptFunctionCollection = cloudScriptFunctionCollection;
	}

	/**
	 * Sets the backup cloud script function collection.
	 * @param cloudScriptFunctionCollection Provides the cloud script function collection used by this operation.
	 */
	public setBackupCloudScriptFunctionCollection(cloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.backupCloudScriptFunctionCollection = cloudScriptFunctionCollection;
	}

	/**
	 * Runs the current workflow.
	 */
	public run(): void {
		this.loadVersion();

		// Stores the thiz value used in the current execution flow.
		let thiz = this;

		this.gnServer.getHttpApp().getClusterHandler().onEvent("addEventCloudScriptFunction", data => {
			thiz.remoteAddCloudScriptFunction(data);
		});
	}

	/**
	 * Loads the version.
	 */
	private async loadVersion(): Promise<void> {
		// Stores the cloud script function results value used in the current execution flow.
		let cloudScriptFunctionResults = await this.cloudScriptFunctionCollection.find();

		while (await cloudScriptFunctionResults.hasNext()) {
			// Stores the cloud script function result value used in the current execution flow.
			let cloudScriptFunctionResult = await cloudScriptFunctionResults.next();

			// Stores the cloud script function value used in the current execution flow.
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

	/**
	 * Executes the system.
	 * @param eventName Provides the event name value used by this operation.
	 */
	private async executeSystem(eventName: string) {
		// Stores the cloud function value used in the current execution flow.
		let cloudFunction = this.cloudScriptFunctionDict.get("system");
		if (cloudFunction == null) {
			Debug.logError("[GearN] [SystemEventCallback] system not found");
			return;
		}
		// Stores the cloud script worker value used in the current execution flow.
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return;
		}

		Debug.log("[GearN] [SystemEventCallback] auto call " + eventName);

		// Stores the request ID value used in the current execution flow.
		let requestId = StringUtility.generateRandomString(10, 0);

		// Stores the cloud script request value used in the current execution flow.
		let cloudScriptRequest: CloudScriptRequest = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.System,
		};

		cloudScriptWorker.send(cloudScriptRequest);

		// Stores the thiz value used in the current execution flow.
		let thiz = this;

		// Tracks whether resolved.
		let isResolved = false;
		// Stores the cloud script response value used in the current execution flow.
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			// Stores the timeout value used in the current execution flow.
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

	/**
	 * Executes the request server detail system.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param matchmakingTicketCanMatch Provides the matchmaking ticket can match value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async executeRequestServerDetailSystem(gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch): Promise<{ success: boolean }> {
		// Stores the cloud function value used in the current execution flow.
		let cloudFunction = this.cloudScriptFunctionDict.get("systemMatchmaking");
		if (cloudFunction == null) {
			return { success: false };
		}
		// Stores the event name value used in the current execution flow.
		let eventName = "systemMatchmaking_RequestServerDetail";
		// Stores the cloud script worker value used in the current execution flow.
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return { success: false };
		}

		// Stores the request ID value used in the current execution flow.
		let requestId = StringUtility.generateRandomString(10, 0);

		// Stores the cloud script request value used in the current execution flow.
		let cloudScriptRequest: CloudScriptRequest = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.SystemMatchmaking,
			request: {
				gameId: gameId,
				matchmakingTicketCanMatch: matchmakingTicketCanMatch,
			},
		};

		cloudScriptWorker.send(cloudScriptRequest);

		// Stores the thiz value used in the current execution flow.
		let thiz = this;

		// Tracks whether resolved.
		let isResolved = false;
		// Stores the cloud script response value used in the current execution flow.
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			// Stores the timeout value used in the current execution flow.
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

	/**
	 * Executes the event.
	 * @param eventName Provides the event name value used by this operation.
	 * @param request Provides the request value used by this operation.
	 * @param operationEvent Provides the operation event value used by this operation.
	 */
	public async executeEvent(eventName: string, request: { [k: string]: any }, operationEvent: OperationEvent) {
		// Stores the cloud function value used in the current execution flow.
		let cloudFunction = this.cloudScriptFunctionDict.get("event");
		if (cloudFunction == null) {
			return;
		}
		// Stores the cloud script worker value used in the current execution flow.
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return;
		}

		// Stores the request ID value used in the current execution flow.
		let requestId = StringUtility.generateRandomString(10, 0);

		// Stores the cloud script request value used in the current execution flow.
		let cloudScriptRequest: CloudScriptRequest = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.Event,
			operationEvent: {
				eventCode: operationEvent.getEventCode(),
				parameters: operationEvent.getParameters(),
			},
			request: request,
		};

		cloudScriptWorker.send(cloudScriptRequest);

		// Stores the thiz value used in the current execution flow.
		let thiz = this;

		// Tracks whether resolved.
		let isResolved = false;
		// Stores the cloud script response value used in the current execution flow.
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			// Stores the timeout value used in the current execution flow.
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
			operationEvent.setParameters(cloudScriptResponse.response.result.parameters ? GNHashtable.builder().addAll(cloudScriptResponse.response.result.parameters).build() : null);
			(operationEvent as any).eventCode = (cloudScriptResponse.response.result as {
				// Stores the event code value used by this contract.
				eventCode: string;
				// Stores the parameters value used by this contract.
				parameters?: {};
			}).eventCode;

			if (cloudScriptResponse.response.request.userId) request.userId = cloudScriptResponse.response.request.userId;
			if (cloudScriptResponse.response.request.userIds) request.userIds = cloudScriptResponse.response.request.userIds;
			if (cloudScriptResponse.response.request.roomId) request.roomId = cloudScriptResponse.response.request.roomId;
		}
	}

	/**
	 * Executes the pre.
	 * @param eventName Provides the event name value used by this operation.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async executePre(
		eventName: string,
		request: { [k: string]: any },
		secretInfo: SecretInfo,
		operationRequest: OperationRequest
	): Promise<OperationResponse> {
		// Stores the cloud script worker value used in the current execution flow.
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(eventName.split("_")[0], eventName);

		if (cloudScriptWorker == null) {
			return null;
		}

		// Stores the request ID value used in the current execution flow.
		let requestId = StringUtility.generateRandomString(10, 0);

		// Stores the final secret info value used in the current execution flow.
		let finalSecretInfo: {
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

		// Stores the cloud script request value used in the current execution flow.
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

		// Stores the thiz value used in the current execution flow.
		let thiz = this;

		// Tracks whether resolved.
		let isResolved = false;
		// Stores the cloud script response value used in the current execution flow.
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			// Stores the timeout value used in the current execution flow.
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
				// Stores the response request value used in the current execution flow.
				let responseRequest = cloudScriptResponse.response.request;
				// Stores the keys value used in the current execution flow.
				let keys = Object.keys(responseRequest);

				for (let i = 0; i < keys.length; i++) {
					// Stores the key value used in the current execution flow.
					let key = keys[i];

					request[key] = responseRequest[key];
				}
			}

			if (cloudScriptResponse.response.result) {
				// Stores the response operation response value used in the current execution flow.
				let responseOperationResponse = cloudScriptResponse.response.result as {
					// Stores the return code value used by this contract.
					returnCode: number;
					// Stores the debug message value used by this contract.
					debugMessage: string;
					// Stores the parameters value used by this contract.
					parameters?: {};
				};

				// Stores the operation response value used in the current execution flow.
				let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());

				operationResponse.setReturnCode(responseOperationResponse.returnCode);
				operationResponse.setDebugMessage(responseOperationResponse.debugMessage);

				if (responseOperationResponse.parameters) operationResponse.setParameters(GNHashtable.builder().addAll(responseOperationResponse.parameters).build());

				return operationResponse;
			}
		}

		return null;
	}

	/**
	 * Executes the verify generic service.
	 * @param serviceName Provides the service name value used by this operation.
	 * @param serviceData Provides the service data value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async executeVerifyGenericService(serviceName: string, serviceData: { [k: string]: any; }): Promise<{ success: boolean, serviceId: string, someDatas?: any, errorMessage?: string }> {
		// Stores the cloud function value used in the current execution flow.
		let cloudFunction = this.cloudScriptFunctionDict.get("systemAuthenticate");
		if (cloudFunction == null) {
			return { success: false, serviceId: null, errorMessage: "systemAuthenticate does not implement" };
		}
		// Stores the event name value used in the current execution flow.
		let eventName = "systemAuthenticate_VerifyGenericService";
		// Stores the cloud script worker value used in the current execution flow.
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return { success: false, serviceId: null, };
		}

		// Stores the request ID value used in the current execution flow.
		let requestId = StringUtility.generateRandomString(10, 0);

		// Stores the cloud script request value used in the current execution flow.
		let cloudScriptRequest: CloudScriptRequest = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.SystemAuthenticate,
			request: {
				serviceName: serviceName,
				serviceData: serviceData,
			},
		};

		cloudScriptWorker.send(cloudScriptRequest);

		// Stores the thiz value used in the current execution flow.
		let thiz = this;

		// Tracks whether resolved.
		let isResolved = false;
		// Stores the cloud script response value used in the current execution flow.
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			// Stores the timeout value used in the current execution flow.
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

	/**
	 * Executes the authenticate.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @param operationResponse Provides the operation response value used by this operation.
	 */
	public async executeAuthenticate(
		request: { userId: string, ipAddress: string, isNewUser: boolean, authenticationType: string, subData: { [k: string]: any } },
		secretInfo: SecretInfo,
		operationRequest: OperationRequest,
		operationResponse: OperationResponse
	): Promise<void> {
		// Stores the cloud function value used in the current execution flow.
		let cloudFunction = this.cloudScriptFunctionDict.get("systemAuthenticate");
		if (cloudFunction == null) {
			return;
		}

		// Stores the event name value used in the current execution flow.
		let eventName = "systemAuthenticate_OnAuthenticateSuccess";
		// Stores the cloud script worker value used in the current execution flow.
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return;
		}

		// Stores the request ID value used in the current execution flow.
		let requestId = StringUtility.generateRandomString(10, 0);

		// Stores the final secret info value used in the current execution flow.
		let finalSecretInfo: {
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

		// Stores the cloud script request value used in the current execution flow.
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

		// Stores the thiz value used in the current execution flow.
		let thiz = this;

		// Tracks whether resolved.
		let isResolved = false;
		// Stores the cloud script response value used in the current execution flow.
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			// Stores the timeout value used in the current execution flow.
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
				// Stores the response operation response value used in the current execution flow.
				let responseOperationResponse = cloudScriptResponse.response.result as {
					// Stores the return code value used by this contract.
					returnCode: number;
					// Stores the debug message value used by this contract.
					debugMessage: string;
					// Stores the parameters value used by this contract.
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

	/**
	 * Executes the post.
	 * @param eventName Provides the event name value used by this operation.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @param operationResponse Provides the operation response value used by this operation.
	 */
	public async executePost(
		eventName: string,
		request: { [k: string]: any },
		secretInfo: SecretInfo,
		operationRequest: OperationRequest,
		operationResponse: OperationResponse
	): Promise<void> {
		// Stores the cloud script worker value used in the current execution flow.
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(eventName.split("_")[0], eventName);

		if (cloudScriptWorker == null) {
			return;
		}

		// Stores the request ID value used in the current execution flow.
		let requestId = StringUtility.generateRandomString(10, 0);

		// Stores the final secret info value used in the current execution flow.
		let finalSecretInfo: {
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

		// Stores the cloud script request value used in the current execution flow.
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

		// Stores the thiz value used in the current execution flow.
		let thiz = this;

		// Tracks whether resolved.
		let isResolved = false;
		// Stores the cloud script response value used in the current execution flow.
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			// Stores the timeout value used in the current execution flow.
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
				// Stores the response operation response value used in the current execution flow.
				let responseOperationResponse = cloudScriptResponse.response.result as {
					// Stores the return code value used by this contract.
					returnCode: number;
					// Stores the debug message value used by this contract.
					debugMessage: string;
					// Stores the parameters value used by this contract.
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

	/**
	 * Executes the socket.
	 * @param eventName Provides the event name value used by this operation.
	 * @param request Provides the request value used by this operation.
	 */
	public async executeSocket(eventName: string, request: { [k: string]: any }): Promise<void> {
		// Stores the cloud function value used in the current execution flow.
		let cloudFunction = this.cloudScriptFunctionDict.get("socket");
		if (cloudFunction == null) {
			return;
		}
		// Stores the cloud script worker value used in the current execution flow.
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return;
		}

		// Stores the request ID value used in the current execution flow.
		let requestId = StringUtility.generateRandomString(10, 0);

		// Stores the cloud script request value used in the current execution flow.
		let cloudScriptRequest: CloudScriptRequest = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.Socket,
			request: request,
		};

		cloudScriptWorker.send(cloudScriptRequest);

		// Stores the thiz value used in the current execution flow.
		let thiz = this;

		// Tracks whether resolved.
		let isResolved = false;
		// Stores the cloud script response value used in the current execution flow.
		let cloudScriptResponse: CloudScriptResponse = await new Promise((resolve) => {
			// Stores the timeout value used in the current execution flow.
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
	}

	/**
	 * Loads the cloud script function worker from cache.
	 * @param type Provides the type value used by this operation.
	 * @param eventName Provides the event name value used by this operation.
	 * @returns Returns the operation result.
	 */
	private loadCloudScriptFunctionWorkerFromCache(type: string, eventName: string): ChildProcess {
		// Stores the cloud function value used in the current execution flow.
		let cloudFunction = this.cloudScriptFunctionDict.get(type);
		if (cloudFunction == null) return null;

		// Stores the child script value used in the current execution flow.
		let childScript = cloudFunction.childScripts.find((x) => x.eventName == eventName);
		if (childScript == null || !childScript.hasEdit) return null;

		// Stores the final version value used in the current execution flow.
		let finalVersion = cloudFunction.type + "_" + cloudFunction.version;

		// Stores the cloud script worker value used in the current execution flow.
		let cloudScriptWorker = this.cloudScriptWorkerDict.get(finalVersion);
		if (cloudScriptWorker == null) {
			return this.loadCloudScriptFunctionWorker(cloudFunction.type, cloudFunction.version, cloudFunction.fullScript);
		}

		return cloudScriptWorker;
	}

	/**
	 * Adds the cloud script function.
	 * @param eventName Provides the event name value used by this operation.
	 * @param script Provides the script value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async addCloudScriptFunction(eventName: string, script: string): Promise<{ success: boolean; errorMessage?: string; version?: string }> {
		// Stores the type value used in the current execution flow.
		let type = eventName.split("_")[0];
		// Stores the version value used in the current execution flow.
		let version = StringUtility.generateRandomString(7, 0);

		// Stores the file path temp timestamp value used in the current execution flow.
		let filePathTempTs = __dirname + "/./GN-startup/cloudScript/temp2.ts";

		// Stores the cloud function value used in the current execution flow.
		let cloudFunction = this.cloudScriptFunctionDict.get(type);
		if (cloudFunction == null)
			return {
				success: false,
				errorMessage: "eventName invalid",
			};

		// Stores the child script value used in the current execution flow.
		let childScript = cloudFunction.childScripts.find((x) => x.eventName == eventName);
		if (childScript == null) {
			return {
				success: false,
				errorMessage: "eventName invalid",
			};
		}

		// Stores the final script value used in the current execution flow.
		let finalScript: string = "";

		for (let i = 0; i < cloudFunction.childScripts.length; i++) {
			// Stores the this child script value used in the current execution flow.
			let thisChildScript = cloudFunction.childScripts[i];

			if (thisChildScript.eventName == eventName) {
				finalScript += script;
				finalScript += "\n";
			} else if (thisChildScript.hasEdit) {
				finalScript += thisChildScript.script;
				finalScript += "\n";
			}
		}

		// Stores the full script js value used in the current execution flow.
		let fullScriptJs: string;

		try {
			// Stores the template full script path timestamp value used in the current execution flow.
			let templateFullScriptPathTs = __dirname + "/./GN-startup/cloudScript/templateEventCallback.ts";
			// Stores the full script timestamp value used in the current execution flow.
			let fullScriptTs = fs.readFileSync(templateFullScriptPathTs).toString().replace("//$replaceScript", finalScript);

			fs.writeFileSync(filePathTempTs, fullScriptTs);

			// Stores the file path temp value used in the current execution flow.
			let filePathTemp = __dirname + "/./GN-startup/cloudScript";

			await execSync("npx tsc " + filePathTempTs + " --allowJs --skipLibCheck --esModuleInterop --outDir " + filePathTemp);

			// Stores the file path temp js value used in the current execution flow.
			let filePathTempJs = __dirname + "/./GN-startup/cloudScript/temp2.js";
			fullScriptJs = fs.readFileSync(filePathTempJs).toString();

		} catch (err) {
			if (fs.existsSync(filePathTempTs)) fs.rmSync(filePathTempTs);

			// Stores the error message value used in the current execution flow.
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

		// Stores the final version value used in the current execution flow.
		let finalVersion = cloudFunction.type + "_" + cloudFunction.version;
		setTimeout(() => {
			// Stores the cloud script worker value used in the current execution flow.
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

	/**
	 * Executes the remote add cloud script function workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 */
	private async remoteAddCloudScriptFunction(request: { type: string, eventName: string, version: string, fullScriptJs: string, script: string, }) {
		// Stores the type value used in the current execution flow.
		let type = request.type;
		// Stores the event name value used in the current execution flow.
		let eventName = request.eventName;
		// Stores the version value used in the current execution flow.
		let version = request.version;
		// Stores the full script js value used in the current execution flow.
		let fullScriptJs = request.fullScriptJs;
		// Stores the script value used in the current execution flow.
		let script = request.script;

		// Stores the cloud function value used in the current execution flow.
		let cloudFunction = this.cloudScriptFunctionDict.get(type);
		if (cloudFunction == null)
			return;

		// Stores the child script value used in the current execution flow.
		let childScript = cloudFunction.childScripts.find((x) => x.eventName == eventName);
		if (childScript == null) {
			return;
		}

		// Stores the final version value used in the current execution flow.
		let finalVersion = cloudFunction.type + "_" + cloudFunction.version;
		setTimeout(() => {
			// Stores the cloud script worker value used in the current execution flow.
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

	/**
	 * Loads the cloud script function worker.
	 * @param type Provides the type value used by this operation.
	 * @param version Provides the version value used by this operation.
	 * @param fullScript Provides the full script value used by this operation.
	 * @returns Returns the operation result.
	 */
	private loadCloudScriptFunctionWorker(type: string, version: string, fullScript: string): ChildProcess {
		// Stores the final version value used in the current execution flow.
		let finalVersion = type + "_" + version;

		// Stores the file path value used in the current execution flow.
		let filePath = __dirname + "/./GN-startup/cloudScript/" + finalVersion + ".js";
		fs.writeFileSync(filePath, fullScript);

		return this.loadCloudScriptWorker(type, version);
	}

	/**
	 * Loads the cloud script worker.
	 * @param type Provides the type value used by this operation.
	 * @param version Provides the version value used by this operation.
	 * @returns Returns the operation result.
	 */
	private loadCloudScriptWorker(type: string, version: string): ChildProcess {
		// Stores the final version value used in the current execution flow.
		let finalVersion = type + "_" + version;
		// Stores the file path value used in the current execution flow.
		let filePath = __dirname + "/./GN-startup/cloudScript/" + finalVersion + ".js";

		Debug.log("[GearN] [EventCallback] run cloudScript " + finalVersion);

		// Stores the cloud script worker value used in the current execution flow.
		let cloudScriptWorker = fork(filePath, {
			env: {
				gnServerSettingsOptions: JSON.stringify(this.gnServerSettingsOptions),
				dbConnection: JSON.stringify(this.dbConnection),
			},
		});

		// Stores the thiz value used in the current execution flow.
		let thiz = this;
		cloudScriptWorker.on("message", (cloudScriptResponse: CloudScriptResponse) => {
			if (cloudScriptResponse.responseId) {
				// Stores the callback value used in the current execution flow.
				let callback = thiz.cloudScriptWaitingResponseCallbackDict.get(cloudScriptResponse.responseId);
				if (callback != null) {
					callback(cloudScriptResponse);
				}
			} else {
				// Stores the cloud script event value used in the current execution flow.
				let cloudScriptEvent: CloudScriptEvent = cloudScriptResponse as any;
				thiz.gnServer.getCloudScriptEventService().handleEvent(cloudScriptEvent);
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
	// Stores the event lst dict collection used by this instance.
	private eventLstDict: Map<string, Array<OnPostCallbackFunction>>;

	/**
	 * Initializes a new post event callback service instance.
	 */
	constructor() {
		this.eventLstDict = new Map();
	}

	// Stores the event callback log collection value used by this instance.
	private eventCallbackLogCollection: mongoDB.Collection<mongoDB.Document>;
	// Stores the cloud script service value used by this instance.
	private cloudScriptService: IEventCallbackCloudScriptService;

	/**
	 * Executes the subscriber event workflow.
	 * @param eventName Provides the event name value used by this operation.
	 * @param callbackFunction Provides the callback function value used by this operation.
	 */
	public subscriberEvent(eventName: string, callbackFunction: OnPostCallbackFunction) {
		if (!this.eventLstDict.has(eventName)) {
			this.eventLstDict.set(eventName, []);
		}

		// Stores the event lst value used in the current execution flow.
		let eventLst = this.eventLstDict.get(eventName);
		eventLst.push(callbackFunction);
	}

	/**
	 * Executes the un subscriber event workflow.
	 * @param eventName Provides the event name value used by this operation.
	 * @param callbackFunction Provides the callback function value used by this operation.
	 */
	public unSubscriberEvent(eventName: string, callbackFunction: OnPostCallbackFunction) {
		if (!this.eventLstDict.has(eventName)) {
			this.eventLstDict.set(eventName, []);
		}

		// Stores the event lst value used in the current execution flow.
		let eventLst = this.eventLstDict.get(eventName);

		// Stores the index of value used in the current execution flow.
		let indexOf = eventLst.indexOf(callbackFunction);

		if (indexOf != -1) {
			eventLst.splice(indexOf, 1);
		}
	}

	/**
	 * Sets the event callback log collection.
	 * @param eventCallbackLogCollection Provides the event callback log collection used by this operation.
	 */
	public setEventCallbackLogCollection(eventCallbackLogCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.eventCallbackLogCollection = eventCallbackLogCollection;
	}

	/**
	 * Sets the cloud script service.
	 * @param cloudScriptService Provides the cloud script service used by this operation.
	 */
	public setCloudScriptService(cloudScriptService: IEventCallbackCloudScriptService): void {
		this.cloudScriptService = cloudScriptService;
	}

	/**
	 * Executes the on event workflow asynchronously.
	 * @param eventName Provides the event name value used by this operation.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @param operationResponse Provides the operation response value used by this operation.
	 */
	public async onEvent(
		eventName: string,
		request: {},
		secretInfo: SecretInfo,
		operationRequest: OperationRequest,
		operationResponse: OperationResponse
	): Promise<void> {
		// Stores the operation response to data value used in the current execution flow.
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

		// Stores the event lst value used in the current execution flow.
		let eventLst = this.eventLstDict.get(eventName);

		for (let i = 0; i < eventLst.length; i++) {
			try {
				await eventLst[i](request, secretInfo, operationRequest, operationResponse);
			} catch (err) {
				Debug.logException(err);
			}
		}
	}

}

export class PreEventCallbackService implements IPreEventCallbackService {
	// Stores the event dict collection used by this instance.
	private eventDict: Map<string, OnPreCallbackFunction>;
	// Stores the cloud script service value used by this instance.
	private cloudScriptService: IEventCallbackCloudScriptService;

	/**
	 * Initializes a new pre event callback service instance.
	 */
	constructor() {
		this.eventDict = new Map();
	}

	/**
	 * Executes the subscriber event workflow.
	 * @param eventName Provides the event name value used by this operation.
	 * @param callbackFunction Provides the callback function value used by this operation.
	 */
	public subscriberEvent(eventName: string, callbackFunction: OnPreCallbackFunction) {
		this.eventDict.set(eventName, callbackFunction);
	}

	/**
	 * Executes the un subscriber event workflow.
	 * @param eventName Provides the event name value used by this operation.
	 */
	public unSubscriberEvent(eventName: string) {
		this.eventDict.delete(eventName);
	}

	/**
	 * Sets the cloud script service.
	 * @param cloudScriptService Provides the cloud script service used by this operation.
	 */
	public setCloudScriptService(cloudScriptService: IEventCallbackCloudScriptService): void {
		this.cloudScriptService = cloudScriptService;
	}

	/**
	 * Executes the on event workflow asynchronously.
	 * @param eventName Provides the event name value used by this operation.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async onEvent(eventName: string, request: {}, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		if (this.cloudScriptService) {
			// Stores the operation response value used in the current execution flow.
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
