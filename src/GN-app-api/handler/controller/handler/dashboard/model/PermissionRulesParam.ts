import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class PermissionRulesParam {
    @BooleanDataMember({ code: GNParameterCode.SelfEnable, isOptional: true })
    selfEnable?: boolean;

    @BooleanDataMember({ code: GNParameterCode.OtherSelfEnable, isOptional: true })
    otherSelfEnable?: boolean;

    @BooleanDataMember({ code: GNParameterCode.AdminSelfEnable, isOptional: true })
    adminSelfEnable?: boolean;

    @BooleanDataMember({ code: GNParameterCode.ServerSelfEnable, isOptional: true })
    serverSelfEnable?: boolean;
}
