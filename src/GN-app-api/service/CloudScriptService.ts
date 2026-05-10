import { ExecuteResponseStatus, ExecuteResult, ICloudScriptService } from "./ICloudScriptService";
import { ChildProcess, execFile, fork } from "child_process";
import * as mongodb from "mongodb";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { StringUtility } from "./../../GN-common/helper/StringUtility";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { GNServerSettingsOptions } from "@xmobitea/gearn-typescript-client-sdk";
import { GNServer } from "./../../GNServer";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { CloudScriptEvent } from "./CloudScriptEventService";
import { CloudScriptSecurityValidator } from "./CloudScriptSecurityValidator";

const execFileAsync = promisify(execFile);

interface CloudScriptRequestAuthToken {
    gnAuthToken: string;
}

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

interface CloudScriptResponse extends ExecuteResult {
    // Stores the response ID value used by this contract.
    responseId: string;
}

interface DbConnection {
    // Stores the URL value used by this contract.
    url: string;
    // Stores the database name value used by this contract.
    dbName: string;
    // Stores the log URL value used by this contract.
    logUrl: string;
    // Stores the log database name value used by this contract.
    logDbName: string;
    // Stores the options collection used by this contract.
    options?: { [k: string]: any };
}

export class CloudScriptService implements ICloudScriptService {
    private static readonly MaxFailedToTerminalCloudScript: number = 3;

    // Stores the cloud script worker dict collection used by this instance.
    private cloudScriptWorkerDict: Map<string, ChildProcess>;
    // Stores the cloud script worker failed dict collection used by this instance.
    private cloudScriptWorkerFailedDict: Map<string, number>;
    // Stores the cloud script waiting response callback dict collection used by this instance.
    private cloudScriptWaitingResponseCallbackDict: Map<string, (cloudScriptResponse: CloudScriptResponse) => void>;

    // Stores the latest version value used by this instance.
    private latestVersion: string;
    // Stores the live latest version value used by this instance.
    private liveLatestVersion: string;

    // Stores the cloud script function collection value used by this instance.
    private cloudScriptFunctionCollection: mongodb.Collection<mongodb.Document>;
    // Stores the cloud script function log collection value used by this instance.
    private cloudScriptFunctionLogCollection: mongodb.Collection<mongodb.Document>;

    // Stores the GearN server value used by this instance.
    private gnServer: GNServer;
    // Stores the GearN server settings options value used by this instance.
    private gnServerSettingsOptions: GNServerSettingsOptions;
    // Stores the database connection value used by this instance.
    private dbConnection: DbConnection;
    // Stores the game ID value used by this instance.
    private gameId: string;
    // Stores the execute timeout in milliseconds value used by this instance.
    private executeTimeoutInMs: number;

    // Stores the cloud script functions value used by this instance.
    private cloudScriptFunctions: Array<{
        // Stores the version value used by this contract.
        version: string;
        // Indicates whether execute can be performed.
        canExecute: boolean;
        // Stores the full script value used by this contract.
        fullScript: string;
    }>;

    /**
     * Initializes a new cloud script service instance.
     */
    constructor() {
        this.cloudScriptFunctions = [];
        this.cloudScriptWorkerDict = new Map();
        this.cloudScriptWorkerFailedDict = new Map();
        this.cloudScriptWaitingResponseCallbackDict = new Map();
    }

    /**
     * Executes the init workflow.
     * @param gameId Provides the game ID value used by this operation.
     * @param gnServerSettingsOptions Provides the GearN server settings options value used by this operation.
     * @param dbConnection Provides the database connection value used by this operation.
     * @param gnServer Provides the GearN server value used by this operation.
     * @param executeTimeoutInMs Provides the execute timeout in milliseconds value used by this operation.
     */
    public init(gameId: string, gnServerSettingsOptions: GNServerSettingsOptions, dbConnection: DbConnection, gnServer: GNServer, executeTimeoutInMs: number): void {
        this.gameId = gameId;
        this.gnServerSettingsOptions = gnServerSettingsOptions;
        this.gnServerSettingsOptions.gameId = gameId;
        this.dbConnection = dbConnection;
        this.gnServer = gnServer;
        this.executeTimeoutInMs = executeTimeoutInMs;
    }

    /**
     * Sets the cloud script function collection.
     * @param cloudScriptFunctionCollection Provides the cloud script function collection used by this operation.
     */
    public setCloudScriptFunctionCollection(cloudScriptFunctionCollection: mongodb.Collection<mongodb.Document>): void {
        this.cloudScriptFunctionCollection = cloudScriptFunctionCollection;
    }

    /**
     * Sets the cloud script function log collection.
     * @param cloudScriptFunctionLogCollection Provides the cloud script function log collection used by this operation.
     */
    public setCloudScriptFunctionLogCollection(cloudScriptFunctionLogCollection: mongodb.Collection<mongodb.Document>): void {
        this.cloudScriptFunctionLogCollection = cloudScriptFunctionLogCollection;
    }

    /**
     * Runs the current workflow.
     */
    public run(): void {
        this.loadVersion();

        // Stores the thiz value used in the current execution flow.
        let thiz = this;
        this.gnServer
            .getHttpApp()
            .getClusterHandler()
            .onEvent("addCloudScriptFunction", (data) => {
                if (data.gameId != thiz.gameId) return;

                thiz.remoteAddCloudScriptFunction(data);
            });

        this.gnServer
            .getHttpApp()
            .getClusterHandler()
            .onEvent("editCloudScriptFunction", (data) => {
                if (data.gameId != thiz.gameId) return;

                thiz.remoteEditCloudScriptFunction(data);
            });
    }

    /**
     * Loads the version.
     */
    private async loadVersion(): Promise<void> {
        // Stores the cloud script function results value used in the current execution flow.
        let cloudScriptFunctionResults = await this.cloudScriptFunctionCollection.find(
            {},
            {
                sort: {
                    _id: -1,
                },
                projection: {
                    version: true,
                    isLive: true,
                    canExecute: true,
                    fullScript: true,
                },
            },
        );

        while (await cloudScriptFunctionResults.hasNext()) {
            // Stores the cloud script function result value used in the current execution flow.
            let cloudScriptFunctionResult = await cloudScriptFunctionResults.next();
            if (!this.latestVersion) this.latestVersion = cloudScriptFunctionResult["version"];

            this.cloudScriptFunctions.push({
                version: cloudScriptFunctionResult["version"],
                canExecute: cloudScriptFunctionResult["canExecute"],
                fullScript: cloudScriptFunctionResult["fullScript"],
            });

            if (cloudScriptFunctionResult.isLive) {
                this.liveLatestVersion = cloudScriptFunctionResult["version"];

                if (cloudScriptFunctionResult.canExecute) await this.loadCloudScriptFunctionWorker(this.liveLatestVersion, cloudScriptFunctionResult["fullScript"]);
            }
        }
    }

    /**
     * Executes the cloud script function.
     * @param userId Indicates whether r ID should be used.
     * @param functionName Provides the function name value used by this operation.
     * @param functionParameters Provides the function parameters value used by this operation.
     * @param version Provides the version value used by this operation.
     * @param customTags Provides the custom tags value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async executeCloudScriptFunction(userId: string, functionName: string, functionParameters: any, version: string, customTags: { [k: string]: any }): Promise<ExecuteResult> {
        if (!version) version = this.liveLatestVersion;

        // Stores the cloud script worker value used in the current execution flow.
        let cloudScriptWorker = await this.loadCloudScriptFunctionWorkerFromCache(version);

        if (cloudScriptWorker == null) {
            return {
                response: {
                    result: null,
                    status: ExecuteResponseStatus.VersionInvalid,
                    errorMessage: "version not found",
                },
                stats: null,
                logs: [],
            };
        }

        // Stores the timestamp create value used in the current execution flow.
        let tsCreate = xDatetime.getCurrentMilliseconds();

        // Stores the request ID value used in the current execution flow.
        let requestId = StringUtility.generateRandomString(10, 0);

        // Stores the cloud script request value used in the current execution flow.
        let cloudScriptRequest: CloudScriptRequest = {
            requestId: requestId,
            name: functionName,
            userId: userId,
            parameters: functionParameters,
            customTags: customTags,
            context: {},
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

                let nextFailedCount = (thiz.cloudScriptWorkerFailedDict.get(version) ?? 0) + 1;
                thiz.cloudScriptWorkerFailedDict.set(version, nextFailedCount);

                if (nextFailedCount >= CloudScriptService.MaxFailedToTerminalCloudScript) {
                    // Drop the poisoned worker so the next execute can spawn a fresh child process.
                    thiz.recycleCloudScriptWorker(version, cloudScriptWorker);
                }

                resolve({
                    responseId: requestId,
                    response: {
                        status: ExecuteResponseStatus.Timeout,
                        errorMessage: "function execute timeout",
                        result: null,
                    },
                    stats: null,
                    logs: [],
                });
            }, thiz.executeTimeoutInMs);

            thiz.cloudScriptWaitingResponseCallbackDict.set(requestId, (cloudScriptResponse: CloudScriptResponse) => {
                if (isResolved) return;
                isResolved = true;

                thiz.cloudScriptWorkerFailedDict.set(version, 0);

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
            logs: cloudScriptResponse.logs,
        };
    }

    /**
     * Adds the cloud script function.
     * @param script Provides the script value used by this operation.
     * @param isLive Indicates whether live.
     * @param canExecute Indicates whether execute can be performed.
     * @returns Resolves with the operation result.
     */
    public async addCloudScriptFunction(script: string, isLive: boolean, canExecute: boolean): Promise<{ success: boolean; errorMessage?: string; version?: string }> {
        let validationResult = CloudScriptSecurityValidator.validateFunctionScript(script);
        if (!validationResult.success) {
            return {
                success: false,
                errorMessage: validationResult.errorMessage,
            };
        }

        let normalizedScript = validationResult.normalizedScript;

        // Stores the version value used in the current execution flow.
        let version = StringUtility.generateRandomString(7, 0);

        // Stores the full script js value used in the current execution flow.
        let fullScriptJs: string;

        try {
            fullScriptJs = await this.compileCloudScript(normalizedScript, version);
        } catch (err) {
            return {
                success: false,
                errorMessage: this.getErrorMessage(err),
            };
        }

        if (!fullScriptJs) {
            return {
                success: false,
                errorMessage: "compile error",
            };
        }

        this.gnServer.getHttpApp().getClusterHandler().sendEvent("addCloudScriptFunction", { version: version, fullScriptJs: fullScriptJs, canExecute: canExecute, isLive: isLive, gameId: this.gameId }, false);

        if (canExecute) {
            await this.loadCloudScriptFunctionWorker(version, fullScriptJs);
        }

        if (isLive) {
            await this.cloudScriptFunctionCollection.updateMany(
                { isLive: true },
                {
                    $set: {
                        isLive: false,
                    },
                },
            );

            this.liveLatestVersion = version;
        }

        await this.cloudScriptFunctionCollection.insertOne({
            version: version,
            script: normalizedScript,
            fullScript: fullScriptJs,
            canExecute: canExecute,
            isLive: isLive,
            tsCreate: xDatetime.getCurrentMilliseconds(),
        });

        this.latestVersion = version;

        this.cloudScriptFunctions.unshift({
            version: version,
            canExecute: canExecute,
            fullScript: fullScriptJs,
        });

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
        let templateCloudScriptPath = path.join(cloudScriptDirectoryPath, "templateCloudScript.ts");
        let compileId = version + "_" + StringUtility.generateRandomString(10, 0);
        let tempTsFilePath = path.join(cloudScriptDirectoryPath, compileId + ".ts");
        let tempJsFilePath = path.join(cloudScriptDirectoryPath, compileId + ".js");

        try {
            let templateCloudScript = await fs.promises.readFile(templateCloudScriptPath, "utf8");
            let fullScriptTs = templateCloudScript.replace("//$replaceScript", script);

            await fs.promises.writeFile(tempTsFilePath, fullScriptTs, "utf8");
            // tsc ignores project config when a file path is passed, so keep helper classes native.
            await execFileAsync("npx", ["tsc", tempTsFilePath, "--target", "ES2022", "--module", "commonjs", "--moduleResolution", "node", "--allowJs", "--skipLibCheck", "--esModuleInterop", "--experimentalDecorators", "--emitDecoratorMetadata", "--outDir", cloudScriptDirectoryPath], { windowsHide: true, shell: process.platform == "win32" });
            // await execFileAsync("npx tsc " + tempTsFilePath + " --allowJs --skipLibCheck --outDir " + tempJsFilePath);
            return await fs.promises.readFile(tempJsFilePath, "utf8");
        } catch (err) {
            Debug.logError("[GearN] [CloudScriptService] error when compileCloudScript " + err.message);
            return null;
        } finally {
            try {
                await fs.promises.rm(tempTsFilePath, { force: true });
            } catch {}
            try {
                await fs.promises.rm(tempJsFilePath, { force: true });
            } catch {}
        }
    }

    /**
     * Normalizes unknown error values into a readable message.
     * @param err Provides the error value used by this operation.
     * @returns Returns the error message.
     */
    private getErrorMessage(err: unknown): string {
        if (err instanceof Error) {
            let execError = err as Error & { stderr?: string | Buffer; stdout?: string | Buffer };

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
     * Executes the remote add cloud script function workflow asynchronously.
     * @param request Provides the request value used by this operation.
     */
    private async remoteAddCloudScriptFunction(request: { version: string; fullScriptJs: string; canExecute: boolean; isLive: boolean }) {
        // Stores the version value used in the current execution flow.
        let version = request.version;
        // Tracks whether execute can be performed.
        let canExecute = request.canExecute;
        // Stores the full script js value used in the current execution flow.
        let fullScriptJs = request.fullScriptJs;
        // Tracks whether live.
        let isLive = request.isLive;

        if (canExecute) {
            await this.loadCloudScriptFunctionWorker(version, fullScriptJs);
        }

        if (isLive) {
            this.liveLatestVersion = version;
        }

        this.latestVersion = version;

        this.cloudScriptFunctions.unshift({
            version: version,
            canExecute: canExecute,
            fullScript: fullScriptJs,
        });
    }

    /**
     * Executes the remote edit cloud script function workflow asynchronously.
     * @param request Provides the request value used by this operation.
     */
    private async remoteEditCloudScriptFunction(request: { version: string; isLive: boolean; canExecute: boolean }) {
        // Stores the version value used in the current execution flow.
        let version = request.version;
        // Tracks whether execute can be performed.
        let canExecute = request.canExecute;
        // Tracks whether live.
        let isLive = request.isLive;

        // Stores the cloud function value used in the current execution flow.
        let cloudFunction = this.cloudScriptFunctions.find((x) => x.version == version);
        if (!cloudFunction) {
            return;
        }

        cloudFunction.canExecute = canExecute;

        if (isLive) {
            if (this.liveLatestVersion != version) {
                this.liveLatestVersion = version;
            }
        } else {
            if (this.liveLatestVersion == version) {
                this.liveLatestVersion = null;
            }
        }

        if (!canExecute) {
            // Stores the cloud script worker value used in the current execution flow.
            let cloudScriptWorker = this.cloudScriptWorkerDict.get(version);
            if (cloudScriptWorker) {
                this.cloudScriptWorkerDict.delete(version);
                this.cloudScriptWorkerFailedDict.delete(version);

                setTimeout(() => {
                    if (!this.cloudScriptWorkerDict.has(version) && cloudScriptWorker) {
                        cloudScriptWorker.kill("SIGKILL");
                    }
                }, 20000);
            }
        }
    }

    /**
     * Executes the edit cloud script function workflow asynchronously.
     * @param version Provides the version value used by this operation.
     * @param isLive Indicates whether live.
     * @param canExecute Indicates whether execute can be performed.
     * @returns Resolves with the operation result.
     */
    public async editCloudScriptFunction(version: string, isLive: boolean, canExecute: boolean): Promise<{ success: boolean; errorMessage?: string }> {
        // Stores the cloud function value used in the current execution flow.
        let cloudFunction = this.cloudScriptFunctions.find((x) => x.version == version);
        if (!cloudFunction) {
            return {
                success: false,
                errorMessage: "version not found",
            };
        }

        this.gnServer.getHttpApp().getClusterHandler().sendEvent("editCloudScriptFunction", { version: version, canExecute: canExecute, isLive: isLive, gameId: this.gameId }, false);

        cloudFunction.canExecute = canExecute;

        await this.cloudScriptFunctionCollection.updateOne(
            {
                version: version,
            },
            {
                $set: {
                    isLive: isLive,
                    canExecute: canExecute,
                },
            },
        );

        if (isLive) {
            if (this.liveLatestVersion != version) {
                if (this.liveLatestVersion) {
                    await this.cloudScriptFunctionCollection.updateOne(
                        {
                            version: this.liveLatestVersion,
                        },
                        {
                            $set: {
                                isLive: false,
                            },
                        },
                    );
                }

                this.liveLatestVersion = version;
            }
        } else {
            if (this.liveLatestVersion == version) {
                this.liveLatestVersion = null;
            }
        }

        if (!canExecute) {
            // Stores the cloud script worker value used in the current execution flow.
            let cloudScriptWorker = this.cloudScriptWorkerDict.get(version);
            if (cloudScriptWorker) {
                // doi 1 lat cho khong con ai thuc thi nua thi thuc hien terminate
                this.cloudScriptWorkerDict.delete(version);
                this.cloudScriptWorkerFailedDict.delete(version);

                setTimeout(() => {
                    if (!this.cloudScriptWorkerDict.has(version) && cloudScriptWorker) {
                        cloudScriptWorker.kill("SIGKILL");
                    }
                }, 20000);
            }
        }

        return {
            success: true,
        };
    }

    /**
     * Returns the cloud script functions.
     * @returns Returns the cloud script functions.
     */
    public getCloudScriptFunctions(): Array<{
        // Stores the version value used by this contract.
        version: string;
        // Indicates whether execute can be performed.
        canExecute: boolean;
    }> {
        return this.cloudScriptFunctions;
    }

    /**
     * Returns the cloud script function.
     * @param version Provides the version value used by this operation.
     * @returns Returns the cloud script function.
     */
    public async getCloudScriptFunction(version: string): Promise<{
        // Stores the script value used by this contract.
        script: string;
        // Indicates whether execute can be performed.
        canExecute: boolean;
        // Indicates whether live.
        isLive: boolean;
        // Stores the timestamp create value used by this contract.
        tsCreate: number;
    }> {
        // Stores the cloud script function result value used in the current execution flow.
        let cloudScriptFunctionResult = await this.cloudScriptFunctionCollection.findOne(
            { version: version },
            {
                projection: {
                    script: true,
                    canExecute: true,
                    isLive: true,
                    tsCreate: true,
                },
            },
        );

        if (!cloudScriptFunctionResult) return null;
        return {
            script: cloudScriptFunctionResult["script"],
            canExecute: cloudScriptFunctionResult["canExecute"],
            isLive: cloudScriptFunctionResult["isLive"],
            tsCreate: cloudScriptFunctionResult["tsCreate"],
        };
    }

    /**
     * Returns the latest version.
     * @returns Returns the latest version.
     */
    public getLatestVersion(): string {
        return this.latestVersion;
    }

    /**
     * Returns the live latest version.
     * @returns Returns the live latest version.
     */
    public getLiveLatestVersion(): string {
        return this.liveLatestVersion;
    }

    /**
     * Loads the cloud script function worker from cache.
     * @param version Provides the version value used by this operation.
     * @returns Returns the operation result.
     */
    private async loadCloudScriptFunctionWorkerFromCache(version: string): Promise<ChildProcess> {
        if (!version) return null;

        // Stores the cloud script worker value used in the current execution flow.
        let cloudScriptWorker = this.cloudScriptWorkerDict.get(version);
        if (cloudScriptWorker == null) {
            // Stores the cloud function value used in the current execution flow.
            let cloudFunction = this.cloudScriptFunctions.find((x) => x.version == version);

            if (cloudFunction == null) return null;
            if (!cloudFunction.canExecute) return null;

            return await this.loadCloudScriptFunctionWorker(version, cloudFunction.fullScript);
        }

        let currentMillseconds = xDatetime.getCurrentMilliseconds();

        if (cloudScriptWorker.nextRefreshAuthToken < currentMillseconds) {
            let cloudScriptUserId = "c_" + version + "_" + StringUtility.generateRandomString(10, 0);

            let cloudScriptRequestAuthToken: CloudScriptRequestAuthToken = {
                gnAuthToken: (
                    await this.gnServer.getApiMiddleware().generateAuthInfoForCloudScript(
                        {
                            userId: cloudScriptUserId,
                            secretKey: this.gnServerSettingsOptions.secretKey,
                            gnToken: null,
                        },
                        xDatetime.ONE_HOUR_MILLISECOND,
                    )
                ).getAuthToken(),
            };

            cloudScriptWorker.send(cloudScriptRequestAuthToken);

            cloudScriptWorker.nextRefreshAuthToken = currentMillseconds + 59 * 60 * 1000;
            cloudScriptWorker.cloudScriptUserId = cloudScriptUserId;
        }

        return cloudScriptWorker;
    }

    /**
     * Loads the cloud script function worker.
     * @param version Provides the version value used by this operation.
     * @param fullScript Provides the full script value used by this operation.
     * @returns Returns the operation result.
     */
    private async loadCloudScriptFunctionWorker(version: string, fullScript: string): Promise<ChildProcess> {
        if (!version) return null;

        // Stores the file path value used in the current execution flow.
        let filePath = __dirname + "/./GN-startup/cloudScript/" + version + ".js";
        fs.writeFileSync(filePath, fullScript);

        return await this.loadCloudScriptWorker(version);
    }

    /**
     * Loads the cloud script worker.
     * @param version Provides the version value used by this operation.
     * @returns Returns the operation result.
     */
    private async loadCloudScriptWorker(version: string): Promise<ChildProcess> {
        // Stores the file path value used in the current execution flow.
        let filePath = __dirname + "/./GN-startup/cloudScript/" + version + ".js";

        Debug.log("[GearN] [CloudScript] run cloudScript " + version);

        let cloudScriptUserId = "c_" + version + "_" + StringUtility.generateRandomString(10, 0);

        // Stores the cloud script worker value used in the current execution flow.
        let cloudScriptWorker = fork(filePath, {
            env: {
                gameId: this.gameId,
                gnServerSettingsOptions: JSON.stringify(this.gnServerSettingsOptions),
                dbConnection: JSON.stringify(this.dbConnection),
                gnAuthToken: (
                    await this.gnServer.getApiMiddleware().generateAuthInfoForCloudScript(
                        {
                            secretKey: this.gnServerSettingsOptions.secretKey,
                            userId: cloudScriptUserId,
                            gnToken: null,
                        },
                        xDatetime.ONE_HOUR_MILLISECOND,
                    )
                ).getAuthToken(),
            },
        });

        cloudScriptWorker.nextRefreshAuthToken = xDatetime.getCurrentMilliseconds() + 59 * 60 * 1000;
        cloudScriptWorker.cloudScriptUserId = cloudScriptUserId;

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
            Debug.log("[GearN] [CloudScript] terminal cloudScript " + version + " with code " + code);

            if (thiz.cloudScriptWorkerDict.get(version) === cloudScriptWorker) {
                thiz.cloudScriptWorkerDict.delete(version);
                thiz.cloudScriptWorkerFailedDict.delete(version);
            }

            if (cloudScriptWorker.cloudScriptUserId) this.gnServer.getApiMiddleware().removeAllAuthInfosInDb(cloudScriptWorker.cloudScriptUserId);
        });

        this.cloudScriptWorkerDict.set(version, cloudScriptWorker);
        this.cloudScriptWorkerFailedDict.set(version, 0);

        return cloudScriptWorker;
    }

    /**
     * Removes the timed-out worker from cache and terminates it.
     * @param version Provides the version value used by this operation.
     * @param cloudScriptWorker Provides the worker value used by this operation.
     */
    private recycleCloudScriptWorker(version: string, cloudScriptWorker: ChildProcess): void {
        if (!cloudScriptWorker) {
            return;
        }

        if (this.cloudScriptWorkerDict.get(version) === cloudScriptWorker) {
            this.cloudScriptWorkerDict.delete(version);

            this.cloudScriptWorkerFailedDict.delete(version);
        }

        if (!cloudScriptWorker.killed) {
            try {
                cloudScriptWorker.kill("SIGKILL");
            } catch {}
        }
    }
}
