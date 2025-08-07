import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember, DataMember } from "./../../../../../../GN-common/entity/DataMember";

class SizeParam {
    @NumberDataMember({ code: ParameterCode.Min, minValue: 1, mustInt: true })
    min: number;

    @NumberDataMember({ code: ParameterCode.Max, minValue: 1, mustInt: true })
    max: number;

}

class TeamParam {
    @StringDataMember({ code: ParameterCode.TeamId, minLength: 1, maxLength: 32 })
    teamId: string;

    @GNHashtableDataMember({ code: ParameterCode.TeamSize })
    teamSize: SizeParam;

}

class LinearExpansionsParam {
    @NumberDataMember({ code: ParameterCode.SecondsBetweenExpansions, minValue: 1 })
    secondsBetweenExpansions: number;

    @NumberDataMember({ code: ParameterCode.Delta, isOptional: true })
    delta?: number;

    @NumberDataMember({ code: ParameterCode.Limit, isOptional: true })
    limit?: number;

}

class CustomExpansionsParam {
    @NumberDataMember({ code: ParameterCode.SecondsBetweenExpansions, minValue: 1 })
    secondsBetweenExpansions: number;

    @GNArrayDataMember({ code: ParameterCode.OverrideValue, isOptional: true, elementCls: Object })
    overrideValue?: any[];

    @GNArrayDataMember({ code: ParameterCode.OverrideMin, isOptional: true, elementCls: Object })
    overrideMin?: any[];

    @GNArrayDataMember({ code: ParameterCode.OverrideMax, isOptional: true, elementCls: Object })
    overrideMax?: any[];

}

class AdvancedSettingsParam {
    @NumberDataMember({ code: ParameterCode.SecondsUntilOptional, minValue: 1 })
    secondsUntilOptional: number;

    @NumberDataMember({ code: ParameterCode.ExpansionType, minValue: 1, maxValue: 3, isOptional: true, mustInt: true })
    expansionType?: number;

    @GNHashtableDataMember({ code: ParameterCode.LinearExpansions, isOptional: true })
    linearExpansions?: LinearExpansionsParam;

    @GNHashtableDataMember({ code: ParameterCode.CustomExpansions, isOptional: true })
    customExpansions?: CustomExpansionsParam;

}

class RuleParam {
    @StringDataMember({ code: ParameterCode.Name, minLength: 1, maxLength: 32 })
    name: string;

    @NumberDataMember({ code: ParameterCode.Type, minValue: 1, maxValue: 8, mustInt: true })
    type: number;

    @NumberDataMember({ code: ParameterCode.AttributeSource, minValue: 1, maxValue: 2, isOptional: true })
    attributeSource?: number;

    @StringDataMember({ code: ParameterCode.AttributePath, minLength: 1, maxLength: 32, isOptional: true })
    attributePath?: string;

    @DataMember({ code: ParameterCode.DefaultValue, isOptional: true })
    defaultValue?: any;

    @NumberDataMember({ code: ParameterCode.CompairType, minValue: 1, maxValue: 2, isOptional: true, mustInt: true })
    compairType?: number;

    @NumberDataMember({ code: ParameterCode.AllowedDifference, minValue: 0, isOptional: true })
    allowedDifference?: number;

    @NumberDataMember({ code: ParameterCode.Min, isOptional: true })
    min?: number;

    @NumberDataMember({ code: ParameterCode.Max, isOptional: true })
    max?: number;

    @GNHashtableDataMember({ code: ParameterCode.AdvancedSettings, isOptional: true })
    advancedSettings?: AdvancedSettingsParam;

}

class ServerAllocationParam {
    @BooleanDataMember({ code: ParameterCode.Enable })
    enable: boolean;

}

export class MatchmakingQueueSettingsParam {
    @StringDataMember({ code: ParameterCode.QueueName, minLength: 6, maxLength: 32 })
    queueName: string;

    @GNHashtableDataMember({ code: ParameterCode.MatchSize })
    matchSize: SizeParam;

    @GNHashtableDataMember({ code: ParameterCode.TicketSize })
    ticketSize: SizeParam;

    @GNHashtableDataMember({ code: ParameterCode.ServerAllocation })
    serverAllocation: ServerAllocationParam;

    @GNArrayDataMember({ code: ParameterCode.Teams, isOptional: true, elementCls: TeamParam })
    teams?: TeamParam[];

    @GNArrayDataMember({ code: ParameterCode.Rules, isOptional: true, elementCls: RuleParam })
    rules?: RuleParam[];

    @BooleanDataMember({ code: ParameterCode.Remove, isOptional: true })
    remove?: boolean;

}

// queueName: string;
//     matchSize: {
//         min: number,
//         max: number
//     },
//     ticketSize: {
//         min: number,
//         max: number
//     },
//     serverAllocation: {
//         enable: boolean,

//     },
//     teams?: {
//         name: string,
//         teamSize: {
//             min: number,
//             max: number
//         },
//     }[],
//     rules?: (StringRule | DifferenceRule | SetIntersectionRule | MatchTotalRule | RegionSelectionRule | TeamSizeBalanceRule | TeamDifferenceRule | TeamTicketSizeSimilarityRule)[]