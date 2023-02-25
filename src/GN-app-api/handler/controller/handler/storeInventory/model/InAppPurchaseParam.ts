import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, StringDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InAppPurchaseParam {
    @StringDataMember({ code: GNParameterCode.FacebookStoreId, minLength: 1, maxLength: 128, mustNonNull: true, isOptional: true, })
    facebookStoreId?: string;

    @StringDataMember({ code: GNParameterCode.GooglePlayStoreId, minLength: 1, maxLength: 128, mustNonNull: true, isOptional: true, })
    googlePlayStoreId?: string;

    @StringDataMember({ code: GNParameterCode.AppleAppStoreId, minLength: 1, maxLength: 128, mustNonNull: true, isOptional: true, })
    appleAppStoreId?: string;

    @NumberDataMember({ code: GNParameterCode.AnalyticsPrice, isOptional: true })
    analyticsPrice?: number;

}
