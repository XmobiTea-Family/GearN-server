import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class StatisticsSettingsParam {

	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32 })
	public key: string;

	@NumberDataMember({ code: ParameterCode.StatisticsAggregationMethod, mustInt: true })
	public statisticsAggregationMethod: number;

	@NumberDataMember({ code: ParameterCode.MaximumValue, isOptional: true, defaultValue: null })
	public maximumValue?: number;

	@NumberDataMember({ code: ParameterCode.MinimumValue, isOptional: true, defaultValue: null })
	public minimumValue?: number;

	@NumberDataMember({ code: ParameterCode.InitialValue })
	public initialValue: number;

	@StringDataMember({ code: ParameterCode.Description })
	public description: string;

	@BooleanDataMember({ code: ParameterCode.Index })
	public index: boolean;

}
