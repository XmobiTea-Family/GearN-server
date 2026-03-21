import { xCharacterPlayerSettings } from "./../../../../../xsettings/lib/entity/xCharacterPlayerSettings";
import { xGamePlayerSettings } from "./../../../../../xsettings/lib/entity/xGamePlayerSettings";
import { xGroupSettings } from "./../../../../../xsettings/lib/entity/xGroupSettings";
import { xInventorySettings } from "./../../../../../xsettings/lib/entity/xInventorySettings";

export interface GameSettings {
    // Stores the game player settings value used by this contract.
    gamePlayerSettings: xGamePlayerSettings;
    // Stores the character player settings value used by this contract.
    characterPlayerSettings: xCharacterPlayerSettings;
    // Stores the group settings value used by this contract.
    groupSettings: xGroupSettings;
    // Stores the inventory settings value used by this contract.
    inventorySettings: xInventorySettings;
}
