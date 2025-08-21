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
	public readonly characterPlayer = GNNetwork.characterPlayer.admin;
	public readonly content = GNNetwork.content.admin;
	public readonly gamePlayer = GNNetwork.gamePlayer.admin;
	public readonly group = GNNetwork.group.admin;
	public readonly inventory = GNNetwork.inventory.admin;
	public readonly masterPlayer = GNNetwork.masterPlayer.admin;
	public readonly storeInventory = GNNetwork.storeInventory.admin;
	public readonly multiplayer = GNNetwork.multiplayer.admin;
	public readonly cloudScript = GNNetwork.cloudScript.admin;
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
