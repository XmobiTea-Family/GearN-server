import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class PushNotificationSettingsParam {
	@StringDataMember({ code: ParameterCode.ProjectId })
	projectId: string;

	@StringDataMember({ code: ParameterCode.ClientEmail })
	clientEmail: string;

	@StringDataMember({ code: ParameterCode.PrivateKey })
	privateKey: string;

}
