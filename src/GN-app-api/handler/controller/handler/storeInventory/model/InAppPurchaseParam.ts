import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, StringDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InAppPurchaseParam {

	@StringDataMember({ code: ParameterCode.FacebookStoreId, minLength: 1, maxLength: 128, mustNonNull: true, isOptional: true, })
	public facebookStoreId?: string;

	@StringDataMember({ code: ParameterCode.GooglePlayStoreId, minLength: 1, maxLength: 128, mustNonNull: true, isOptional: true, })
	public googlePlayStoreId?: string;

	@StringDataMember({ code: ParameterCode.AppleAppStoreId, minLength: 1, maxLength: 128, mustNonNull: true, isOptional: true, })
	public appleAppStoreId?: string;

	@NumberDataMember({ code: ParameterCode.AnalyticsPrice, isOptional: true })
	public analyticsPrice?: number;

}
