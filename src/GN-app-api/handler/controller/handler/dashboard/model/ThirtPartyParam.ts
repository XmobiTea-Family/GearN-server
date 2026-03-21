import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { ThirtPartyAppleSettingsParam } from "./ThirtPartyAppleSettingsParam";
import { ThirtPartyFacebookSettingsParam } from "./ThirtPartyFacebookSettingsParam";
import { ThirtPartyGameCenterSettingsParam } from "./ThirtPartyGameCenterSettingsParam";
import { ThirtPartyGooglePlayGameSettingsParam } from "./ThirtPartyGooglePlayGameSettingsParam";
import { ThirtPartyGoogleSettingsParam } from "./ThirtPartyGoogleSettingsParam";

export class ThirtPartyParam {

	// Stores the google settings value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GoogleSettings, isOptional: true })
	public googleSettings?: ThirtPartyGoogleSettingsParam;

	// Stores the facebook settings value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.FacebookSettings, isOptional: true })
	public facebookSettings?: ThirtPartyFacebookSettingsParam;

	// Stores the apple settings value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.AppleSettings, isOptional: true })
	public appleSettings?: ThirtPartyAppleSettingsParam;

	// Stores the google play game settings value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GooglePlayGameSettings, isOptional: true })
	public googlePlayGameSettings?: ThirtPartyGooglePlayGameSettingsParam;

	// Stores the game center settings value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GameCenterSettings, isOptional: true })
	public gameCenterSettings?: ThirtPartyGameCenterSettingsParam;

}
