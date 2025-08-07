import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class CloudScriptPermissionRulesParam {
	@GNHashtableDataMember({ code: ParameterCode.AddFunction, isOptional: true })
	addFunction?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetFunctions, isOptional: true })
	getFunctions?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.EditFunction, isOptional: true })
	editFunction?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ExecuteFunction, isOptional: true })
	executeFunction?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetFunction, isOptional: true })
	getFunction?: PermissionRulesParam;

}
