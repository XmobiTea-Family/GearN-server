import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class CurrencySettingsParam {

	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32 })
	public key: string;

	@NumberDataMember({ code: ParameterCode.InitialValue })
	public initialValue: number;

	@StringDataMember({ code: ParameterCode.Description })
	public description: string;

	@BooleanDataMember({ code: ParameterCode.Index })
	public index: boolean;

}
