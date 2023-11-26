import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {

    @BooleanDataMember({ code: GNParameterCode.CatalogId, isOptional: true, defaultValue: false })
    catalogId?: boolean;

    @BooleanDataMember({ code: GNParameterCode.Owner, isOptional: true, defaultValue: false })
    owner?: boolean;

    @BooleanDataMember({ code: GNParameterCode.RemoveStatus, isOptional: true, defaultValue: false })
    removeStatus?: boolean;

    @BooleanDataMember({ code: GNParameterCode.Segments, isOptional: true, defaultValue: false })
    segments?: boolean;

    @BooleanDataMember({ code: GNParameterCode.CustomDatas, isOptional: true, defaultValue: false })
    customDatas?: boolean;

    @BooleanDataMember({ code: GNParameterCode.DisplayName, isOptional: true, defaultValue: false })
    displayName?: boolean;

    @BooleanDataMember({ code: GNParameterCode.Avatar, isOptional: true, defaultValue: false })
    avatar?: boolean;

    @BooleanDataMember({ code: GNParameterCode.TsCreate, isOptional: true, defaultValue: false })
    tsCreate?: boolean;

    @BooleanDataMember({ code: GNParameterCode.Tags, isOptional: true, defaultValue: false })
    tags?: boolean;

    @BooleanDataMember({ code: GNParameterCode.PlayerBan, isOptional: true, defaultValue: false })
    playerBan?: boolean;

    @BooleanDataMember({ code: GNParameterCode.PlayerCurrencies, isOptional: true, defaultValue: false })
    playerCurrencies?: boolean;

    @BooleanDataMember({ code: GNParameterCode.PlayerStatistics, isOptional: true, defaultValue: false })
    playerStatistics?: boolean;

    @BooleanDataMember({ code: GNParameterCode.PlayerDatas, isOptional: true, defaultValue: false })
    playerDatas?: boolean;

    @BooleanDataMember({ code: GNParameterCode.IpAddressCreate, isOptional: true, defaultValue: false })
    ipAddressCreate?: boolean;

    @BooleanDataMember({ code: GNParameterCode.CountryCode, isOptional: true, defaultValue: false })
    countryCode?: boolean;

    @BooleanDataMember({ code: GNParameterCode.TsLastLogin, isOptional: true, defaultValue: false })
    tsLastLogin?: boolean;

    @BooleanDataMember({ code: GNParameterCode.PlayerInventories, isOptional: true, defaultValue: false })
    playerInventories?: boolean;

    @BooleanDataMember({ code: GNParameterCode.PlayerGroups, isOptional: true, defaultValue: false })
    playerGroups?: boolean;

    @BooleanDataMember({ code: GNParameterCode.PlayerFriends, isOptional: true, defaultValue: false })
    playerFriends?: boolean;

    @GNArrayDataMember({ code: GNParameterCode.PlayerDataKeys, isOptional: true, elementCls: String })
    playerDataKeys?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.PlayerCurrencyKeys, isOptional: true, elementCls: String })
    playerCurrencyKeys?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.PlayerStatisticsKeys, isOptional: true, elementCls: String })
    playerStatisticsKeys?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.CustomDataKeys, isOptional: true, elementCls: String })
    customDataKeys?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.TagKeys, isOptional: true, elementCls: String })
    tagKeys?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.CharacterCatalogIds, isOptional: true, elementCls: String })
    characterCatalogIds?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.ItemCatalogIds, isOptional: true, elementCls: String })
    itemCatalogIds?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.GroupCatalogIds, isOptional: true, elementCls: String })
    groupCatalogIds?: Array<string>;

    @GNArrayDataMember({ code: GNParameterCode.FriendCatalogIds, isOptional: true, elementCls: String })
    friendCatalogIds?: Array<string>;
}
