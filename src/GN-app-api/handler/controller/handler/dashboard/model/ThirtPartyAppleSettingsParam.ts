import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyAppleSettingsParam {

	@StringDataMember({ code: ParameterCode.AppleClientId })
	public appleClientId: string;

	@BooleanDataMember({ code: ParameterCode.SandboxEnable })
	public sandboxEnable: boolean;

	@StringDataMember({ code: ParameterCode.IssuerId })
	public issuerId: string;

	@StringDataMember({ code: ParameterCode.KeyId })
	public keyId: string;

	@StringDataMember({ code: ParameterCode.P8Content })
	public p8Content: string;

}
