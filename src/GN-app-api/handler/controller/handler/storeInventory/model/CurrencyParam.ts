import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, StringDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class CurrencyParam {
	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	key: string;

	@NumberDataMember({ code: ParameterCode.Value })
	value: number;
}
