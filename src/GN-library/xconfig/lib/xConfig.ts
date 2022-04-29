import { xConfigItem } from "./entity/xConfigItem";
import * as mongoDB from "mongodb";
import { OnRunSuccess } from "./../../xbuilder/lib/OnRunSuccess";
import { Debug } from "./../../xdebug/lib/xDebug";

export class xConfig {
	private configDic: { [k: string]: xConfigItem } = {};
	private configCollection: mongoDB.Collection<mongoDB.Document>;

	public setConfigCollection(configCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.configCollection = configCollection;
	}

	public run(onRunSuccess?: OnRunSuccess): void {
		this.syncAllConfig();

		if (onRunSuccess != null) onRunSuccess();
	}

	public async syncAllConfig(): Promise<void> {
		let results = await this.configCollection.find();

		while (await results.hasNext()) {
			let result = await results.next();
			let configName = result["ConfigName"];
			if (!configName) {
				Debug.logError("ConfigName null at " + result);
			} else {
				let configItem = new xConfigItem(result);
				this.configDic[configName] = configItem;

				Debug.log("Update success config " + configName);
			}
		}

		results.hasNext;
	}

	public async syncConfig(configName: string): Promise<xConfigItem> {
		let result = await this.configCollection.findOne({ ConfigName: configName });
		if (result == null) {
			Debug.logError("Can not found " + configName);
			return null;
		}

		let configItem = new xConfigItem(result);
		this.configDic[configName] = configItem;

		Debug.log("Update success config " + configName);
		return configItem;
	}

	public getConfig(configName: string): xConfigItem {
		return this.configDic[configName];
	}
}
