import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyGoogleSettingsParam {

	// Stores the google client ID value used by this instance.
	@StringDataMember({ code: ParameterCode.GoogleClientId })
	public googleClientId: string;

	// Stores the package ID value used by this instance.
	@StringDataMember({ code: ParameterCode.PackageId })
	public packageId: string;

	// Stores the public RSA key value used by this instance.
	@StringDataMember({ code: ParameterCode.PublicRSAKey })
	public publicRSAKey: string;

}
