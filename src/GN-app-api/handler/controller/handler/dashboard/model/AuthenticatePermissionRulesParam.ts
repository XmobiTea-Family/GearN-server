import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class AuthenticatePermissionRulesParam {
    @GNHashtableDataMember({ code: GNParameterCode.LoginByAccount, isOptional: true })
    loginByAccount?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByAndroidDeviceId, isOptional: true })
    loginByAndroidDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByApple, isOptional: true })
    loginByApple?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByCustomDeviceId, isOptional: true })
    loginByCustomDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByCustomId, isOptional: true })
    loginByCustomId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByFacebook, isOptional: true })
    loginByFacebook?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByGenericService, isOptional: true })
    loginByGenericService?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByGoogle, isOptional: true })
    loginByGoogle?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByGooglePlayGameService, isOptional: true })
    loginByGooglePlayGameService?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByGameCenter, isOptional: true })
    loginByGameCenter?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByiOSDeviceId, isOptional: true })
    loginByiOSDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByWindowsPhoneDeviceId, isOptional: true })
    loginByWindowsPhoneDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.RegisterAccount, isOptional: true })
    registerAccount?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByEditorDeviceId, isOptional: true })
    loginByEditorDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByLinuxDeviceId, isOptional: true })
    loginByLinuxDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByMacOSDeviceId, isOptional: true })
    loginByMacOSDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LoginByWindowsDeviceId, isOptional: true })
    loginByWindowsDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.RefreshAuthToken, isOptional: true })
    refreshAuthToken?: PermissionRulesParam;
}
