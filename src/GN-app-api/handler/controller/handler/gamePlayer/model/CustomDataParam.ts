import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class CustomDataParam {
	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	key: string;

	@DataMember({ code: ParameterCode.Value })
	value: any;
}
