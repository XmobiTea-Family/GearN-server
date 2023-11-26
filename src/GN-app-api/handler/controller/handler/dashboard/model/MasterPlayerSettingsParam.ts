import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { CurrencySettingsParam } from "./CurrencySettingsParam";
import { DataSettingsParam } from "./DataSettingsParam";
import { GenericServiceSettingsParam } from "./GenericServiceSettingsParam";
import { StatisticsSettingsParam } from "./StatisticsSettingsParam";
import { TagSettingsParam } from "./TagSettingsParam";

export class MasterPlayerSettingsParam {
    @GNArrayDataMember({ code: GNParameterCode.GenericServiceSettings, elementCls: GenericServiceSettingsParam, isOptional: true, })
    genericServiceSettings?: Array<GenericServiceSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.CurrencySettings, elementCls: CurrencySettingsParam, isOptional: true, })
    playerCurrencySettings?: Array<CurrencySettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.StatisticsSettings, elementCls: StatisticsSettingsParam, isOptional: true, })
    playerStatisticsSettings?: Array<StatisticsSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.DatasSettings, elementCls: DataSettingsParam, isOptional: true, })
    playerDatasSettings?: Array<DataSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.CustomDatasSettings, elementCls: DataSettingsParam, isOptional: true, })
    customDatasSettings?: Array<DataSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.TagsSettings, elementCls: TagSettingsParam, isOptional: true, })
    tagsSettings?: Array<TagSettingsParam>;
    
}
