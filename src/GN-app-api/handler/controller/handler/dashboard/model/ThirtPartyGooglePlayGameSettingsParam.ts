import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyGooglePlayGameSettingsParam {

	@StringDataMember({ code: ParameterCode.RedirectUri })
	public redirectUri: string;

	@StringDataMember({ code: ParameterCode.ClientId })
	public clientId: string;

	@StringDataMember({ code: ParameterCode.ClientSecret })
	public clientSecret: string;

	@StringDataMember({ code: ParameterCode.ApplicationId })
	public applicationId: string;

}
