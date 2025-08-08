import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {

	@BooleanDataMember({ code: ParameterCode.CatalogId, isOptional: true, defaultValue: false })
	public catalogId?: boolean;

	@BooleanDataMember({ code: ParameterCode.Members, isOptional: true, defaultValue: false })
	public members?: boolean;

	@BooleanDataMember({ code: ParameterCode.RemoveStatus, isOptional: true, defaultValue: false })
	public removeStatus?: boolean;

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

	@BooleanDataMember({ code: ParameterCode.GroupCurrencies, isOptional: true, defaultValue: false })
	public groupCurrencies?: boolean;

	@BooleanDataMember({ code: ParameterCode.GroupStatistics, isOptional: true, defaultValue: false })
	public groupStatistics?: boolean;

	@BooleanDataMember({ code: ParameterCode.GroupDatas, isOptional: true, defaultValue: false })
	public groupDatas?: boolean;

	@BooleanDataMember({ code: ParameterCode.GroupInventories, isOptional: true, defaultValue: false })
	public groupInventories?: boolean;

	@GNArrayDataMember({ code: ParameterCode.GroupDataKeys, isOptional: true, elementCls: String })
	public groupDataKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.GroupCurrencyKeys, isOptional: true, elementCls: String })
	public groupCurrencyKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.GroupStatisticsKeys, isOptional: true, elementCls: String })
	public groupStatisticsKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.CustomDataKeys, isOptional: true, elementCls: String })
	public customDataKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.TagKeys, isOptional: true, elementCls: String })
	public tagKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.ItemCatalogIds, isOptional: true, elementCls: String })
	public itemCatalogIds?: Array<string>;

}
