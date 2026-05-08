import {
	GNNetwork,
	Action1,
	GNHashtable,
	RequestType,
	RequestRole,
	OperationRequest,
	OperationResponse,
} from "@xmobitea/gn-typescript-client";

export class CloudScriptAdmin {
	// Stores the character player value used by this instance.
	public readonly characterPlayer = GNNetwork.characterPlayer.admin;
	// Stores the content value used by this instance.
	public readonly content = GNNetwork.content.admin;
	// Stores the game player value used by this instance.
	public readonly gamePlayer = GNNetwork.gamePlayer.admin;
	// Stores the group value used by this instance.
	public readonly group = GNNetwork.group.admin;
	// Stores the inventory value used by this instance.
	public readonly inventory = GNNetwork.inventory.admin;
	// Stores the master player value used by this instance.
	public readonly masterPlayer = GNNetwork.masterPlayer.admin;
	// Stores the store inventory value used by this instance.
	public readonly storeInventory = GNNetwork.storeInventory.admin;
	// Stores the multiplayer value used by this instance.
	public readonly multiplayer = GNNetwork.multiplayer.admin;
	// Stores the cloud script value used by this instance.
	public readonly cloudScript = {
		executeFunction: GNNetwork.cloudScript.admin.executeFunction,
		executeFunctionAsync: GNNetwork.cloudScript.admin.executeFunctionAsync,
	};
	// Stores the dashboard value used by this instance.
	public readonly dashboard = {
		getAdminAccountList: GNNetwork.dashboard.getAdminAccountList,
		getAdminAccountListAsync: GNNetwork.dashboard.getAdminAccountListAsync,
		getGameInformation: GNNetwork.dashboard.getGameInformation,
		getGameInformationAsync: GNNetwork.dashboard.getGameInformationAsync,
		getGameList: GNNetwork.dashboard.getGameList,
		getGameListAsync: GNNetwork.dashboard.getGameListAsync,
		getMasterGameSettings: GNNetwork.dashboard.getMasterGameSettings,
		getMasterGameSettingsAsync: GNNetwork.dashboard.getMasterGameSettingsAsync,
		getSecretInfoInformation: GNNetwork.dashboard.getSecretInfoInformation,
		getSecretInfoInformationAsync: GNNetwork.dashboard.getSecretInfoInformationAsync,
		getSecretInfoList: GNNetwork.dashboard.getSecretInfoList,
		getSecretInfoListAsync: GNNetwork.dashboard.getSecretInfoListAsync,
		getServerLog: GNNetwork.dashboard.getServerLog,
		getServerLogAsync: GNNetwork.dashboard.getServerLogAsync,
		setGameInformation: GNNetwork.dashboard.setGameInformation,
		setGameInformationAsync: GNNetwork.dashboard.setGameInformationAsync,
		getUsernameAdminAccount: GNNetwork.dashboard.getUsernameAdminAccount,
		getUsernameAdminAccountAsync: GNNetwork.dashboard.getUsernameAdminAccountAsync,
		getAnalytics: GNNetwork.dashboard.getAnalytics,
		getAnalyticsAsync: GNNetwork.dashboard.getAnalyticsAsync,
		resetStatisticsLeaderboard: GNNetwork.dashboard.resetStatisticsLeaderboard,
		resetStatisticsLeaderboardAsync: GNNetwork.dashboard.resetStatisticsLeaderboardAsync,
		getBackupStatisticsLeaderboardVersion: GNNetwork.dashboard.getBackupStatisticsLeaderboardVersion,
		getBackupStatisticsLeaderboardVersionAsync: GNNetwork.dashboard.getBackupStatisticsLeaderboardVersionAsync,
		getServerGameData: GNNetwork.dashboard.getServerGameData,
		getServerGameDataAsync: GNNetwork.dashboard.getServerGameDataAsync,
		deleteInDatabase: GNNetwork.dashboard.deleteInDatabase,
		deleteInDatabaseAsync: GNNetwork.dashboard.deleteInDatabaseAsync,
	};
	/**
	 * Executes the send workflow.
	 * @param requestType Provides the request type value used by this operation.
	 * @param role Provides the role value used by this operation.
	 * @param request Provides the request value used by this operation.
	 * @param onResponse Provides the on response value used by this operation.
	 * @param overrideAuthToken Provides the override auth token value used by this operation.
	 * @param overrideSecretKey Provides the override secret key value used by this operation.
	 * @param customTags Provides the custom tags value used by this operation.
	 */
	public send(
		requestType: RequestType,
		role: RequestRole,
		request: OperationRequest,
		onResponse: Action1<OperationResponse>,
		overrideAuthToken: string,
		overrideSecretKey: string,
		customTags: GNHashtable
	): void {
		GNNetwork.sendViaHttp(requestType, role, request, onResponse, overrideAuthToken, overrideSecretKey, customTags);
	}

	/**
	 * Sends the async.
	 * @param requestType Provides the request type value used by this operation.
	 * @param role Provides the role value used by this operation.
	 * @param request Provides the request value used by this operation.
	 * @param overrideAuthToken Provides the override auth token value used by this operation.
	 * @param overrideSecretKey Provides the override secret key value used by this operation.
	 * @param customTags Provides the custom tags value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public sendAsync(
		requestType: RequestType,
		role: RequestRole,
		request: OperationRequest,
		overrideAuthToken: string,
		overrideSecretKey: string,
		customTags: GNHashtable
	): Promise<OperationResponse> {
		return GNNetwork.sendViaHttpAsync(requestType, role, request, overrideAuthToken, overrideSecretKey, customTags);
	}

}
