import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class PushNotificationSettingsParam {

	@StringDataMember({ code: ParameterCode.ProjectId })
	public projectId: string;

	@StringDataMember({ code: ParameterCode.ClientEmail })
	public clientEmail: string;

	@StringDataMember({ code: ParameterCode.PrivateKey })
	public privateKey: string;

}
