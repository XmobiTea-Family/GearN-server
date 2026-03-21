import { GNHashtable } from "./../../../../../../GN-common/common/GNData";
import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, GNHashtableDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ContentDataParam {

	// Stores the key value used by this instance.
	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32, mustNonNull: true })
	public key: string;

	// Stores the data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.Data })
	public data: GNHashtable;

}
