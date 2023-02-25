import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, StringDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class AvatarParam {
    @NumberDataMember({ code: GNParameterCode.Type, mustInt: true })
    type: number;

    @StringDataMember({ code: GNParameterCode.Value, minLength: 1, maxLength: 128, mustNonNull: true })
    value: string;
}
