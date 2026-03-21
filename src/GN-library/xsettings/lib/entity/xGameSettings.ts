import { xCharacterPlayerSettings } from "./xCharacterPlayerSettings";
import { xGamePlayerSettings } from "./xGamePlayerSettings";
import { xGroupSettings } from "./xGroupSettings";
import { xInventorySettings } from "./xInventorySettings";

export interface xGameSettings {
	// Stores the character player settings value used by this contract.
	characterPlayerSettings: xCharacterPlayerSettings;
	// Stores the game player settings value used by this contract.
	gamePlayerSettings: xGamePlayerSettings;
	// Stores the group settings value used by this contract.
	groupSettings: xGroupSettings;
	// Stores the inventory settings value used by this contract.
	inventorySettings: xInventorySettings;
}
