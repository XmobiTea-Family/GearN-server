import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class PermissionRulesParam {

	@BooleanDataMember({ code: ParameterCode.SelfEnable, isOptional: true })
	public selfEnable?: boolean;

	@BooleanDataMember({ code: ParameterCode.OtherSelfEnable, isOptional: true })
	public otherSelfEnable?: boolean;

	@BooleanDataMember({ code: ParameterCode.AdminSelfEnable, isOptional: true })
	public adminSelfEnable?: boolean;

	@BooleanDataMember({ code: ParameterCode.ServerSelfEnable, isOptional: true })
	public serverSelfEnable?: boolean;

}
