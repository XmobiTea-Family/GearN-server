export enum RuleType {
    String = 1,
    Difference = 2,
    SetIntersection = 3,
    MatchTotal = 4,
    RegionSelection = 5,
    TeamSizeBalance = 6,
    TeamDifference = 7,
    TeamTicketSizeSimilarity = 8,
}

export enum RuleAttributeSource {
    UserInput = 1,
    PlayerData = 2,
}

export enum RuleExpansionType {
    None = 1,
    Linear = 2,
    Custom = 3,
}

interface RuleBase {
    // Stores the name value used by this contract.
    name: string;
    // Stores the type value used by this contract.
    type: RuleType;
}

export enum RuleStringCompairType {
    Equals = 1,
    NotEquals = 2,
}

export interface StringRule extends RuleBase {
    // Stores the attribute source value used by this contract.
    attributeSource: RuleAttributeSource;
    // Stores the attribute path value used by this contract.
    attributePath: string;

    // Stores the type value used by this contract.
    type: RuleType.String;

    // Stores the default value value used by this contract.
    defaultValue: string;
    // Stores the compair type value used by this contract.
    compairType: RuleStringCompairType;

    // Stores the advanced settings value used by this contract.
    advancedSettings?: {
        // Stores the seconds until optional value used by this contract.
        secondsUntilOptional: number;

        // Stores the expansion type value used by this contract.
        expansionType: RuleExpansionType.None | RuleExpansionType.Custom;
        // Stores the custom expansions value used by this contract.
        customExpansions?: {
            // Stores the seconds between expansions value used by this contract.
            secondsBetweenExpansions: number;
            // Stores the override value list used by this contract.
            overrideValue: string[];
        };
    };
}

export interface DifferenceRule extends RuleBase {
    // Stores the attribute source value used by this contract.
    attributeSource: RuleAttributeSource;
    // Stores the attribute path value used by this contract.
    attributePath: string;

    // Stores the type value used by this contract.
    type: RuleType.Difference;

    // Stores the default value value used by this contract.
    defaultValue: number;
    // Indicates whether ed difference is allowed.
    allowedDifference: number;

    // Stores the advanced settings value used by this contract.
    advancedSettings?: {
        // Stores the seconds until optional value used by this contract.
        secondsUntilOptional: number;

        // Stores the expansion type value used by this contract.
        expansionType: RuleExpansionType;

        // Stores the linear expansions value used by this contract.
        linearExpansions?: {
            // Stores the seconds between expansions value used by this contract.
            secondsBetweenExpansions: number;
            // Stores the delta value used by this contract.
            delta: number;
            // Stores the limit value used by this contract.
            limit: number;
        };

        // Stores the custom expansions value used by this contract.
        customExpansions?: {
            // Stores the seconds between expansions value used by this contract.
            secondsBetweenExpansions: number;
            // Stores the override value list used by this contract.
            overrideValue: number[];
        };
    };
}

export interface SetIntersectionRule extends RuleBase {
    // Stores the attribute source value used by this contract.
    attributeSource: RuleAttributeSource;
    // Stores the attribute path value used by this contract.
    attributePath: string;

    // Stores the type value used by this contract.
    type: RuleType.SetIntersection;

    // Stores the min value used by this contract.
    min: number;
    // Stores the default value list used by this contract.
    defaultValue: string[];

    // Stores the advanced settings value used by this contract.
    advancedSettings?: {
        // Stores the seconds until optional value used by this contract.
        secondsUntilOptional: number;

        // Stores the expansion type value used by this contract.
        expansionType: RuleExpansionType;

        // Stores the linear expansions value used by this contract.
        linearExpansions?: {
            // Stores the seconds between expansions value used by this contract.
            secondsBetweenExpansions: number;
            // Stores the delta value used by this contract.
            delta: number;
        };

        // Stores the custom expansions value used by this contract.
        customExpansions?: {
            // Stores the seconds between expansions value used by this contract.
            secondsBetweenExpansions: number;
            // Stores the override value list used by this contract.
            overrideValue: number[];
        };
    };
}

export interface MatchTotalRule extends RuleBase {
    // Stores the attribute source value used by this contract.
    attributeSource: RuleAttributeSource;
    // Stores the attribute path value used by this contract.
    attributePath: string;

    // Stores the type value used by this contract.
    type: RuleType.MatchTotal;

    // Stores the min value used by this contract.
    min: number;
    // Stores the max value used by this contract.
    max: number;

    // Stores the advanced settings value used by this contract.
    advancedSettings?: {
        // Stores the seconds until optional value used by this contract.
        secondsUntilOptional: number;

        // Stores the expansion type value used by this contract.
        expansionType: RuleExpansionType.None | RuleExpansionType.Custom;

        // Stores the custom expansions value used by this contract.
        customExpansions?: {
            // Stores the seconds between expansions value used by this contract.
            secondsBetweenExpansions: number;
            // Stores the override min list used by this contract.
            overrideMin?: number[];
            // Stores the override max list used by this contract.
            overrideMax?: number[];
        };
    };
}

export interface RegionSelectionRule extends RuleBase {
    // Stores the attribute path value used by this contract.
    attributePath: string;

    // Stores the type value used by this contract.
    type: RuleType.RegionSelection;

    // Stores the max value used by this contract.
    max: number;

    // Stores the advanced settings value used by this contract.
    advancedSettings?: {
        // Stores the seconds until optional value used by this contract.
        secondsUntilOptional: number;

        // Stores the expansion type value used by this contract.
        expansionType: RuleExpansionType;

        // Stores the linear expansions value used by this contract.
        linearExpansions?: {
            // Stores the seconds between expansions value used by this contract.
            secondsBetweenExpansions: number;
            // Stores the delta value used by this contract.
            delta: number;
            // Stores the limit value used by this contract.
            limit: number;
        };

        // Stores the custom expansions value used by this contract.
        customExpansions?: {
            // Stores the seconds between expansions value used by this contract.
            secondsBetweenExpansions: number;
            // Stores the override value list used by this contract.
            overrideValue: number[];
        };
    };
}

export interface TeamSizeBalanceRule extends RuleBase {
    // Stores the type value used by this contract.
    type: RuleType.TeamSizeBalance;

    // Indicates whether ed difference is allowed.
    allowedDifference: number;

    // Stores the advanced settings value used by this contract.
    advancedSettings?: {
        // Stores the seconds until optional value used by this contract.
        secondsUntilOptional: number;

        // Stores the expansion type value used by this contract.
        expansionType: RuleExpansionType;

        // Stores the linear expansions value used by this contract.
        linearExpansions?: {
            // Stores the seconds between expansions value used by this contract.
            secondsBetweenExpansions: number;
            // Stores the delta value used by this contract.
            delta: number;
            // Stores the limit value used by this contract.
            limit: number;
        };

        // Stores the custom expansions value used by this contract.
        customExpansions?: {
            // Stores the seconds between expansions value used by this contract.
            secondsBetweenExpansions: number;
            // Stores the override value list used by this contract.
            overrideValue: number[];
        };
    };
}

export interface TeamDifferenceRule extends RuleBase {
    // Stores the attribute source value used by this contract.
    attributeSource: RuleAttributeSource;
    // Stores the attribute path value used by this contract.
    attributePath: string;

    // Stores the type value used by this contract.
    type: RuleType.TeamDifference;

    // Indicates whether ed difference is allowed.
    allowedDifference: number;
    // Stores the default value value used by this contract.
    defaultValue: number;

    // Stores the advanced settings value used by this contract.
    advancedSettings?: {
        // Stores the seconds until optional value used by this contract.
        secondsUntilOptional: number;

        // Stores the expansion type value used by this contract.
        expansionType: RuleExpansionType;

        // Stores the linear expansions value used by this contract.
        linearExpansions?: {
            // Stores the seconds between expansions value used by this contract.
            secondsBetweenExpansions: number;
            // Stores the delta value used by this contract.
            delta: number;
            // Stores the limit value used by this contract.
            limit: number;
        };

        // Stores the custom expansions value used by this contract.
        customExpansions?: {
            // Stores the seconds between expansions value used by this contract.
            secondsBetweenExpansions: number;
            // Stores the override value list used by this contract.
            overrideValue: number[];
        };
    };
}

export interface TeamTicketSizeSimilarityRule extends RuleBase {
    // Stores the type value used by this contract.
    type: RuleType.TeamTicketSizeSimilarity;

    // Stores the advanced settings value used by this contract.
    advancedSettings?: {
        // Stores the seconds until optional value used by this contract.
        secondsUntilOptional: number;
    };
}

export interface xMatchmakingQueueSettings {
    // Stores the queue name value used by this contract.
    queueName: string;
    // Stores the match size value used by this contract.
    matchSize: {
        // Stores the min value used by this contract.
        min: number;
        // Stores the max value used by this contract.
        max: number;
    };
    // Stores the ticket size value used by this contract.
    ticketSize: {
        // Stores the min value used by this contract.
        min: number;
        // Stores the max value used by this contract.
        max: number;
    };
    // Stores the server allocation value used by this contract.
    serverAllocation: {
        // Indicates whether the feature is enabled.
        enable: boolean;
    };
    // Stores the teams list used by this contract.
    teams?: {
        // Stores the team ID value used by this contract.
        teamId: string;
        // Stores the team size value used by this contract.
        teamSize: {
            // Stores the min value used by this contract.
            min: number;
            // Stores the max value used by this contract.
            max: number;
        };
    }[];
    // Stores the rules list used by this contract.
    rules?: (StringRule | DifferenceRule | SetIntersectionRule | MatchTotalRule | RegionSelectionRule | TeamSizeBalanceRule | TeamDifferenceRule | TeamTicketSizeSimilarityRule)[];
}
