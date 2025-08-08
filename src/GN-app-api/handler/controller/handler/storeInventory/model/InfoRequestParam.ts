import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {

	@BooleanDataMember({ code: ParameterCode.StoreItems, isOptional: true, defaultValue: false })
	public storeItems?: boolean;

	@BooleanDataMember({ code: ParameterCode.StoreItemType, isOptional: true, defaultValue: false })
	public storeItemType?: boolean;

	@BooleanDataMember({ code: ParameterCode.StoreCurrencies, isOptional: true, defaultValue: false })
	public storeCurrencies?: boolean;

	@BooleanDataMember({ code: ParameterCode.PriceCurrencies, isOptional: true, defaultValue: false })
	public priceCurrencies?: boolean;

	@BooleanDataMember({ code: ParameterCode.InAppPurchase, isOptional: true, defaultValue: false })
	public inAppPurchase?: boolean;

	@BooleanDataMember({ code: ParameterCode.RemoveStatus, isOptional: true, defaultValue: false })
	public removeStatus?: boolean;

	@BooleanDataMember({ code: ParameterCode.DisplayName, isOptional: true, defaultValue: false })
	public displayName?: boolean;

	@BooleanDataMember({ code: ParameterCode.Avatar, isOptional: true, defaultValue: false })
	public avatar?: boolean;

	@BooleanDataMember({ code: ParameterCode.TsCreate, isOptional: true, defaultValue: false })
	public tsCreate?: boolean;

	@BooleanDataMember({ code: ParameterCode.Tags, isOptional: true, defaultValue: false })
	public tags?: boolean;

	@BooleanDataMember({ code: ParameterCode.StoreDatas, isOptional: true, defaultValue: false })
	public storeDatas?: boolean;

}
