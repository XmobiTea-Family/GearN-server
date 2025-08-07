import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class GroupPermissionRulesParam {
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

	@GNHashtableDataMember({ code: ParameterCode.SetAvatar, isOptional: true })
	setAvatar?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAvatar, isOptional: true })
	getAvatar?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetGroupCurrency, isOptional: true })
	setGroupCurrency?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupCurrency, isOptional: true })
	getGroupCurrency?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetGroupStatistics, isOptional: true })
	setGroupStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupStatistics, isOptional: true })
	getGroupStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboard, isOptional: true })
	getStatisticsLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboardAroundGroup, isOptional: true })
	getStatisticsLeaderboardAroundGroup?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCustomData, isOptional: true })
	getCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetCustomData, isOptional: true })
	setCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetGroupData, isOptional: true })
	setGroupData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupData, isOptional: true })
	getGroupData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupInformation, isOptional: true })
	getGroupInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupsWithSegment, isOptional: true })
	getGroupsWithSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupsWithTag, isOptional: true })
	getGroupsWithTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCatalogId, isOptional: true })
	getCatalogId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetRemoveStatus, isOptional: true })
	getRemoveStatus?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupInventory, isOptional: true })
	getGroupInventory?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveGroupItem, isOptional: true })
	removeGroupItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateGroupItem, isOptional: true })
	createGroupItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetMembers, isOptional: true })
	getMembers?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.AddMember, isOptional: true })
	addMember?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveMember, isOptional: true })
	removeMember?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SendGroupMessage, isOptional: true })
	sendGroupMessage?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupMessage, isOptional: true })
	getGroupMessage?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetRemoveStatus, isOptional: true })
	setRemoveStatus?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupsWithDisplayName, isOptional: true })
	getGroupsWithDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLeaderboard, isOptional: true })
	getCurrencyLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
	getCreateLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLog, isOptional: true })
	getStatisticsLog?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLog, isOptional: true })
	getCurrencyLog?: PermissionRulesParam;

}
