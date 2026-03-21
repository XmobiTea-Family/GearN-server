import { xCurrencySettings } from "./xCurrencySettings";
import { xDataSettings } from "./xDataSettings";
import { xGenericServiceSettings } from "./xGenericServiceSettings";
import { xStatisticsSettings } from "./xStatisticsSettings";
import { xTagSettings } from "./xTagSettings";

export interface xMasterPlayerSettings {
	// Stores the generic service settings value used by this contract.
	genericServiceSettings: Array<xGenericServiceSettings>;

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
}
