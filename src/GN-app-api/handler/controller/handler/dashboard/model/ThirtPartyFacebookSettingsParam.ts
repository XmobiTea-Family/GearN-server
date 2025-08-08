import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyFacebookSettingsParam {

	@StringDataMember({ code: ParameterCode.FacebookAppId })
	public facebookAppId: string;

	@StringDataMember({ code: ParameterCode.FacebookAppToken })
	public facebookAppToken: string;

	@StringDataMember({ code: ParameterCode.FacebookInappSecret })
	public facebookInappSecret: string;

}
