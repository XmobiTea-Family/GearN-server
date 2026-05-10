import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { DataSettingsParam } from "./DataSettingsParam";
import { StatisticsSettingsParam } from "./StatisticsSettingsParam";
import { TagSettingsParam } from "./TagSettingsParam";

export class InventorySettingsParam {
    // Stores the item statistics settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.ItemStatisticsSettings, elementCls: StatisticsSettingsParam, isOptional: true })
    public itemStatisticsSettings?: Array<StatisticsSettingsParam>;

    // Stores the item datas settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.ItemDatasSettings, elementCls: DataSettingsParam, isOptional: true })
    public itemDatasSettings?: Array<DataSettingsParam>;

    // Stores the custom datas settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.CustomDatasSettings, elementCls: DataSettingsParam, isOptional: true })
    public customDatasSettings?: Array<DataSettingsParam>;

    // Stores the tags settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.TagsSettings, elementCls: TagSettingsParam, isOptional: true })
    public tagsSettings?: Array<TagSettingsParam>;
}
