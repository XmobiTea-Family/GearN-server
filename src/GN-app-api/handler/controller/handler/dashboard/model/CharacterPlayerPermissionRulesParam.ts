import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class CharacterPlayerPermissionRulesParam {

	@GNHashtableDataMember({ code: ParameterCode.AddSegment, isOptional: true })
	public addSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveSegment, isOptional: true })
	public removeSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetSegment, isOptional: true })
	public getSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetTag, isOptional: true })
	public setTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveTag, isOptional: true })
	public removeTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetTag, isOptional: true })
	public getTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetDisplayName, isOptional: true })
	public getDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetDisplayName, isOptional: true })
	public setDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetTsCreate, isOptional: true })
	public getTsCreate?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetIpAddressCreate, isOptional: true })
	public getIpAddressCreate?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetTsLastLogin, isOptional: true })
	public getTsLastLogin?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerBan, isOptional: true })
	public setPlayerBan?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerBan, isOptional: true })
	public getPlayerBan?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetCountryCode, isOptional: true })
	public setCountryCode?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCountryCode, isOptional: true })
	public getCountryCode?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetAvatar, isOptional: true })
	public setAvatar?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAvatar, isOptional: true })
	public getAvatar?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerCurrency, isOptional: true })
	public setPlayerCurrency?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerCurrency, isOptional: true })
	public getPlayerCurrency?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerStatistics, isOptional: true })
	public setPlayerStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerStatistics, isOptional: true })
	public getPlayerStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboard, isOptional: true })
	public getStatisticsLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboardAroundPlayer, isOptional: true })
	public getStatisticsLeaderboardAroundPlayer?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCustomData, isOptional: true })
	public getCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetCustomData, isOptional: true })
	public setCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerData, isOptional: true })
	public setPlayerData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerData, isOptional: true })
	public getPlayerData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerInformation, isOptional: true })
	public getPlayerInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithSegment, isOptional: true })
	public getPlayersWithSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithTag, isOptional: true })
	public getPlayersWithTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCatalogId, isOptional: true })
	public getCatalogId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetOwner, isOptional: true })
	public getOwner?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetRemoveStatus, isOptional: true })
	public getRemoveStatus?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerFriend, isOptional: true })
	public getPlayerFriend?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerGroup, isOptional: true })
	public getPlayerGroup?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerInventory, isOptional: true })
	public getPlayerInventory?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemovePlayerItem, isOptional: true })
	public removePlayerItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreatePlayerItem, isOptional: true })
	public createPlayerItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateGroup, isOptional: true })
	public createGroup?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.JoinGroup, isOptional: true })
	public joinGroup?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LeaveGroup, isOptional: true })
	public leaveGroup?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetOwner, isOptional: true })
	public setOwner?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.AddPlayerFriend, isOptional: true })
	public addPlayerFriend?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemovePlayerFriend, isOptional: true })
	public removePlayerFriend?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithDisplayName, isOptional: true })
	public getPlayersWithDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetRemoveStatus, isOptional: true })
	public setRemoveStatus?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetFriendStatisticsLeaderboardAroundPlayer, isOptional: true })
	public getFriendStatisticsLeaderboardAroundPlayer?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetFriendStatisticsLeaderboard, isOptional: true })
	public getFriendStatisticsLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLeaderboard, isOptional: true })
	public getCurrencyLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
	public getCreateLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetLastLoginLeaderboard, isOptional: true })
	public getLastLoginLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLog, isOptional: true })
	public getStatisticsLog?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLog, isOptional: true })
	public getCurrencyLog?: PermissionRulesParam;

}
