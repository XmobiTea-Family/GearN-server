import { OperationHelper } from "./../../GN-common/entity/operationHelper/OperationHelper";
import { SecretInfo, SecretPermissionItem, SecretRole } from "./../../GN-common/entity/SecretInfo";
import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../GN-common/entity/operationResponse/OperationResponse";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { IPostEventCallbackService, IPreEventCallbackService, OnPostCallbackFunction, OnPreCallbackFunction } from "./IEventCallbackService";
import * as mongoDB from "mongodb";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { ExecuteResponseStatus } from "./ICloudScriptService";
import { ChildProcess, execFile, fork } from "child_process";
import { GNServer } from "./../../GNServer";
import { GNServerSettingsOptions } from "@xmobitea/gn-typescript-client";
import { StringUtility } from "./../../GN-common/helper/StringUtility";
import { OperationEvent } from "./../../GN-common/entity/operationEvent/OperationEvent";
import { ParameterCode } from "./../../GN-common/constant/parameterCode/ParameterCode";
import { GNHashtable } from "./../../GN-common/common/GNData";
import { MatchmakingTicketCanMatch } from "./../service/IMatchmakingService";
import { CloudScriptEvent } from "./CloudScriptEventService";
import { CloudScriptSecurityValidator } from "./CloudScriptSecurityValidator";

const execFileAsync = promisify(execFile);

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
	role: number;
	// Stores the secret info value used by this contract.
	secretInfo: {
		// Stores the secret key value used by this contract.
		secretKey: string;
		// Stores the description value used by this contract.
		description: string;
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
	role: number;
	// Stores the secret info value used by this contract.
	secretInfo: {
		// Stores the secret key value used by this contract.
		secretKey: string;
		// Stores the description value used by this contract.
		description: string;
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
	 * @param role Provides the role value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @param operationResponse Provides the operation response value used by this operation.
	 */
	executePost(eventName: string, request: { [k: string]: any }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest, operationResponse: OperationResponse): Promise<void>;
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
	 * @param role Provides the role value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	executePre(eventName: string, request: { [k: string]: any }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse>;
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

/**
 * Loads cloud-script bundles, keeps worker processes warm, and bridges GearN events to those workers.
 */
export class EventCallbackCloudScriptService implements IEventCallbackCloudScriptService {

	// Fixed timeout for built-in system jobs that should never hang forever.
	private static readonly SystemExecuteTimeoutInMs = 12000000;
	// Reserved system event names triggered by the timer service.
	private static readonly OnEveryMinute = "system_OnEveryMinute";
	private static readonly OnEveryHour = "system_OnEveryHour";
	private static readonly OnEveryDay = "system_OnEveryDay";

	// Warm workers and pending response resolvers keyed by script identity or request id.
	private cloudScriptWorkerDict: Map<string, ChildProcess>;
	private cloudScriptWaitingResponseCallbackDict: Map<string, (cloudScriptResponse: CloudScriptResponse) => void>;

	// Primary and backup collections that persist cloud-script source and versions.
	private cloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>;
	private backupCloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>;

	// Runtime dependencies required to spawn workers and execute cloud scripts.
	private gnServer: GNServer;
	private gnServerSettingsOptions: GNServerSettingsOptions;
	private dbConnection: DbConnection;
	private executeTimeoutInMs: number;

	// In-memory function registry keyed by script type such as `pre`, `post`, or `system`.
	private cloudScriptFunctionDict = new Map<string, EventCallbackCloudScriptFunction>();

	/**
	 * Initializes the in-memory registries used by the cloud-script runtime.
	 */
	constructor() {
		this.cloudScriptFunctionDict = new Map();

		this.cloudScriptWorkerDict = new Map();
		this.cloudScriptWaitingResponseCallbackDict = new Map();
	}

	/**
	 * Returns the cloud-script bundles currently loaded in memory.
	 * @returns Loaded cloud-script definitions, including child overrides per event.
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

		let values = Array.from(this.cloudScriptFunctionDict.values());

		for (let i = 0; i < values.length; i++) {
			let cloudFunction = values[i];

			answer.push(cloudFunction);
		}

		return answer;
	}

	/**
	 * Injects runtime dependencies and subscribes the built-in system callbacks to the timer service.
	 * Only the primary node executes timed system cloud scripts.
	 * @param gnServerSettingsOptions Server settings passed down to spawned workers.
	 * @param dbConnection Database connection info mirrored into worker processes.
	 * @param gnServer Runtime server instance.
	 * @param executeTimeoutInMs Default timeout for non-system script execution.
	 */
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

	/**
	 * Registers the primary collection that stores cloud-script versions and source code.
	 * @param cloudScriptFunctionCollection Mongo collection for active cloud-script bundles.
	 */
	public setCloudScriptFunctionCollection(cloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.cloudScriptFunctionCollection = cloudScriptFunctionCollection;
	}

	/**
	 * Registers the backup collection used when rotating or restoring cloud-script bundles.
	 * @param cloudScriptFunctionCollection Mongo collection for backup cloud-script bundles.
	 */
	public setBackupCloudScriptFunctionCollection(cloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.backupCloudScriptFunctionCollection = cloudScriptFunctionCollection;
	}

	/**
	 * Loads persisted cloud-script versions and listens for cluster-wide reload events.
	 */
	public run(): void {
		this.loadVersion();

		let thiz = this;

		// Cloud-script updates are propagated from the primary node through the cluster handler.
		this.gnServer.getHttpApp().getClusterHandler().onEvent("addEventCloudScriptFunction", data => {
			thiz.remoteAddCloudScriptFunction(data);
		});
	}

	/**
	 * Restores every persisted cloud-script bundle into memory and spawns a worker for each script type.
	 */
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

	/**
	 * Executes a reserved system event inside the `system` cloud-script worker.
	 * @param eventName Reserved system event name triggered by the timer service.
	 */
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

		let cloudScriptRequest: CloudScriptRequestSystem = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.System,
		};

		cloudScriptWorker.send(cloudScriptRequest);

		let thiz = this;
		let isResolved = false;

		// Resolve exactly one response per worker request, or synthesize a timeout payload.
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

	/**
	 * Executes the matchmaking system script that asks game code to allocate server details for a match.
	 * @param gameId Game identifier associated with the match request.
	 * @param matchmakingTicketCanMatch Match candidate produced by the matchmaking service.
	 * @returns Resolves with the operation result.
	 */
	public async executeRequestServerDetailSystem(gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch): Promise<{ success: boolean }> {
		let cloudFunction = this.cloudScriptFunctionDict.get("systemMatchmaking");
		if (cloudFunction == null) {
			return { success: false };
		}
		let eventName = "systemMatchmaking_RequestServerDetail";
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return { success: false };
		}

		let requestId = StringUtility.generateRandomString(10, 0);

		let cloudScriptRequest: CloudScriptRequestSystemMatchmaking = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.SystemMatchmaking,
			request: {
				gameId: gameId,
				matchmakingTicketCanMatch: matchmakingTicketCanMatch,
			},
		};

		cloudScriptWorker.send(cloudScriptRequest);

		let thiz = this;
		let isResolved = false;

		// Matchmaking waits for the cloud script to either enrich the match or fail fast on timeout.
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

	/**
	 * Executes an event callback script and lets the script mutate the outgoing event payload.
	 * @param eventName Event callback name resolved from the emitted event.
	 * @param request Mutable event context shared with the script.
	 * @param operationEvent Event payload that can be rewritten by the script.
	 */
	public async executeEvent(eventName: string, request: { [k: string]: any }, operationEvent: OperationEvent) {
		let cloudFunction = this.cloudScriptFunctionDict.get("event");
		if (cloudFunction == null) {
			return;
		}
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return;
		}

		let requestId = StringUtility.generateRandomString(10, 0);

		let cloudScriptRequest: CloudScriptRequestEvent = {
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
			operationEvent.setParameters(cloudScriptResponse.response.result.parameters ? GNHashtable.builder().addAll(cloudScriptResponse.response.result.parameters).build() : null);
			// The worker can also replace the emitted event code, not only its parameters.
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
	 * Executes the pre-handler cloud script before the normal handler runs.
	 * The script can mutate the request context or short-circuit execution by returning an `OperationResponse`.
	 * @param eventName Request event name.
	 * @param request Mutable request context.
	 * @param secretInfo Authenticated secret context forwarded to the script.
	 * @param operationRequest Typed operation request sent to the handler pipeline.
	 * @returns Resolves with the operation result.
	 */
	public async executePre(
		eventName: string,
		request: { [k: string]: any },
		role: SecretRole,
		secretInfo: SecretInfo,
		operationRequest: OperationRequest
	): Promise<OperationResponse> {
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(eventName.split("_")[0], eventName);

		if (cloudScriptWorker == null) {
			return null;
		}

		let requestId = StringUtility.generateRandomString(10, 0);

		// Serialize `SecretInfo` into a plain object because it will cross a worker-process boundary.
		let finalSecretInfo: {
			// Stores the secret key value used by this contract.
			secretKey: string;
			// Stores the description value used by this contract.
			description: string;
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
				secretKey: secretInfo.getSecretKey(),
				tsExpire: secretInfo.getTsExpire(),
			};
		}

		let cloudScriptRequest: CloudScriptRequestPre = {
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
			role: role,
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
					// Stores the return code value used by this contract.
					returnCode: number;
					// Stores the debug message value used by this contract.
					debugMessage: string;
					// Stores the parameters value used by this contract.
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

	/**
	 * Executes the system-authenticate script used to verify third-party services generically.
	 * @param serviceName External service identifier.
	 * @param serviceData Service-specific payload forwarded to the worker.
	 * @returns Resolves with the operation result.
	 */
	public async executeVerifyGenericService(serviceName: string, serviceData: { [k: string]: any; }): Promise<{ success: boolean, serviceId: string, someDatas?: any, errorMessage?: string }> {
		let cloudFunction = this.cloudScriptFunctionDict.get("systemAuthenticate");
		if (cloudFunction == null) {
			return { success: false, serviceId: null, errorMessage: "systemAuthenticate does not implement" };
		}
		let eventName = "systemAuthenticate_VerifyGenericService";
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return { success: false, serviceId: null, };
		}

		let requestId = StringUtility.generateRandomString(10, 0);

		let cloudScriptRequest: CloudScriptRequestVerifyGenericService = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.SystemAuthenticate,
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

	/**
	 * Executes the post-authentication system script after a player login succeeds.
	 * @param request Authentication context built by the middleware.
	 * @param secretInfo Secret used for the authentication flow.
	 * @param operationRequest Request that triggered authentication.
	 * @param operationResponse Mutable response that the script can enrich.
	 */
	public async executeAuthenticate(
		request: { userId: string, ipAddress: string, isNewUser: boolean, authenticationType: string, subData: { [k: string]: any } },
		secretInfo: SecretInfo,
		operationRequest: OperationRequest,
		operationResponse: OperationResponse
	): Promise<void> {
		let cloudFunction = this.cloudScriptFunctionDict.get("systemAuthenticate");
		if (cloudFunction == null) {
			return;
		}

		let eventName = "systemAuthenticate_OnAuthenticateSuccess";
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return;
		}

		let requestId = StringUtility.generateRandomString(10, 0);

		// Serialize `SecretInfo` into a plain object because workers cannot receive class instances directly.
		let finalSecretInfo: {
			// Stores the secret key value used by this contract.
			secretKey: string;
			// Stores the description value used by this contract.
			description: string;
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
				secretKey: secretInfo.getSecretKey(),
				tsExpire: secretInfo.getTsExpire(),
			};
		}

		let cloudScriptRequest: CloudScriptRequestSystemAuthenticate = {
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
	 * Executes the post-handler cloud script after the normal handler produced a response.
	 * @param eventName Request event name.
	 * @param request Mutable request context.
	 * @param secretInfo Authenticated secret context forwarded to the script.
	 * @param operationRequest Typed operation request sent to the handler pipeline.
	 * @param operationResponse Mutable response that the script can rewrite.
	 */
	public async executePost(
		eventName: string,
		request: { [k: string]: any },
		role: SecretRole,
		secretInfo: SecretInfo,
		operationRequest: OperationRequest,
		operationResponse: OperationResponse
	): Promise<void> {
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(eventName.split("_")[0], eventName);

		if (cloudScriptWorker == null) {
			return;
		}

		let requestId = StringUtility.generateRandomString(10, 0);

		// Serialize `SecretInfo` into a plain object because workers cannot receive class instances directly.
		let finalSecretInfo: {
			// Stores the secret key value used by this contract.
			secretKey: string;
			// Stores the description value used by this contract.
			description: string;
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
		} = null;
		if (secretInfo) {
			finalSecretInfo = {
				gameId: secretInfo.getGameId(),
				description: secretInfo.getDescription(),
				isDefault: secretInfo.getIsDefault(),
				onlyMasterAdmin: secretInfo.getIsOnlyMasterAdmin(),
				permission: secretInfo.getPermission(),
				remove: secretInfo.isRemove(),
				secretKey: secretInfo.getSecretKey(),
				tsExpire: secretInfo.getTsExpire(),
			};
		}

		let cloudScriptRequest: CloudScriptRequestPost = {
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
			role: role,
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
	 * Executes socket-specific cloud script hooks for non-request socket events.
	 * @param eventName Socket event name.
	 * @param request Mutable socket event context.
	 */
	public async executeSocket(eventName: string, request: { [k: string]: any }): Promise<void> {
		let cloudFunction = this.cloudScriptFunctionDict.get("socket");
		if (cloudFunction == null) {
			return;
		}
		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(cloudFunction.type, eventName);

		if (cloudScriptWorker == null) {
			Debug.logError("[GearN] [SystemEventCallback] worker not found at " + cloudFunction.type);
			return;
		}

		let requestId = StringUtility.generateRandomString(10, 0);

		let cloudScriptRequest: CloudScriptRequestSocket = {
			requestId: requestId,
			eventName: eventName,
			eventType: EventCallbackType.Socket,
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
	 * Returns the cached worker for an edited child script, or recreates it if the worker was evicted.
	 * Only child scripts marked with `hasEdit` get their own worker version.
	 * @param type Script family such as `pre`, `post`, or `system`.
	 * @param eventName Concrete event name inside that script family.
	 * @returns Child-process worker able to execute the requested event.
	 */
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

	/**
	 * Compiles and hot-swaps a child cloud script for a specific event, then broadcasts the update to the cluster.
	 * @param eventName Event whose child script is being edited.
	 * @param script Replacement source code for the child script.
	 * @returns Resolves with the operation result.
	 */
	public async addCloudScriptFunction(eventName: string, script: string): Promise<{ success: boolean; errorMessage?: string; version?: string }> {
		let childScriptValidationResult = CloudScriptSecurityValidator.validateEventCallbackScript(eventName, script);
		if (!childScriptValidationResult.success) {
			return {
				success: false,
				errorMessage: childScriptValidationResult.errorMessage,
			};
		}

		let normalizedScript = childScriptValidationResult.normalizedScript;
		let type = eventName.split("_")[0];
		let version = StringUtility.generateRandomString(7, 0);

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

		// Rebuild the template by stitching together the edited child script set for this script family.
		let finalScript: string = "";

		for (let i = 0; i < cloudFunction.childScripts.length; i++) {
			let thisChildScript = cloudFunction.childScripts[i];

			if (thisChildScript.eventName == eventName) {
				finalScript += normalizedScript;
				finalScript += "\n";
			} else if (thisChildScript.hasEdit) {
				finalScript += thisChildScript.script;
				finalScript += "\n";
			}
		}

		let finalScriptValidationResult = CloudScriptSecurityValidator.validateEventCallbackBundle(finalScript);
		if (!finalScriptValidationResult.success) {
			return {
				success: false,
				errorMessage: finalScriptValidationResult.errorMessage,
			};
		}

		let normalizedFinalScript = finalScriptValidationResult.normalizedScript;

		let fullScriptJs: string;

		try {
			fullScriptJs = await this.compileCloudScript(normalizedFinalScript, version);
		} catch (err) {
			return {
				success: false,
				errorMessage: this.getErrorMessage(err),
			}
		}

		if (!fullScriptJs) {
			return {
				success: false,
				errorMessage: "compile error",
			};
		}

		this.gnServer.getHttpApp().getClusterHandler().sendEvent("addEventCloudScriptFunction", { type: type, eventName: eventName, version: version, fullScriptJs: fullScriptJs, script: normalizedScript, }, false);

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

		childScript.script = normalizedScript;
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
	 * Compiles the submitted cloud script into executable JavaScript using isolated temp files.
	 * @param script Provides the script value used by this operation.
	 * @param version Provides the version value used by this operation.
	 * @returns Resolves with the compiled JavaScript output.
	 */
	private async compileCloudScript(script: string, version: string): Promise<string> {
		// Use a unique temp file per request to avoid concurrent add-function races.
		let cloudScriptDirectoryPath = path.join(__dirname, "./GN-startup/cloudScript");
		let templateCloudScriptPath = path.join(cloudScriptDirectoryPath, "templateEventCallback.ts");
		let compileId = version + "_" + StringUtility.generateRandomString(11, 0);
		let tempTsFilePath = path.join(cloudScriptDirectoryPath, compileId + ".ts");
		let tempJsFilePath = path.join(cloudScriptDirectoryPath, compileId + ".js");

		try {
			let templateCloudScript = await fs.promises.readFile(templateCloudScriptPath, "utf8");
			let fullScriptTs = templateCloudScript.replace("//$replaceScript", script);

			await fs.promises.writeFile(tempTsFilePath, fullScriptTs, "utf8");
			await execFileAsync("npx", ["tsc", tempTsFilePath, "--allowJs", "--skipLibCheck", "--outDir", cloudScriptDirectoryPath], { windowsHide: true, shell: process.platform === "win32" });

			// await execFileAsync("npx tsc " + tempTsFilePath + " --allowJs --skipLibCheck --outDir " + tempJsFilePath);
			return await fs.promises.readFile(tempJsFilePath, "utf8");
		}
		catch {
			return null;
		}
		finally {
			try {
				await fs.promises.rm(tempTsFilePath, { force: true });
			}
			catch {
			}
			try {
				await fs.promises.rm(tempJsFilePath, { force: true });
			}
			catch {
			}
		}
	}

	/**
	 * Normalizes unknown error values into a readable message.
	 * @param err Provides the error value used by this operation.
	 * @returns Returns the error message.
	 */
	private getErrorMessage(err: unknown): string {
		if (err instanceof Error) {
			let execError = err as Error & { stderr?: string | Buffer, stdout?: string | Buffer };

			let stderr = execError.stderr == null ? "" : execError.stderr.toString().trim();
			if (stderr.length > 0) {
				return stderr;
			}

			let stdout = execError.stdout == null ? "" : execError.stdout.toString().trim();
			if (stdout.length > 0) {
				return stdout;
			}

			return execError.message;
		}

		if (typeof err === "string") {
			return err;
		}

		if (typeof err === "object" && err !== null) {
			return JSON.stringify(err);
		}

		return "Unknown error occurred";
	}

	/**
	 * Applies a hot-reload broadcast received from another cluster node.
	 * @param request Cluster payload describing the new child-script version.
	 */
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

	/**
	 * Persists a compiled script version to disk and starts a worker for it.
	 * @param type Script family such as `pre`, `post`, or `system`.
	 * @param version Version identifier appended to the worker filename.
	 * @param fullScript Compiled JavaScript source that the worker executes.
	 * @returns Spawned worker process.
	 */
	private loadCloudScriptFunctionWorker(type: string, version: string, fullScript: string): ChildProcess {
		let finalVersion = type + "_" + version;

		let filePath = __dirname + "/./GN-startup/cloudScript/" + finalVersion + ".js";
		fs.writeFileSync(filePath, fullScript);

		return this.loadCloudScriptWorker(type, version);
	}

	/**
	 * Forks a cloud-script worker process and wires response/event messages back into the main runtime.
	 * @param type Script family such as `pre`, `post`, or `system`.
	 * @param version Version identifier appended to the worker filename.
	 * @returns Spawned worker process.
	 */
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
	// Post-handler subscribers grouped by event name.
	private eventLstDict: Map<string, Array<OnPostCallbackFunction>>;

	/**
	 * Initializes a new post event callback service instance.
	 */
	constructor() {
		this.eventLstDict = new Map();
	}

	// Runtime log collection and optional cloud-script bridge invoked after handlers finish.
	private eventCallbackLogCollection: mongoDB.Collection<mongoDB.Document>;
	private cloudScriptService: IEventCallbackCloudScriptService;

	/**
	 * Registers an in-process post callback for a specific event.
	 * @param eventName Request event name.
	 * @param callbackFunction Callback invoked after the handler and cloud script complete.
	 */
	public subscriberEvent(eventName: string, callbackFunction: OnPostCallbackFunction) {
		if (!this.eventLstDict.has(eventName)) {
			this.eventLstDict.set(eventName, []);
		}

		let eventLst = this.eventLstDict.get(eventName);
		eventLst.push(callbackFunction);
	}

	/**
	 * Removes a previously registered in-process post callback.
	 * @param eventName Request event name.
	 * @param callbackFunction Callback instance to remove.
	 */
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

	/**
	 * Injects the runtime collection used to persist post-event logs.
	 * @param eventCallbackLogCollection Mongo collection used for post-event log documents.
	 */
	public setEventCallbackLogCollection(eventCallbackLogCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.eventCallbackLogCollection = eventCallbackLogCollection;
	}

	/**
	 * Injects the cloud-script bridge used by post callbacks.
	 * @param cloudScriptService Cloud-script callback runtime.
	 */
	public setCloudScriptService(cloudScriptService: IEventCallbackCloudScriptService): void {
		this.cloudScriptService = cloudScriptService;
	}

	/**
	 * Persists the post-event log, runs the post cloud script, then executes local post subscribers.
	 * @param eventName Request event name.
	 * @param request Mutable request context.
	 * @param role Role context.
	 * @param secretInfo Authenticated secret context.
	 * @param operationRequest Request that produced the response.
	 * @param operationResponse Final response produced by the handler pipeline.
	 */
	public async onEvent(
		eventName: string,
		request: {},
		role: SecretRole,
		secretInfo: SecretInfo,
		operationRequest: OperationRequest,
		operationResponse: OperationResponse
	): Promise<void> {
		let operationResponseToData = OperationHelper.toDataOperationResponse(operationResponse)

		this.eventCallbackLogCollection.insertOne({
			eventName: eventName,
			tsCreate: xDatetime.getCurrentMilliseconds(),
			request: request,
			role: role,
			operationRequest: OperationHelper.toDataOperationRequest(operationRequest),
			originRequest: OperationHelper.toDataFromRequest((operationRequest as any).originRequest),
			operationResponse: operationResponseToData,
			customTags: operationRequest.getParameters().getGNHashtable("customTags"),
			responseSize: Buffer.byteLength(JSON.stringify(operationResponseToData), "utf-8"),
		});

		if (this.cloudScriptService) {
			await this.cloudScriptService.executePost(eventName, request, role, secretInfo, operationRequest, operationResponse);
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

}

export class PreEventCallbackService implements IPreEventCallbackService {
	// One pre-handler callback per event name.
	private eventDict: Map<string, OnPreCallbackFunction>;
	// Optional cloud-script bridge executed before in-process pre callbacks.
	private cloudScriptService: IEventCallbackCloudScriptService;

	/**
	 * Initializes the pre-callback registry.
	 */
	constructor() {
		this.eventDict = new Map();
	}

	/**
	 * Registers an in-process pre callback for a specific event.
	 * @param eventName Request event name.
	 * @param callbackFunction Callback invoked before the normal handler runs.
	 */
	public subscriberEvent(eventName: string, callbackFunction: OnPreCallbackFunction) {
		this.eventDict.set(eventName, callbackFunction);
	}

	/**
	 * Removes the in-process pre callback for a specific event.
	 * @param eventName Request event name.
	 */
	public unSubscriberEvent(eventName: string) {
		this.eventDict.delete(eventName);
	}

	/**
	 * Injects the cloud-script bridge used by pre callbacks.
	 * @param cloudScriptService Cloud-script callback runtime.
	 */
	public setCloudScriptService(cloudScriptService: IEventCallbackCloudScriptService): void {
		this.cloudScriptService = cloudScriptService;
	}

	/**
	 * Runs the cloud-script pre hook first, then falls back to the in-process pre callback if needed.
	 * Returning a non-null `OperationResponse` short-circuits the normal request handler.
	 * @param eventName Request event name.
	 * @param request Mutable request context.
	 * @param role Role context.
	 * @param secretInfo Authenticated secret context.
	 * @param operationRequest Request entering the handler pipeline.
	 * @returns Resolves with the operation result.
	 */
	public async onEvent(eventName: string, request: {}, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		if (this.cloudScriptService) {
			let operationResponse = await this.cloudScriptService.executePre(eventName, request, role, secretInfo, operationRequest);

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
