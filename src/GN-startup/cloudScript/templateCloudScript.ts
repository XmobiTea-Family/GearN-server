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
	public readonly dashboard = {
        getAdminAccountList: GNNetwork.dashboard.getAdminAccountList,
        getAdminAccountListAsync: GNNetwork.dashboard.getAdminAccountListAsync,
        getGameInformation: GNNetwork.dashboard.getGameInformation,
        getGameInformationAsync: GNNetwork.dashboard.getGameInformationAsync,
        getGameList: GNNetwork.dashboard.getGameList,
        getGameListAsync: GNNetwork.dashboard.getGameListAsync,
        getMasterGameSettings: GNNetwork.dashboard.getMasterGameSettings,
        getMasterGameSettingsAsync: GNNetwork.dashboard.getMasterGameSettingsAsync,
        getSecretInfoInformation: GNNetwork.dashboard.getSecretInfoInformation,
        getSecretInfoInformationAsync: GNNetwork.dashboard.getSecretInfoInformationAsync,
        getSecretInfoList: GNNetwork.dashboard.getSecretInfoList,
        getSecretInfoListAsync: GNNetwork.dashboard.getSecretInfoListAsync,
        getServerLog: GNNetwork.dashboard.getServerLog,
        getServerLogAsync: GNNetwork.dashboard.getServerLogAsync,
        setGameInformation: GNNetwork.dashboard.setGameInformation,
        setGameInformationAsync: GNNetwork.dashboard.setGameInformationAsync,
        getUsernameAdminAccount: GNNetwork.dashboard.getUsernameAdminAccount,
        getUsernameAdminAccountAsync: GNNetwork.dashboard.getUsernameAdminAccountAsync,
        getAnalytics: GNNetwork.dashboard.getAnalytics,
        getAnalyticsAsync: GNNetwork.dashboard.getAnalyticsAsync,
        resetStatisticsLeaderboard: GNNetwork.dashboard.resetStatisticsLeaderboard,
        resetStatisticsLeaderboardAsync: GNNetwork.dashboard.resetStatisticsLeaderboardAsync,
        getBackupStatisticsLeaderboardVersion: GNNetwork.dashboard.getBackupStatisticsLeaderboardVersion,
        getBackupStatisticsLeaderboardVersionAsync: GNNetwork.dashboard.getBackupStatisticsLeaderboardVersionAsync,
        getServerGameData: GNNetwork.dashboard.getServerGameData,
        getServerGameDataAsync: GNNetwork.dashboard.getServerGameDataAsync,
        deleteInDatabase: GNNetwork.dashboard.deleteInDatabase,
        deleteInDatabaseAsync: GNNetwork.dashboard.deleteInDatabaseAsync,
    };
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

	private logClient: mongodb.MongoClient;
	private logDb: mongodb.Db;

	init(url: string, logUrl: string, dbName: string, options?: mongodb.MongoClientOptions): void {
		this.client = new mongodb.MongoClient(url, options);

		this.db = this.client.db(dbName);

		if (!logUrl || logUrl == "" || logUrl == url) {
			this.logClient = this.client;
			this.logDb = this.db;
		}
		else {
			this.logClient = new mongodb.MongoClient(logUrl, options);
			this.logDb = this.logClient.db(dbName);
		}
	}

	public runtimeCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(CloudScriptDatabase.RUNTIME + collectionName);
	}

	public metaCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(CloudScriptDatabase.META + collectionName);
	}

	public systemCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(CloudScriptDatabase.SYSTEM + collectionName);
	}

	public runtimeGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(CloudScriptDatabase.RUNTIME + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public metaGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(CloudScriptDatabase.META + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public systemGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.collection<TSchema>(CloudScriptDatabase.SYSTEM + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public collection<TSchema extends mongodb.Document = mongodb.Document>(fullCollectionName: string): mongodb.Collection<TSchema> {
		return this.db.collection<TSchema>(fullCollectionName);
	}

	public createCollection(name: string, options?: mongodb.CreateCollectionOptions): Promise<mongodb.Collection<mongodb.BSON.Document>> {
		return this.db.createCollection(name, options);
	}

	public logRuntimeCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(CloudScriptDatabase.RUNTIME + collectionName);
	}

	public logMetaCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(CloudScriptDatabase.META + collectionName);
	}

	public logSystemCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(CloudScriptDatabase.SYSTEM + collectionName);
	}

	public logRuntimeGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(CloudScriptDatabase.RUNTIME + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public logMetaGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(CloudScriptDatabase.META + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public logSystemGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema> {
		return this.logCollection<TSchema>(CloudScriptDatabase.SYSTEM + gameId + CloudScriptDatabase.DOT + collectionName);
	}

	public logCollection<TSchema extends mongodb.Document = mongodb.Document>(fullCollectionName: string): mongodb.Collection<TSchema> {
		return this.logDb.collection<TSchema>(fullCollectionName);
	}

	public logCreateCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, options?: mongodb.CreateCollectionOptions) {
		return this.logDb.createCollection<TSchema>(collectionName, options)
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
			}
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
			}
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
			}
		});
	}

	private async sendEvent(event: CloudScriptEvent) {
		if (process?.send)
            process.send(event);
	}
}

class CloudScriptMail {
	public async send(email: string, subject: string, contentHtml: string) {
		if (process?.send)
            process.send({
                eventType: 20,
                receiver: null,
                operationEvent: {
                    eventCode: 0,
                    encrypted: false,
                    parameters: {
                        email: email,
                        subject: subject,
                        contentHtml: contentHtml,
                    },
                },
            });
	}

	public async sendToMore(emails: string[], subject: string, contentHtml: string) {
        if (process?.send)
            process.send({
                eventType: 21,
                receiver: null,
                operationEvent: {
                    eventCode: 0,
                    encrypted: false,
                    parameters: {
                        emails: emails,
                        subject: subject,
                        contentHtml: contentHtml,
                    },
                },
            });
	}
}

class CloudScriptPushNotification {
	public async send(token: string, title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }) {
		if (process?.send)
            process.send({
                eventType: 30,
                receiver: null,
                operationEvent: {
                    eventCode: 0,
                    encrypted: false,
                    parameters: {
                        token: token,
                        title: title,
                        body: body,
                        badge: badge,
                        sound: sound,
                        icon: icon,
                        data: data,
                    },
                },
            });
	}

	public async sendToMore(tokens: string[], title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }) {
		if (process?.send)
            process.send({
                eventType: 31,
                receiver: null,
                operationEvent: {
                    eventCode: 0,
                    encrypted: false,
                    parameters: {
                        tokens: tokens,
                        title: title,
                        body: body,
                        badge: badge,
                        sound: sound,
                        icon: icon,
                        data: data,
                    },
                },
            });
	}

	public async sendToTopic(topic: string, title: string, body: string, badge?: number, sound?: string, icon?: string, data?: { [k: string]: any }) {
		if (process?.send)
            process.send({
                eventType: 32,
                receiver: null,
                operationEvent: {
                    eventCode: 0,
                    encrypted: false,
                    parameters: {
                        topic: topic,
                        title: title,
                        body: body,
                        badge: badge,
                        sound: sound,
                        icon: icon,
                        data: data,
                    },
                },
            });
	}

    public async subscribeToTopic(tokens: string[], topic: string) {
		if (process?.send)
            process.send({
                eventType: 33,
                receiver: null,
                operationEvent: {
                    eventCode: 0,
                    encrypted: false,
                    parameters: {
                        tokens: tokens,
                        topic: topic,
                    },
                },
            });
	}

    public async unsubscribeFromTopic(tokens: string[], topic: string) {
		if (process?.send)
            process.send({
                eventType: 34,
                receiver: null,
                operationEvent: {
                    eventCode: 0,
                    encrypted: false,
                    parameters: {
                        tokens: tokens,
                        topic: topic,
                    },
                },
            });
	}
}

interface CloudScriptRequest {
	requestId: string;
	userId: string;
	name: string;
	parameters: object;
	customTags: { [k: string]: any };
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
	userId: string;
	name: string;
	parameters: any;
	customTags: { [k: string]: any };
	context: {};
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
	errorMessage: any;
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
        userId: request.userId,
        name: request.name,
        parameters: request.parameters,
        context: {},
        customTags: request.customTags,
        log(log: any) {
            logs.push(JSON.stringify(log));
        },
    };

    let handleResponse = await ___handleFunction(functionRequest);

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

async function ___handleFunction(request: FunctionRequest): Promise<FunctionResponse> {
	let handler = handlers[request.name];

	if (handler == null) {
		return {
			status: ExecuteResponseStatus.FunctionNameNotFound,
			result: null,
			errorMessage: null,
		};
	}

	let answer: FunctionResponse = {
		status: ExecuteResponseStatus.Ok,
		errorMessage: null,
		result: null,
	};

	try {
		answer.result = await handler(request.parameters, { userId: request.userId, customTags: request.customTags }, request.log);
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
	database.init(dbConnection.url, dbConnection.logUrl, dbConnection.dbName, dbConnection.options);
}

process.env.dbConnection = "";
process.env.gnServerSettingsOptions = "";

const handlers: Record<string, (args: any, context: { userId: string; customTags: { [k: string]: any } }, log: (log: any) => void) => any> = {};

//$replaceScript
