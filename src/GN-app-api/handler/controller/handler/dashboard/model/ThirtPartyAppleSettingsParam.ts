import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyAppleSettingsParam {
	@StringDataMember({ code: GNParameterCode.AppleClientId })
	appleClientId: string;

	@BooleanDataMember({ code: GNParameterCode.SandboxEnable })
	sandboxEnable: boolean;

	@StringDataMember({ code: GNParameterCode.IssuerId })
	issuerId: string;

	@StringDataMember({ code: GNParameterCode.KeyId })
	keyId: string;

	@StringDataMember({ code: GNParameterCode.P8Content })
	p8Content: string;

}
