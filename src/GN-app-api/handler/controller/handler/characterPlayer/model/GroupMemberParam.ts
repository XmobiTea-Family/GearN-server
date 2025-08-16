import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, NumberDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class GroupMemberParam {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 11, maxLength: 11, mustNonNull: true })
	public userId: string;

}
