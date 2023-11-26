import { xCurrencySettings } from "./xCurrencySettings";
import { xDataSettings } from "./xDataSettings";
import { xGenericServiceSettings } from "./xGenericServiceSettings";
import { xStatisticsSettings } from "./xStatisticsSettings";
import { xTagSettings } from "./xTagSettings";

export interface xMasterPlayerSettings {
    genericServiceSettings: Array<xGenericServiceSettings>;

    playerCurrencySettings: Array<xCurrencySettings>;
    playerStatisticsSettings: Array<xStatisticsSettings>;
    playerDatasSettings: Array<xDataSettings>;
    customDatasSettings: Array<xDataSettings>;
    tagsSettings: Array<xTagSettings>;
}
