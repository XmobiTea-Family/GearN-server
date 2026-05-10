import { xDataSettings } from "./xDataSettings";
import { xStatisticsSettings } from "./xStatisticsSettings";
import { xTagSettings } from "./xTagSettings";

export interface xInventorySettings {
    // Stores the item statistics settings value used by this contract.
    itemStatisticsSettings: Array<xStatisticsSettings>;
    // Stores the item datas settings value used by this contract.
    itemDatasSettings: Array<xDataSettings>;
    // Stores the custom datas settings value used by this contract.
    customDatasSettings: Array<xDataSettings>;
    // Stores the tags settings value used by this contract.
    tagsSettings: Array<xTagSettings>;
}
