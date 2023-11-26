import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class MasterPlayerPermissionRulesParam {
    @GNHashtableDataMember({ code: GNParameterCode.LinkAccount, isOptional: true })
    linkAccount?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkAndroidDeviceId, isOptional: true })
    linkAndroidDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkApple, isOptional: true })
    linkApple?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkCustomDeviceId, isOptional: true })
    linkCustomDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkCustomId, isOptional: true })
    linkCustomId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkEditorDeviceId, isOptional: true })
    linkEditorDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkFacebook, isOptional: true })
    linkFacebook?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkGenericService, isOptional: true })
    linkGenericService?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkGoogle, isOptional: true })
    linkGoogle?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkGooglePlayGameService, isOptional: true })
    linkGooglePlayGameService?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkGameCenter, isOptional: true })
    linkGameCenter?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkiOSDeviceId, isOptional: true })
    linkiOSDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkLinuxDeviceId, isOptional: true })
    linkLinuxDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkMacOSDeviceId, isOptional: true })
    linkMacOSDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkWindowsDeviceId, isOptional: true })
    linkWindowsDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LinkWindowsPhoneDeviceId, isOptional: true })
    linkWindowsPhoneDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkAccount, isOptional: true })
    unlinkAccount?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkAndroidDeviceId, isOptional: true })
    unlinkAndroidDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkApple, isOptional: true })
    unlinkApple?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkCustomDeviceId, isOptional: true })
    unlinkCustomDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkCustomId, isOptional: true })
    unlinkCustomId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkEditorDeviceId, isOptional: true })
    unlinkEditorDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkFacebook, isOptional: true })
    unlinkFacebook?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkGenericService, isOptional: true })
    unlinkGenericService?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkGoogle, isOptional: true })
    unlinkGoogle?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkGooglePlayGameService, isOptional: true })
    unlinkGooglePlayGameService?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkGameCenter, isOptional: true })
    unlinkGameCenter?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkiOSDeviceId, isOptional: true })
    unlinkiOSDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkLinuxDeviceId, isOptional: true })
    unlinkLinuxDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkMacOSDeviceId, isOptional: true })
    unlinkMacOSDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkWindowsDeviceId, isOptional: true })
    unlinkWindowsDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.UnlinkWindowsPhoneDeviceId, isOptional: true })
    unlinkWindowsPhoneDeviceId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.AddSegment, isOptional: true })
    addSegment?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.RemoveSegment, isOptional: true })
    removeSegment?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetSegment, isOptional: true })
    getSegment?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetTag, isOptional: true })
    setTag?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.RemoveTag, isOptional: true })
    removeTag?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetTag, isOptional: true })
    getTag?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetDisplayName, isOptional: true })
    getDisplayName?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetDisplayName, isOptional: true })
    setDisplayName?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetTsCreate, isOptional: true })
    getTsCreate?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetIpAddressCreate, isOptional: true })
    getIpAddressCreate?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetTsLastLogin, isOptional: true })
    setTsLastLogin?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetTsLastLogin, isOptional: true })
    getTsLastLogin?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetPlayerBan, isOptional: true })
    setPlayerBan?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayerBan, isOptional: true })
    getPlayerBan?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetCountryCode, isOptional: true })
    setCountryCode?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCountryCode, isOptional: true })
    getCountryCode?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.ChangeAccountPassword, isOptional: true })
    changeAccountPassword?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.ResetAccountPassword, isOptional: true })
    resetAccountPassword?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetAvatar, isOptional: true })
    setAvatar?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetAvatar, isOptional: true })
    getAvatar?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetPlayerCurrency, isOptional: true })
    setPlayerCurrency?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayerCurrency, isOptional: true })
    getPlayerCurrency?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetPlayerStatistics, isOptional: true })
    setPlayerStatistics?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayerStatistics, isOptional: true })
    getPlayerStatistics?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetStatisticsLeaderboard, isOptional: true })
    getStatisticsLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetStatisticsLeaderboardAroundPlayer, isOptional: true })
    getStatisticsLeaderboardAroundPlayer?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCustomData, isOptional: true })
    getCustomData?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetCustomData, isOptional: true })
    setCustomData?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetPlayerData, isOptional: true })
    setPlayerData?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayerData, isOptional: true })
    getPlayerData?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayerInformation, isOptional: true })
    getPlayerInformation?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayersWithApple, isOptional: true })
    getPlayersWithApple?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayersWithFacebook, isOptional: true })
    getPlayersWithFacebook?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayersWithGoogle, isOptional: true })
    getPlayersWithGoogle?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayersWithGenericService, isOptional: true })
    getPlayersWithGenericService?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayersWithSegment, isOptional: true })
    getPlayersWithSegment?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayersWithTag, isOptional: true })
    getPlayersWithTag?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayersWithGooglePlayGameService, isOptional: true })
    getPlayersWithGooglePlayGameService?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayersWithGameCenter, isOptional: true })
    getPlayersWithGameCenter?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetExternal, isOptional: true })
    getExternal?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayersWithDisplayName, isOptional: true })
    getPlayersWithDisplayName?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetEmail, isOptional: true })
    getEmail?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetEmail, isOptional: true })
    setEmail?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCurrencyLeaderboard, isOptional: true })
    getCurrencyLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetLastLoginLeaderboard, isOptional: true })
    getLastLoginLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCreateLeaderboard, isOptional: true })
    getCreateLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetStatisticsLog, isOptional: true })
    getStatisticsLog?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCurrencyLog, isOptional: true })
    getCurrencyLog?: PermissionRulesParam;

}
