import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyGoogleSettingsParam {

	@StringDataMember({ code: ParameterCode.GoogleClientId })
	public googleClientId: string;

	@StringDataMember({ code: ParameterCode.PackageId })
	public packageId: string;

	@StringDataMember({ code: ParameterCode.PublicRSAKey })
	public publicRSAKey: string;

}
