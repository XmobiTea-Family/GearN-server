import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class DataSettingsParam {

	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32 })
	public key: string;

	@StringDataMember({ code: ParameterCode.Description, minLength: 2, maxLength: 64 })
	public description: string;

	@NumberDataMember({ code: ParameterCode.Permission, mustInt: true })
	public permission: number;

}
