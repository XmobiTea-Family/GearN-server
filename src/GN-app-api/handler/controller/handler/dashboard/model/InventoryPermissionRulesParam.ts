import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class InventoryPermissionRulesParam {

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

	@GNHashtableDataMember({ code: ParameterCode.ChangeItemStatistics, isOptional: true })
	public changeItemStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetItemStatistics, isOptional: true })
	public getItemStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboard, isOptional: true })
	public getStatisticsLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboardAroundItem, isOptional: true })
	public getStatisticsLeaderboardAroundItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCustomData, isOptional: true })
	public getCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetCustomData, isOptional: true })
	public setCustomData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetItemData, isOptional: true })
	public setItemData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetItemData, isOptional: true })
	public getItemData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetItemInformation, isOptional: true })
	public getItemInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetItemsWithSegment, isOptional: true })
	public getItemsWithSegment?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetItemsWithTag, isOptional: true })
	public getItemsWithTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCatalogId, isOptional: true })
	public getCatalogId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetClassId, isOptional: true })
	public getClassId?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetItemType, isOptional: true })
	public getItemType?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAmount, isOptional: true })
	public getAmount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetOwner, isOptional: true })
	public getOwner?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetRemoveStatus, isOptional: true })
	public getRemoveStatus?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetAmount, isOptional: true })
	public setAmount?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetOwner, isOptional: true })
	public setOwner?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetRemoveStatus, isOptional: true })
	public setRemoveStatus?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetItemsWithDisplayName, isOptional: true })
	public getItemsWithDisplayName?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
	public getCreateLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLog, isOptional: true })
	public getStatisticsLog?: PermissionRulesParam;

}
