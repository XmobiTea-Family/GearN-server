import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyFacebookSettingsParam {
	@StringDataMember({ code: GNParameterCode.FacebookAppId })
	facebookAppId: string;

	@StringDataMember({ code: GNParameterCode.FacebookAppToken })
	facebookAppToken: string;

	@StringDataMember({ code: GNParameterCode.FacebookInappSecret })
	facebookInappSecret: string;
}
