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

// dont remove this import 

import * as mongodb from "mongodb";
import * as axios from "axios";

import { CloudScriptAdmin } from "./CloudScriptAdmin";
import { CloudScriptDatabase } from "./CloudScriptDatabase";
import { CloudScriptHttp } from "./CloudScriptHttp";
import { CloudScriptSocket } from "./CloudScriptSocket";
import { CloudScriptMail } from "./CloudScriptMail";
import { CloudScriptPushNotification } from "./CloudScriptPushNotification";

interface CloudScriptRequest {
	// Stores the request ID value used by this contract.
	requestId: string;
	// Indicates whether r ID should be used.
	userId: string;
	// Stores the name value used by this contract.
	name: string;
	// Stores the parameters value used by this contract.
	parameters: any;
	// Stores the custom tags collection used by this contract.
	customTags: { [k: string]: any };
	// Stores the context collection used by this contract.
	context: { [k: string]: any };
}

interface CloudScriptResponse {
	// Stores the stats value used by this contract.
	stats: {
		// Stores the memory used in bytes value used by this contract.
		memoryUsedInBytes: number;
		// Stores the execute time in milliseconds value used by this contract.
		executeTimeInMs: number;
	};
	// Stores the response ID value used by this contract.
	responseId: string;
	// Stores the response value used by this contract.
	response: FunctionResponse;
	// Stores the logs list used by this contract.
	logs: string[];
}

interface FunctionRequest {
	// Stores the args value used by this contract.
	args: any,
	// Stores the context collection used by this contract.
	context: {
		// Indicates whether r ID should be used.
		userId: string,
		// Stores the custom tags collection used by this contract.
		customTags: { [k: string]: any };
	},
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
	result: any;
	// Stores the error message value used by this contract.
	errorMessage: string;
}

/**
 * Executes the convert object workflow.
 * @param result Provides the result value used by this operation.
 */
const ConvertObject = (result: any) => {
	if (result) {
		if (result instanceof GNHashtable) {
			result = (<GNHashtable>result).toData();
		}
		else if (result instanceof GNArray) {
			result = (<GNArray>result).toData();
		}
		else {
			// Stores the typeof object value used in the current execution flow.
			let typeofObject = typeof (result);
			if (typeofObject == "object") {
				if (Array.isArray(result)) {
					result = ConvertArray(result as any[]);
				}
				else {
					// Stores the answer value used in the current execution flow.
					let answer = {} as any;

					// Stores the keys value used in the current execution flow.
					let keys = Object.keys(result);

					for (let i = 0; i < keys.length; i++) {
						// Stores the key value used in the current execution flow.
						let key = keys[i];
						// Stores the value value used in the current execution flow.
						let value = ConvertObject(result[key]);

						if (value) {
							answer[key] = value;
						}
					}

					result = answer;
				}
			}
			else if (typeofObject == "function") {
				result = null;
			}
		}
	}

	return result;
}

/**
 * Executes the convert array workflow.
 * @param results Provides the results value used by this operation.
 */
const ConvertArray = (results: any[]) => {
	// Stores the answer value used in the current execution flow.
	let answer: any[] = [];

	for (let i = 0; i < results.length; i++) {
		// Stores the result value used in the current execution flow.
		let result = ConvertObject(results[i]);

		answer.push(result);
	}

	return answer;
}

process?.on("message", async (request: CloudScriptRequest) => {
	// Stores the start time value used in the current execution flow.
	let startTime = performance.now();
	// Stores the start memory usage value used in the current execution flow.
	let startMemoryUsage = process.memoryUsage();

	// Stores the logs value used in the current execution flow.
	let logs: string[] = [];
	// Stores the function request value used in the current execution flow.
	let functionRequest: FunctionRequest = {
		args: request.parameters,
		context: { ...request.context, userId: request.userId, customTags: request.customTags },
		/**
		 * Executes the log workflow.
		 * @param log Provides the log value used by this operation.
		 */
		log(log: any) {
			logs.push(JSON.stringify(log));
		},
	};

	// Stores the handle response value used in the current execution flow.
	let handleResponse = await ___handleCloudScriptFunction(request.name, functionRequest);

	if (handleResponse.result) {
		if (handleResponse.result instanceof GNHashtable) {
			handleResponse.result = (<GNHashtable>handleResponse.result).toData();
		}
		else if (handleResponse.result instanceof GNArray) {
			handleResponse.result = (<GNArray>handleResponse.result).toData();
		}
		else {
			// Stores the typeof result value used in the current execution flow.
			let typeofResult = typeof (handleResponse.result);

			if (typeofResult == "boolean") {

			}
			else if (typeofResult == "number") {

			}
			else if (typeofResult == "object") {
				if (Array.isArray(handleResponse.result)) {

					handleResponse.result = ConvertArray(handleResponse.result as any[]);
					//answer.push(this.deserializeArray(gnArray.getGNArray(i), cls));
				}
				else {
					handleResponse.result = ConvertObject(handleResponse.result);
				}
			}
			else if (typeofResult == "string") {

			}
			else {
				handleResponse.result = null;

				handleResponse.errorMessage = "CloudScript must return void, number, string, boolean, null, json dictionary, json array, GNHashtable or GNArray";
				handleResponse.status = ExecuteResponseStatus.Exception;
			}
		}
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
		response: handleResponse,
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
 * Handles the cloud script function.
 * @param name Provides the name value used by this operation.
 * @param request Provides the request value used by this operation.
 * @returns Resolves with the operation result.
 */
async function ___handleCloudScriptFunction(name: string, request: FunctionRequest): Promise<FunctionResponse> {
	// Stores the handler value used in the current execution flow.
	let handler = handlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			errorMessage: null as any,
		};
	}

	// Stores the answer value used in the current execution flow.
	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null as any,
		result: null,
	};

	try {
		answer.result = await handler(request.args, request.context, request.log);
	} catch (err: any) {
		answer.status = ExecuteResponseStatus.Exception;
		answer.errorMessage = err.message;
	}

	return answer;
}

// Stores the game ID value used by this module.
const gameId: string = process.env.gameId ?? "";

{
	// Stores the GearN server settings options value used in the current execution flow.
	let gnServerSettingsOptions: GNServerSettingsOptions = JSON.parse(process.env.gnServerSettingsOptions ?? "");

	// Stores the resolved GearN server settings instance for the current execution flow.
	let gnServerSettings = new GNServerSettings();
	gnServerSettings.config(gnServerSettingsOptions);

	GNNetwork.init(gnServerSettings);
	GNNetwork.setGameId(gameId);
}

// Stores the admin value used by this module.
const admin = new CloudScriptAdmin();
// Stores the database value used by this module.
const database = new CloudScriptDatabase();
// Stores the HTTP value used by this module.
const http = new CloudScriptHttp();
// Stores the socket value used by this module.
const socket = new CloudScriptSocket();
// Stores the mail value used by this module.
const mail = new CloudScriptMail();
// Stores the push notification value used by this module.
const pushNotification = new CloudScriptPushNotification();

{
	// Stores the database connection value used in the current execution flow.
	let dbConnection = JSON.parse(process.env.dbConnection ?? "");
	database.init(dbConnection.url, dbConnection.dbName, dbConnection.logUrl, dbConnection.logDbName, dbConnection.options);
}

// release for the security
process.env.dbConnection = "";
process.env.gnServerSettingsOptions = "";

// Stores the handlers value used by this module.
const handlers: Record<string, (args: any, context: { userId: string; customTags: { [k: string]: any } }, log: (log: any) => void) => any> = {};

//$replaceScript
