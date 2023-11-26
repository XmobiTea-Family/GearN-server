import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyGooglePlayGameSettingsParam {
	@StringDataMember({ code: GNParameterCode.RedirectUri })
	redirectUri: string;

	@StringDataMember({ code: GNParameterCode.ClientId })
	clientId: string;

    @StringDataMember({ code: GNParameterCode.ClientSecret })
	clientSecret: string;

    @StringDataMember({ code: GNParameterCode.ApplicationId })
	applicationId: string;
}
