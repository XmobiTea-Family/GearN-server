import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class PushNotificationSettingsParam {
    // Stores the project ID value used by this instance.
    @StringDataMember({ code: ParameterCode.ProjectId })
    public projectId: string;

    // Stores the client email value used by this instance.
    @StringDataMember({ code: ParameterCode.ClientEmail })
    public clientEmail: string;

    // Stores the private key value used by this instance.
    @StringDataMember({ code: ParameterCode.PrivateKey })
    public privateKey: string;
}
