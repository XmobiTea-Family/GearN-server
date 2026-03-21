import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyFacebookSettingsParam {

	// Stores the facebook app ID value used by this instance.
	@StringDataMember({ code: ParameterCode.FacebookAppId })
	public facebookAppId: string;

	// Stores the facebook app token value used by this instance.
	@StringDataMember({ code: ParameterCode.FacebookAppToken })
	public facebookAppToken: string;

	// Stores the facebook inapp secret value used by this instance.
	@StringDataMember({ code: ParameterCode.FacebookInappSecret })
	public facebookInappSecret: string;

}
