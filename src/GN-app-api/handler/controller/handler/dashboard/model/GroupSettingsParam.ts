import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { CurrencySettingsParam } from "./CurrencySettingsParam";
import { DataSettingsParam } from "./DataSettingsParam";
import { ItemCatalogSettingsParam } from "./ItemCatalogSettingsParam";
import { StatisticsSettingsParam } from "./StatisticsSettingsParam";
import { TagSettingsParam } from "./TagSettingsParam";

export class GroupSettingsParam {
    // Stores the group currencies settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.GroupCurrenciesSettings, elementCls: CurrencySettingsParam, isOptional: true })
    public groupCurrenciesSettings?: Array<CurrencySettingsParam>;

    // Stores the group statistics settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.GroupStatisticsSettings, elementCls: StatisticsSettingsParam, isOptional: true })
    public groupStatisticsSettings?: Array<StatisticsSettingsParam>;

    // Stores the group datas settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.GroupDatasSettings, elementCls: DataSettingsParam, isOptional: true })
    public groupDatasSettings?: Array<DataSettingsParam>;

    // Stores the custom datas settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.CustomDatasSettings, elementCls: DataSettingsParam, isOptional: true })
    public customDatasSettings?: Array<DataSettingsParam>;

    // Stores the tags settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.TagsSettings, elementCls: TagSettingsParam, isOptional: true })
    public tagsSettings?: Array<TagSettingsParam>;

    // Stores the group item catalog settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.GroupItemCatalogSettings, elementCls: ItemCatalogSettingsParam, isOptional: true })
    public groupItemCatalogSettings?: Array<ItemCatalogSettingsParam>;
}
