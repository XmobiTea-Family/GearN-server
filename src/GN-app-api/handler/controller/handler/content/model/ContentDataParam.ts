import { GNHashtable } from "./../../../../../../GN-common/common/GNData";
import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, GNHashtableDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ContentDataParam {
    @StringDataMember({ code: GNParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
    key: string;

    @GNHashtableDataMember({ code: GNParameterCode.Data })
    data: GNHashtable;
}
