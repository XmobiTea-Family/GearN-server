import { xCharacterPlayerSettings } from "./../../../../../xsettings/lib/entity/xCharacterPlayerSettings";
import { xGamePlayerSettings } from "./../../../../../xsettings/lib/entity/xGamePlayerSettings";
import { xGroupSettings } from "./../../../../../xsettings/lib/entity/xGroupSettings";
import { xInventorySettings } from "./../../../../../xsettings/lib/entity/xInventorySettings";

export interface GameSettings {
    gamePlayerSettings: xGamePlayerSettings;
    characterPlayerSettings: xCharacterPlayerSettings;
    groupSettings: xGroupSettings;
    inventorySettings: xInventorySettings;
}
