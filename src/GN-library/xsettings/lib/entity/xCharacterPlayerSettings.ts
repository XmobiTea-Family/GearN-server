import { xCurrencySettings } from "./xCurrencySettings";
import { xDataSettings } from "./xDataSettings";
import { xFriendCatalogSettings } from "./xFriendCatalogSettings";
import { xGroupCatalogSettings } from "./xGroupCatalogSettings";
import { xItemCatalogSettings } from "./xItemCatalogSettings";
import { xStatisticsSettings } from "./xStatisticsSettings";
import { xTagSettings } from "./xTagSettings";

export interface xCharacterPlayerSettings {
	// Stores the player currencies settings value used by this contract.
	playerCurrenciesSettings: Array<xCurrencySettings>;
	// Stores the player statistics settings value used by this contract.
	playerStatisticsSettings: Array<xStatisticsSettings>;
	// Stores the player datas settings value used by this contract.
	playerDatasSettings: Array<xDataSettings>;
	// Stores the custom datas settings value used by this contract.
	customDatasSettings: Array<xDataSettings>;
	// Stores the tags settings value used by this contract.
	tagsSettings: Array<xTagSettings>;

	// Stores the player group catalog settings value used by this contract.
	playerGroupCatalogSettings: Array<xGroupCatalogSettings>;
	// Stores the player item catalog settings value used by this contract.
	playerItemCatalogSettings: Array<xItemCatalogSettings>;
	// Stores the player friend catalog settings value used by this contract.
	playerFriendCatalogSettings: Array<xFriendCatalogSettings>;
}
