import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class GenericServiceSettingsParam {

	@StringDataMember({ code: ParameterCode.ServiceName, minLength: 2, maxLength: 32 })
	public serviceName: string;

}
