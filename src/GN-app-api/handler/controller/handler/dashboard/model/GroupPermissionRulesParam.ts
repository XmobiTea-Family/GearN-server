import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class GroupPermissionRulesParam {

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

	@GNHashtableDataMember({ code: ParameterCode.SetAvatar, isOptional: true })
	public setAvatar?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAvatar, isOptional: true })
	public getAvatar?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetGroupCurrency, isOptional: true })
	public setGroupCurrency?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupCurrency, isOptional: true })
	public getGroupCurrency?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetGroupStatistics, isOptional: true })
	public setGroupStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupStatistics, isOptional: true })
	public getGroupStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboard, isOptional: true })
	public getStatisticsLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboardAroundGroup, isOptional: true })
	public getStatisticsLeaderboardAroundGroup?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCustomData, isOptional: true })
	public getCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetCustomData, isOptional: true })
	public setCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetGroupData, isOptional: true })
	public setGroupData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupData, isOptional: true })
	public getGroupData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupInformation, isOptional: true })
	public getGroupInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupsWithSegment, isOptional: true })
	public getGroupsWithSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupsWithTag, isOptional: true })
	public getGroupsWithTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCatalogId, isOptional: true })
	public getCatalogId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetRemoveStatus, isOptional: true })
	public getRemoveStatus?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupInventory, isOptional: true })
	public getGroupInventory?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveGroupItem, isOptional: true })
	public removeGroupItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateGroupItem, isOptional: true })
	public createGroupItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetMembers, isOptional: true })
	public getMembers?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.AddMember, isOptional: true })
	public addMember?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveMember, isOptional: true })
	public removeMember?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SendGroupMessage, isOptional: true })
	public sendGroupMessage?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupMessage, isOptional: true })
	public getGroupMessage?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetRemoveStatus, isOptional: true })
	public setRemoveStatus?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetGroupsWithDisplayName, isOptional: true })
	public getGroupsWithDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLeaderboard, isOptional: true })
	public getCurrencyLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
	public getCreateLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLog, isOptional: true })
	public getStatisticsLog?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCurrencyLog, isOptional: true })
	public getCurrencyLog?: PermissionRulesParam;

}
