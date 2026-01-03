"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudScriptAdmin = void 0;
const gn_typescript_client_1 = require("@xmobitea/gn-typescript-client");
class CloudScriptAdmin {
    characterPlayer = gn_typescript_client_1.GNNetwork.characterPlayer.admin;
    content = gn_typescript_client_1.GNNetwork.content.admin;
    gamePlayer = gn_typescript_client_1.GNNetwork.gamePlayer.admin;
    group = gn_typescript_client_1.GNNetwork.group.admin;
    inventory = gn_typescript_client_1.GNNetwork.inventory.admin;
    masterPlayer = gn_typescript_client_1.GNNetwork.masterPlayer.admin;
    storeInventory = gn_typescript_client_1.GNNetwork.storeInventory.admin;
    multiplayer = gn_typescript_client_1.GNNetwork.multiplayer.admin;
    cloudScript = gn_typescript_client_1.GNNetwork.cloudScript.admin;
    dashboard = {
        getAdminAccountList: gn_typescript_client_1.GNNetwork.dashboard.getAdminAccountList,
        getAdminAccountListAsync: gn_typescript_client_1.GNNetwork.dashboard.getAdminAccountListAsync,
        getGameInformation: gn_typescript_client_1.GNNetwork.dashboard.getGameInformation,
        getGameInformationAsync: gn_typescript_client_1.GNNetwork.dashboard.getGameInformationAsync,
        getGameList: gn_typescript_client_1.GNNetwork.dashboard.getGameList,
        getGameListAsync: gn_typescript_client_1.GNNetwork.dashboard.getGameListAsync,
        getMasterGameSettings: gn_typescript_client_1.GNNetwork.dashboard.getMasterGameSettings,
        getMasterGameSettingsAsync: gn_typescript_client_1.GNNetwork.dashboard.getMasterGameSettingsAsync,
        getSecretInfoInformation: gn_typescript_client_1.GNNetwork.dashboard.getSecretInfoInformation,
        getSecretInfoInformationAsync: gn_typescript_client_1.GNNetwork.dashboard.getSecretInfoInformationAsync,
        getSecretInfoList: gn_typescript_client_1.GNNetwork.dashboard.getSecretInfoList,
        getSecretInfoListAsync: gn_typescript_client_1.GNNetwork.dashboard.getSecretInfoListAsync,
        getServerLog: gn_typescript_client_1.GNNetwork.dashboard.getServerLog,
        getServerLogAsync: gn_typescript_client_1.GNNetwork.dashboard.getServerLogAsync,
        setGameInformation: gn_typescript_client_1.GNNetwork.dashboard.setGameInformation,
        setGameInformationAsync: gn_typescript_client_1.GNNetwork.dashboard.setGameInformationAsync,
        getUsernameAdminAccount: gn_typescript_client_1.GNNetwork.dashboard.getUsernameAdminAccount,
        getUsernameAdminAccountAsync: gn_typescript_client_1.GNNetwork.dashboard.getUsernameAdminAccountAsync,
        getAnalytics: gn_typescript_client_1.GNNetwork.dashboard.getAnalytics,
        getAnalyticsAsync: gn_typescript_client_1.GNNetwork.dashboard.getAnalyticsAsync,
        resetStatisticsLeaderboard: gn_typescript_client_1.GNNetwork.dashboard.resetStatisticsLeaderboard,
        resetStatisticsLeaderboardAsync: gn_typescript_client_1.GNNetwork.dashboard.resetStatisticsLeaderboardAsync,
        getBackupStatisticsLeaderboardVersion: gn_typescript_client_1.GNNetwork.dashboard.getBackupStatisticsLeaderboardVersion,
        getBackupStatisticsLeaderboardVersionAsync: gn_typescript_client_1.GNNetwork.dashboard.getBackupStatisticsLeaderboardVersionAsync,
        getServerGameData: gn_typescript_client_1.GNNetwork.dashboard.getServerGameData,
        getServerGameDataAsync: gn_typescript_client_1.GNNetwork.dashboard.getServerGameDataAsync,
        deleteInDatabase: gn_typescript_client_1.GNNetwork.dashboard.deleteInDatabase,
        deleteInDatabaseAsync: gn_typescript_client_1.GNNetwork.dashboard.deleteInDatabaseAsync,
    };
    send(requestType, role, request, onResponse, overrideAuthToken, overrideSecretKey, customTags) {
        gn_typescript_client_1.GNNetwork.sendViaHttp(requestType, role, request, onResponse, overrideAuthToken, overrideSecretKey, customTags);
    }
    sendAsync(requestType, role, request, overrideAuthToken, overrideSecretKey, customTags) {
        return gn_typescript_client_1.GNNetwork.sendViaHttpAsync(requestType, role, request, overrideAuthToken, overrideSecretKey, customTags);
    }
}
exports.CloudScriptAdmin = CloudScriptAdmin;
