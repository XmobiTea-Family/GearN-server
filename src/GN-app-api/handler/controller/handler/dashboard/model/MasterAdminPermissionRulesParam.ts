import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class MasterAdminPermissionRulesParam {

	@GNHashtableDataMember({ code: ParameterCode.SetMasterGameSettings, isOptional: true })
	public setMasterGameSettings?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateAdminAccount, isOptional: true })
	public createAdminAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveAdminAccount, isOptional: true })
	public removeAdminAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPasswordAdminAccount, isOptional: true })
	public setPasswordAdminAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetSecretKeyAdminAccount, isOptional: true })
	public setSecretKeyAdminAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetGameInformation, isOptional: true })
	public setGameInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateGame, isOptional: true })
	public createGame?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ChangePasswordAdminAccount, isOptional: true })
	public changePasswordAdminAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAdminAccountList, isOptional: true })
	public getAdminAccountList?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGameInformation, isOptional: true })
	public getGameInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGameList, isOptional: true })
	public getGameList?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetMasterGameSettings, isOptional: true })
	public getMasterGameSettings?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetServerLog, isOptional: true })
	public getServerLog?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetSecretInfoInformation, isOptional: true })
	public getSecretInfoInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetSecretInfoList, isOptional: true })
	public getSecretInfoList?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateSecretInfo, isOptional: true })
	public createSecretInfo?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetSecretInfoInformation, isOptional: true })
	public setSecretInfoInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetUsernameAdminAccount, isOptional: true })
	public getUsernameAdminAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAnalytics, isOptional: true })
	public getAnalytics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetEventCallbackCloudScript, isOptional: true })
	public getEventCallbackCloudScript?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetEventCallbackCloudScript, isOptional: true })
	public setEventCallbackCloudScript?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ResetStatisticsLeaderboard, isOptional: true })
	public resetStatisticsLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetBackupStatisticsLeaderboardVersion, isOptional: true })
	public getBackupStatisticsLeaderboardVersion?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.DeleteInDatabase, isOptional: true })
	public deleteInDatabase?: PermissionRulesParam;

}
