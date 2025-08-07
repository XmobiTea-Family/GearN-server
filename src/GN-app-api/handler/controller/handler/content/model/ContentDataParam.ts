import { GNHashtable } from "./../../../../../../GN-common/common/GNData";
import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, GNHashtableDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ContentDataParam {
	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	key: string;

	@GNHashtableDataMember({ code: ParameterCode.Data })
	data: GNHashtable;
}
