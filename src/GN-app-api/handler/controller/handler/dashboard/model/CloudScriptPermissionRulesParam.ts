import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class CloudScriptPermissionRulesParam {

	// Stores the add function value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.AddFunction, isOptional: true })
	public addFunction?: PermissionRulesParam;

	// Stores the get functions value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetFunctions, isOptional: true })
	public getFunctions?: PermissionRulesParam;

	// Stores the edit function value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.EditFunction, isOptional: true })
	public editFunction?: PermissionRulesParam;

	// Stores the execute function value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.ExecuteFunction, isOptional: true })
	public executeFunction?: PermissionRulesParam;

	// Stores the get function value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetFunction, isOptional: true })
	public getFunction?: PermissionRulesParam;

}
