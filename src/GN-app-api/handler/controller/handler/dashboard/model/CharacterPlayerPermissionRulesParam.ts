import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class CharacterPlayerPermissionRulesParam {
	@GNHashtableDataMember({ code: ParameterCode.AddSegment, isOptional: true })
	addSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveSegment, isOptional: true })
	removeSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetSegment, isOptional: true })
	getSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetTag, isOptional: true })
	setTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveTag, isOptional: true })
	removeTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetTag, isOptional: true })
	getTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetDisplayName, isOptional: true })
	getDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetDisplayName, isOptional: true })
	setDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetTsCreate, isOptional: true })
	getTsCreate?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetIpAddressCreate, isOptional: true })
	getIpAddressCreate?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetTsLastLogin, isOptional: true })
	getTsLastLogin?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerBan, isOptional: true })
	setPlayerBan?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerBan, isOptional: true })
	getPlayerBan?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetCountryCode, isOptional: true })
	setCountryCode?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCountryCode, isOptional: true })
	getCountryCode?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetAvatar, isOptional: true })
	setAvatar?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAvatar, isOptional: true })
	getAvatar?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerCurrency, isOptional: true })
	setPlayerCurrency?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerCurrency, isOptional: true })
	getPlayerCurrency?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerStatistics, isOptional: true })
	setPlayerStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerStatistics, isOptional: true })
	getPlayerStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboard, isOptional: true })
	getStatisticsLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboardAroundPlayer, isOptional: true })
	getStatisticsLeaderboardAroundPlayer?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCustomData, isOptional: true })
	getCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetCustomData, isOptional: true })
	setCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetPlayerData, isOptional: true })
	setPlayerData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerData, isOptional: true })
	getPlayerData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerInformation, isOptional: true })
	getPlayerInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithSegment, isOptional: true })
	getPlayersWithSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithTag, isOptional: true })
	getPlayersWithTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCatalogId, isOptional: true })
	getCatalogId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetOwner, isOptional: true })
	getOwner?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetRemoveStatus, isOptional: true })
	getRemoveStatus?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerFriend, isOptional: true })
	getPlayerFriend?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerGroup, isOptional: true })
	getPlayerGroup?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayerInventory, isOptional: true })
	getPlayerInventory?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemovePlayerItem, isOptional: true })
	removePlayerItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreatePlayerItem, isOptional: true })
	createPlayerItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateGroup, isOptional: true })
	createGroup?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.JoinGroup, isOptional: true })
	joinGroup?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.LeaveGroup, isOptional: true })
	leaveGroup?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetOwner, isOptional: true })
	setOwner?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.AddPlayerFriend, isOptional: true })
	addPlayerFriend?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemovePlayerFriend, isOptional: true })
	removePlayerFriend?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetPlayersWithDisplayName, isOptional: true })
	getPlayersWithDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetRemoveStatus, isOptional: true })
	setRemoveStatus?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetFriendStatisticsLeaderboardAroundPlayer, isOptional: true })
	getFriendStatisticsLeaderboardAroundPlayer?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetFriendStatisticsLeaderboard, isOptional: true })
	getFriendStatisticsLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLeaderboard, isOptional: true })
	getCurrencyLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
	getCreateLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetLastLoginLeaderboard, isOptional: true })
	getLastLoginLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLog, isOptional: true })
	getStatisticsLog?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLog, isOptional: true })
	getCurrencyLog?: PermissionRulesParam;

}
