import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { CurrencySettingsParam } from "./CurrencySettingsParam";
import { DataSettingsParam } from "./DataSettingsParam";
import { ItemCatalogSettingsParam } from "./ItemCatalogSettingsParam";
import { StatisticsSettingsParam } from "./StatisticsSettingsParam";
import { TagSettingsParam } from "./TagSettingsParam";

export class GroupSettingsParam {

	@GNArrayDataMember({ code: ParameterCode.CurrencySettings, elementCls: CurrencySettingsParam, isOptional: true })
	public groupCurrencySettings?: Array<CurrencySettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.StatisticsSettings, elementCls: StatisticsSettingsParam, isOptional: true })
	public groupStatisticsSettings?: Array<StatisticsSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.DatasSettings, elementCls: DataSettingsParam, isOptional: true })
	public groupDatasSettings?: Array<DataSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.CustomDatasSettings, elementCls: DataSettingsParam, isOptional: true })
	public customDatasSettings?: Array<DataSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.TagsSettings, elementCls: TagSettingsParam, isOptional: true })
	public tagsSettings?: Array<TagSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.ItemCatalogSettings, elementCls: ItemCatalogSettingsParam, isOptional: true })
	public groupItemCatalogSettings?: Array<ItemCatalogSettingsParam>;

}
