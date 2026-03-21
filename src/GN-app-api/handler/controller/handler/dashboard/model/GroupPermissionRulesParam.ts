import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class GroupPermissionRulesParam {

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

	// Stores the set avatar value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetAvatar, isOptional: true })
	public setAvatar?: PermissionRulesParam;

	// Stores the get avatar value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetAvatar, isOptional: true })
	public getAvatar?: PermissionRulesParam;

	// Stores the change group currency value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.ChangeGroupCurrency, isOptional: true })
	public changeGroupCurrency?: PermissionRulesParam;

	// Stores the get group currency value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetGroupCurrency, isOptional: true })
	public getGroupCurrency?: PermissionRulesParam;

	// Stores the change group statistics value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.ChangeGroupStatistics, isOptional: true })
	public changeGroupStatistics?: PermissionRulesParam;

	// Stores the get group statistics value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetGroupStatistics, isOptional: true })
	public getGroupStatistics?: PermissionRulesParam;

	// Stores the get statistics leaderboard value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboard, isOptional: true })
	public getStatisticsLeaderboard?: PermissionRulesParam;

	// Stores the get statistics leaderboard around group value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboardAroundGroup, isOptional: true })
	public getStatisticsLeaderboardAroundGroup?: PermissionRulesParam;

	// Stores the get custom data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetCustomData, isOptional: true })
	public getCustomData?: PermissionRulesParam;

	// Stores the set custom data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetCustomData, isOptional: true })
	public setCustomData?: PermissionRulesParam;

	// Stores the set group data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetGroupData, isOptional: true })
	public setGroupData?: PermissionRulesParam;

	// Stores the get group data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetGroupData, isOptional: true })
	public getGroupData?: PermissionRulesParam;

	// Stores the get group information value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetGroupInformation, isOptional: true })
	public getGroupInformation?: PermissionRulesParam;

	// Stores the get groups with segment value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetGroupsWithSegment, isOptional: true })
	public getGroupsWithSegment?: PermissionRulesParam;

	// Stores the get groups with tag value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetGroupsWithTag, isOptional: true })
	public getGroupsWithTag?: PermissionRulesParam;

	// Stores the get catalog ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetCatalogId, isOptional: true })
	public getCatalogId?: PermissionRulesParam;

	// Stores the get remove status value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetRemoveStatus, isOptional: true })
	public getRemoveStatus?: PermissionRulesParam;

	// Stores the get group inventory value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetGroupInventory, isOptional: true })
	public getGroupInventory?: PermissionRulesParam;

	// Stores the remove group item value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.RemoveGroupItem, isOptional: true })
	public removeGroupItem?: PermissionRulesParam;

	// Stores the create group item value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.CreateGroupItem, isOptional: true })
	public createGroupItem?: PermissionRulesParam;

	// Stores the get members value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetMembers, isOptional: true })
	public getMembers?: PermissionRulesParam;

	// Stores the add member value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.AddMember, isOptional: true })
	public addMember?: PermissionRulesParam;

	// Stores the remove member value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.RemoveMember, isOptional: true })
	public removeMember?: PermissionRulesParam;

	// Stores the send group message value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SendGroupMessage, isOptional: true })
	public sendGroupMessage?: PermissionRulesParam;

	// Stores the get group message value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetGroupMessage, isOptional: true })
	public getGroupMessage?: PermissionRulesParam;

	// Stores the set remove status value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetRemoveStatus, isOptional: true })
	public setRemoveStatus?: PermissionRulesParam;

	// Stores the get groups with display name value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetGroupsWithDisplayName, isOptional: true })
	public getGroupsWithDisplayName?: PermissionRulesParam;

	// Stores the get currency leaderboard value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLeaderboard, isOptional: true })
	public getCurrencyLeaderboard?: PermissionRulesParam;

	// Stores the get create leaderboard value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
	public getCreateLeaderboard?: PermissionRulesParam;

	// Stores the get statistics log value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLog, isOptional: true })
	public getStatisticsLog?: PermissionRulesParam;

	// Stores the get currency log value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLog, isOptional: true })
	public getCurrencyLog?: PermissionRulesParam;

}
