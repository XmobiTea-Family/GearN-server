export class ConfigItem {
    // Stores the configuration name value used by this instance.
    private configName: string;
    // Stores the label value used by this instance.
    private label: string;
    // Stores the data value used by this instance.
    private data: {};

    /**
     * Initializes a new configuration item instance.
     * @param configName Provides the configuration name value used by this operation.
     * @param label Provides the label value used by this operation.
     * @param data Provides the data value used by this operation.
     */
    constructor(configName: string, label: string, data: {}) {
        this.configName = configName;
        this.label = label;
        this.data = data;
    }

    /**
     * Returns the configuration name.
     * @returns Returns the configuration name.
     */
    public getConfigName(): string {
        return this.configName;
    }

    /**
     * Returns the label.
     * @returns Returns the label.
     */
    public getLabel(): string {
        return this.label;
    }

    /**
     * Returns the data.
     * @returns Returns the data.
     */
    public getData(): {} {
        return this.data;
    }
}

export interface IConfigService {
    /**
     * Executes the sync configuration from database async workflow.
     * @param configName Provides the configuration name value used by this operation.
     * @param label Provides the label value used by this operation.
     * @returns Resolves with the operation result.
     */
    syncConfigFromDatabaseAsync(configName: string, label: string): Promise<ConfigItem>;

    /**
     * Sets the configuration async.
     * @param configName Provides the configuration name value used by this operation.
     * @param label Provides the label value used by this operation.
     * @param data Provides the data value used by this operation.
     * @param withSave Provides the with save value used by this operation.
     * @returns Resolves with the operation result.
     */
    setConfigAsync(configName: string, label: string, data: {}, withSave: boolean): Promise<ConfigItem>;

    /**
     * Returns the configuration item.
     * @param configName Provides the configuration name value used by this operation.
     * @param label Provides the label value used by this operation.
     * @returns Returns the configuration item.
     */
    getConfigItem(configName: string, label: string): ConfigItem;

    /**
     * Returns the configuration dictionary via label.
     * @param label Provides the label value used by this operation.
     * @returns Returns the configuration dictionary via label.
     */
    getConfigDicViaLabel(label: string): Map<string, ConfigItem>;
}
