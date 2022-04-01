import { xConfigItem } from "./entity/xConfigItem";
import * as mongoDB from "mongodb";

export class xConfig {
    private configDic: { [k: string]: xConfigItem } = {};
    private configCollection: mongoDB.Collection<mongoDB.Document>;

    public init(configCollection: mongoDB.Collection<mongoDB.Document>) {
        this.configCollection = configCollection;
    }

    public run() {
        this.syncAllConfig();
    }

    public async syncAllConfig(): Promise<void> {
        let results = await this.configCollection.find();

        while (results.hasNext()) {
            let result = await results.next();
            let configName = result["ConfigName"];
            if (!configName) {
                console.error("ConfigName null at " + result);
            }
            else {
                let configItem = new xConfigItem(result);
                this.configDic[configName] = configItem;

                console.log("Update success config " + configName);
            }
        }

        results.hasNext
    }

    public async syncConfig(configName: string): Promise<xConfigItem> {
        let result = await this.configCollection.findOne({"ConfigName": configName});
        if (result == null) {
            console.error("Can not found " + configName);
            return null;
        }

        let configItem = new xConfigItem(result);
        this.configDic[configName] = configItem;

        console.log("Update success config " + configName);
        return configItem;
    }

    public getConfig(configName: string): xConfigItem {
        return this.configDic[configName];
    }
}
