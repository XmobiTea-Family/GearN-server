import { xCurrencySettings } from "./xCurrencySettings";
import { xDataSettings } from "./xDataSettings";
import { xItemCatalogSettings } from "./xItemCatalogSettings";
import { xStatisticsSettings } from "./xStatisticsSettings";
import { xTagSettings } from "./xTagSettings";

export interface xGroupSettings {
	// Stores the group currencies settings value used by this contract.
	groupCurrenciesSettings: Array<xCurrencySettings>;
	// Stores the group statistics settings value used by this contract.
	groupStatisticsSettings: Array<xStatisticsSettings>;
	// Stores the group datas settings value used by this contract.
	groupDatasSettings: Array<xDataSettings>;
	// Stores the custom datas settings value used by this contract.
	customDatasSettings: Array<xDataSettings>;
	// Stores the tags settings value used by this contract.
	tagsSettings: Array<xTagSettings>;
	// Stores the group item catalog settings value used by this contract.
	groupItemCatalogSettings: Array<xItemCatalogSettings>;
}
