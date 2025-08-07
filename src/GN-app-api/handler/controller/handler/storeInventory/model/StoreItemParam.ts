import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, NumberDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class StoreItemParam {
    @StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32 })
    catalogId: string;

    @StringDataMember({ code: ParameterCode.ClassId, minLength: 2, maxLength: 32 })
    classId: string;

    @NumberDataMember({ code: ParameterCode.Amount })
    amount: number;
}
