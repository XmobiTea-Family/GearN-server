import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class StoreInventoryPermissionRulesParam {
    @GNHashtableDataMember({ code: GNParameterCode.BuyStoreItem, isOptional: true })
    buyStoreItem?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetStoreItemInformation, isOptional: true })
    getStoreItemInformation?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetStoreItemsWithTag, isOptional: true })
    getStoreItemsWithTag?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GrantStoreItem, isOptional: true })
    grantStoreItem?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetRemoveStatus, isOptional: true })
    setRemoveStatus?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetStoreItemInformation, isOptional: true })
    setStoreItemInformation?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.ValidateAppleAppStoreReceipt, isOptional: true })
    validateAppleAppStoreReceipt?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.ValidateGooglePlayStoreReceipt, isOptional: true })
    validateGooglePlayStoreReceipt?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.ValidateFacebookStoreReceipt, isOptional: true })
    validateFacebookStoreReceipt?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetCreateLeaderboard, isOptional: true })
    getCreateLeaderboard?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.PresentStoreItem, isOptional: true })
    presentStoreItem?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetStoreLog, isOptional: true })
    getStoreLog?: PermissionRulesParam;
}
