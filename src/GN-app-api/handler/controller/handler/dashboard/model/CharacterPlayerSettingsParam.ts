import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { CurrencySettingsParam } from "./CurrencySettingsParam";
import { DataSettingsParam } from "./DataSettingsParam";
import { FriendCatalogSettingsParam } from "./FriendCatalogSettingsParam";
import { GroupCatalogSettingsParam } from "./GroupCatalogSettingsParam";
import { ItemCatalogSettingsParam } from "./ItemCatalogSettingsParam";
import { StatisticsSettingsParam } from "./StatisticsSettingsParam";
import { TagSettingsParam } from "./TagSettingsParam";

export class CharacterPlayerSettingsParam {

	@GNArrayDataMember({ code: ParameterCode.PlayerCurrenciesSettings, elementCls: CurrencySettingsParam, isOptional: true })
	public playerCurrenciesSettings?: Array<CurrencySettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.PlayerStatisticsSettings, elementCls: StatisticsSettingsParam, isOptional: true })
	public playerStatisticsSettings?: Array<StatisticsSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.PlayerDatasSettings, elementCls: DataSettingsParam, isOptional: true })
	public playerDatasSettings?: Array<DataSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.CustomDatasSettings, elementCls: DataSettingsParam, isOptional: true })
	public customDatasSettings?: Array<DataSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.TagsSettings, elementCls: TagSettingsParam, isOptional: true })
	public tagsSettings?: Array<TagSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.PlayerGroupCatalogSettings, elementCls: GroupCatalogSettingsParam, isOptional: true })
	public playerGroupCatalogSettings?: Array<GroupCatalogSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.PlayerItemCatalogSettings, elementCls: ItemCatalogSettingsParam, isOptional: true })
	public playerItemCatalogSettings?: Array<ItemCatalogSettingsParam>;

	@GNArrayDataMember({ code: ParameterCode.PlayerFriendCatalogSettings, elementCls: FriendCatalogSettingsParam, isOptional: true })
	public playerFriendCatalogSettings?: Array<FriendCatalogSettingsParam>;

}
