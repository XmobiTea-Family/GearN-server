import { ExecuteResponseStatus, ExecuteResult, ICloudScriptService } from "./ICloudScriptService";
import { Worker } from 'worker_threads';
import { execSync } from "child_process";
import * as mongoDB from "mongodb";
import fs from "fs";
import { StringUtility } from "./../../GN-common/helper/StringUtility";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { GNServerSettingsOptions } from "@xmobitea/gn-typescript-client";
import { GNServer } from "../../GNServer";
import { OperationEvent } from "../../GN-common/entity/operationEvent/OperationEvent";
import { GNHashtable } from "../../GN-common/common/GNData";
import { Debug } from "../../GN-library/xdebug/lib/xDebug";

interface CloudScriptRequest {
    requestId: string,
    userId: string,
    name: string,
    parameters: object,
    customTags: { [k: string]: any }
}

interface CloudScriptResponse {
    stats: {
        memoryUsedInBytes: number,
        executeTimeInMs: number,
    },
    response: {
        status: ExecuteResponseStatus,
        result: any,
        errorMessage: any,
    },
    responseId: string,
    logs: string[],
}

enum CloudScriptEventType {
    SendToUser = 0,
    SendToMore = 1,
    SendToAll = 2,
}

interface CloudScriptEvent {
    eventType: CloudScriptEventType;
    operationEvent: {
        eventCode: number;
        parameters: {};
        encrypted: boolean;
    };
    receiver: string[] | string | null;
}

interface DbConnection {
    url: string,
    dbName: string,
    options?: { [k: string]: any },
}

export class CloudScriptService implements ICloudScriptService {
    private static readonly ExecuteTimeoutInMs = 12000;

    private cloudScriptWorkerDict: Map<string, Worker>;
    private cloudScriptWaitingResponseCallbackDict: Map<string, (cloudScriptResponse: CloudScriptResponse) => void>;

    private latestVersion: string;
    private liveLatestVersion: string;

    private cloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>;
    private cloudScriptFunctionLogCollection: mongoDB.Collection<mongoDB.Document>;

    private gnServer: GNServer;
    private gnServerSettingsOptions: GNServerSettingsOptions;
    private dbConnection: DbConnection;
    private gameId: string;

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

    public init(gameId: string, gnServerSettingsOptions: GNServerSettingsOptions, dbConnection: DbConnection, gnServer: GNServer): void {
        this.gameId = gameId;
        this.gnServerSettingsOptions = gnServerSettingsOptions;
        this.dbConnection = dbConnection;
        this.gnServer = gnServer;
    }

    public setCloudScriptFunctionCollection(cloudScriptFunctionCollection: mongoDB.Collection<mongoDB.Document>): void {
        this.cloudScriptFunctionCollection = cloudScriptFunctionCollection;
    }

    public setCloudScriptFunctionLogCollection(cloudScriptFunctionLogCollection: mongoDB.Collection<mongoDB.Document>): void {
        this.cloudScriptFunctionLogCollection = cloudScriptFunctionLogCollection;
    }

    public run(): void {
        this.loadVersion();
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

    public async executeCloudScriptFunction(userId: string, functionName: string, functionParameters: object, version: string, customTags: { [k: string]: any }): Promise<ExecuteResult> {
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
        }

        cloudScriptWorker.postMessage(cloudScriptRequest);

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
            }, CloudScriptService.ExecuteTimeoutInMs);

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

            await execSync("npx tsc " + filePathTempTs + " --noImplicitAny --allowJs --outDir " + filePathTemp);

            let filePathTempJs = __dirname + "/./GN-startup/cloudScript/temp.js";
            fullScriptJs = fs.readFileSync(filePathTempJs).toString();

            if (canExecute) {
                this.loadCloudScriptFunctionWorker(version, fullScriptJs);
            }
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

    public async editCloudScriptFunction(version: string, isLive: boolean, canExecute: boolean): Promise<{ success: boolean, errorMessage?: string }> {
        let cloudFunction = this.cloudScriptFunctions.find(x => x.version == version);
        if (!cloudFunction) {
            return {
                success: false,
                errorMessage: "version not found"
            }
        }

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
                        cloudScriptWorker.terminate();
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

    private loadCloudScriptFunctionWorkerFromCache(version: string): Worker {
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

    private loadCloudScriptFunctionWorker(version: string, fullScript: string): Worker {
        if (!version) return null;

        let filePath = __dirname + "/./GN-startup/cloudScript/" + version + ".js";
        fs.writeFileSync(filePath, fullScript);

        return this.loadCloudScriptWorker(version);
    }

    private loadCloudScriptWorker(version: string): Worker {
        let filePath = __dirname + "/./GN-startup/cloudScript/" + version + ".js";

        Debug.log("[GN] [CloudScript] run cloudScript " + version);

        let cloudScriptWorker = new Worker(filePath, {
            workerData: {
                gameId: this.gameId,
                gnServerSettingsOptions: this.gnServerSettingsOptions,
                dbConnection: this.dbConnection,
            }
        });

        let thiz = this;
        cloudScriptWorker.on('message', (cloudScriptResponse: CloudScriptResponse) => {
            if (cloudScriptResponse.responseId) {
                let callback = thiz.cloudScriptWaitingResponseCallbackDict.get(cloudScriptResponse.responseId);
                if (callback != null) {
                    callback(cloudScriptResponse);
                }
            }
            else {
                let cloudScriptEvent: CloudScriptEvent = cloudScriptResponse as any;

                let operationEvent = new OperationEvent(cloudScriptEvent.operationEvent.eventCode, cloudScriptEvent.operationEvent.parameters != null ? GNHashtable.builder().addAll(cloudScriptEvent.operationEvent.parameters).build() : null, cloudScriptEvent.operationEvent.encrypted);

                if (cloudScriptEvent.eventType == CloudScriptEventType.SendToUser) {
                    thiz.gnServer.sendEventTo(cloudScriptEvent.receiver as string, operationEvent);
                }
                else if (cloudScriptEvent.eventType == CloudScriptEventType.SendToMore) {
                    thiz.gnServer.sendEventToMoreUser(cloudScriptEvent.receiver as string[], operationEvent);
                }
                else if (cloudScriptEvent.eventType == CloudScriptEventType.SendToAll) {
                    thiz.gnServer.sendEventToAllPlayer(operationEvent);
                }
            }
        });

        cloudScriptWorker.on('exit', (code) => {
            Debug.log("[GN] [CloudScript] terminal cloudScript " + version + " with code " + code);

            thiz.cloudScriptWorkerDict.delete(version);
        });

        this.cloudScriptWorkerDict.set(version, cloudScriptWorker);

        return cloudScriptWorker;
    }
}
