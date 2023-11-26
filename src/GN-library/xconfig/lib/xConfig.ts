import { xConfigItem } from "./entity/xConfigItem";
import * as mongoDB from "mongodb";
import { OnRunSuccess } from "./../../xbuilder/lib/OnRunSuccess";
import { Debug } from "./../../xdebug/lib/xDebug";

export class xConfig {
	private configDic: Map<string, Map<string, xConfigItem>> = new Map();

	private gameId: string;
	private configCollection: mongoDB.Collection<mongoDB.Document>;

	public setConfigCollection(gameId: string, configCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.gameId = gameId;
		this.configCollection = configCollection;
	}

	public run(onRunSuccess?: OnRunSuccess): void {
		this.syncAllConfigAsync();

		if (onRunSuccess != null) onRunSuccess();
	}

	public async syncAllConfigAsync(): Promise<void> {
		let results = await this.configCollection.find({});

		while (await results.hasNext()) {
			let result = await results.next();

			let configName = result["configName"];
			let label = result["label"];
			let data = result["data"];

			let configItem = new xConfigItem(configName, label, data);

			if (!this.configDic.has(label)) {
				this.configDic.set(label, new Map());
			}

			let configDic2 = this.configDic.get(label);
			configDic2.set(configName, configItem);

			Debug.log("Update success local config " + configName + " with label " + label + " on " + this.gameId);
		}
	}

	public async syncConfigFromDatabaseAsync(configName: string, label: string): Promise<xConfigItem> {
		let result = await this.configCollection.findOne({ configName: configName, label: label });
		if (result == null) {
			Debug.logError("Can not found " + configName);
			return null;
		}

		let data = result["Data"];

		let configItem = new xConfigItem(configName, label, data);

		if (!this.configDic.has(label)) {
			this.configDic.set(label, new Map());
		}

		let configDic2 = this.configDic.get(label);
		configDic2.set(configName, configItem);

		Debug.log("Update success local config " + configName + " on " + this.gameId);
		return configItem;
	}

	public async setConfigAsync(configName: string, label: string, data: {}): Promise<xConfigItem> {
		let configItem = new xConfigItem(configName, label, data);

		if (!this.configDic.has(label)) {
			this.configDic.set(label, new Map());
		}

		let configDic2 = this.configDic.get(label);

		if (data == null) {
			configDic2.delete(configName);

			this.configCollection.deleteOne({ configName: configName, label: label });
		}
		else {
			configDic2.set(configName, configItem);

			this.configCollection.updateOne({ configName: configName, label: label }, {
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

	public getConfigItem(configName: string, label: string): xConfigItem {
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

	public getConfigDicViaLabel(label: string): Map<string, xConfigItem> {
		if (!this.configDic.has(label)) {
			this.configDic.set(label, new Map());
		}

		return this.configDic.get(label);
	}
}
