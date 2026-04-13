import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, NumberDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class GroupMemberParam {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.MemberId, minLength: 10, maxLength: 11, mustNonNull: true })
	public memberId: string;

}
