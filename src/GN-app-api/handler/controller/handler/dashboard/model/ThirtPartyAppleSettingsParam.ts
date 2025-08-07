import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyAppleSettingsParam {
	@StringDataMember({ code: ParameterCode.AppleClientId })
	appleClientId: string;

	@BooleanDataMember({ code: ParameterCode.SandboxEnable })
	sandboxEnable: boolean;

	@StringDataMember({ code: ParameterCode.IssuerId })
	issuerId: string;

	@StringDataMember({ code: ParameterCode.KeyId })
	keyId: string;

	@StringDataMember({ code: ParameterCode.P8Content })
	p8Content: string;

}
