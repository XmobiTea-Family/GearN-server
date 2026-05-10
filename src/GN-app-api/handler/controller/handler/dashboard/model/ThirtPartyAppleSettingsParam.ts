import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class ThirtPartyAppleSettingsParam {
    // Stores the apple client ID value used by this instance.
    @StringDataMember({ code: ParameterCode.AppleClientId })
    public appleClientId: string;

    // Indicates whether sandbox enable.
    @BooleanDataMember({ code: ParameterCode.SandboxEnable })
    public sandboxEnable: boolean;

    // Indicates whether suer ID.
    @StringDataMember({ code: ParameterCode.IssuerId })
    public issuerId: string;

    // Stores the key ID value used by this instance.
    @StringDataMember({ code: ParameterCode.KeyId })
    public keyId: string;

    // Stores the p 8 content value used by this instance.
    @StringDataMember({ code: ParameterCode.P8Content })
    public p8Content: string;
}
