import { xDataSettings } from "./xDataSettings";
import { xStatisticsSettings } from "./xStatisticsSettings";
import { xTagSettings } from "./xTagSettings";

export interface xInventorySettings {
	itemStatisticsSettings: Array<xStatisticsSettings>;
	itemDatasSettings: Array<xDataSettings>;
	customDatasSettings: Array<xDataSettings>;
	tagsSettings: Array<xTagSettings>;
}
