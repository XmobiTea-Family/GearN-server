import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {
    @BooleanDataMember({ code: GNParameterCode.CatalogId, isOptional: true, defaultValue: false })
    catalogId?: boolean;

    @BooleanDataMember({ code: GNParameterCode.Members, isOptional: true, defaultValue: false })
    members?: boolean;

    @BooleanDataMember({ code: GNParameterCode.RemoveStatus, isOptional: true, defaultValue: false })
    removeStatus?: boolean;

    @BooleanDataMember({ code: GNParameterCode.Segments, isOptional: true, defaultValue: false })
    segments?: boolean;

    @BooleanDataMember({ code: GNParameterCode.CustomDatas, isOptional: true, defaultValue: false })
    customDatas?: boolean;

    @BooleanDataMember({ code: GNParameterCode.DisplayName, isOptional: true, defaultValue: false })
    displayName?: boolean;

    @BooleanDataMember({ code: GNParameterCode.Avatar, isOptional: true, defaultValue: false })
    avatar?: boolean;

    @BooleanDataMember({ code: GNParameterCode.TsCreate, isOptional: true, defaultValue: false })
    tsCreate?: boolean;

    @BooleanDataMember({ code: GNParameterCode.Tags, isOptional: true, defaultValue: false })
    tags?: boolean;

    @BooleanDataMember({ code: GNParameterCode.GroupCurrencies, isOptional: true, defaultValue: false })
    groupCurrencies?: boolean;

    @BooleanDataMember({ code: GNParameterCode.GroupStatistics, isOptional: true, defaultValue: false })
    groupStatistics?: boolean;

    @BooleanDataMember({ code: GNParameterCode.GroupDatas, isOptional: true, defaultValue: false })
    groupDatas?: boolean;

    @BooleanDataMember({ code: GNParameterCode.GroupInventories, isOptional: true, defaultValue: false })
    groupInventories?: boolean;

    @GNArrayDataMember({ code: GNParameterCode.GroupDataKeys, isOptional: true, elementCls: String })
    groupDataKeys?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.GroupCurrencyKeys, isOptional: true, elementCls: String })
    groupCurrencyKeys?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.GroupStatisticsKeys, isOptional: true, elementCls: String })
    groupStatisticsKeys?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.CustomDataKeys, isOptional: true, elementCls: String })
    customDataKeys?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.TagKeys, isOptional: true, elementCls: String })
    tagKeys?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.ItemCatalogIds, isOptional: true, elementCls: String })
    itemCatalogIds?: Array<string>;
}
