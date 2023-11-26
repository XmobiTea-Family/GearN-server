import { xDataSettings } from "./xDataSettings";
import { xStatisticsSettings } from "./xStatisticsSettings";
import { xTagSettings } from "./xTagSettings";

export interface xInventorySettings {
    inventoryStatisticsSettings: Array<xStatisticsSettings>;
    inventoryDatasSettings: Array<xDataSettings>;
    customDatasSettings: Array<xDataSettings>;
    tagsSettings: Array<xTagSettings>;
}
