import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class InventoryPermissionRulesParam {
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

    @GNHashtableDataMember({ code: GNParameterCode.SetAvatar, isOptional: true })
    setAvatar?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetAvatar, isOptional: true })
    getAvatar?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetItemStatistics, isOptional: true })
    setItemStatistics?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetItemStatistics, isOptional: true })
    getItemStatistics?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetStatisticsLeaderboard, isOptional: true })
    getStatisticsLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetStatisticsLeaderboardAroundItem, isOptional: true })
    getStatisticsLeaderboardAroundItem?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCustomData, isOptional: true })
    getCustomData?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetCustomData, isOptional: true })
    setCustomData?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetItemData, isOptional: true })
    setItemData?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetItemData, isOptional: true })
    getItemData?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetItemInformation, isOptional: true })
    getItemInformation?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetItemsWithSegment, isOptional: true })
    getItemsWithSegment?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetItemsWithTag, isOptional: true })
    getItemsWithTag?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCatalogId, isOptional: true })
    getCatalogId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetClassId, isOptional: true })
    getClassId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetItemType, isOptional: true })
    getItemType?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetAmount, isOptional: true })
    getAmount?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetOwner, isOptional: true })
    getOwner?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetRemoveStatus, isOptional: true })
    getRemoveStatus?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetAmount, isOptional: true })
    setAmount?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetOwner, isOptional: true })
    setOwner?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetRemoveStatus, isOptional: true })
    setRemoveStatus?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetItemsWithDisplayName, isOptional: true })
    getItemsWithDisplayName?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCreateLeaderboard, isOptional: true })
    getCreateLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetStatisticsLog, isOptional: true })
    getStatisticsLog?: PermissionRulesParam;

}
