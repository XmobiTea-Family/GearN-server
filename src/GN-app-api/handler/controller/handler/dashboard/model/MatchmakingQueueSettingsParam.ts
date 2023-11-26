import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember, DataMember } from "./../../../../../../GN-common/entity/DataMember";

class SizeParam {
    @NumberDataMember({ code: GNParameterCode.Min, minValue: 1, mustInt: true })
    min: number;

    @NumberDataMember({ code: GNParameterCode.Max, minValue: 1, mustInt: true })
    max: number;

}

class TeamParam {
    @StringDataMember({ code: GNParameterCode.TeamId, minLength: 1, maxLength: 32 })
    teamId: string;

    @GNHashtableDataMember({ code: GNParameterCode.TeamSize })
    teamSize: SizeParam;

}

class LinearExpansionsParam {
    @NumberDataMember({ code: GNParameterCode.SecondsBetweenExpansions, minValue: 1 })
    secondsBetweenExpansions: number;

    @NumberDataMember({ code: GNParameterCode.Delta, isOptional: true })
    delta?: number;

    @NumberDataMember({ code: GNParameterCode.Limit, isOptional: true })
    limit?: number;

}

class CustomExpansionsParam {
    @NumberDataMember({ code: GNParameterCode.SecondsBetweenExpansions, minValue: 1 })
    secondsBetweenExpansions: number;

    @GNArrayDataMember({ code: GNParameterCode.OverrideValue, isOptional: true, elementCls: Object })
    overrideValue?: any[];

    @GNArrayDataMember({ code: GNParameterCode.OverrideMin, isOptional: true, elementCls: Object })
    overrideMin?: any[];

    @GNArrayDataMember({ code: GNParameterCode.OverrideMax, isOptional: true, elementCls: Object })
    overrideMax?: any[];

}

class AdvancedSettingsParam {
    @NumberDataMember({ code: GNParameterCode.SecondsUntilOptional, minValue: 1 })
    secondsUntilOptional: number;

    @NumberDataMember({ code: GNParameterCode.ExpansionType, minValue: 1, maxValue: 3, isOptional: true, mustInt: true })
    expansionType?: number;

    @GNHashtableDataMember({ code: GNParameterCode.LinearExpansions, isOptional: true })
    linearExpansions?: LinearExpansionsParam;

    @GNHashtableDataMember({ code: GNParameterCode.CustomExpansions, isOptional: true })
    customExpansions?: CustomExpansionsParam;

}

class RuleParam {
    @StringDataMember({ code: GNParameterCode.Name, minLength: 1, maxLength: 32 })
    name: string;

    @NumberDataMember({ code: GNParameterCode.Type, minValue: 1, maxValue: 8, mustInt: true })
    type: number;

    @NumberDataMember({ code: GNParameterCode.AttributeSource, minValue: 1, maxValue: 2, isOptional: true })
    attributeSource?: number;

    @StringDataMember({ code: GNParameterCode.AttributePath, minLength: 1, maxLength: 32, isOptional: true })
    attributePath?: string;

    @DataMember({ code: GNParameterCode.DefaultValue, isOptional: true })
    defaultValue?: any;

    @NumberDataMember({ code: GNParameterCode.CompairType, minValue: 1, maxValue: 2, isOptional: true, mustInt: true })
    compairType?: number;

    @NumberDataMember({ code: GNParameterCode.AllowedDifference, minValue: 0, isOptional: true })
    allowedDifference?: number;

    @NumberDataMember({ code: GNParameterCode.Min, isOptional: true })
    min?: number;

    @NumberDataMember({ code: GNParameterCode.Max, isOptional: true })
    max?: number;

    @GNHashtableDataMember({ code: GNParameterCode.AdvancedSettings, isOptional: true })
    advancedSettings?: AdvancedSettingsParam;

}

class ServerAllocationParam {
    @BooleanDataMember({ code: GNParameterCode.Enable })
    enable: boolean;

}

export class MatchmakingQueueSettingsParam {
    @StringDataMember({ code: GNParameterCode.QueueName, minLength: 6, maxLength: 32 })
    queueName: string;

    @GNHashtableDataMember({ code: GNParameterCode.MatchSize })
    matchSize: SizeParam;

    @GNHashtableDataMember({ code: GNParameterCode.TicketSize })
    ticketSize: SizeParam;

    @GNHashtableDataMember({ code: GNParameterCode.ServerAllocation })
    serverAllocation: ServerAllocationParam;

    @GNArrayDataMember({ code: GNParameterCode.Teams, isOptional: true, elementCls: TeamParam })
    teams?: TeamParam[];

    @GNArrayDataMember({ code: GNParameterCode.Rules, isOptional: true, elementCls: RuleParam })
    rules?: RuleParam[];

    @BooleanDataMember({ code: GNParameterCode.Remove, isOptional: true })
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