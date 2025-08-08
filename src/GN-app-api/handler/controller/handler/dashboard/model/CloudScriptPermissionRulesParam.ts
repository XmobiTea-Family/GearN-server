import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class CloudScriptPermissionRulesParam {

	@GNHashtableDataMember({ code: ParameterCode.AddFunction, isOptional: true })
	public addFunction?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetFunctions, isOptional: true })
	public getFunctions?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.EditFunction, isOptional: true })
	public editFunction?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ExecuteFunction, isOptional: true })
	public executeFunction?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetFunction, isOptional: true })
	public getFunction?: PermissionRulesParam;

}
