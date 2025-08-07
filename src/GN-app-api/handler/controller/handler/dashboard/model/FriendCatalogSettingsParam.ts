import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class FriendCatalogSettingsParam {
	@StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32 })
	catalogId: string;

	@BooleanDataMember({ code: ParameterCode.ForceAcceptFriend })
	forceAcceptFriend: boolean;
}
