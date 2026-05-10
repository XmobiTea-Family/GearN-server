import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class PermissionRulesParam {
    // Indicates whether self enable.
    @BooleanDataMember({ code: ParameterCode.SelfEnable, isOptional: true })
    public selfEnable?: boolean;

    // Indicates whether other self enable.
    @BooleanDataMember({ code: ParameterCode.OtherSelfEnable, isOptional: true })
    public otherSelfEnable?: boolean;

    // Indicates whether admin self enable.
    @BooleanDataMember({ code: ParameterCode.AdminSelfEnable, isOptional: true })
    public adminSelfEnable?: boolean;

    // Indicates whether server self enable.
    @BooleanDataMember({ code: ParameterCode.ServerSelfEnable, isOptional: true })
    public serverSelfEnable?: boolean;
}
