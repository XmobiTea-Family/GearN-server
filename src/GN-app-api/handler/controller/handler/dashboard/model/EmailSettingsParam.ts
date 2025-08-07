import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class EmailSettingsParam {
	@StringDataMember({ code: ParameterCode.SendFrom })
	sendFrom: string;

	@BooleanDataMember({ code: ParameterCode.Secure })
	secure: boolean;

	@StringDataMember({ code: ParameterCode.Host })
	host: string;

	@NumberDataMember({ code: ParameterCode.Port })
	port: number;

	@StringDataMember({ code: ParameterCode.Username })
	username: string;

	@StringDataMember({ code: ParameterCode.Password })
	password: string;

}
