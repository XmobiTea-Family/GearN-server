import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {

	// Indicates whether catalog ID.
	@BooleanDataMember({ code: ParameterCode.CatalogId, isOptional: true, defaultValue: false })
	public catalogId?: boolean;

	// Indicates whether class ID.
	@BooleanDataMember({ code: ParameterCode.ClassId, isOptional: true, defaultValue: false })
	public classId?: boolean;

	// Indicates whether item type.
	@BooleanDataMember({ code: ParameterCode.ItemType, isOptional: true, defaultValue: false })
	public itemType?: boolean;

	// Indicates whether amount.
	@BooleanDataMember({ code: ParameterCode.Amount, isOptional: true, defaultValue: false })
	public amount?: boolean;

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

	// Indicates whether item statistics.
	@BooleanDataMember({ code: ParameterCode.ItemStatistics, isOptional: true, defaultValue: false })
	public itemStatistics?: boolean;

	// Indicates whether item datas.
	@BooleanDataMember({ code: ParameterCode.ItemDatas, isOptional: true, defaultValue: false })
	public itemDatas?: boolean;

	// Stores the item data keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.ItemDataKeys, isOptional: true, elementCls: String })
	public itemDataKeys?: Array<string>;

	// Stores the item statistics keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.ItemStatisticsKeys, isOptional: true, elementCls: String })
	public itemStatisticsKeys?: Array<string>;

	// Stores the custom data keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.CustomDataKeys, isOptional: true, elementCls: String })
	public customDataKeys?: Array<string>;

	// Stores the tag keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.TagKeys, isOptional: true, elementCls: String })
	public tagKeys?: Array<string>;

}
