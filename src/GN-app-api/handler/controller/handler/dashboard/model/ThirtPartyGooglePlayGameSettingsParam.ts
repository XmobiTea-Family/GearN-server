import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyGooglePlayGameSettingsParam {
	@StringDataMember({ code: ParameterCode.RedirectUri })
	redirectUri: string;

	@StringDataMember({ code: ParameterCode.ClientId })
	clientId: string;

	@StringDataMember({ code: ParameterCode.ClientSecret })
	clientSecret: string;

	@StringDataMember({ code: ParameterCode.ApplicationId })
	applicationId: string;
}
