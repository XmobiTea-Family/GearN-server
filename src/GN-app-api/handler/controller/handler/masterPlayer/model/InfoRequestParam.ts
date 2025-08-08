import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {

	@BooleanDataMember({ code: ParameterCode.External, isOptional: true, defaultValue: false })
	public external?: boolean;

	@BooleanDataMember({ code: ParameterCode.Segments, isOptional: true, defaultValue: false })
	public segments?: boolean;

	@BooleanDataMember({ code: ParameterCode.CustomDatas, isOptional: true, defaultValue: false })
	public customDatas?: boolean;

	@BooleanDataMember({ code: ParameterCode.DisplayName, isOptional: true, defaultValue: false })
	public displayName?: boolean;

	@BooleanDataMember({ code: ParameterCode.Avatar, isOptional: true, defaultValue: false })
	public avatar?: boolean;

	@BooleanDataMember({ code: ParameterCode.TsCreate, isOptional: true, defaultValue: false })
	public tsCreate?: boolean;

	@BooleanDataMember({ code: ParameterCode.Tags, isOptional: true, defaultValue: false })
	public tags?: boolean;

	@BooleanDataMember({ code: ParameterCode.PlayerBan, isOptional: true, defaultValue: false })
	public playerBan?: boolean;

	@BooleanDataMember({ code: ParameterCode.PlayerCurrencies, isOptional: true, defaultValue: false })
	public playerCurrencies?: boolean;

	@BooleanDataMember({ code: ParameterCode.PlayerStatistics, isOptional: true, defaultValue: false })
	public playerStatistics?: boolean;

	@BooleanDataMember({ code: ParameterCode.PlayerDatas, isOptional: true, defaultValue: false })
	public playerDatas?: boolean;

	@BooleanDataMember({ code: ParameterCode.IpAddressCreate, isOptional: true, defaultValue: false })
	public ipAddressCreate?: boolean;

	@BooleanDataMember({ code: ParameterCode.CountryCode, isOptional: true, defaultValue: false })
	public countryCode?: boolean;

	@BooleanDataMember({ code: ParameterCode.Email, isOptional: true, defaultValue: false })
	public email?: boolean;

	@BooleanDataMember({ code: ParameterCode.TsLastLogin, isOptional: true, defaultValue: false })
	public tsLastLogin?: boolean;

	@BooleanDataMember({ code: ParameterCode.PushNotifications, isOptional: true, defaultValue: false })
	public pushNotifications?: boolean;

	@GNArrayDataMember({ code: ParameterCode.PlayerDataKeys, isOptional: true, elementCls: String })
	public playerDataKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.PlayerCurrencyKeys, isOptional: true, elementCls: String })
	public playerCurrencyKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.PlayerStatisticsKeys, isOptional: true, elementCls: String })
	public playerStatisticsKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.CustomDataKeys, isOptional: true, elementCls: String })
	public customDataKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.TagKeys, isOptional: true, elementCls: String })
	public tagKeys?: Array<string>;

}
