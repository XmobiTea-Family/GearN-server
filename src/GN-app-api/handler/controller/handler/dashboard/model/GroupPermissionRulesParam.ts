import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class GroupPermissionRulesParam {
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

    @GNHashtableDataMember({ code: GNParameterCode.SetGroupCurrency, isOptional: true })
    setGroupCurrency?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetGroupCurrency, isOptional: true })
    getGroupCurrency?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetGroupStatistics, isOptional: true })
    setGroupStatistics?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetGroupStatistics, isOptional: true })
    getGroupStatistics?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetStatisticsLeaderboard, isOptional: true })
    getStatisticsLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetStatisticsLeaderboardAroundGroup, isOptional: true })
    getStatisticsLeaderboardAroundGroup?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCustomData, isOptional: true })
    getCustomData?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetCustomData, isOptional: true })
    setCustomData?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetGroupData, isOptional: true })
    setGroupData?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetGroupData, isOptional: true })
    getGroupData?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetGroupInformation, isOptional: true })
    getGroupInformation?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetGroupsWithSegment, isOptional: true })
    getGroupsWithSegment?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetGroupsWithTag, isOptional: true })
    getGroupsWithTag?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCatalogId, isOptional: true })
    getCatalogId?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetRemoveStatus, isOptional: true })
    getRemoveStatus?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetGroupInventory, isOptional: true })
    getGroupInventory?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.RemoveGroupItem, isOptional: true })
    removeGroupItem?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GrantGroupItem, isOptional: true })
    grantGroupItem?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetMembers, isOptional: true })
    getMembers?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.AddMember, isOptional: true })
    addMember?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.RemoveMember, isOptional: true })
    removeMember?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SendGroupMessage, isOptional: true })
    sendGroupMessage?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetGroupMessage, isOptional: true })
    getGroupMessage?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetRemoveStatus, isOptional: true })
    setRemoveStatus?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetGroupsWithDisplayName, isOptional: true })
    getGroupsWithDisplayName?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCurrencyLeaderboard, isOptional: true })
    getCurrencyLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCreateLeaderboard, isOptional: true })
    getCreateLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetStatisticsLog, isOptional: true })
    getStatisticsLog?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCurrencyLog, isOptional: true })
    getCurrencyLog?: PermissionRulesParam;

}
