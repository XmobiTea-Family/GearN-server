import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class CurrencySettingsParam {
    @StringDataMember({ code: GNParameterCode.Key, minLength: 2, maxLength: 32 })
    key: string;

    @NumberDataMember({ code: GNParameterCode.InitialValue })
    initialValue: number;

    @StringDataMember({ code: GNParameterCode.DisplayName, minLength: 2, maxLength: 64 })
    displayName: string;

    @BooleanDataMember({ code: GNParameterCode.Index })
    index: boolean;

}
