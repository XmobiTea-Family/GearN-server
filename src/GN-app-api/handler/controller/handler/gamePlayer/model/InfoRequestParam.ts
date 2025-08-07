import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {
	@BooleanDataMember({ code: ParameterCode.Segments, isOptional: true, defaultValue: false })
	segments?: boolean;

	@BooleanDataMember({ code: ParameterCode.CustomDatas, isOptional: true, defaultValue: false })
	customDatas?: boolean;

	@BooleanDataMember({ code: ParameterCode.DisplayName, isOptional: true, defaultValue: false })
	displayName?: boolean;

	@BooleanDataMember({ code: ParameterCode.Avatar, isOptional: true, defaultValue: false })
	avatar?: boolean;

	@BooleanDataMember({ code: ParameterCode.TsCreate, isOptional: true, defaultValue: false })
	tsCreate?: boolean;

	@BooleanDataMember({ code: ParameterCode.Tags, isOptional: true, defaultValue: false })
	tags?: boolean;

	@BooleanDataMember({ code: ParameterCode.PlayerBan, isOptional: true, defaultValue: false })
	playerBan?: boolean;

	@BooleanDataMember({ code: ParameterCode.PlayerCurrencies, isOptional: true, defaultValue: false })
	playerCurrencies?: boolean;

	@BooleanDataMember({ code: ParameterCode.PlayerStatistics, isOptional: true, defaultValue: false })
	playerStatistics?: boolean;

	@BooleanDataMember({ code: ParameterCode.PlayerDatas, isOptional: true, defaultValue: false })
	playerDatas?: boolean;

	@BooleanDataMember({ code: ParameterCode.IpAddressCreate, isOptional: true, defaultValue: false })
	ipAddressCreate?: boolean;

	@BooleanDataMember({ code: ParameterCode.CountryCode, isOptional: true, defaultValue: false })
	countryCode?: boolean;

	@BooleanDataMember({ code: ParameterCode.TsLastLogin, isOptional: true, defaultValue: false })
	tsLastLogin?: boolean;

	@BooleanDataMember({ code: ParameterCode.PlayerCharacters, isOptional: true, defaultValue: false })
	playerCharacters?: boolean;

	@BooleanDataMember({ code: ParameterCode.PlayerInventories, isOptional: true, defaultValue: false })
	playerInventories?: boolean;

	@BooleanDataMember({ code: ParameterCode.PlayerGroups, isOptional: true, defaultValue: false })
	playerGroups?: boolean;

	@BooleanDataMember({ code: ParameterCode.PlayerFriends, isOptional: true, defaultValue: false })
	playerFriends?: boolean;

	@GNArrayDataMember({ code: ParameterCode.PlayerDataKeys, isOptional: true, elementCls: String })
	playerDataKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.PlayerCurrencyKeys, isOptional: true, elementCls: String })
	playerCurrencyKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.PlayerStatisticsKeys, isOptional: true, elementCls: String })
	playerStatisticsKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.CustomDataKeys, isOptional: true, elementCls: String })
	customDataKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.TagKeys, isOptional: true, elementCls: String })
	tagKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.CharacterCatalogIds, isOptional: true, elementCls: String })
	characterCatalogIds?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.ItemCatalogIds, isOptional: true, elementCls: String })
	itemCatalogIds?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.GroupCatalogIds, isOptional: true, elementCls: String })
	groupCatalogIds?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.FriendCatalogIds, isOptional: true, elementCls: String })
	friendCatalogIds?: Array<string>;
}
