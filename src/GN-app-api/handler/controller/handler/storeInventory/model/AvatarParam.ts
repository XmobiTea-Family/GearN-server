import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, StringDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class AvatarParam {

	@NumberDataMember({ code: ParameterCode.Type, mustInt: true })
	public type: number;

	@StringDataMember({ code: ParameterCode.Value, minLength: 1, maxLength: 128, mustNonNull: true })
	public value: string;

}
