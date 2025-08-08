import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class EmailSettingsParam {

	@StringDataMember({ code: ParameterCode.SendFrom })
	public sendFrom: string;

	@BooleanDataMember({ code: ParameterCode.Secure })
	public secure: boolean;

	@StringDataMember({ code: ParameterCode.Host })
	public host: string;

	@NumberDataMember({ code: ParameterCode.Port })
	public port: number;

	@StringDataMember({ code: ParameterCode.Username })
	public username: string;

	@StringDataMember({ code: ParameterCode.Password })
	public password: string;

}
