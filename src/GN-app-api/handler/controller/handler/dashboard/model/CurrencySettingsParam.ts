import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class CurrencySettingsParam {
	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32 })
	key: string;

	@NumberDataMember({ code: ParameterCode.InitialValue })
	initialValue: number;

	@StringDataMember({ code: ParameterCode.Description, minLength: 2, maxLength: 64 })
	description: string;

	@BooleanDataMember({ code: ParameterCode.Index })
	index: boolean;

}
