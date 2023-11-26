import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, NumberDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class StoreItemParam {
    @StringDataMember({ code: GNParameterCode.CatalogId, minLength: 2, maxLength: 32 })
    catalogId: string;

    @StringDataMember({ code: GNParameterCode.ClassId, minLength: 2, maxLength: 32 })
    classId: string;

    @NumberDataMember({ code: GNParameterCode.Amount })
    amount: number;
}
