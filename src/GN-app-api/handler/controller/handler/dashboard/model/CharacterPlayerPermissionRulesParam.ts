import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class CharacterPlayerPermissionRulesParam {
    // Stores the add segment value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.AddSegment, isOptional: true })
    public addSegment?: PermissionRulesParam;

    // Stores the remove segment value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.RemoveSegment, isOptional: true })
    public removeSegment?: PermissionRulesParam;

    // Stores the get segment value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetSegment, isOptional: true })
    public getSegment?: PermissionRulesParam;

    // Stores the set tag value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetTag, isOptional: true })
    public setTag?: PermissionRulesParam;

    // Stores the remove tag value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.RemoveTag, isOptional: true })
    public removeTag?: PermissionRulesParam;

    // Stores the get tag value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetTag, isOptional: true })
    public getTag?: PermissionRulesParam;

    // Stores the get display name value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetDisplayName, isOptional: true })
    public getDisplayName?: PermissionRulesParam;

    // Stores the set display name value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetDisplayName, isOptional: true })
    public setDisplayName?: PermissionRulesParam;

    // Stores the get timestamp create value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetTsCreate, isOptional: true })
    public getTsCreate?: PermissionRulesParam;

    // Stores the get IP address create value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetIpAddressCreate, isOptional: true })
    public getIpAddressCreate?: PermissionRulesParam;

    // Stores the get timestamp last login value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetTsLastLogin, isOptional: true })
    public getTsLastLogin?: PermissionRulesParam;

    // Stores the set player ban value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetPlayerBan, isOptional: true })
    public setPlayerBan?: PermissionRulesParam;

    // Stores the get player ban value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetPlayerBan, isOptional: true })
    public getPlayerBan?: PermissionRulesParam;

    // Stores the set country code value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetCountryCode, isOptional: true })
    public setCountryCode?: PermissionRulesParam;

    // Stores the get country code value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetCountryCode, isOptional: true })
    public getCountryCode?: PermissionRulesParam;

    // Stores the set avatar value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetAvatar, isOptional: true })
    public setAvatar?: PermissionRulesParam;

    // Stores the get avatar value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetAvatar, isOptional: true })
    public getAvatar?: PermissionRulesParam;

    // Stores the change player currency value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.ChangePlayerCurrency, isOptional: true })
    public changePlayerCurrency?: PermissionRulesParam;

    // Stores the get player currency value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetPlayerCurrency, isOptional: true })
    public getPlayerCurrency?: PermissionRulesParam;

    // Stores the change player statistics value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.ChangePlayerStatistics, isOptional: true })
    public changePlayerStatistics?: PermissionRulesParam;

    // Stores the get player statistics value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetPlayerStatistics, isOptional: true })
    public getPlayerStatistics?: PermissionRulesParam;

    // Stores the get statistics leaderboard value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboard, isOptional: true })
    public getStatisticsLeaderboard?: PermissionRulesParam;

    // Stores the get statistics leaderboard around player value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboardAroundPlayer, isOptional: true })
    public getStatisticsLeaderboardAroundPlayer?: PermissionRulesParam;

    // Stores the get custom data value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetCustomData, isOptional: true })
    public getCustomData?: PermissionRulesParam;

    // Stores the set custom data value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetCustomData, isOptional: true })
    public setCustomData?: PermissionRulesParam;

    // Stores the set player data value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetPlayerData, isOptional: true })
    public setPlayerData?: PermissionRulesParam;

    // Stores the get player data value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetPlayerData, isOptional: true })
    public getPlayerData?: PermissionRulesParam;

    // Stores the get player information value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetPlayerInformation, isOptional: true })
    public getPlayerInformation?: PermissionRulesParam;

    // Stores the get players with segment value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetPlayersWithSegment, isOptional: true })
    public getPlayersWithSegment?: PermissionRulesParam;

    // Stores the get players with tag value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetPlayersWithTag, isOptional: true })
    public getPlayersWithTag?: PermissionRulesParam;

    // Stores the get catalog ID value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetCatalogId, isOptional: true })
    public getCatalogId?: PermissionRulesParam;

    // Stores the get owner value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetOwner, isOptional: true })
    public getOwner?: PermissionRulesParam;

    // Stores the get remove status value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetRemoveStatus, isOptional: true })
    public getRemoveStatus?: PermissionRulesParam;

    // Stores the get player friend value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetPlayerFriend, isOptional: true })
    public getPlayerFriend?: PermissionRulesParam;

    // Stores the get player group value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetPlayerGroup, isOptional: true })
    public getPlayerGroup?: PermissionRulesParam;

    // Stores the get player inventory value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetPlayerInventory, isOptional: true })
    public getPlayerInventory?: PermissionRulesParam;

    // Stores the remove player item value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.RemovePlayerItem, isOptional: true })
    public removePlayerItem?: PermissionRulesParam;

    // Stores the create player item value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.CreatePlayerItem, isOptional: true })
    public createPlayerItem?: PermissionRulesParam;

    // Stores the create group value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.CreateGroup, isOptional: true })
    public createGroup?: PermissionRulesParam;

    // Stores the join group value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.JoinGroup, isOptional: true })
    public joinGroup?: PermissionRulesParam;

    // Stores the leave group value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.LeaveGroup, isOptional: true })
    public leaveGroup?: PermissionRulesParam;

    // Stores the set owner value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetOwner, isOptional: true })
    public setOwner?: PermissionRulesParam;

    // Stores the add player friend value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.AddPlayerFriend, isOptional: true })
    public addPlayerFriend?: PermissionRulesParam;

    // Stores the remove player friend value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.RemovePlayerFriend, isOptional: true })
    public removePlayerFriend?: PermissionRulesParam;

    // Stores the get players with display name value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetPlayersWithDisplayName, isOptional: true })
    public getPlayersWithDisplayName?: PermissionRulesParam;

    // Stores the set remove status value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetRemoveStatus, isOptional: true })
    public setRemoveStatus?: PermissionRulesParam;

    // Stores the get friend statistics leaderboard around player value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetFriendStatisticsLeaderboardAroundPlayer, isOptional: true })
    public getFriendStatisticsLeaderboardAroundPlayer?: PermissionRulesParam;

    // Stores the get friend statistics leaderboard value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetFriendStatisticsLeaderboard, isOptional: true })
    public getFriendStatisticsLeaderboard?: PermissionRulesParam;

    // Stores the get currency leaderboard value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetCurrencyLeaderboard, isOptional: true })
    public getCurrencyLeaderboard?: PermissionRulesParam;

    // Stores the get create leaderboard value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
    public getCreateLeaderboard?: PermissionRulesParam;

    // Stores the get last login leaderboard value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetLastLoginLeaderboard, isOptional: true })
    public getLastLoginLeaderboard?: PermissionRulesParam;

    // Stores the get statistics log value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetStatisticsLog, isOptional: true })
    public getStatisticsLog?: PermissionRulesParam;

    // Stores the get currency log value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetCurrencyLog, isOptional: true })
    public getCurrencyLog?: PermissionRulesParam;
}
