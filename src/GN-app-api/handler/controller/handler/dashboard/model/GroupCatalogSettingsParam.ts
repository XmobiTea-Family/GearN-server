import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class GroupCatalogSettingsParam {

	@StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32 })
	public catalogId: string;

	@StringDataMember({ code: ParameterCode.Description, isOptional: true })
	public description?: string;

	@BooleanDataMember({ code: ParameterCode.ForceAcceptMember })
	public forceAcceptMember: boolean;

}
