import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { ThirtPartyAppleSettingsParam } from "./ThirtPartyAppleSettingsParam";
import { ThirtPartyFacebookSettingsParam } from "./ThirtPartyFacebookSettingsParam";
import { ThirtPartyGameCenterSettingsParam } from "./ThirtPartyGameCenterSettingsParam";
import { ThirtPartyGooglePlayGameSettingsParam } from "./ThirtPartyGooglePlayGameSettingsParam";
import { ThirtPartyGoogleSettingsParam } from "./ThirtPartyGoogleSettingsParam";

export class ThirtPartyParam {
	@GNHashtableDataMember({ code: ParameterCode.GoogleSettings, isOptional: true })
	googleSettings?: ThirtPartyGoogleSettingsParam;

	@GNHashtableDataMember({ code: ParameterCode.FacebookSettings, isOptional: true })
	facebookSettings?: ThirtPartyFacebookSettingsParam;

	@GNHashtableDataMember({ code: ParameterCode.AppleSettings, isOptional: true })
	appleSettings?: ThirtPartyAppleSettingsParam;

	@GNHashtableDataMember({ code: ParameterCode.GooglePlayGameSettings, isOptional: true })
	googlePlayGameSettings?: ThirtPartyGooglePlayGameSettingsParam;

	@GNHashtableDataMember({ code: ParameterCode.GameCenterSettings, isOptional: true })
	gameCenterSettings?: ThirtPartyGameCenterSettingsParam;
}
