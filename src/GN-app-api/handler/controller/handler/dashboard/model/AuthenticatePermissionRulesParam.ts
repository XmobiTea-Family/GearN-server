import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class AuthenticatePermissionRulesParam {

	@GNHashtableDataMember({ code: ParameterCode.LoginByAccount, isOptional: true })
	public loginByAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByAndroidDeviceId, isOptional: true })
	public loginByAndroidDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByApple, isOptional: true })
	public loginByApple?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByCustomDeviceId, isOptional: true })
	public loginByCustomDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByCustomId, isOptional: true })
	public loginByCustomId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByFacebook, isOptional: true })
	public loginByFacebook?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByGenericService, isOptional: true })
	public loginByGenericService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByGoogle, isOptional: true })
	public loginByGoogle?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByGooglePlayGameService, isOptional: true })
	public loginByGooglePlayGameService?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByGameCenter, isOptional: true })
	public loginByGameCenter?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByiOSDeviceId, isOptional: true })
	public loginByiOSDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByWindowsPhoneDeviceId, isOptional: true })
	public loginByWindowsPhoneDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RegisterAccount, isOptional: true })
	public registerAccount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByEditorDeviceId, isOptional: true })
	public loginByEditorDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByLinuxDeviceId, isOptional: true })
	public loginByLinuxDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByMacOSDeviceId, isOptional: true })
	public loginByMacOSDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LoginByWindowsDeviceId, isOptional: true })
	public loginByWindowsDeviceId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RefreshAuthToken, isOptional: true })
	public refreshAuthToken?: PermissionRulesParam;

}
