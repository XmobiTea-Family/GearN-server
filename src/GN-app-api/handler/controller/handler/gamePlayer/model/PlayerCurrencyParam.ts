import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, NumberDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class PlayerCurrencyParam {
    @StringDataMember({ code: GNParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
    key: string;

    @NumberDataMember({ code: GNParameterCode.Amount })
    amount: number;
}
