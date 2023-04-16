import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ItemClassSettingsParam {
    @StringDataMember({ code: GNParameterCode.ClassId, minLength: 2, maxLength: 32 })
    classId: string;

    @StringDataMember({ code: GNParameterCode.DisplayName, isOptional: true })
    displayName?: string;
}
