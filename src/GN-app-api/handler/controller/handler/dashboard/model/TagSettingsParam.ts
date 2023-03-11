import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class TagSettingsParam {
    @StringDataMember({ code: GNParameterCode.Key, minLength: 2, maxLength: 32 })
    key: string;

    @StringDataMember({ code: GNParameterCode.DisplayName, isOptional: true })
    displayName?: string;

    @BooleanDataMember({ code: GNParameterCode.Index })
    index: boolean;

}
