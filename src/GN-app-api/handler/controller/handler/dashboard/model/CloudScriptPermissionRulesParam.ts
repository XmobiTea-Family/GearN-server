import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class CloudScriptPermissionRulesParam {
    @GNHashtableDataMember({ code: GNParameterCode.AddFunction, isOptional: true })
    addFunction?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetFunctions, isOptional: true })
    getFunctions?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.EditFunction, isOptional: true })
    editFunction?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.ExecuteFunction, isOptional: true })
    executeFunction?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetFunction, isOptional: true })
    getFunction?: PermissionRulesParam;

}
