import { xCharacterPlayerSettings } from "./entity/xCharacterPlayerSettings";
import { xGamePlayerSettings } from "./entity/xGamePlayerSettings";
import { xGroupSettings } from "./entity/xGroupSettings";
import { xInventorySettings } from "./entity/xInventorySettings";
import { xMasterPlayerSettings } from "./entity/xMasterPlayerSettings";
import { xMatchmakingQueueSettings } from "./entity/xMatchmakingQueueSettings";

export class xGNSettings {
    // Stores the master player settings value used by this instance.
    private masterPlayerSettings: xMasterPlayerSettings;
    // Stores the game player settings dict collection used by this instance.
    private gamePlayerSettingsDict: Map<string, xGamePlayerSettings>;
    // Stores the character player settings dict collection used by this instance.
    private characterPlayerSettingsDict: Map<string, xCharacterPlayerSettings>;
    // Stores the group settings dict collection used by this instance.
    private groupSettingsDict: Map<string, xGroupSettings>;
    // Stores the inventory settings dict collection used by this instance.
    private inventorySettingsDict: Map<string, xInventorySettings>;
    // Stores the matchmaking queue settings dict collection used by this instance.
    private matchmakingQueueSettingsDict: Map<string, xMatchmakingQueueSettings[]>;

    /**
     * Initializes a new x GearN settings instance.
     */
    constructor() {
        this.masterPlayerSettings = {
            genericServiceSettings: [],
            playerCurrenciesSettings: [],
            playerStatisticsSettings: [],
            playerDatasSettings: [],
            customDatasSettings: [],
            tagsSettings: [],
        };

        this.gamePlayerSettingsDict = new Map();
        this.characterPlayerSettingsDict = new Map();
        this.groupSettingsDict = new Map();
        this.inventorySettingsDict = new Map();
        this.matchmakingQueueSettingsDict = new Map();
    }

    /**
     * Returns the master player settings.
     * @returns Returns the master player settings.
     */
    public getMasterPlayerSettings(): xMasterPlayerSettings {
        return this.masterPlayerSettings;
    }

    /**
     * Returns the game player settings.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Returns the game player settings.
     */
    public getGamePlayerSettings(gameId: string): xGamePlayerSettings {
        if (!this.gamePlayerSettingsDict.has(gameId)) {
            this.gamePlayerSettingsDict.set(gameId, {
                playerCurrenciesSettings: [],
                playerStatisticsSettings: [],
                playerDatasSettings: [],
                customDatasSettings: [],
                tagsSettings: [],

                playerCharacterCatalogSettings: [],
                playerGroupCatalogSettings: [],
                playerItemCatalogSettings: [],
                playerFriendCatalogSettings: [],
            });
        }

        return this.gamePlayerSettingsDict.get(gameId);
    }

    /**
     * Returns the character player settings.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Returns the character player settings.
     */
    public getCharacterPlayerSettings(gameId: string): xCharacterPlayerSettings {
        if (!this.characterPlayerSettingsDict.has(gameId)) {
            this.characterPlayerSettingsDict.set(gameId, {
                playerCurrenciesSettings: [],
                playerStatisticsSettings: [],
                playerDatasSettings: [],
                customDatasSettings: [],
                tagsSettings: [],

                playerGroupCatalogSettings: [],
                playerItemCatalogSettings: [],
                playerFriendCatalogSettings: [],
            });
        }

        return this.characterPlayerSettingsDict.get(gameId);
    }

    /**
     * Returns the group settings.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Returns the group settings.
     */
    public getGroupSettings(gameId: string): xGroupSettings {
        if (!this.groupSettingsDict.has(gameId)) {
            this.groupSettingsDict.set(gameId, {
                groupCurrenciesSettings: [],
                groupStatisticsSettings: [],
                groupDatasSettings: [],
                customDatasSettings: [],
                tagsSettings: [],

                groupItemCatalogSettings: [],
            });
        }

        return this.groupSettingsDict.get(gameId);
    }

    /**
     * Returns the inventory settings.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Returns the inventory settings.
     */
    public getInventorySettings(gameId: string): xInventorySettings {
        if (!this.inventorySettingsDict.has(gameId)) {
            this.inventorySettingsDict.set(gameId, {
                itemStatisticsSettings: [],
                itemDatasSettings: [],
                customDatasSettings: [],
                tagsSettings: [],
            });
        }

        return this.inventorySettingsDict.get(gameId);
    }

    /**
     * Returns the matchmaking queue settings.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Returns the matchmaking queue settings.
     */
    public getMatchmakingQueueSettings(gameId: string): xMatchmakingQueueSettings[] {
        if (!this.matchmakingQueueSettingsDict.has(gameId)) {
            this.matchmakingQueueSettingsDict.set(gameId, []);
        }

        return this.matchmakingQueueSettingsDict.get(gameId);
    }
}
