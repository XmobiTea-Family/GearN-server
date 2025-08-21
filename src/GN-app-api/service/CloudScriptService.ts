import { ExecuteResponseStatus, ExecuteResult, ICloudScriptService } from "./ICloudScriptService";
import { ChildProcess, fork, execSync } from "child_process";
import * as mongoDB from "mongodb";
import fs from "fs";
import { StringUtility } from "./../../GN-common/helper/StringUtility";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { GNServerSettingsOptions } from "@xmobitea/gn-typescript-client";
import { GNServer } from "./../../GNServer";
import { OperationEvent } from "./../../GN-common/entity/operationEvent/OperationEvent";
import { GNHashtable } from "./../../GN-common/common/GNData";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { MatchmakingTicketCanMatch } from "./../handler/controller/handler/multiplayer/MatchmakingHandler";
import { ServerDetail } from "./../../GN-library/xdatabase/lib/entity/pro/ServerDetail";

interface CloudScriptRequest {
	requestId: string,
	userId: string,
	name: string,
	parameters: any,
	customTags: { [k: string]: any },
	context: { [k: string]: any },
}

interface CloudScriptResponse extends ExecuteResult {
	responseId: string,
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

export class CloudScriptService implements ICloudScriptService {
	private cloudScriptWorkerDict: Map<string, ChildProcess>;
	private cloudScriptWaitingResponseCallbackDict: Map<string, (cloudScriptResponse: CloudScriptResponse) => void>;

	private latestVersion: string;
	private liveLatestVersion: string;

	private cloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>;
	private cloudScriptFunctionLogCollection: mongoDB.Collection<mongoDB.Document>;

	private gnServer: GNServer;
	private gnServerSettingsOptions: GNServerSettingsOptions;
	private dbConnection: DbConnection;
	private gameId: string;
	private executeTimeoutInMs: number;

	private cloudScriptFunctions: Array<{
		version: string,
		canExecute: boolean,
		fullScript: string,
	}>;

	constructor() {
		this.cloudScriptFunctions = [];
		this.cloudScriptWorkerDict = new Map();
		this.cloudScriptWaitingResponseCallbackDict = new Map();
	}

	public init(gameId: string, gnServerSettingsOptions: GNServerSettingsOptions, dbConnection: DbConnection, gnServer: GNServer, executeTimeoutInMs: number): void {
		this.gameId = gameId;
		this.gnServerSettingsOptions = gnServerSettingsOptions;
		this.dbConnection = dbConnection;
		this.gnServer = gnServer;
		this.executeTimeoutInMs = executeTimeoutInMs;
	}

	public setCloudScriptFunctionCollection(cloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.cloudScriptFunctionCollection = cloudScriptFunctionCollection;
	}

	public setCloudScriptFunctionLogCollection(cloudScriptFunctionLogCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.cloudScriptFunctionLogCollection = cloudScriptFunctionLogCollection;
	}

	public run(): void {
		this.loadVersion();

		let thiz = this;
		this.gnServer.getHttpApp().getClusterHandler().onEvent("addCloudScriptFunction", data => {
			thiz.remoteAddCloudScriptFunction(data);
		});

		this.gnServer.getHttpApp().getClusterHandler().onEvent("editCloudScriptFunction", data => {
			thiz.remoteEditCloudScriptFunction(data);
		});

	}

	private async loadVersion(): Promise<void> {
		let cloudScriptFunctionResults = await this.cloudScriptFunctionCollection.find({}, {
			sort: {
				_id: -1,
			},
			projection: {
				version: true,
				isLive: true,
				canExecute: true,
				fullScript: true,
			}
		});

		while (await cloudScriptFunctionResults.hasNext()) {
			let cloudScriptFunctionResult = await cloudScriptFunctionResults.next();
			if (!this.latestVersion) this.latestVersion = cloudScriptFunctionResult["version"];

			this.cloudScriptFunctions.push({
				version: cloudScriptFunctionResult["version"],
				canExecute: cloudScriptFunctionResult["canExecute"],
				fullScript: cloudScriptFunctionResult["fullScript"],
			});

			if (cloudScriptFunctionResult.isLive) {
				this.liveLatestVersion = cloudScriptFunctionResult["version"];
				this.loadCloudScriptFunctionWorker(this.liveLatestVersion, cloudScriptFunctionResult["fullScript"]);
			}
		}
	}

	public async executeCloudScriptFunction(userId: string, functionName: string, functionParameters: any, version: string, customTags: { [k: string]: any }): Promise<ExecuteResult> {
		if (!version) version = this.liveLatestVersion;

		let cloudScriptWorker = this.loadCloudScriptFunctionWorkerFromCache(version);

		if (cloudScriptWorker == null) {
			return {
				response: {
					result: null,
					status: ExecuteResponseStatus.VersionInvalid,
					errorMessage: "version not found",
				},
				stats: null,
				logs: [],
			}
		}

		let tsCreate = xDatetime.getCurrentMilliseconds();

		let requestId = StringUtility.generateRandomString(10, 0);

		let cloudScriptRequest: CloudScriptRequest = {
			requestId: requestId,
			name: functionName,
			userId: userId,
			parameters: functionParameters,
			customTags: customTags,
			context: {},
		}

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
						result: null
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

		this.cloudScriptFunctionLogCollection.insertOne({
			request: cloudScriptRequest,
			response: cloudScriptResponse,
			tsCreate: tsCreate,
		});

		this.cloudScriptWaitingResponseCallbackDict.delete(requestId);

		return {
			response: cloudScriptResponse.response,
			stats: cloudScriptResponse.stats,
			logs: cloudScriptResponse.logs
		}
	}

	public async addCloudScriptFunction(script: string, isLive: boolean, canExecute: boolean): Promise<{ success: boolean, errorMessage?: string, version?: string }> {
		let version = StringUtility.generateRandomString(7, 0);

		let filePathTempTs = __dirname + "/./GN-startup/cloudScript/temp.ts";

		let fullScriptJs: string;

		try {
			let templateFullScriptPathTs = __dirname + "/./GN-startup/cloudScript/templateCloudScript.ts";
			let fullScriptTs = fs.readFileSync(templateFullScriptPathTs).toString().replace("//$replaceScript", script);

			fs.writeFileSync(filePathTempTs, fullScriptTs);

			let filePathTemp = __dirname + "/./GN-startup/cloudScript";

			await execSync("npx tsc " + filePathTempTs + " --allowJs --skipLibCheck --outDir " + filePathTemp);

			let filePathTempJs = __dirname + "/./GN-startup/cloudScript/temp.js";
			fullScriptJs = fs.readFileSync(filePathTempJs).toString();
		}
		catch (err) {
			if (fs.existsSync(filePathTempTs))
				fs.rmSync(filePathTempTs);

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
			}
		}

		this.gnServer.getHttpApp().getClusterHandler().sendEvent("addCloudScriptFunction", { version: version, fullScriptJs: fullScriptJs, canExecute: canExecute, isLive: isLive, }, false);

		if (canExecute) {
			this.loadCloudScriptFunctionWorker(version, fullScriptJs);
		}

		if (isLive) {
			await this.cloudScriptFunctionCollection.updateMany({ isLive: true }, {
				$set: {
					isLive: false
				}
			});

			this.liveLatestVersion = version;
		}

		this.cloudScriptFunctionCollection.insertOne({
			version: version,
			script: script,
			fullScript: fullScriptJs,
			canExecute: canExecute,
			isLive: isLive,
			tsCreate: xDatetime.getCurrentMilliseconds(),
		});

		this.latestVersion = version;

		this.cloudScriptFunctions.unshift({
			version: version,
			canExecute: canExecute,
			fullScript: fullScriptJs
		});

		return {
			success: true,
			version: version,
		};
	}

	private async remoteAddCloudScriptFunction(request: { version: string, fullScriptJs: string, canExecute: boolean, isLive: boolean, }) {
		let version = request.version;
		let canExecute = request.canExecute;
		let fullScriptJs = request.fullScriptJs;
		let isLive = request.isLive;

		if (canExecute) {
			this.loadCloudScriptFunctionWorker(version, fullScriptJs);
		}

		if (isLive) {
			this.liveLatestVersion = version;
		}

		this.latestVersion = version;

		this.cloudScriptFunctions.unshift({
			version: version,
			canExecute: canExecute,
			fullScript: fullScriptJs
		});
	}

	private async remoteEditCloudScriptFunction(request: { version: string, isLive: boolean, canExecute: boolean, }) {
		let version = request.version;
		let canExecute = request.canExecute;
		let isLive = request.isLive;

		let cloudFunction = this.cloudScriptFunctions.find(x => x.version == version);
		if (!cloudFunction) {
			return;
		}

		cloudFunction.canExecute = canExecute;

		if (isLive) {
			if (this.liveLatestVersion != version) {
				this.liveLatestVersion = version;
			}
		}
		else {
			if (this.liveLatestVersion == version) {
				this.liveLatestVersion = null;
			}
		}

		if (!canExecute) {
			let cloudScriptWorker = this.cloudScriptWorkerDict.get(version);
			if (cloudScriptWorker) {
				this.cloudScriptWorkerDict.delete(version);

				setTimeout(() => {
					if (!this.cloudScriptWorkerDict.has(version) && cloudScriptWorker) {
						cloudScriptWorker.kill("SIGKILL");
					}
				}, 20000);
			}
		}
	}

	public async editCloudScriptFunction(version: string, isLive: boolean, canExecute: boolean): Promise<{ success: boolean, errorMessage?: string }> {
		let cloudFunction = this.cloudScriptFunctions.find(x => x.version == version);
		if (!cloudFunction) {
			return {
				success: false,
				errorMessage: "version not found"
			}
		}

		this.gnServer.getHttpApp().getClusterHandler().sendEvent("editCloudScriptFunction", { version: version, canExecute: canExecute, isLive: isLive, }, false);

		cloudFunction.canExecute = canExecute;

		this.cloudScriptFunctionCollection.updateOne({
			version: version,
		}, {
			$set: {
				isLive: isLive,
				canExecute: canExecute,
			}
		});

		if (isLive) {
			if (this.liveLatestVersion != version) {
				if (this.liveLatestVersion) {
					this.cloudScriptFunctionCollection.updateOne({
						version: this.liveLatestVersion,
					}, {
						$set: {
							isLive: false,
						}
					});
				}

				this.liveLatestVersion = version;
			}
		}
		else {
			if (this.liveLatestVersion == version) {
				this.liveLatestVersion = null;
			}
		}

		if (!canExecute) {
			let cloudScriptWorker = this.cloudScriptWorkerDict.get(version);
			if (cloudScriptWorker) {
				// doi 1 lat cho khong con ai thuc thi nua thi thuc hien terminate
				this.cloudScriptWorkerDict.delete(version);

				setTimeout(() => {
					if (!this.cloudScriptWorkerDict.has(version) && cloudScriptWorker) {
						cloudScriptWorker.kill("SIGKILL");
					}
				}, 20000);
			}
		}

		return {
			success: true,
		}
	}

	public getCloudScriptFunctions(): Array<{
		version: string,
		canExecute: boolean,
	}> {
		return this.cloudScriptFunctions;
	}

	public async getCloudScriptFunction(version: string): Promise<{
		script: string,
		canExecute: boolean,
		isLive: boolean,
		tsCreate: number
	}> {
		let cloudScriptFunctionResult = await this.cloudScriptFunctionCollection.findOne({ version: version }, {
			projection: {
				script: true,
				canExecute: true,
				isLive: true,
				tsCreate: true,
			}
		});

		if (!cloudScriptFunctionResult) return null;
		return {
			script: cloudScriptFunctionResult["script"],
			canExecute: cloudScriptFunctionResult["canExecute"],
			isLive: cloudScriptFunctionResult["isLive"],
			tsCreate: cloudScriptFunctionResult["tsCreate"],
		}
	}

	public getLatestVersion(): string {
		return this.latestVersion;
	}

	public getLiveLatestVersion(): string {
		return this.liveLatestVersion;
	}

	private loadCloudScriptFunctionWorkerFromCache(version: string): ChildProcess {
		if (!version) return null;

		let cloudScriptWorker = this.cloudScriptWorkerDict.get(version);
		if (cloudScriptWorker == null) {
			let cloudFunction = this.cloudScriptFunctions.find(x => x.version == version);

			if (cloudFunction == null) return null;
			if (!cloudFunction.canExecute) return null;

			return this.loadCloudScriptFunctionWorker(version, cloudFunction.fullScript);
		}

		return cloudScriptWorker;
	}

	private loadCloudScriptFunctionWorker(version: string, fullScript: string): ChildProcess {
		if (!version) return null;

		let filePath = __dirname + "/./GN-startup/cloudScript/" + version + ".js";
		fs.writeFileSync(filePath, fullScript);

		return this.loadCloudScriptWorker(version);
	}

	private loadCloudScriptWorker(version: string): ChildProcess {
		let filePath = __dirname + "/./GN-startup/cloudScript/" + version + ".js";

		Debug.log("[GearN] [CloudScript] run cloudScript " + version);

		let cloudScriptWorker = fork(filePath, {
			env: {
				gameId: this.gameId,
				gnServerSettingsOptions: JSON.stringify(this.gnServerSettingsOptions),
				dbConnection: JSON.stringify(this.dbConnection),
			}
		});

		let thiz = this;
		cloudScriptWorker.on("message", (cloudScriptResponse: CloudScriptResponse) => {
			if (cloudScriptResponse.responseId) {
				let callback = thiz.cloudScriptWaitingResponseCallbackDict.get(cloudScriptResponse.responseId);
				if (callback != null) {
					callback(cloudScriptResponse);
				}
			}
			else {
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
			Debug.log("[GearN] [CloudScript] terminal cloudScript " + version + " with code " + code);

			thiz.cloudScriptWorkerDict.delete(version);
		});

		this.cloudScriptWorkerDict.set(version, cloudScriptWorker);

		return cloudScriptWorker;
	}
}
