import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, NumberDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class StoreItemParam {

	@StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32 })
	public catalogId: string;

	@StringDataMember({ code: ParameterCode.ClassId, minLength: 2, maxLength: 32 })
	public classId: string;

	@NumberDataMember({ code: ParameterCode.Amount })
	public amount: number;

}
