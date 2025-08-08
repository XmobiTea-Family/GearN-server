import { xCurrencySettings } from "./xCurrencySettings";
import { xDataSettings } from "./xDataSettings";
import { xItemCatalogSettings } from "./xItemCatalogSettings";
import { xStatisticsSettings } from "./xStatisticsSettings";
import { xTagSettings } from "./xTagSettings";

export interface xGroupSettings {
	groupCurrencySettings: Array<xCurrencySettings>;
	groupStatisticsSettings: Array<xStatisticsSettings>;
	groupDatasSettings: Array<xDataSettings>;
	customDatasSettings: Array<xDataSettings>;
	tagsSettings: Array<xTagSettings>;
	groupItemCatalogSettings: Array<xItemCatalogSettings>;
}
