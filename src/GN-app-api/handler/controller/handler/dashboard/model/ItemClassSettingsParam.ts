import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ItemClassSettingsParam {

	@StringDataMember({ code: ParameterCode.ClassId, minLength: 2, maxLength: 32 })
	public classId: string;

	@StringDataMember({ code: ParameterCode.Description, isOptional: true })
	public description?: string;

}
