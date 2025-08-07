import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class StatisticsSettingsParam {
	@StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32 })
	key: string;

	@NumberDataMember({ code: ParameterCode.StatisticsAggregationMethod, mustInt: true })
	statisticsAggregationMethod: number;

	@NumberDataMember({ code: ParameterCode.MaximumValue, isOptional: true, defaultValue: null })
	maximumValue?: number;

	@NumberDataMember({ code: ParameterCode.MinimumValue, isOptional: true, defaultValue: null })
	minimumValue?: number;

	@NumberDataMember({ code: ParameterCode.InitialValue })
	initialValue: number;

	@StringDataMember({ code: ParameterCode.Description, minLength: 2, maxLength: 64 })
	description: string;

	@BooleanDataMember({ code: ParameterCode.Index })
	index: boolean;

}
