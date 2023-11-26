import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class GenericServiceSettingsParam {
    @StringDataMember({ code: GNParameterCode.ServiceName, minLength: 2, maxLength: 32 })
    serviceName: string;
}
