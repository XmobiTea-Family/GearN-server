export class xConfigItem {
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
