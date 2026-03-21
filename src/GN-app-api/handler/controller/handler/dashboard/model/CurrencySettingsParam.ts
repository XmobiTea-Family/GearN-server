import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class CurrencySettingsParam {

	// Stores the key value used by this instance.
	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32 })
	public key: string;

	// Stores the initial value value used by this instance.
	@NumberDataMember({ code: ParameterCode.InitialValue })
	public initialValue: number;

	// Stores the description value used by this instance.
	@StringDataMember({ code: ParameterCode.Description })
	public description: string;

	// Indicates whether index.
	@BooleanDataMember({ code: ParameterCode.Index })
	public index: boolean;

}
