import { xCharacterPlayerSettings } from "./entity/xCharacterPlayerSettings";
import { xGamePlayerSettings } from "./entity/xGamePlayerSettings";
import { xGroupSettings } from "./entity/xGroupSettings";
import { xInventorySettings } from "./entity/xInventorySettings";
import { xMasterPlayerSettings } from "./entity/xMasterPlayerSettings";
import { xMatchmakingQueueSettings } from "./entity/xMatchmakingQueueSettings";

export class xGNSettings {

	private masterPlayerSettings: xMasterPlayerSettings;
	private gamePlayerSettingsDict: Map<string, xGamePlayerSettings>;
	private characterPlayerSettingsDict: Map<string, xCharacterPlayerSettings>;
	private groupSettingsDict: Map<string, xGroupSettings>;
	private inventorySettingsDict: Map<string, xInventorySettings>;
	private matchmakingQueueSettingsDict: Map<string, xMatchmakingQueueSettings[]>;

	constructor() {
		this.masterPlayerSettings = {
			genericServiceSettings: [],
			playerCurrenciesSettings: [],
			playerStatisticsSettings: [],
			playerDatasSettings: [],
			customDatasSettings: [],
			tagsSettings: [],
		}

		this.gamePlayerSettingsDict = new Map();
		this.characterPlayerSettingsDict = new Map();
		this.groupSettingsDict = new Map();
		this.inventorySettingsDict = new Map();
		this.matchmakingQueueSettingsDict = new Map();
	}

	public getMasterPlayerSettings(): xMasterPlayerSettings {
		return this.masterPlayerSettings;
	}

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

	public getMatchmakingQueueSettings(gameId: string): xMatchmakingQueueSettings[] {
		if (!this.matchmakingQueueSettingsDict.has(gameId)) {
			this.matchmakingQueueSettingsDict.set(gameId, []);
		}

		return this.matchmakingQueueSettingsDict.get(gameId);
	}
}
