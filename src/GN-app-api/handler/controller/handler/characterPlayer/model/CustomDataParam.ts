import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class CustomDataParam {

	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	public key: string;

	@DataMember({ code: ParameterCode.Value })
	public value: any;

}
