import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyGoogleSettingsParam {
	@StringDataMember({ code: ParameterCode.GoogleClientId })
	googleClientId: string;

	@StringDataMember({ code: ParameterCode.PackageId })
	packageId: string;

	@StringDataMember({ code: ParameterCode.PublicRSAKey })
	publicRSAKey: string;
}
