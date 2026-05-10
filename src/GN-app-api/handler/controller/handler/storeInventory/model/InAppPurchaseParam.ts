import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, StringDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InAppPurchaseParam {
    // Stores the facebook store ID value used by this instance.
    @StringDataMember({ code: ParameterCode.FacebookStoreId, minLength: 1, maxLength: 128, mustNonNull: true, isOptional: true })
    public facebookStoreId?: string;

    // Stores the google play store ID value used by this instance.
    @StringDataMember({ code: ParameterCode.GooglePlayStoreId, minLength: 1, maxLength: 128, mustNonNull: true, isOptional: true })
    public googlePlayStoreId?: string;

    // Stores the apple app store ID value used by this instance.
    @StringDataMember({ code: ParameterCode.AppleAppStoreId, minLength: 1, maxLength: 128, mustNonNull: true, isOptional: true })
    public appleAppStoreId?: string;

    // Stores the analytics price value used by this instance.
    @NumberDataMember({ code: ParameterCode.AnalyticsPrice, isOptional: true })
    public analyticsPrice?: number;
}
