export class ConfigItem {
	private configName: string;
	private label: string;
	private data: {};

	constructor(configName: string, label: string, data: {}) {
		this.configName = configName;
		this.label = label;
		this.data = data;
	}

	public getConfigName(): string {
		return this.configName;
	}

	public getLabel(): string {
		return this.label;
	}

	public getData(): {} {
		return this.data;
	}
}

export interface IConfigService {
	syncConfigFromDatabaseAsync(configName: string, label: string): Promise<ConfigItem>;

	setConfigAsync(configName: string, label: string, data: {}, withSave: boolean): Promise<ConfigItem>;

	getConfigItem(configName: string, label: string): ConfigItem;

	getConfigDicViaLabel(label: string): Map<string, ConfigItem>;

}
