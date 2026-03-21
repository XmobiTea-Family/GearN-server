import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class AuthenticatePermissionRulesParam {

	// Stores the login by account value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByAccount, isOptional: true })
	public loginByAccount?: PermissionRulesParam;

	// Stores the login by android device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByAndroidDeviceId, isOptional: true })
	public loginByAndroidDeviceId?: PermissionRulesParam;

	// Stores the login by apple value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByApple, isOptional: true })
	public loginByApple?: PermissionRulesParam;

	// Stores the login by custom device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByCustomDeviceId, isOptional: true })
	public loginByCustomDeviceId?: PermissionRulesParam;

	// Stores the login by custom ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByCustomId, isOptional: true })
	public loginByCustomId?: PermissionRulesParam;

	// Stores the login by facebook value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByFacebook, isOptional: true })
	public loginByFacebook?: PermissionRulesParam;

	// Stores the login by generic service value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByGenericService, isOptional: true })
	public loginByGenericService?: PermissionRulesParam;

	// Stores the login by google value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByGoogle, isOptional: true })
	public loginByGoogle?: PermissionRulesParam;

	// Stores the login by google play game service value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByGooglePlayGameService, isOptional: true })
	public loginByGooglePlayGameService?: PermissionRulesParam;

	// Stores the login by game center value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByGameCenter, isOptional: true })
	public loginByGameCenter?: PermissionRulesParam;

	// Stores the login byi OS device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByiOSDeviceId, isOptional: true })
	public loginByiOSDeviceId?: PermissionRulesParam;

	// Stores the login by windows phone device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByWindowsPhoneDeviceId, isOptional: true })
	public loginByWindowsPhoneDeviceId?: PermissionRulesParam;

	// Stores the register account value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.RegisterAccount, isOptional: true })
	public registerAccount?: PermissionRulesParam;

	// Stores the login by editor device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByEditorDeviceId, isOptional: true })
	public loginByEditorDeviceId?: PermissionRulesParam;

	// Stores the login by linux device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByLinuxDeviceId, isOptional: true })
	public loginByLinuxDeviceId?: PermissionRulesParam;

	// Stores the login by mac OS device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByMacOSDeviceId, isOptional: true })
	public loginByMacOSDeviceId?: PermissionRulesParam;

	// Stores the login by windows device ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LoginByWindowsDeviceId, isOptional: true })
	public loginByWindowsDeviceId?: PermissionRulesParam;

	// Stores the refresh auth token value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.RefreshAuthToken, isOptional: true })
	public refreshAuthToken?: PermissionRulesParam;

}
