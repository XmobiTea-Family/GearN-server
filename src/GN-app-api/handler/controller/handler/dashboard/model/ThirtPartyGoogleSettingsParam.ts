import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyGoogleSettingsParam {
	@StringDataMember({ code: GNParameterCode.GoogleClientId })
	googleClientId: string;

	@StringDataMember({ code: GNParameterCode.PackageId })
	packageId: string;

	@StringDataMember({ code: GNParameterCode.PublicRSAKey })
	publicRSAKey: string;
}
