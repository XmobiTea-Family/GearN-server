import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class MasterAdminPermissionRulesParam {
    @GNHashtableDataMember({ code: GNParameterCode.SetMasterGameSettings, isOptional: true })
    setMasterGameSettings?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GrantAdminAccount, isOptional: true })
    grantAdminAccount?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.RemoveAdminAccount, isOptional: true })
    removeAdminAccount?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetPasswordAdminAccount, isOptional: true })
    setPasswordAdminAccount?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetSecretKeyAdminAccount, isOptional: true })
    setSecretKeyAdminAccount?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetGameInformation, isOptional: true })
    setGameInformation?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GrantGame, isOptional: true })
    grantGame?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.ChangePasswordAdminAccount, isOptional: true })
    changePasswordAdminAccount?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetAdminAccountList, isOptional: true })
    getAdminAccountList?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetGameInformation, isOptional: true })
    getGameInformation?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetGameList, isOptional: true })
    getGameList?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetMasterGameSettings, isOptional: true })
    getMasterGameSettings?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetServerLog, isOptional: true })
    getServerLog?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetSecretInfoInformation, isOptional: true })
    getSecretInfoInformation?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetSecretInfoList, isOptional: true })
    getSecretInfoList?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GrantSecretInfo, isOptional: true })
    grantSecretInfo?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetSecretInfoInformation, isOptional: true })
    setSecretInfoInformation?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetUsernameAdminAccount, isOptional: true })
    getUsernameAdminAccount?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetAnalytics, isOptional: true })
    getAnalytics?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetEventCallbackCloudScript, isOptional: true })
    getEventCallbackCloudScript?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetEventCallbackCloudScript, isOptional: true })
    setEventCallbackCloudScript?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.ResetStatisticsLeaderboard, isOptional: true })
    resetStatisticsLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetBackupStatisticsLeaderboardVersion, isOptional: true })
    getBackupStatisticsLeaderboardVersion?: PermissionRulesParam;

}
