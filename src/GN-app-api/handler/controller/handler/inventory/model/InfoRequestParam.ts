import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {

	@BooleanDataMember({ code: ParameterCode.CatalogId, isOptional: true, defaultValue: false })
	public catalogId?: boolean;

	@BooleanDataMember({ code: ParameterCode.ClassId, isOptional: true, defaultValue: false })
	public classId?: boolean;

	@BooleanDataMember({ code: ParameterCode.ItemType, isOptional: true, defaultValue: false })
	public itemType?: boolean;

	@BooleanDataMember({ code: ParameterCode.Amount, isOptional: true, defaultValue: false })
	public amount?: boolean;

	@BooleanDataMember({ code: ParameterCode.Owner, isOptional: true, defaultValue: false })
	public owner?: boolean;

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

	@BooleanDataMember({ code: ParameterCode.ItemStatistics, isOptional: true, defaultValue: false })
	public itemStatistics?: boolean;

	@BooleanDataMember({ code: ParameterCode.ItemDatas, isOptional: true, defaultValue: false })
	public itemDatas?: boolean;

	@GNArrayDataMember({ code: ParameterCode.ItemDataKeys, isOptional: true, elementCls: String })
	public itemDataKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.ItemStatisticsKeys, isOptional: true, elementCls: String })
	public itemStatisticsKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.CustomDataKeys, isOptional: true, elementCls: String })
	public customDataKeys?: Array<string>;

	@GNArrayDataMember({ code: ParameterCode.TagKeys, isOptional: true, elementCls: String })
	public tagKeys?: Array<string>;

}
