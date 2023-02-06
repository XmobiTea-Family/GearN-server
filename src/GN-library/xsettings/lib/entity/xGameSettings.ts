import { xCharacterPlayerSettings } from "./xCharacterPlayerSettings";
import { xGamePlayerSettings } from "./xGamePlayerSettings";
import { xGroupSettings } from "./xGroupSettings";
import { xInventorySettings } from "./xInventorySettings";

export interface xGameSettings {
    characterPlayerSettings: xCharacterPlayerSettings;
    gamePlayerSettings: xGamePlayerSettings;
    groupSettings: xGroupSettings;
    inventorySettings: xInventorySettings;
}
