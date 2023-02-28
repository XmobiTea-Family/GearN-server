import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, NumberDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class GroupMemberParam {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 11, mustNonNull: true })
    userId: string;

    @NumberDataMember({ code: GNParameterCode.Role, mustInt: true })
    role: number;
}
