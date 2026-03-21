import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class InventoryPermissionRulesParam {

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

	// Stores the change item statistics value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.ChangeItemStatistics, isOptional: true })
	public changeItemStatistics?: PermissionRulesParam;

	// Stores the get item statistics value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetItemStatistics, isOptional: true })
	public getItemStatistics?: PermissionRulesParam;

	// Stores the get statistics leaderboard value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboard, isOptional: true })
	public getStatisticsLeaderboard?: PermissionRulesParam;

	// Stores the get statistics leaderboard around item value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLeaderboardAroundItem, isOptional: true })
	public getStatisticsLeaderboardAroundItem?: PermissionRulesParam;

	// Stores the get custom data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetCustomData, isOptional: true })
	public getCustomData?: PermissionRulesParam;

	// Stores the set custom data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetCustomData, isOptional: true })
	public setCustomData?: PermissionRulesParam;

	// Stores the set item data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetItemData, isOptional: true })
	public setItemData?: PermissionRulesParam;

	// Stores the get item data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetItemData, isOptional: true })
	public getItemData?: PermissionRulesParam;

	// Stores the get item information value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetItemInformation, isOptional: true })
	public getItemInformation?: PermissionRulesParam;

	// Stores the get items with segment value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetItemsWithSegment, isOptional: true })
	public getItemsWithSegment?: PermissionRulesParam;

	// Stores the get items with tag value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetItemsWithTag, isOptional: true })
	public getItemsWithTag?: PermissionRulesParam;

	// Stores the get catalog ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetCatalogId, isOptional: true })
	public getCatalogId?: PermissionRulesParam;

	// Stores the get class ID value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetClassId, isOptional: true })
	public getClassId?: PermissionRulesParam;

	// Stores the get item type value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetItemType, isOptional: true })
	public getItemType?: PermissionRulesParam;

	// Stores the get amount value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetAmount, isOptional: true })
	public getAmount?: PermissionRulesParam;

	// Stores the get owner value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetOwner, isOptional: true })
	public getOwner?: PermissionRulesParam;

	// Stores the get remove status value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetRemoveStatus, isOptional: true })
	public getRemoveStatus?: PermissionRulesParam;

	// Stores the set amount value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetAmount, isOptional: true })
	public setAmount?: PermissionRulesParam;

	// Stores the set owner value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetOwner, isOptional: true })
	public setOwner?: PermissionRulesParam;

	// Stores the set remove status value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetRemoveStatus, isOptional: true })
	public setRemoveStatus?: PermissionRulesParam;

	// Stores the get items with display name value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetItemsWithDisplayName, isOptional: true })
	public getItemsWithDisplayName?: PermissionRulesParam;

	// Stores the get create leaderboard value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
	public getCreateLeaderboard?: PermissionRulesParam;

	// Stores the get statistics log value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetStatisticsLog, isOptional: true })
	public getStatisticsLog?: PermissionRulesParam;

}
