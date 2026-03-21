import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, StringDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class AvatarParam {

	// Stores the type value used by this instance.
	@NumberDataMember({ code: ParameterCode.Type, mustInt: true })
	public type: number;

	// Stores the value value used by this instance.
	@StringDataMember({ code: ParameterCode.Value, minLength: 1, maxLength: 128, mustNonNull: true })
	public value: string;

}
