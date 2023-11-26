import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { CharacterCatalogSettingsParam } from "./CharacterCatalogSettingsParam";
import { CurrencySettingsParam } from "./CurrencySettingsParam";
import { DataSettingsParam } from "./DataSettingsParam";
import { FriendCatalogSettingsParam } from "./FriendCatalogSettingsParam";
import { GroupCatalogSettingsParam } from "./GroupCatalogSettingsParam";
import { ItemCatalogSettingsParam } from "./ItemCatalogSettingsParam";
import { StatisticsSettingsParam } from "./StatisticsSettingsParam";
import { TagSettingsParam } from "./TagSettingsParam";

export class GamePlayerSettingsParam {
    @GNArrayDataMember({ code: GNParameterCode.CurrencySettings, elementCls: CurrencySettingsParam, isOptional: true })
    playerCurrencySettings?: Array<CurrencySettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.StatisticsSettings, elementCls: StatisticsSettingsParam, isOptional: true })
    playerStatisticsSettings?: Array<StatisticsSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.DatasSettings, elementCls: DataSettingsParam, isOptional: true })
    playerDatasSettings?: Array<DataSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.CustomDatasSettings, elementCls: DataSettingsParam, isOptional: true })
    customDatasSettings?: Array<DataSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.TagsSettings, elementCls: TagSettingsParam, isOptional: true })
    tagsSettings?: Array<TagSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.CharacterCatalogSettings, elementCls: CharacterCatalogSettingsParam, isOptional: true })
    playerCharacterCatalogSettings?: Array<CharacterCatalogSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.GroupCatalogSettings, elementCls: GroupCatalogSettingsParam, isOptional: true })
    playerGroupCatalogSettings?: Array<GroupCatalogSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.ItemCatalogSettings, elementCls: ItemCatalogSettingsParam, isOptional: true })
    playerItemCatalogSettings?: Array<ItemCatalogSettingsParam>;

    @GNArrayDataMember({ code: GNParameterCode.FriendCatalogSettings, elementCls: FriendCatalogSettingsParam, isOptional: true })
    playerFriendCatalogSettings?: Array<FriendCatalogSettingsParam>;
}
