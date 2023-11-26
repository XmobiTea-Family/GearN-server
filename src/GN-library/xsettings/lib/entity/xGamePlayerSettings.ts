import { xCharacterCatalogSettings } from "./xCharacterCatalogSettings";
import { xCurrencySettings } from "./xCurrencySettings";
import { xDataSettings } from "./xDataSettings";
import { xFriendCatalogSettings } from "./xFriendCatalogSettings";
import { xGroupCatalogSettings } from "./xGroupCatalogSettings";
import { xItemCatalogSettings } from "./xItemCatalogSettings";
import { xStatisticsSettings } from "./xStatisticsSettings";
import { xTagSettings } from "./xTagSettings";

export interface xGamePlayerSettings {
    playerCurrencySettings: Array<xCurrencySettings>;
    playerStatisticsSettings: Array<xStatisticsSettings>;
    playerDatasSettings: Array<xDataSettings>;
    customDatasSettings: Array<xDataSettings>;
    tagsSettings: Array<xTagSettings>;

    playerCharacterCatalogSettings: Array<xCharacterCatalogSettings>;
    playerGroupCatalogSettings: Array<xGroupCatalogSettings>;
    playerItemCatalogSettings: Array<xItemCatalogSettings>;
    playerFriendCatalogSettings: Array<xFriendCatalogSettings>;
}
