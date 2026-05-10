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
    // Stores the player currencies settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.PlayerCurrenciesSettings, elementCls: CurrencySettingsParam, isOptional: true })
    public playerCurrenciesSettings?: Array<CurrencySettingsParam>;

    // Stores the player statistics settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.PlayerStatisticsSettings, elementCls: StatisticsSettingsParam, isOptional: true })
    public playerStatisticsSettings?: Array<StatisticsSettingsParam>;

    // Stores the player datas settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.PlayerDatasSettings, elementCls: DataSettingsParam, isOptional: true })
    public playerDatasSettings?: Array<DataSettingsParam>;

    // Stores the custom datas settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.CustomDatasSettings, elementCls: DataSettingsParam, isOptional: true })
    public customDatasSettings?: Array<DataSettingsParam>;

    // Stores the tags settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.TagsSettings, elementCls: TagSettingsParam, isOptional: true })
    public tagsSettings?: Array<TagSettingsParam>;

    // Stores the player group catalog settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.PlayerGroupCatalogSettings, elementCls: GroupCatalogSettingsParam, isOptional: true })
    public playerGroupCatalogSettings?: Array<GroupCatalogSettingsParam>;

    // Stores the player item catalog settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.PlayerItemCatalogSettings, elementCls: ItemCatalogSettingsParam, isOptional: true })
    public playerItemCatalogSettings?: Array<ItemCatalogSettingsParam>;

    // Stores the player friend catalog settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.PlayerFriendCatalogSettings, elementCls: FriendCatalogSettingsParam, isOptional: true })
    public playerFriendCatalogSettings?: Array<FriendCatalogSettingsParam>;
}
