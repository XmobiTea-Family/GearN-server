import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {
	@BooleanDataMember({ code: ParameterCode.StoreItems, isOptional: true, defaultValue: false })
	storeItems?: boolean;

	@BooleanDataMember({ code: ParameterCode.StoreItemType, isOptional: true, defaultValue: false })
	storeItemType?: boolean;

	@BooleanDataMember({ code: ParameterCode.StoreCurrencies, isOptional: true, defaultValue: false })
	storeCurrencies?: boolean;

	@BooleanDataMember({ code: ParameterCode.PriceCurrencies, isOptional: true, defaultValue: false })
	priceCurrencies?: boolean;

	@BooleanDataMember({ code: ParameterCode.InAppPurchase, isOptional: true, defaultValue: false })
	inAppPurchase?: boolean;

	@BooleanDataMember({ code: ParameterCode.RemoveStatus, isOptional: true, defaultValue: false })
	removeStatus?: boolean;

	@BooleanDataMember({ code: ParameterCode.DisplayName, isOptional: true, defaultValue: false })
	displayName?: boolean;

	@BooleanDataMember({ code: ParameterCode.Avatar, isOptional: true, defaultValue: false })
	avatar?: boolean;

	@BooleanDataMember({ code: ParameterCode.TsCreate, isOptional: true, defaultValue: false })
	tsCreate?: boolean;

	@BooleanDataMember({ code: ParameterCode.Tags, isOptional: true, defaultValue: false })
	tags?: boolean;

	@BooleanDataMember({ code: ParameterCode.StoreDatas, isOptional: true, defaultValue: false })
	storeDatas?: boolean;
}
