import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class AuthenticatePermissionRulesParam {
	@GNHashtableDataMember({ code: ParameterCode.LoginByAccount, isOptional: true })
	loginByAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByAndroidDeviceId, isOptional: true })
	loginByAndroidDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByApple, isOptional: true })
	loginByApple?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByCustomDeviceId, isOptional: true })
	loginByCustomDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByCustomId, isOptional: true })
	loginByCustomId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByFacebook, isOptional: true })
	loginByFacebook?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByGenericService, isOptional: true })
	loginByGenericService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByGoogle, isOptional: true })
	loginByGoogle?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByGooglePlayGameService, isOptional: true })
	loginByGooglePlayGameService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByGameCenter, isOptional: true })
	loginByGameCenter?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByiOSDeviceId, isOptional: true })
	loginByiOSDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByWindowsPhoneDeviceId, isOptional: true })
	loginByWindowsPhoneDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RegisterAccount, isOptional: true })
	registerAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByEditorDeviceId, isOptional: true })
	loginByEditorDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByLinuxDeviceId, isOptional: true })
	loginByLinuxDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByMacOSDeviceId, isOptional: true })
	loginByMacOSDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByWindowsDeviceId, isOptional: true })
	loginByWindowsDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RefreshAuthToken, isOptional: true })
	refreshAuthToken?: PermissionRulesParam;
}
