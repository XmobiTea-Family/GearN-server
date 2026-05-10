import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ItemClassSettingsParam {
    // Stores the class ID value used by this instance.
    @StringDataMember({ code: ParameterCode.ClassId, minLength: 2, maxLength: 32 })
    public classId: string;

    // Stores the description value used by this instance.
    @StringDataMember({ code: ParameterCode.Description })
    public description: string;
}
