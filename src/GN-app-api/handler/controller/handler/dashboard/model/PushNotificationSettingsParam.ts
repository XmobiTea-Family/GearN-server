import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class PushNotificationSettingsParam {
    @StringDataMember({ code: GNParameterCode.ProjectId })
    projectId: string;

    @StringDataMember({ code: GNParameterCode.ClientEmail })
    clientEmail: string;

    @StringDataMember({ code: GNParameterCode.PrivateKey })
    privateKey: string;

}
