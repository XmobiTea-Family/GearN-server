import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class TagSettingsParam {

	// Stores the key value used by this instance.
	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32 })
	public key: string;

	// Stores the description value used by this instance.
	@StringDataMember({ code: ParameterCode.Description })
	public description: string;

	// Indicates whether index.
	@BooleanDataMember({ code: ParameterCode.Index })
	public index: boolean;

}
