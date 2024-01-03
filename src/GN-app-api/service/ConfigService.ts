import { Debug } from "../../GN-library/xdebug/lib/xDebug";
import { IConfigService, ConfigItem } from "./IConfigService";
import * as mongoDB from "mongodb";

export class ConfigService implements IConfigService {
    private configDic: Map<string, Map<string, ConfigItem>> = new Map();

	private gameId: string;
	private configCollection: mongoDB.Collection<mongoDB.Document>;

	public setConfigCollection(gameId: string, configCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.gameId = gameId;
		this.configCollection = configCollection;
	}

	public run(): void {
		this.syncAllConfigAsync();
	}

	private async syncAllConfigAsync(): Promise<void> {
		let results = await this.configCollection.find({});

		while (await results.hasNext()) {
			let result = await results.next();

			let configName = result["configName"];
			let label = result["label"];
			let data = result["data"];

			let configItem = new ConfigItem(configName, label, data);

			if (!this.configDic.has(label)) {
				this.configDic.set(label, new Map());
			}

			let configDic2 = this.configDic.get(label);
			configDic2.set(configName, configItem);

			Debug.log("Update success local config " + configName + " with label " + label + " on " + this.gameId);
		}
	}

	public async syncConfigFromDatabaseAsync(configName: string, label: string): Promise<ConfigItem> {
		let result = await this.configCollection.findOne({ configName: configName, label: label });
		if (result == null) {
			Debug.logError("Can not found " + configName);
			return null;
		}

		let data = result["Data"];

		let configItem = new ConfigItem(configName, label, data);

		if (!this.configDic.has(label)) {
			this.configDic.set(label, new Map());
		}

		let configDic2 = this.configDic.get(label);
		configDic2.set(configName, configItem);

		Debug.log("Update success local config " + configName + " on " + this.gameId);
		return configItem;
	}

	public async setConfigAsync(configName: string, label: string, data: {}, withSave: boolean): Promise<ConfigItem> {
		let configItem = new ConfigItem(configName, label, data);

		if (!this.configDic.has(label)) {
			this.configDic.set(label, new Map());
		}

		let configDic2 = this.configDic.get(label);

		if (data == null) {
			configDic2.delete(configName);

			if (withSave) this.configCollection.deleteOne({ configName: configName, label: label });
		}
		else {
			configDic2.set(configName, configItem);

			if (withSave) this.configCollection.updateOne({ configName: configName, label: label }, {
				$set: {
					"data": data
				}
			},
			{
				upsert: true
			});
		}

		Debug.log("Update success online config " + configName + " on " + this.gameId);

		return configItem;
	}

	public getConfigItem(configName: string, label: string): ConfigItem {
		if (!this.configDic.has(label)) {
			return null;
		}

		let configDic2 = this.configDic.get(label);

		if (!configDic2.has(configName)) {
			return null;
		}

		let configItem = configDic2.get(configName);
		return configItem;
	}

	public getConfigDicViaLabel(label: string): Map<string, ConfigItem> {
		if (!this.configDic.has(label)) {
			this.configDic.set(label, new Map());
		}

		return this.configDic.get(label);
	}
}
