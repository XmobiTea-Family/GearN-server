import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, NumberDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class GroupMemberParam {
    @StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 11, mustNonNull: true })
    userId: string;

    @NumberDataMember({ code: ParameterCode.Role, mustInt: true })
    role: number;
}
