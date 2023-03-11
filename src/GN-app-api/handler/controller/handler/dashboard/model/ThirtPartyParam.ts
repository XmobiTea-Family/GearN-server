import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { ThirtPartyAppleSettingsParam } from "./ThirtPartyAppleSettingsParam";
import { ThirtPartyFacebookSettingsParam } from "./ThirtPartyFacebookSettingsParam";
import { ThirtPartyGameCenterSettingsParam } from "./ThirtPartyGameCenterSettingsParam";
import { ThirtPartyGooglePlayGameSettingsParam } from "./ThirtPartyGooglePlayGameSettingsParam";
import { ThirtPartyGoogleSettingsParam } from "./ThirtPartyGoogleSettingsParam";

export class ThirtPartyParam {
    @GNHashtableDataMember({ code: GNParameterCode.GoogleSettings, isOptional: true })
    googleSettings?: ThirtPartyGoogleSettingsParam;

    @GNHashtableDataMember({ code: GNParameterCode.FacebookSettings, isOptional: true })
    facebookSettings?: ThirtPartyFacebookSettingsParam;

    @GNHashtableDataMember({ code: GNParameterCode.AppleSettings, isOptional: true })
    appleSettings?: ThirtPartyAppleSettingsParam;

    @GNHashtableDataMember({ code: GNParameterCode.GooglePlayGameSettings, isOptional: true })
    googlePlayGameSettings?: ThirtPartyGooglePlayGameSettingsParam;

    @GNHashtableDataMember({ code: GNParameterCode.GameCenterSettings, isOptional: true })
    gameCenterSettings?: ThirtPartyGameCenterSettingsParam;
}
