import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {

	// Indicates whether catalog ID.
	@BooleanDataMember({ code: ParameterCode.CatalogId, isOptional: true, defaultValue: false })
	public catalogId?: boolean;

	// Indicates whether members.
	@BooleanDataMember({ code: ParameterCode.Members, isOptional: true, defaultValue: false })
	public members?: boolean;

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

	// Indicates whether group currencies.
	@BooleanDataMember({ code: ParameterCode.GroupCurrencies, isOptional: true, defaultValue: false })
	public groupCurrencies?: boolean;

	// Indicates whether group statistics.
	@BooleanDataMember({ code: ParameterCode.GroupStatistics, isOptional: true, defaultValue: false })
	public groupStatistics?: boolean;

	// Indicates whether group datas.
	@BooleanDataMember({ code: ParameterCode.GroupDatas, isOptional: true, defaultValue: false })
	public groupDatas?: boolean;

	// Indicates whether group inventories.
	@BooleanDataMember({ code: ParameterCode.GroupInventories, isOptional: true, defaultValue: false })
	public groupInventories?: boolean;

	// Stores the group data keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.GroupDataKeys, isOptional: true, elementCls: String })
	public groupDataKeys?: Array<string>;

	// Stores the group currency keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.GroupCurrencyKeys, isOptional: true, elementCls: String })
	public groupCurrencyKeys?: Array<string>;

	// Stores the group statistics keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.GroupStatisticsKeys, isOptional: true, elementCls: String })
	public groupStatisticsKeys?: Array<string>;

	// Stores the custom data keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.CustomDataKeys, isOptional: true, elementCls: String })
	public customDataKeys?: Array<string>;

	// Stores the tag keys value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.TagKeys, isOptional: true, elementCls: String })
	public tagKeys?: Array<string>;

	// Stores the item catalog IDs value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.ItemCatalogIds, isOptional: true, elementCls: String })
	public itemCatalogIds?: Array<string>;

}
