import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { CurrencySettingsParam } from "./CurrencySettingsParam";
import { DataSettingsParam } from "./DataSettingsParam";
import { ItemCatalogSettingsParam } from "./ItemCatalogSettingsParam";
import { StatisticsSettingsParam } from "./StatisticsSettingsParam";
import { TagSettingsParam } from "./TagSettingsParam";

export class GroupSettingsParam {

	@GNArrayDataMember({ code: ParameterCode.GroupCurrenciesSettings, elementCls: CurrencySettingsParam, isOptional: true })
	public groupCurrenciesSettings?: Array<CurrencySettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.GroupStatisticsSettings, elementCls: StatisticsSettingsParam, isOptional: true })
	public groupStatisticsSettings?: Array<StatisticsSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.GroupDatasSettings, elementCls: DataSettingsParam, isOptional: true })
	public groupDatasSettings?: Array<DataSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.CustomDatasSettings, elementCls: DataSettingsParam, isOptional: true })
	public customDatasSettings?: Array<DataSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.TagsSettings, elementCls: TagSettingsParam, isOptional: true })
	public tagsSettings?: Array<TagSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.GroupItemCatalogSettings, elementCls: ItemCatalogSettingsParam, isOptional: true })
	public groupItemCatalogSettings?: Array<ItemCatalogSettingsParam>;

}
