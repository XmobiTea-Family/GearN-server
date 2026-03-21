import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, DataMember, GNArrayDataMember, NumberDataMember, StringDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class StoreItemParam {

	// Stores the catalog ID value used by this instance.
	@StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32 })
	public catalogId: string;

	// Stores the class ID value used by this instance.
	@StringDataMember({ code: ParameterCode.ClassId, minLength: 2, maxLength: 32 })
	public classId: string;

	// Stores the amount value used by this instance.
	@NumberDataMember({ code: ParameterCode.Amount })
	public amount: number;

}
