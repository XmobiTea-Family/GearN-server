import { parentPort, workerData } from "worker_threads";

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
// import { GroupMemberParam } from "../../index";
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
	GNErrorCode,
	GNParameterCode,
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
	LogType,
	GNSupport,
	PostType,
} from "@xmobitea/gn-typescript-client";

import * as mongodb from "mongodb";
import * as axios from "axios";

enum CloudScriptEventType {
	SendToUser = 0,
	SendToMore = 1,
	SendToAll = 2,
}

interface CloudScriptEvent {
	eventType: CloudScriptEventType;
	operationEvent: {
		eventCode: number;
		parameters: {} | null;
		encrypted: boolean;
	};
	receiver: string[] | string | null;
}

class CloudScriptAdmin {
	public readonly characterPlayer = GNNetwork.characterPlayer.admin;
	public readonly content = GNNetwork.content.admin;
	public readonly gamePlayer = GNNetwork.gamePlayer.admin;
	public readonly group = GNNetwork.group.admin;
	public readonly inventory = GNNetwork.inventory.admin;
	public readonly masterPlayer = GNNetwork.masterPlayer.admin;
	public readonly storeInventory = GNNetwork.storeInventory.admin;
	public readonly multiplayer = GNNetwork.multiplayer.admin;
	public readonly cloudScript = GNNetwork.cloudScript.admin;
	public readonly dashboard = GNNetwork.dashboard;
	public send(
		requestType: RequestType,
		requestRole: RequestRole,
		request: OperationRequest,
		onResponse: Action1<OperationResponse>,
		overrideAuthToken: string,
		overrideSecretKey: string,
		customTags: GNHashtable
	): void {
		GNNetwork.sendViaHttp(requestType, requestRole, request, onResponse, overrideAuthToken, overrideSecretKey, customTags);
	}

	public sendAsync(
		requestType: RequestType,
		requestRole: RequestRole,
		request: OperationRequest,
		overrideAuthToken: string,
		overrideSecretKey: string,
		customTags: GNHashtable
	): Promise<OperationResponse> {
		return GNNetwork.sendViaHttpAsync(requestType, requestRole, request, overrideAuthToken, overrideSecretKey, customTags);
	}
}

class CloudScriptDatabase {
	private static readonly DOT: string = ".";
	private static readonly RUNTIME: string = "Runtime" + CloudScriptDatabase.DOT;
	private static readonly META: string = "Meta" + CloudScriptDatabase.DOT;
	private static readonly SYSTEM: string = "System" + CloudScriptDatabase.DOT;

	private client: mongodb.MongoClient;
	private db: mongodb.Db;

	init(url: string, dbName: string, options?: mongodb.MongoClientOptions): void {
		this.client = new mongodb.MongoClient(url, options);

		this.db = this.client.db(dbName);

		this.client.connect();
	}

	public runtimeCollection(collectionName: string): mongodb.Collection<mongodb.Document> {
		return this.collection(CloudScriptDatabase.RUNTIME + collectionName);
	}

	public metaCollection(collectionName: string): mongodb.Collection<mongodb.Document> {
		return this.collection(CloudScriptDatabase.META + collectionName);
	}

	public systemCollection(collectionName: string): mongodb.Collection<mongodb.Document> {
		return this.collection(CloudScriptDatabase.SYSTEM + collectionName);
	}

	public runtimeGameCollection(collectionName: string, gameId: string): mongodb.Collection<mongodb.Document> {
		return this.collection(CloudScriptDatabase.RUNTIME + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public metaGameCollection(collectionName: string, gameId: string): mongodb.Collection<mongodb.Document> {
		return this.collection(CloudScriptDatabase.META + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public systemGameCollection(collectionName: string, gameId: string): mongodb.Collection<mongodb.Document> {
		return this.collection(CloudScriptDatabase.SYSTEM + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public collection(fullCollectionName: string): mongodb.Collection<mongodb.Document> {
		return this.db.collection(fullCollectionName);
	}

	public createCollection(name: string, options?: mongodb.CreateCollectionOptions): Promise<mongodb.Collection<mongodb.BSON.Document>> {
		return this.db.createCollection(name, options);
	}
}

class CloudScriptHttp {
	public async get<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.get<T, R, D>(url, config);
	}

	public async delete<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.delete<T, R, D>(url, config);
	}

	public async head<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.head<T, R, D>(url, config);
	}

	public async options<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.options<T, R, D>(url, config);
	}

	public async post<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, data?: any, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.post<T, R, D>(url, data, config);
	}

	public async put<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, data?: any, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.put<T, R, D>(url, data, config);
	}

	public async patch<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, data?: any, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.patch<T, R, D>(url, data, config);
	}
}

class CloudScriptSocket {
	public async sendEventTo(userId: string, operationEvent: OperationEvent): Promise<void> {
		return await this.sendEvent({
			eventType: CloudScriptEventType.SendToUser,
			receiver: userId,
			operationEvent: {
				eventCode: operationEvent.getEventCode(),
				encrypted: operationEvent.isEncrypted(),
				parameters: operationEvent.getParameters()?.toData() ?? null,
			},
		});
	}

	public async sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent): Promise<void> {
		return await this.sendEvent({
			eventType: CloudScriptEventType.SendToMore,
			receiver: userIds,
			operationEvent: {
				eventCode: operationEvent.getEventCode(),
				encrypted: operationEvent.isEncrypted(),
				parameters: operationEvent.getParameters()?.toData() ?? null,
			},
		});
	}

	public async sendEventToAllPlayer(operationEvent: OperationEvent): Promise<void> {
		return await this.sendEvent({
			eventType: CloudScriptEventType.SendToAll,
			receiver: null,
			operationEvent: {
				eventCode: operationEvent.getEventCode(),
				encrypted: operationEvent.isEncrypted(),
				parameters: operationEvent.getParameters()?.toData() ?? null,
			},
		});
	}

	private async sendEvent(event: CloudScriptEvent) {
		parentPort?.postMessage(event);
	}
}

enum EventCallbackType {
	Pre = 0,
	Post = 1,
	System = 2,
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
		operationCode: number;
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
	log?: (log: any) => void;
}

interface CloudScriptResponse {
	stats: {
		memoryUsedInBytes: number;
		executeTimeInMs: number;
	};
	response: FunctionResponse;
	responseId: string;
	logs: string[];
}

interface FunctionRequest {
	eventName: string;
	request: { [k: string]: any };
	secretInfo: SecretInfo;
	operationRequest: OperationRequest;
	operationResponse?: OperationResponse;
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
		encrypted: boolean;
	} | null;
	request: {
		[k: string]: any;
	} | null;
	errorMessage: any;
}

if (parentPort) {
	parentPort.on("message", async (request: CloudScriptRequest) => {
		let startTime = performance.now();
		let startMemoryUsage = process.memoryUsage();

		let logs: string[] = [];

		let handleResponse: FunctionResponse = null as any;

		if (request.eventType == EventCallbackType.System) {
			if (request.eventName == "system_RequestServerDetail") {
				let functionRequest: FunctionRequest = {
					eventName: request.eventName,
					operationRequest: null as any,
					secretInfo: null as any,
					request: request.request,
					log(log: any) {
						logs.push(log);
					},
				};
	
				handleResponse = await ___handleMatchmakingFunction(functionRequest);
			}
			else {
				let functionRequest: FunctionRequest = {
					eventName: request.eventName,
					operationRequest: null as any,
					secretInfo: null as any,
					request: null as any,
					log(log: any) {
						logs.push(log);
					},
				};
	
				handleResponse = await ___handleSystemFunction(functionRequest);
			}
		} else {
			let originOperationRequest = request.operationRequest;
			let operationRequest = new OperationRequest(originOperationRequest.operationCode, originOperationRequest.encrypted);
			if (originOperationRequest.parameters) {
				operationRequest.setParameters(GNHashtable.builder().addAll(originOperationRequest.parameters).build());
			}

			let originSecretInfo = request.secretInfo;
			let secretInfo: SecretInfo = null as any;
			if (originSecretInfo) {
				secretInfo = SecretInfo.Builder()
					.setSecretKey(originSecretInfo.secretKey)
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
				let functionRequest: FunctionRequest = {
					eventName: request.eventName,
					operationRequest: operationRequest,
					secretInfo: secretInfo,
					request: request.request,
					log(log: any) {
						logs.push(log);
					},
				};

				handleResponse = await ___handlePreFunction(functionRequest);
			} else if (request.eventType == EventCallbackType.Post) {
				let originOperationResponse = request.operationResponse;
				let operationResponse: OperationResponse = null as any;

				if (originOperationResponse) {
					operationResponse = new OperationResponse(originOperationRequest.operationCode, originOperationRequest.requestId, originOperationRequest.encrypted);
					operationResponse.setReturnCode(originOperationResponse.returnCode);
					operationResponse.setDebugMessage(originOperationResponse.debugMessage);

					if (originOperationResponse.parameters) {
						operationResponse.setParameters(GNHashtable.builder().addAll(originOperationResponse.parameters).build());
					}
				}

				let functionRequest: FunctionRequest = {
					eventName: request.eventName,
					operationRequest: operationRequest,
					operationResponse: operationResponse,
					secretInfo: secretInfo,
					request: request.request,
					log(log: any) {
						logs.push(log);
					},
				};

				handleResponse = await ___handlePostFunction(functionRequest);
			}
		}

		let endTime = performance.now();
		let endMemoryUsage = process.memoryUsage();

		let memoryUsedInBytes = endMemoryUsage.rss - startMemoryUsage.rss;
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

		parentPort?.postMessage(response);
	});
}

async function ___handleMatchmakingFunction(request: FunctionRequest): Promise<FunctionResponse> {
	let handler = systemMatchmakingHandlers[request.eventName];

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

async function ___handleSystemFunction(request: FunctionRequest): Promise<FunctionResponse> {
	let handler = systemHandlers[request.eventName];

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

async function ___handlePreFunction(request: FunctionRequest): Promise<FunctionResponse> {
	let handler = preHandlers[request.eventName];

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

		if (result != null)
			answer.result = {
				returnCode: result.getReturnCode(),
				debugMessage: result.getDebugMessage(),
				encrypted: result.isEncrypted(),
				parameters: result.getParameters()?.toData(),
			};

		answer.request = request.request;
	} catch (err: any) {
		answer.status = ExecuteResponseStatus.Exception;
		answer.errorMessage = err.message;
	}

	return answer;
}

async function ___handlePostFunction(request: FunctionRequest): Promise<FunctionResponse> {
	let handler = postHandlers[request.eventName];

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

		answer.result = {
			returnCode: result.getReturnCode(),
			debugMessage: result.getDebugMessage(),
			encrypted: result.isEncrypted(),
			parameters: result.getParameters()?.toData(),
		};
	} catch (err: any) {
		answer.status = ExecuteResponseStatus.Exception;
		answer.errorMessage = err.message;
	}

	return answer;
}

{
	let gnServerSettingsOptions: GNServerSettingsOptions = workerData.gnServerSettingsOptions;

	let gnServerSettings = new GNServerSettings();
	gnServerSettings.config(gnServerSettingsOptions);

	GNNetwork.init(gnServerSettings);
}

const admin = new CloudScriptAdmin();
const database = new CloudScriptDatabase();
const http = new CloudScriptHttp();
const socket = new CloudScriptSocket();

{
	let dbConnection = workerData.dbConnection;
	database.init(dbConnection.url, dbConnection.dbName, dbConnection.options);
}

const preHandlers: Record<
	string,
	(request: any, secretInfo: SecretInfo, operationRequest: OperationRequest, log?: (log: any) => void) => Promise<OperationResponse | null>
> = {};

const postHandlers: Record<
	string,
	(
		request: any,
		secretInfo: SecretInfo,
		operationRequest: OperationRequest,
		operationResponse: OperationResponse,
		log?: (log: any) => void
	) => Promise<OperationResponse>
> = {};

const systemHandlers: Record<string, (log?: (log: any) => void) => Promise<void>> = {};

const confirmServerDetail = (gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch, serverDetail: ServerDetail) => {
	parentPort?.postMessage({
		eventType: 10,
		receiver: null,
		operationEvent: {
			eventCode: 0,
			encrypted: false,
			parameters: {
				gameId: gameId,
				matchmakingTicketCanMatch,
				serverDetail: serverDetail,
			},
		},
	});
}

const systemMatchmakingHandlers: Record<string, (gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch, log?: (log: any) => void) => Promise<{ success: boolean }>> = {};

//$replaceScript
