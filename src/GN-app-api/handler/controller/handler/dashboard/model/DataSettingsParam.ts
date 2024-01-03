import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class DataSettingsParam {
    @StringDataMember({ code: GNParameterCode.Key, minLength: 2, maxLength: 32 })
    key: string;

    @StringDataMember({ code: GNParameterCode.DisplayName, minLength: 2, maxLength: 64 })
    displayName: string;

    @NumberDataMember({ code: GNParameterCode.Permission, mustInt: true })
    permission: number;
    
}
