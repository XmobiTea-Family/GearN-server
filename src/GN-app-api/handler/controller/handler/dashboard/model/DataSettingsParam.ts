import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class DataSettingsParam {
    // Stores the key value used by this instance.
    @StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32 })
    public key: string;

    // Stores the description value used by this instance.
    @StringDataMember({ code: ParameterCode.Description })
    public description: string;

    // Stores the permission value used by this instance.
    @NumberDataMember({ code: ParameterCode.Permission, mustInt: true })
    public permission: number;
}
