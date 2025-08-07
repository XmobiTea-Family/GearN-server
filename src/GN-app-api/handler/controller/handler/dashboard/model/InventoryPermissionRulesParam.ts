import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class InventoryPermissionRulesParam {
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

	@GNHashtableDataMember({ code: ParameterCode.SetItemStatistics, isOptional: true })
	setItemStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetItemStatistics, isOptional: true })
	getItemStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboard, isOptional: true })
	getStatisticsLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboardAroundItem, isOptional: true })
	getStatisticsLeaderboardAroundItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCustomData, isOptional: true })
	getCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetCustomData, isOptional: true })
	setCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetItemData, isOptional: true })
	setItemData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetItemData, isOptional: true })
	getItemData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetItemInformation, isOptional: true })
	getItemInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetItemsWithSegment, isOptional: true })
	getItemsWithSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetItemsWithTag, isOptional: true })
	getItemsWithTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCatalogId, isOptional: true })
	getCatalogId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetClassId, isOptional: true })
	getClassId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetItemType, isOptional: true })
	getItemType?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAmount, isOptional: true })
	getAmount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetOwner, isOptional: true })
	getOwner?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetRemoveStatus, isOptional: true })
	getRemoveStatus?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetAmount, isOptional: true })
	setAmount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetOwner, isOptional: true })
	setOwner?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetRemoveStatus, isOptional: true })
	setRemoveStatus?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetItemsWithDisplayName, isOptional: true })
	getItemsWithDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
	getCreateLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLog, isOptional: true })
	getStatisticsLog?: PermissionRulesParam;

}
