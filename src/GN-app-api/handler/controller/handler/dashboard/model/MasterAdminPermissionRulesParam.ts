import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class MasterAdminPermissionRulesParam {
    // Stores the set master game settings value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetMasterGameSettings, isOptional: true })
    public setMasterGameSettings?: PermissionRulesParam;

    // Stores the create admin account value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.CreateAdminAccount, isOptional: true })
    public createAdminAccount?: PermissionRulesParam;

    // Stores the remove admin account value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.RemoveAdminAccount, isOptional: true })
    public removeAdminAccount?: PermissionRulesParam;

    // Stores the set password admin account value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetPasswordAdminAccount, isOptional: true })
    public setPasswordAdminAccount?: PermissionRulesParam;

    // Stores the set secret key admin account value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetSecretKeyAdminAccount, isOptional: true })
    public setSecretKeyAdminAccount?: PermissionRulesParam;

    // Stores the set game information value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetGameInformation, isOptional: true })
    public setGameInformation?: PermissionRulesParam;

    // Stores the create game value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.CreateGame, isOptional: true })
    public createGame?: PermissionRulesParam;

    // Stores the change password admin account value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.ChangePasswordAdminAccount, isOptional: true })
    public changePasswordAdminAccount?: PermissionRulesParam;

    // Stores the get admin account list value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetAdminAccountList, isOptional: true })
    public getAdminAccountList?: PermissionRulesParam;

    // Stores the get game information value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetGameInformation, isOptional: true })
    public getGameInformation?: PermissionRulesParam;

    // Stores the get game list value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetGameList, isOptional: true })
    public getGameList?: PermissionRulesParam;

    // Stores the get master game settings value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetMasterGameSettings, isOptional: true })
    public getMasterGameSettings?: PermissionRulesParam;

    // Stores the get server log value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetServerLog, isOptional: true })
    public getServerLog?: PermissionRulesParam;

    // Stores the get secret info information value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetSecretInfoInformation, isOptional: true })
    public getSecretInfoInformation?: PermissionRulesParam;

    // Stores the get secret info list value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetSecretInfoList, isOptional: true })
    public getSecretInfoList?: PermissionRulesParam;

    // Stores the create secret info value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.CreateSecretInfo, isOptional: true })
    public createSecretInfo?: PermissionRulesParam;

    // Stores the set secret info information value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetSecretInfoInformation, isOptional: true })
    public setSecretInfoInformation?: PermissionRulesParam;

    // Stores the get username admin account value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetUsernameAdminAccount, isOptional: true })
    public getUsernameAdminAccount?: PermissionRulesParam;

    // Stores the get analytics value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetAnalytics, isOptional: true })
    public getAnalytics?: PermissionRulesParam;

    // Stores the get event callback cloud script value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetEventCallbackCloudScript, isOptional: true })
    public getEventCallbackCloudScript?: PermissionRulesParam;

    // Stores the set event callback cloud script value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetEventCallbackCloudScript, isOptional: true })
    public setEventCallbackCloudScript?: PermissionRulesParam;

    // Stores the reset statistics leaderboard value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.ResetStatisticsLeaderboard, isOptional: true })
    public resetStatisticsLeaderboard?: PermissionRulesParam;

    // Stores the get backup statistics leaderboard version value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetBackupStatisticsLeaderboardVersion, isOptional: true })
    public getBackupStatisticsLeaderboardVersion?: PermissionRulesParam;

    @GNHashtableDataMember({ code: ParameterCode.GetServerGameData, isOptional: true })
    public getServerGameData?: PermissionRulesParam;

    // Stores the delete in database value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.DeleteInDatabase, isOptional: true })
    public deleteInDatabase?: PermissionRulesParam;
}
