import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {

	// Indicates whether catalog ID.
	@BooleanDataMember({ code: ParameterCode.CatalogId, isOptional: true, defaultValue: false })
	public catalogId?: boolean;

	// Indicates whether owner.
	@BooleanDataMember({ code: ParameterCode.Owner, isOptional: true, defaultValue: false })
	public owner?: boolean;

	// Indicates whether remove status.
	@BooleanDataMember({ code: ParameterCode.RemoveStatus, isOptional: true, defaultValue: false })
	public removeStatus?: boolean;

	// Indicates whether segments.
	@BooleanDataMember({ code: ParameterCode.Segments, isOptional: true, defaultValue: false })
	public segments?: boolean;

	// Indicates whether custom datas.
	@BooleanDataMember({ code: ParameterCode.CustomDatas, isOptional: true, defaultValue: false })
	public customDatas?: boolean;

	// Indicates whether display name.
	@BooleanDataMember({ code: ParameterCode.DisplayName, isOptional: true, defaultValue: false })
	public displayName?: boolean;

	// Indicates whether avatar.
	@BooleanDataMember({ code: ParameterCode.Avatar, isOptional: true, defaultValue: false })
	public avatar?: boolean;

	// Indicates whether timestamp create.
	@BooleanDataMember({ code: ParameterCode.TsCreate, isOptional: true, defaultValue: false })
	public tsCreate?: boolean;

	// Indicates whether tags.
	@BooleanDataMember({ code: ParameterCode.Tags, isOptional: true, defaultValue: false })
	public tags?: boolean;

	// Indicates whether player ban.
	@BooleanDataMember({ code: ParameterCode.PlayerBan, isOptional: true, defaultValue: false })
	public playerBan?: boolean;

	// Indicates whether player currencies.
	@BooleanDataMember({ code: ParameterCode.PlayerCurrencies, isOptional: true, defaultValue: false })
	public playerCurrencies?: boolean;

	// Indicates whether player statistics.
	@BooleanDataMember({ code: ParameterCode.PlayerStatistics, isOptional: true, defaultValue: false })
	public playerStatistics?: boolean;

	// Indicates whether player datas.
	@BooleanDataMember({ code: ParameterCode.PlayerDatas, isOptional: true, defaultValue: false })
	public playerDatas?: boolean;

	// Indicates whether IP address create.
	@BooleanDataMember({ code: ParameterCode.IpAddressCreate, isOptional: true, defaultValue: false })
	public ipAddressCreate?: boolean;

	// Indicates whether country code.
	@BooleanDataMember({ code: ParameterCode.CountryCode, isOptional: true, defaultValue: false })
	public countryCode?: boolean;

	// Indicates whether timestamp last login.
	@BooleanDataMember({ code: ParameterCode.TsLastLogin, isOptional: true, defaultValue: false })
	public tsLastLogin?: boolean;

	// Indicates whether player inventories.
	@BooleanDataMember({ code: ParameterCode.PlayerInventories, isOptional: true, defaultValue: false })
	public playerInventories?: boolean;

	// Indicates whether player groups.
	@BooleanDataMember({ code: ParameterCode.PlayerGroups, isOptional: true, defaultValue: false })
	public playerGroups?: boolean;

	// Indicates whether player friends.
	@BooleanDataMember({ code: ParameterCode.PlayerFriends, isOptional: true, defaultValue: false })
	public playerFriends?: boolean;

	// Stores the player data keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.PlayerDataKeys, isOptional: true, elementCls: String })
	public playerDataKeys?: Array<string>;

	// Stores the player currency keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.PlayerCurrencyKeys, isOptional: true, elementCls: String })
	public playerCurrencyKeys?: Array<string>;

	// Stores the player statistics keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.PlayerStatisticsKeys, isOptional: true, elementCls: String })
	public playerStatisticsKeys?: Array<string>;

	// Stores the custom data keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.CustomDataKeys, isOptional: true, elementCls: String })
	public customDataKeys?: Array<string>;

	// Stores the tag keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.TagKeys, isOptional: true, elementCls: String })
	public tagKeys?: Array<string>;

	// Stores the character catalog IDs value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.CharacterCatalogIds, isOptional: true, elementCls: String })
	public characterCatalogIds?: Array<string>;

	// Stores the item catalog IDs value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.ItemCatalogIds, isOptional: true, elementCls: String })
	public itemCatalogIds?: Array<string>;

	// Stores the group catalog IDs value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.GroupCatalogIds, isOptional: true, elementCls: String })
	public groupCatalogIds?: Array<string>;

	// Stores the friend catalog IDs value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.FriendCatalogIds, isOptional: true, elementCls: String })
	public friendCatalogIds?: Array<string>;

}
