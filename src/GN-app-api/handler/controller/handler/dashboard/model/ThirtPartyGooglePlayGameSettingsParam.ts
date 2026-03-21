import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyGooglePlayGameSettingsParam {

	// Stores the redirect URI value used by this instance.
	@StringDataMember({ code: ParameterCode.RedirectUri })
	public redirectUri: string;

	// Stores the client ID value used by this instance.
	@StringDataMember({ code: ParameterCode.ClientId })
	public clientId: string;

	// Stores the client secret value used by this instance.
	@StringDataMember({ code: ParameterCode.ClientSecret })
	public clientSecret: string;

	// Stores the application ID value used by this instance.
	@StringDataMember({ code: ParameterCode.ApplicationId })
	public applicationId: string;

}
