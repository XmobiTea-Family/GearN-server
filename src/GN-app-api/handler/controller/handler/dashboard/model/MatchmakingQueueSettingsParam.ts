import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember, DataMember } from "./../../../../../../GN-common/entity/DataMember";

class SizeParam {

	@NumberDataMember({ code: ParameterCode.Min, minValue: 1, mustInt: true })
	public min: number;

	@NumberDataMember({ code: ParameterCode.Max, minValue: 1, mustInt: true })
	public max: number;

}

class TeamParam {

	@StringDataMember({ code: ParameterCode.TeamId, minLength: 1, maxLength: 32 })
	public teamId: string;

	@GNHashtableDataMember({ code: ParameterCode.TeamSize })
	public teamSize: SizeParam;

}

class LinearExpansionsParam {

	@NumberDataMember({ code: ParameterCode.SecondsBetweenExpansions, minValue: 1 })
	public secondsBetweenExpansions: number;

	@NumberDataMember({ code: ParameterCode.Delta, isOptional: true })
	public delta?: number;

	@NumberDataMember({ code: ParameterCode.Limit, isOptional: true })
	public limit?: number;

}

class CustomExpansionsParam {

	@NumberDataMember({ code: ParameterCode.SecondsBetweenExpansions, minValue: 1 })
	public secondsBetweenExpansions: number;

	@GNArrayDataMember({ code: ParameterCode.OverrideValue, isOptional: true, elementCls: Object })
	public overrideValue?: Array<any>;

	@GNArrayDataMember({ code: ParameterCode.OverrideMin, isOptional: true, elementCls: Object })
	public overrideMin?: Array<any>;

	@GNArrayDataMember({ code: ParameterCode.OverrideMax, isOptional: true, elementCls: Object })
	public overrideMax?: Array<any>;

}

class AdvancedSettingsParam {

	@NumberDataMember({ code: ParameterCode.SecondsUntilOptional, minValue: 1 })
	public secondsUntilOptional: number;

	@NumberDataMember({ code: ParameterCode.ExpansionType, minValue: 1, maxValue: 3, isOptional: true, mustInt: true })
	public expansionType?: number;

	@GNHashtableDataMember({ code: ParameterCode.LinearExpansions, isOptional: true })
	public linearExpansions?: LinearExpansionsParam;

	@GNHashtableDataMember({ code: ParameterCode.CustomExpansions, isOptional: true })
	public customExpansions?: CustomExpansionsParam;

}

class RuleParam {

	@StringDataMember({ code: ParameterCode.Name, minLength: 1, maxLength: 32 })
	public name: string;

	@NumberDataMember({ code: ParameterCode.Type, minValue: 1, maxValue: 8, mustInt: true })
	public type: number;

	@NumberDataMember({ code: ParameterCode.AttributeSource, minValue: 1, maxValue: 2, isOptional: true })
	public attributeSource?: number;

	@StringDataMember({ code: ParameterCode.AttributePath, minLength: 1, maxLength: 32, isOptional: true })
	public attributePath?: string;

	@DataMember({ code: ParameterCode.DefaultValue, isOptional: true })
	public defaultValue?: any;

	@NumberDataMember({ code: ParameterCode.CompairType, minValue: 1, maxValue: 2, isOptional: true, mustInt: true })
	public compairType?: number;

	@NumberDataMember({ code: ParameterCode.AllowedDifference, minValue: 0, isOptional: true })
	public allowedDifference?: number;

	@NumberDataMember({ code: ParameterCode.Min, isOptional: true })
	public min?: number;

	@NumberDataMember({ code: ParameterCode.Max, isOptional: true })
	public max?: number;

	@GNHashtableDataMember({ code: ParameterCode.AdvancedSettings, isOptional: true })
	public advancedSettings?: AdvancedSettingsParam;

}

class ServerAllocationParam {

	@BooleanDataMember({ code: ParameterCode.Enable })
	public enable: boolean;

}

export class MatchmakingQueueSettingsParam {

	@StringDataMember({ code: ParameterCode.QueueName, minLength: 6, maxLength: 32 })
	public queueName: string;

	@GNHashtableDataMember({ code: ParameterCode.MatchSize })
	public matchSize: SizeParam;

	@GNHashtableDataMember({ code: ParameterCode.TicketSize })
	public ticketSize: SizeParam;

	@GNHashtableDataMember({ code: ParameterCode.ServerAllocation })
	public serverAllocation: ServerAllocationParam;

	@GNArrayDataMember({ code: ParameterCode.Teams, isOptional: true, elementCls: TeamParam })
	public teams?: Array<TeamParam>;

	@GNArrayDataMember({ code: ParameterCode.Rules, isOptional: true, elementCls: RuleParam })
	public rules?: Array<RuleParam>;

	@BooleanDataMember({ code: ParameterCode.Remove, isOptional: true })
	public remove?: boolean;

}
