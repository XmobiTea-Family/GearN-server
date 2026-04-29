import { xCharacterPlayerSettings } from "./../../../../../xsettings/lib/entity/xCharacterPlayerSettings";
import { xGamePlayerSettings } from "./../../../../../xsettings/lib/entity/xGamePlayerSettings";
import { xGroupSettings } from "./../../../../../xsettings/lib/entity/xGroupSettings";
import { xInventorySettings } from "./../../../../../xsettings/lib/entity/xInventorySettings";

/**
 * Aggregate of the gameplay configuration for a single game (player, character, group, inventory).
 * Embedded inside GameItem so admins can edit it through the dashboard without redeploying the server.
 */
export interface GameSettings {
    /** Configuration applied to GamePlayer (currency caps, statistics, allowed segments...). */
    gamePlayerSettings: xGamePlayerSettings;
    /** Configuration applied to CharacterPlayer (max characters per player, default character template...). */
    characterPlayerSettings: xCharacterPlayerSettings;
    /** Configuration applied to Group (maximum size, default roles, permissions...). */
    groupSettings: xGroupSettings;
    /** Configuration applied to Inventory (slot caps, default stack size...). */
    inventorySettings: xInventorySettings;
}
