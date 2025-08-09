import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { CurrencySettingsParam } from "./CurrencySettingsParam";
import { DataSettingsParam } from "./DataSettingsParam";
import { GenericServiceSettingsParam } from "./GenericServiceSettingsParam";
import { StatisticsSettingsParam } from "./StatisticsSettingsParam";
import { TagSettingsParam } from "./TagSettingsParam";

export class MasterPlayerSettingsParam {
	@GNArrayDataMember({ code: ParameterCode.GenericServiceSettings, elementCls: GenericServiceSettingsParam, isOptional: true, })
	public genericServiceSettings?: Array<GenericServiceSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.PlayerCurrenciesSettings, elementCls: CurrencySettingsParam, isOptional: true, })
	public playerCurrenciesSettings?: Array<CurrencySettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.PlayerStatisticsSettings, elementCls: StatisticsSettingsParam, isOptional: true, })
	public playerStatisticsSettings?: Array<StatisticsSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.PlayerDatasSettings, elementCls: DataSettingsParam, isOptional: true, })
	public playerDatasSettings?: Array<DataSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.CustomDatasSettings, elementCls: DataSettingsParam, isOptional: true, })
	public customDatasSettings?: Array<DataSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.TagsSettings, elementCls: TagSettingsParam, isOptional: true, })
	public tagsSettings?: Array<TagSettingsParam>;

}
