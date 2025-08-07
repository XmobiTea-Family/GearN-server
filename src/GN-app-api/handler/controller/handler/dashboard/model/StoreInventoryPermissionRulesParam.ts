import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class StoreInventoryPermissionRulesParam {
	@GNHashtableDataMember({ code: ParameterCode.BuyStoreItem, isOptional: true })
	buyStoreItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStoreItemInformation, isOptional: true })
	getStoreItemInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStoreItemsWithTag, isOptional: true })
	getStoreItemsWithTag?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateStoreItem, isOptional: true })
	createStoreItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetRemoveStatus, isOptional: true })
	setRemoveStatus?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetStoreItemInformation, isOptional: true })
	setStoreItemInformation?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ValidateAppleAppStoreReceipt, isOptional: true })
	validateAppleAppStoreReceipt?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ValidateGooglePlayStoreReceipt, isOptional: true })
	validateGooglePlayStoreReceipt?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ValidateFacebookStoreReceipt, isOptional: true })
	validateFacebookStoreReceipt?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetCreateLeaderboard, isOptional: true })
	getCreateLeaderboard?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.PresentStoreItem, isOptional: true })
	presentStoreItem?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStoreLog, isOptional: true })
	getStoreLog?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetStoreUsed, isOptional: true })
	getStoreUsed?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveStoreUsed, isOptional: true })
	removeStoreUsed?: PermissionRulesParam;

}
