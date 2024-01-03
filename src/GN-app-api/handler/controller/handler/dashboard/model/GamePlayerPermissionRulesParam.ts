import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class GamePlayerPermissionRulesParam {
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

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayersWithSegment, isOptional: true })
    getPlayersWithSegment?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayersWithTag, isOptional: true })
    getPlayersWithTag?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayerCharacter, isOptional: true })
    getPlayerCharacter?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayerInventory, isOptional: true })
    getPlayerInventory?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayerGroup, isOptional: true })
    getPlayerGroup?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayerFriend, isOptional: true })
    getPlayerFriend?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.RemovePlayerItem, isOptional: true })
    removePlayerItem?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetOnlineStatus, isOptional: true })
    getOnlineStatus?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GrantGroup, isOptional: true })
    grantGroup?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GrantPlayerItem, isOptional: true })
    grantPlayerItem?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GrantPlayerCharacter, isOptional: true })
    grantPlayerCharacter?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.AddPlayerFriend, isOptional: true })
    addPlayerFriend?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.RemovePlayerFriend, isOptional: true })
    removePlayerFriend?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.RemovePlayerCharacter, isOptional: true })
    removePlayerCharacter?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.JoinGroup, isOptional: true })
    joinGroup?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.LeaveGroup, isOptional: true })
    leaveGroup?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetPlayersWithDisplayName, isOptional: true })
    getPlayersWithDisplayName?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetFriendStatisticsLeaderboardAroundPlayer, isOptional: true })
    getFriendStatisticsLeaderboardAroundPlayer?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetFriendStatisticsLeaderboard, isOptional: true })
    getFriendStatisticsLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCurrencyLeaderboard, isOptional: true })
    getCurrencyLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCreateLeaderboard, isOptional: true })
    getCreateLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetLastLoginLeaderboard, isOptional: true })
    getLastLoginLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetStatisticsLog, isOptional: true })
    getStatisticsLog?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCurrencyLog, isOptional: true })
    getCurrencyLog?: PermissionRulesParam;

}
