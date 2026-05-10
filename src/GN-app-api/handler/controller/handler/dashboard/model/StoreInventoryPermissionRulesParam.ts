import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class StoreInventoryPermissionRulesParam {
    // Stores the buy store item value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.BuyStoreItem, isOptional: true })
    public buyStoreItem?: PermissionRulesParam;

    // Stores the get store item information value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetStoreItemInformation, isOptional: true })
    public getStoreItemInformation?: PermissionRulesParam;

    // Stores the get store items with tag value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetStoreItemsWithTag, isOptional: true })
    public getStoreItemsWithTag?: PermissionRulesParam;

    // Stores the create store item value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.CreateStoreItem, isOptional: true })
    public createStoreItem?: PermissionRulesParam;

    // Stores the set remove status value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetRemoveStatus, isOptional: true })
    public setRemoveStatus?: PermissionRulesParam;

    // Stores the set store item information value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.SetStoreItemInformation, isOptional: true })
    public setStoreItemInformation?: PermissionRulesParam;

    // Stores the validate apple app store receipt value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.ValidateAppleAppStoreReceipt, isOptional: true })
    public validateAppleAppStoreReceipt?: PermissionRulesParam;

    // Stores the validate google play store receipt value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.ValidateGooglePlayStoreReceipt, isOptional: true })
    public validateGooglePlayStoreReceipt?: PermissionRulesParam;

    // Stores the validate facebook store receipt value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.ValidateFacebookStoreReceipt, isOptional: true })
    public validateFacebookStoreReceipt?: PermissionRulesParam;

    // Stores the get create leaderboard value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
    public getCreateLeaderboard?: PermissionRulesParam;

    // Stores the present store item value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.PresentStoreItem, isOptional: true })
    public presentStoreItem?: PermissionRulesParam;

    // Stores the get store log value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetStoreLog, isOptional: true })
    public getStoreLog?: PermissionRulesParam;

    // Stores the get store used value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GetStoreUsed, isOptional: true })
    public getStoreUsed?: PermissionRulesParam;

    // Stores the remove store used value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.RemoveStoreUsed, isOptional: true })
    public removeStoreUsed?: PermissionRulesParam;
}
