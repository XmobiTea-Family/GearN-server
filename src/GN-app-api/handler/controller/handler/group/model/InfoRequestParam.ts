import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {
	@BooleanDataMember({ code: ParameterCode.CatalogId, isOptional: true, defaultValue: false })
	catalogId?: boolean;

	@BooleanDataMember({ code: ParameterCode.Members, isOptional: true, defaultValue: false })
	members?: boolean;

	@BooleanDataMember({ code: ParameterCode.RemoveStatus, isOptional: true, defaultValue: false })
	removeStatus?: boolean;

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

	@BooleanDataMember({ code: ParameterCode.GroupCurrencies, isOptional: true, defaultValue: false })
	groupCurrencies?: boolean;

	@BooleanDataMember({ code: ParameterCode.GroupStatistics, isOptional: true, defaultValue: false })
	groupStatistics?: boolean;

	@BooleanDataMember({ code: ParameterCode.GroupDatas, isOptional: true, defaultValue: false })
	groupDatas?: boolean;

	@BooleanDataMember({ code: ParameterCode.GroupInventories, isOptional: true, defaultValue: false })
	groupInventories?: boolean;

	@GNArrayDataMember({ code: ParameterCode.GroupDataKeys, isOptional: true, elementCls: String })
	groupDataKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.GroupCurrencyKeys, isOptional: true, elementCls: String })
	groupCurrencyKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.GroupStatisticsKeys, isOptional: true, elementCls: String })
	groupStatisticsKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.CustomDataKeys, isOptional: true, elementCls: String })
	customDataKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.TagKeys, isOptional: true, elementCls: String })
	tagKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.ItemCatalogIds, isOptional: true, elementCls: String })
	itemCatalogIds?: Array<string>;
}
