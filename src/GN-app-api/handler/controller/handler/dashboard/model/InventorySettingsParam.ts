import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { DataSettingsParam } from "./DataSettingsParam";
import { StatisticsSettingsParam } from "./StatisticsSettingsParam";
import { TagSettingsParam } from "./TagSettingsParam";

export class InventorySettingsParam {
	@GNArrayDataMember({ code: ParameterCode.StatisticsSettings, elementCls: StatisticsSettingsParam, isOptional: true })
	inventoryStatisticsSettings?: Array<StatisticsSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.DatasSettings, elementCls: DataSettingsParam, isOptional: true })
	inventoryDatasSettings?: Array<DataSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.CustomDatasSettings, elementCls: DataSettingsParam, isOptional: true })
	customDatasSettings?: Array<DataSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.TagsSettings, elementCls: TagSettingsParam, isOptional: true })
	tagsSettings?: Array<TagSettingsParam>;
}
