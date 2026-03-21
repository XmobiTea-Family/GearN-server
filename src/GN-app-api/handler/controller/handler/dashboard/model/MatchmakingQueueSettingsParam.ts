import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember, DataMember } from "./../../../../../../GN-common/entity/DataMember";

class SizeParam {

	// Stores the min value used by this instance.
	@NumberDataMember({ code: ParameterCode.Min, minValue: 1, mustInt: true })
	public min: number;

	// Stores the max value used by this instance.
	@NumberDataMember({ code: ParameterCode.Max, minValue: 1, mustInt: true })
	public max: number;

}

class TeamParam {

	// Stores the team ID value used by this instance.
	@StringDataMember({ code: ParameterCode.TeamId, minLength: 1, maxLength: 32 })
	public teamId: string;

	// Stores the team size value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.TeamSize })
	public teamSize: SizeParam;

}

class LinearExpansionsParam {

	// Stores the seconds between expansions value used by this instance.
	@NumberDataMember({ code: ParameterCode.SecondsBetweenExpansions, minValue: 1 })
	public secondsBetweenExpansions: number;

	// Stores the delta value used by this instance.
	@NumberDataMember({ code: ParameterCode.Delta, isOptional: true })
	public delta?: number;

	// Stores the limit value used by this instance.
	@NumberDataMember({ code: ParameterCode.Limit, isOptional: true })
	public limit?: number;

}

class CustomExpansionsParam {

	// Stores the seconds between expansions value used by this instance.
	@NumberDataMember({ code: ParameterCode.SecondsBetweenExpansions, minValue: 1 })
	public secondsBetweenExpansions: number;

	// Stores the override value value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.OverrideValue, isOptional: true, elementCls: Object })
	public overrideValue?: Array<any>;

	// Stores the override min value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.OverrideMin, isOptional: true, elementCls: Object })
	public overrideMin?: Array<any>;

	// Stores the override max value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.OverrideMax, isOptional: true, elementCls: Object })
	public overrideMax?: Array<any>;

}

class AdvancedSettingsParam {

	// Stores the seconds until optional value used by this instance.
	@NumberDataMember({ code: ParameterCode.SecondsUntilOptional, minValue: 1 })
	public secondsUntilOptional: number;

	// Stores the expansion type value used by this instance.
	@NumberDataMember({ code: ParameterCode.ExpansionType, minValue: 1, maxValue: 3, isOptional: true, mustInt: true })
	public expansionType?: number;

	// Stores the linear expansions value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.LinearExpansions, isOptional: true })
	public linearExpansions?: LinearExpansionsParam;

	// Stores the custom expansions value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.CustomExpansions, isOptional: true })
	public customExpansions?: CustomExpansionsParam;

}

class RuleParam {

	// Stores the name value used by this instance.
	@StringDataMember({ code: ParameterCode.Name, minLength: 1, maxLength: 32 })
	public name: string;

	// Stores the type value used by this instance.
	@NumberDataMember({ code: ParameterCode.Type, minValue: 1, maxValue: 8, mustInt: true })
	public type: number;

	// Stores the attribute source value used by this instance.
	@NumberDataMember({ code: ParameterCode.AttributeSource, minValue: 1, maxValue: 2, isOptional: true })
	public attributeSource?: number;

	// Stores the attribute path value used by this instance.
	@StringDataMember({ code: ParameterCode.AttributePath, minLength: 1, maxLength: 32, isOptional: true })
	public attributePath?: string;

	// Stores the default value value used by this instance.
	@DataMember({ code: ParameterCode.DefaultValue, isOptional: true })
	public defaultValue?: any;

	// Stores the compair type value used by this instance.
	@NumberDataMember({ code: ParameterCode.CompairType, minValue: 1, maxValue: 2, isOptional: true, mustInt: true })
	public compairType?: number;

	// Indicates whether ed difference is allowed.
	@NumberDataMember({ code: ParameterCode.AllowedDifference, minValue: 0, isOptional: true })
	public allowedDifference?: number;

	// Stores the min value used by this instance.
	@NumberDataMember({ code: ParameterCode.Min, isOptional: true })
	public min?: number;

	// Stores the max value used by this instance.
	@NumberDataMember({ code: ParameterCode.Max, isOptional: true })
	public max?: number;

	// Stores the advanced settings value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.AdvancedSettings, isOptional: true })
	public advancedSettings?: AdvancedSettingsParam;

}

class ServerAllocationParam {

	// Indicates whether the feature is enabled.
	@BooleanDataMember({ code: ParameterCode.Enable })
	public enable: boolean;

}

export class MatchmakingQueueSettingsParam {

	// Stores the queue name value used by this instance.
	@StringDataMember({ code: ParameterCode.QueueName, minLength: 6, maxLength: 32 })
	public queueName: string;

	// Stores the match size value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.MatchSize })
	public matchSize: SizeParam;

	// Stores the ticket size value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.TicketSize })
	public ticketSize: SizeParam;

	// Stores the server allocation value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.ServerAllocation })
	public serverAllocation: ServerAllocationParam;

	// Stores the teams value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.Teams, isOptional: true, elementCls: TeamParam })
	public teams?: Array<TeamParam>;

	// Stores the rules value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.Rules, isOptional: true, elementCls: RuleParam })
	public rules?: Array<RuleParam>;

	// Indicates whether remove.
	@BooleanDataMember({ code: ParameterCode.Remove, isOptional: true })
	public remove?: boolean;

}
