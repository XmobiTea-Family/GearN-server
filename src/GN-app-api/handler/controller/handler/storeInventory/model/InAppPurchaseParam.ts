import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, StringDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InAppPurchaseParam {
    @StringDataMember({ code: ParameterCode.FacebookStoreId, minLength: 1, maxLength: 128, mustNonNull: true, isOptional: true, })
    facebookStoreId?: string;

    @StringDataMember({ code: ParameterCode.GooglePlayStoreId, minLength: 1, maxLength: 128, mustNonNull: true, isOptional: true, })
    googlePlayStoreId?: string;

    @StringDataMember({ code: ParameterCode.AppleAppStoreId, minLength: 1, maxLength: 128, mustNonNull: true, isOptional: true, })
    appleAppStoreId?: string;

    @NumberDataMember({ code: ParameterCode.AnalyticsPrice, isOptional: true })
    analyticsPrice?: number;

}
