import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class EmailSettingsParam {

	// Stores the send from value used by this instance.
	@StringDataMember({ code: ParameterCode.SendFrom })
	public sendFrom: string;

	// Indicates whether secure.
	@BooleanDataMember({ code: ParameterCode.Secure })
	public secure: boolean;

	// Stores the host value used by this instance.
	@StringDataMember({ code: ParameterCode.Host })
	public host: string;

	// Stores the port value used by this instance.
	@NumberDataMember({ code: ParameterCode.Port })
	public port: number;

	// Indicates whether rname should be used.
	@StringDataMember({ code: ParameterCode.Username })
	public username: string;

	// Stores the password value used by this instance.
	@StringDataMember({ code: ParameterCode.Password })
	public password: string;

}
