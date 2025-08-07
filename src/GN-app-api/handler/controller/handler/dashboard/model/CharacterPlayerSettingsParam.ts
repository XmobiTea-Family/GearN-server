import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { CharacterCatalogSettingsParam } from "./CharacterCatalogSettingsParam";
import { CurrencySettingsParam } from "./CurrencySettingsParam";
import { DataSettingsParam } from "./DataSettingsParam";
import { FriendCatalogSettingsParam } from "./FriendCatalogSettingsParam";
import { GroupCatalogSettingsParam } from "./GroupCatalogSettingsParam";
import { ItemCatalogSettingsParam } from "./ItemCatalogSettingsParam";
import { StatisticsSettingsParam } from "./StatisticsSettingsParam";
import { TagSettingsParam } from "./TagSettingsParam";

export class CharacterPlayerSettingsParam {
	@GNArrayDataMember({ code: ParameterCode.CurrencySettings, elementCls: CurrencySettingsParam, isOptional: true })
	playerCurrencySettings?: Array<CurrencySettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.StatisticsSettings, elementCls: StatisticsSettingsParam, isOptional: true })
	playerStatisticsSettings?: Array<StatisticsSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.DatasSettings, elementCls: DataSettingsParam, isOptional: true })
	playerDatasSettings?: Array<DataSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.CustomDatasSettings, elementCls: DataSettingsParam, isOptional: true })
	customDatasSettings?: Array<DataSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.TagsSettings, elementCls: TagSettingsParam, isOptional: true })
	tagsSettings?: Array<TagSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.GroupCatalogSettings, elementCls: GroupCatalogSettingsParam, isOptional: true })
	playerGroupCatalogSettings?: Array<GroupCatalogSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.ItemCatalogSettings, elementCls: ItemCatalogSettingsParam, isOptional: true })
	playerItemCatalogSettings?: Array<ItemCatalogSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.FriendCatalogSettings, elementCls: FriendCatalogSettingsParam, isOptional: true })
	playerFriendCatalogSettings?: Array<FriendCatalogSettingsParam>;
}
