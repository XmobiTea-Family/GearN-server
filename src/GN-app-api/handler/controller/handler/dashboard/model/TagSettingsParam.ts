import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class TagSettingsParam {

	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32 })
	public key: string;

	@StringDataMember({ code: ParameterCode.Description })
	public description: string;

	@BooleanDataMember({ code: ParameterCode.Index })
	public index: boolean;

}
