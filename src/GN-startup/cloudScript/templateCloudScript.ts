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
	requestId: string;
	userId: string;
	name: string;
	parameters: any;
	customTags: { [k: string]: any };
	context: { [k: string]: any };
}

interface CloudScriptResponse {
	stats: {
		memoryUsedInBytes: number;
		executeTimeInMs: number;
	};
	responseId: string;
	response: FunctionResponse;
	logs: string[];
}

interface FunctionRequest {
	args: any,
	context: {
		userId: string,
		customTags: { [k: string]: any };
	},
	log: (log: any) => void;
}

enum ExecuteResponseStatus {
	Ok = 1,
	Exception = 2,
	FunctionNameNotFound = 3,
}

interface FunctionResponse {
	status: ExecuteResponseStatus;
	result: any;
	errorMessage: string;
}

const ConvertObject = (result: any) => {
	if (result) {
		if (result instanceof GNHashtable) {
			result = (<GNHashtable>result).toData();
		}
		else if (result instanceof GNArray) {
			result = (<GNArray>result).toData();
		}
		else {
			let typeofObject = typeof (result);
			if (typeofObject == "object") {
				if (Array.isArray(result)) {
					result = ConvertArray(result as any[]);
				}
				else {
					let answer = {} as any;

					let keys = Object.keys(result);

					for (let i = 0; i < keys.length; i++) {
						let key = keys[i];
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

const ConvertArray = (results: any[]) => {
	let answer: any[] = [];

	for (let i = 0; i < results.length; i++) {
		let result = ConvertObject(results[i]);

		answer.push(result);
	}

	return answer;
}

process?.on("message", async (request: CloudScriptRequest) => {
	let startTime = performance.now();
	let startMemoryUsage = process.memoryUsage();

	let logs: string[] = [];
	let functionRequest: FunctionRequest = {
		args: request.parameters,
		context: { ...request.context, userId: request.userId, customTags: request.customTags },
		log(log: any) {
			logs.push(JSON.stringify(log));
		},
	};

	let handleResponse = await ___handleCloudScriptFunction(request.name, functionRequest);

	if (handleResponse.result) {
		if (handleResponse.result instanceof GNHashtable) {
			handleResponse.result = (<GNHashtable>handleResponse.result).toData();
		}
		else if (handleResponse.result instanceof GNArray) {
			handleResponse.result = (<GNArray>handleResponse.result).toData();
		}
		else {
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

	let endTime = performance.now();
	let endMemoryUsage = process.memoryUsage();

	let memoryUsedInBytes = endMemoryUsage.heapUsed - startMemoryUsage.heapUsed;
	if (memoryUsedInBytes <= 0) memoryUsedInBytes = 8192;
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

async function ___handleCloudScriptFunction(name: string, request: FunctionRequest): Promise<FunctionResponse> {
	let handler = handlers[name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			errorMessage: null as any,
		};
	}

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

const gameId: string = process.env.gameId ?? "";

{
	let gnServerSettingsOptions: GNServerSettingsOptions = JSON.parse(process.env.gnServerSettingsOptions ?? "");

	let gnServerSettings = new GNServerSettings();
	gnServerSettings.config(gnServerSettingsOptions);

	GNNetwork.init(gnServerSettings);
	GNNetwork.setGameId(gameId);
}

const admin = new CloudScriptAdmin();
const database = new CloudScriptDatabase();
const http = new CloudScriptHttp();
const socket = new CloudScriptSocket();
const mail = new CloudScriptMail();
const pushNotification = new CloudScriptPushNotification();

{
	let dbConnection = JSON.parse(process.env.dbConnection ?? "");
	database.init(dbConnection.url, dbConnection.dbName, dbConnection.logUrl, dbConnection.logDbName, dbConnection.options);
}

// release for the security
process.env.dbConnection = "";
process.env.gnServerSettingsOptions = "";

const handlers: Record<string, (args: any, context: { userId: string; customTags: { [k: string]: any } }, log: (log: any) => void) => any> = {};

//$replaceScript
