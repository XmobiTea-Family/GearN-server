import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, NumberDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ItemStatisticsParam {

	// Stores the key value used by this instance.
	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	public key: string;

	// Stores the value value used by this instance.
	@NumberDataMember({ code: ParameterCode.Value })
	public value: number;

}
