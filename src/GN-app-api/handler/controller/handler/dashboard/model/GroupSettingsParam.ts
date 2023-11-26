import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { CurrencySettingsParam } from "./CurrencySettingsParam";
import { DataSettingsParam } from "./DataSettingsParam";
import { ItemCatalogSettingsParam } from "./ItemCatalogSettingsParam";
import { StatisticsSettingsParam } from "./StatisticsSettingsParam";
import { TagSettingsParam } from "./TagSettingsParam";

export class GroupSettingsParam {
    @GNArrayDataMember({ code: GNParameterCode.CurrencySettings, elementCls: CurrencySettingsParam, isOptional: true })
    groupCurrencySettings?: Array<CurrencySettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.StatisticsSettings, elementCls: StatisticsSettingsParam, isOptional: true })
    groupStatisticsSettings?: Array<StatisticsSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.DatasSettings, elementCls: DataSettingsParam, isOptional: true })
    groupDatasSettings?: Array<DataSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.CustomDatasSettings, elementCls: DataSettingsParam, isOptional: true })
    customDatasSettings?: Array<DataSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.TagsSettings, elementCls: TagSettingsParam, isOptional: true })
    tagsSettings?: Array<TagSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.ItemCatalogSettings, elementCls: ItemCatalogSettingsParam, isOptional: true })
    groupItemCatalogSettings?: Array<ItemCatalogSettingsParam>;
}
