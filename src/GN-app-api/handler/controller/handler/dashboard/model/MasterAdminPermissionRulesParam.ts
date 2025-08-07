import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class MasterAdminPermissionRulesParam {
	@GNHashtableDataMember({ code: ParameterCode.SetMasterGameSettings, isOptional: true })
	setMasterGameSettings?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateAdminAccount, isOptional: true })
	createAdminAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveAdminAccount, isOptional: true })
	removeAdminAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPasswordAdminAccount, isOptional: true })
	setPasswordAdminAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetSecretKeyAdminAccount, isOptional: true })
	setSecretKeyAdminAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetGameInformation, isOptional: true })
	setGameInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateGame, isOptional: true })
	createGame?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ChangePasswordAdminAccount, isOptional: true })
	changePasswordAdminAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAdminAccountList, isOptional: true })
	getAdminAccountList?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGameInformation, isOptional: true })
	getGameInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGameList, isOptional: true })
	getGameList?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetMasterGameSettings, isOptional: true })
	getMasterGameSettings?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetServerLog, isOptional: true })
	getServerLog?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetSecretInfoInformation, isOptional: true })
	getSecretInfoInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetSecretInfoList, isOptional: true })
	getSecretInfoList?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateSecretInfo, isOptional: true })
	createSecretInfo?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetSecretInfoInformation, isOptional: true })
	setSecretInfoInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetUsernameAdminAccount, isOptional: true })
	getUsernameAdminAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAnalytics, isOptional: true })
	getAnalytics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetEventCallbackCloudScript, isOptional: true })
	getEventCallbackCloudScript?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetEventCallbackCloudScript, isOptional: true })
	setEventCallbackCloudScript?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ResetStatisticsLeaderboard, isOptional: true })
	resetStatisticsLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetBackupStatisticsLeaderboardVersion, isOptional: true })
	getBackupStatisticsLeaderboardVersion?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.DeleteInDatabase, isOptional: true })
	deleteInDatabase?: PermissionRulesParam;

}
