import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class StatisticsSettingsParam {
    // Stores the key value used by this instance.
    @StringDataMember({ code: ParameterCode.Key, minLength: 2, maxLength: 32 })
    public key: string;

    // Stores the statistics aggregation method value used by this instance.
    @NumberDataMember({ code: ParameterCode.StatisticsAggregationMethod, mustInt: true })
    public statisticsAggregationMethod: number;

    // Stores the maximum value value used by this instance.
    @NumberDataMember({ code: ParameterCode.MaximumValue, isOptional: true, defaultValue: null })
    public maximumValue?: number;

    // Stores the minimum value value used by this instance.
    @NumberDataMember({ code: ParameterCode.MinimumValue, isOptional: true, defaultValue: null })
    public minimumValue?: number;

    // Stores the initial value value used by this instance.
    @NumberDataMember({ code: ParameterCode.InitialValue })
    public initialValue: number;

    // Stores the description value used by this instance.
    @StringDataMember({ code: ParameterCode.Description })
    public description: string;

    // Indicates whether index.
    @BooleanDataMember({ code: ParameterCode.Index })
    public index: boolean;
}
