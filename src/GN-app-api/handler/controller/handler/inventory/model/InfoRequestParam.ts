import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {
    @BooleanDataMember({ code: ParameterCode.CatalogId, isOptional: true, defaultValue: false })
    catalogId?: boolean;

    @BooleanDataMember({ code: ParameterCode.ClassId, isOptional: true, defaultValue: false })
    classId?: boolean;

    @BooleanDataMember({ code: ParameterCode.ItemType, isOptional: true, defaultValue: false })
    itemType?: boolean;

    @BooleanDataMember({ code: ParameterCode.Amount, isOptional: true, defaultValue: false })
    amount?: boolean;

    @BooleanDataMember({ code: ParameterCode.Owner, isOptional: true, defaultValue: false })
    owner?: boolean;

    @BooleanDataMember({ code: ParameterCode.RemoveStatus, isOptional: true, defaultValue: false })
    removeStatus?: boolean;

    @BooleanDataMember({ code: ParameterCode.Segments, isOptional: true, defaultValue: false })
    segments?: boolean;

    @BooleanDataMember({ code: ParameterCode.CustomDatas, isOptional: true, defaultValue: false })
    customDatas?: boolean;

    @BooleanDataMember({ code: ParameterCode.DisplayName, isOptional: true, defaultValue: false })
    displayName?: boolean;

    @BooleanDataMember({ code: ParameterCode.Avatar, isOptional: true, defaultValue: false })
    avatar?: boolean;

    @BooleanDataMember({ code: ParameterCode.TsCreate, isOptional: true, defaultValue: false })
    tsCreate?: boolean;

    @BooleanDataMember({ code: ParameterCode.Tags, isOptional: true, defaultValue: false })
    tags?: boolean;

    @BooleanDataMember({ code: ParameterCode.ItemStatistics, isOptional: true, defaultValue: false })
    itemStatistics?: boolean;

    @BooleanDataMember({ code: ParameterCode.ItemDatas, isOptional: true, defaultValue: false })
    itemDatas?: boolean;

    @GNArrayDataMember({ code: ParameterCode.ItemDataKeys, isOptional: true, elementCls: String })
    itemDataKeys?: Array<string>;

    @GNArrayDataMember({ code: ParameterCode.ItemStatisticsKeys, isOptional: true, elementCls: String })
    itemStatisticsKeys?: Array<string>;

    @GNArrayDataMember({ code: ParameterCode.CustomDataKeys, isOptional: true, elementCls: String })
    customDataKeys?: Array<string>;

    @GNArrayDataMember({ code: ParameterCode.TagKeys, isOptional: true, elementCls: String })
    tagKeys?: Array<string>;
}
