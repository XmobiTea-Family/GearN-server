import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { DataSettingsParam } from "./DataSettingsParam";
import { StatisticsSettingsParam } from "./StatisticsSettingsParam";
import { TagSettingsParam } from "./TagSettingsParam";

export class InventorySettingsParam {
    @GNArrayDataMember({ code: GNParameterCode.StatisticsSettings, elementCls: StatisticsSettingsParam, isOptional: true })
    inventoryStatisticsSettings?: Array<StatisticsSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.DatasSettings, elementCls: DataSettingsParam, isOptional: true })
    inventoryDatasSettings?: Array<DataSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.CustomDatasSettings, elementCls: DataSettingsParam, isOptional: true })
    customDatasSettings?: Array<DataSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.TagsSettings, elementCls: TagSettingsParam, isOptional: true })
    tagsSettings?: Array<TagSettingsParam>;
}
