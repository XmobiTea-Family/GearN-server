import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class StoreInventoryPermissionRulesParam {

	@GNHashtableDataMember({ code: ParameterCode.BuyStoreItem, isOptional: true })
	public buyStoreItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStoreItemInformation, isOptional: true })
	public getStoreItemInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStoreItemsWithTag, isOptional: true })
	public getStoreItemsWithTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateStoreItem, isOptional: true })
	public createStoreItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetRemoveStatus, isOptional: true })
	public setRemoveStatus?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetStoreItemInformation, isOptional: true })
	public setStoreItemInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ValidateAppleAppStoreReceipt, isOptional: true })
	public validateAppleAppStoreReceipt?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ValidateGooglePlayStoreReceipt, isOptional: true })
	public validateGooglePlayStoreReceipt?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ValidateFacebookStoreReceipt, isOptional: true })
	public validateFacebookStoreReceipt?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
	public getCreateLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.PresentStoreItem, isOptional: true })
	public presentStoreItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStoreLog, isOptional: true })
	public getStoreLog?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStoreUsed, isOptional: true })
	public getStoreUsed?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveStoreUsed, isOptional: true })
	public removeStoreUsed?: PermissionRulesParam;

}
