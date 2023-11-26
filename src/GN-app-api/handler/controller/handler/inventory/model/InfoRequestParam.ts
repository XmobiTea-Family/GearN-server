import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {
    @BooleanDataMember({ code: GNParameterCode.CatalogId, isOptional: true, defaultValue: false })
    catalogId?: boolean;

    @BooleanDataMember({ code: GNParameterCode.ClassId, isOptional: true, defaultValue: false })
    classId?: boolean;

    @BooleanDataMember({ code: GNParameterCode.ItemType, isOptional: true, defaultValue: false })
    itemType?: boolean;

    @BooleanDataMember({ code: GNParameterCode.Amount, isOptional: true, defaultValue: false })
    amount?: boolean;

    @BooleanDataMember({ code: GNParameterCode.Owner, isOptional: true, defaultValue: false })
    owner?: boolean;

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

    @BooleanDataMember({ code: GNParameterCode.ItemStatistics, isOptional: true, defaultValue: false })
    itemStatistics?: boolean;

    @BooleanDataMember({ code: GNParameterCode.ItemDatas, isOptional: true, defaultValue: false })
    itemDatas?: boolean;

    @GNArrayDataMember({ code: GNParameterCode.ItemDataKeys, isOptional: true, elementCls: String })
    itemDataKeys?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.ItemStatisticsKeys, isOptional: true, elementCls: String })
    itemStatisticsKeys?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.CustomDataKeys, isOptional: true, elementCls: String })
    customDataKeys?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.TagKeys, isOptional: true, elementCls: String })
    tagKeys?: Array<string>;
}
