import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyGameCenterSettingsParam {

	// Stores the package ID value used by this instance.
	@StringDataMember({ code: ParameterCode.PackageId })
	public packageId: string;

}
