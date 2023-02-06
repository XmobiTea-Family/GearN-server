import { xCurrencySettings } from "./xCurrencySettings";
import { xDataSettings } from "./xDataSettings";
import { xFriendCatalogSettings } from "./xFriendCatalogSettings";
import { xGroupCatalogSettings } from "./xGroupCatalogSettings";
import { xItemCatalogSettings } from "./xItemCatalogSettings";
import { xStatisticsSettings } from "./xStatisticsSettings";
import { xTagSettings } from "./xTagSettings";

export interface xCharacterPlayerSettings {
    playerCurrencySettings: Array<xCurrencySettings>;
    playerStatisticsSettings: Array<xStatisticsSettings>;
    playerDatasSettings: Array<xDataSettings>;
    customDatasSettings: Array<xDataSettings>;
    tagsSettings: Array<xTagSettings>;

    playerGroupCatalogSettings: Array<xGroupCatalogSettings>;
    playerItemCatalogSettings: Array<xItemCatalogSettings>;
    playerFriendCatalogSettings: Array<xFriendCatalogSettings>;
}
