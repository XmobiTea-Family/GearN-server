import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { IConfigService, ConfigItem } from "./IConfigService";
import * as mongodb from "mongodb";

export class ConfigService implements IConfigService {
    // Stores the configuration dictionary collection used by this instance.
    private readonly configDic: Map<string, Map<string, ConfigItem>> = new Map();

    private readonly configDocumentDic: Map<string, { label: string, configName: string, }> = new Map();

    // Stores the game ID value used by this instance.
    private gameId: string;
    // Stores the configuration collection value used by this instance.
    private configCollection: mongodb.Collection<mongodb.Document>;

    private intervalId: NodeJS.Timeout;

    /**
     * Sets the configuration collection.
     * @param gameId Provides the game ID value used by this operation.
     * @param configCollection Provides the configuration collection used by this operation.
     */
    public setConfigCollection(gameId: string, configCollection: mongodb.Collection<mongodb.Document>): void {
        this.gameId = gameId;
        this.configCollection = configCollection;
    }

    /**
     * Runs the current workflow.
     */
    public run(): void {
        this.syncAllConfigAsync();
        this.startStreamWatch();

        // this.intervalId = setInterval(() => {
        //     try {
        //         this.syncAllConfigAsync(false);
        //     } catch (error) {
        //         Debug.logError("Sync all config error on " + this.gameId + " with error " + error);
        //     } finally {
        //     }
        // }, 120000);
    }

    private startStreamWatch() {
        const thiz = this;

        const startWatch = () => {
            Debug.log("[GearN] [ConfigService] stream start on collection: " + this.configCollection.collectionName);

            const stream = thiz.configCollection.watch([
                {
                    $match: {
                        operationType: {
                            $in: [
                                "insert",
                                "update",
                                "replace",
                                "delete"
                            ]
                        }
                    }
                }
            ], {
                fullDocument: "updateLookup"
            });

            stream.on("change", (change) => {
                if (change.operationType == "delete") {
                    let configDocument = thiz.configDocumentDic.get(change._id.toString());

                    if (!configDocument) return;

                    let label = configDocument.label;
                    let configName = configDocument.configName;

                    if (!thiz.configDic.has(label)) {
                        return;
                    }

                    // Stores the configuration dictionary 2 value used in the current execution flow.
                    let configDic2 = thiz.configDic.get(label);
                    configDic2.delete(configName);

                    Debug.log("[GearN] [ConfigService] stream delete online config " + configName + " on " + thiz.gameId);
                }
                else if (change.operationType == "insert" || change.operationType == "update" || change.operationType == "replace") {
                    // Stores the configuration name value used in the current execution flow.
                    let configName = change.fullDocument["configName"];
                    // Stores the label value used in the current execution flow.
                    let label = change.fullDocument["label"];
                    // Stores the data value used in the current execution flow.
                    let data = change.fullDocument["data"];

                    // Stores the configuration item value used in the current execution flow.
                    let configItem = new ConfigItem(configName, label, data);

                    if (!thiz.configDic.has(label)) {
                        thiz.configDic.set(label, new Map());
                    }

                    // Stores the configuration dictionary 2 value used in the current execution flow.
                    let configDic2 = thiz.configDic.get(label);
                    configDic2.set(configName, configItem);

                    thiz.configDocumentDic.set(change._id.toString(), { label: label, configName: configName });

                    Debug.log("[GearN] [ConfigService] stream update online config " + configName + " on " + thiz.gameId);
                }
            });

            stream.on("error", (err) => {
                Debug.logError("[GearN] [ConfigService] stream error: " + err.message);

                stream.close();

                setTimeout(() => {
                    startWatch();
                }, 1000);
            });
        };

        startWatch();
    }

    public stop(): void {
        if (this.intervalId) clearInterval(this.intervalId);
    }

    /**
     * Executes the sync all configuration async workflow asynchronously.
     */
    private async syncAllConfigAsync(): Promise<void> {
        // Stores the results value used in the current execution flow.
        let results = await this.configCollection.find({});

        while (await results.hasNext()) {
            // Stores the result value used in the current execution flow.
            let result = await results.next();

            // Stores the configuration name value used in the current execution flow.
            let configName = result["configName"];
            // Stores the label value used in the current execution flow.
            let label = result["label"];
            // Stores the data value used in the current execution flow.
            let data = result["data"];

            this.configDocumentDic.set(result["_id"].toString(), { label: label, configName: configName });

            // Stores the configuration item value used in the current execution flow.
            let configItem = new ConfigItem(configName, label, data);

            if (!this.configDic.has(label)) {
                this.configDic.set(label, new Map());
            }

            // Stores the configuration dictionary 2 value used in the current execution flow.
            let configDic2 = this.configDic.get(label);
            configDic2.set(configName, configItem);

            Debug.log("Update success local config " + configName + " with label " + label + " on " + this.gameId);
        }
    }

    /**
     * Executes the sync configuration from database async workflow asynchronously.
     * @param configName Provides the configuration name value used by this operation.
     * @param label Provides the label value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async syncConfigFromDatabaseAsync(configName: string, label: string): Promise<ConfigItem> {
        // Stores the result value used in the current execution flow.
        let result = await this.configCollection.findOne({ configName: configName, label: label });
        if (result == null) {
            Debug.logError("Can not found " + configName);
            return null;
        }

        // Stores the data value used in the current execution flow.
        let data = result["data"];

        // Stores the configuration item value used in the current execution flow.
        let configItem = new ConfigItem(configName, label, data);

        if (!this.configDic.has(label)) {
            this.configDic.set(label, new Map());
        }

        // Stores the configuration dictionary 2 value used in the current execution flow.
        let configDic2 = this.configDic.get(label);
        configDic2.set(configName, configItem);

        Debug.log("Update success local config " + configName + " on " + this.gameId);
        return configItem;
    }

    /**
     * Sets the configuration async.
     * @param configName Provides the configuration name value used by this operation.
     * @param label Provides the label value used by this operation.
     * @param data Provides the data value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async setConfigAsync(configName: string, label: string, data: {}): Promise<ConfigItem> {
        // Stores the configuration item value used in the current execution flow.
        let configItem = new ConfigItem(configName, label, data);

        if (!this.configDic.has(label)) {
            this.configDic.set(label, new Map());
        }

        // Stores the configuration dictionary 2 value used in the current execution flow.
        let configDic2 = this.configDic.get(label);

        if (data == null) {
            configDic2.delete(configName);

            this.configCollection.deleteOne({ configName: configName, label: label });

            Debug.log("Delete success online config " + configName + " on " + this.gameId);
        } else {
            configDic2.set(configName, configItem);

            this.configCollection.updateOne(
                { configName: configName, label: label },
                {
                    $set: {
                        data: data,
                    },
                },
                {
                    upsert: true,
                },
            );

            Debug.log("Update success online config " + configName + " on " + this.gameId);
        }

        return configItem;
    }

    /**
     * Returns the configuration item.
     * @param configName Provides the configuration name value used by this operation.
     * @param label Provides the label value used by this operation.
     * @returns Returns the configuration item.
     */
    public getConfigItem(configName: string, label: string): ConfigItem {
        if (!this.configDic.has(label)) {
            return null;
        }

        // Stores the configuration dictionary 2 value used in the current execution flow.
        let configDic2 = this.configDic.get(label);

        if (!configDic2.has(configName)) {
            return null;
        }

        // Stores the configuration item value used in the current execution flow.
        let configItem = configDic2.get(configName);
        return configItem;
    }

    /**
     * Returns the configuration dictionary via label.
     * @param label Provides the label value used by this operation.
     * @returns Returns the configuration dictionary via label.
     */
    public getConfigDicViaLabel(label: string): Map<string, ConfigItem> {
        if (!this.configDic.has(label)) {
            this.configDic.set(label, new Map());
        }

        return this.configDic.get(label);
    }
}
