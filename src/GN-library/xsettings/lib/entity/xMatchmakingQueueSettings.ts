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
	name: string;
	type: RuleType;
}

export enum RuleStringCompairType {
	Equals = 1,
	NotEquals = 2,
}

export interface StringRule extends RuleBase {
	attributeSource: RuleAttributeSource;
	attributePath: string;

	type: RuleType.String;

	defaultValue: string;
	compairType: RuleStringCompairType;

	advancedSettings?: {
		secondsUntilOptional: number;

		expansionType: RuleExpansionType.None | RuleExpansionType.Custom;
		customExpansions?: {
			secondsBetweenExpansions: number;
			overrideValue: string[];
		}
	}
}

export interface DifferenceRule extends RuleBase {
	attributeSource: RuleAttributeSource;
	attributePath: string;

	type: RuleType.Difference;

	defaultValue: number;
	allowedDifference: number;

	advancedSettings?: {
		secondsUntilOptional: number;

		expansionType: RuleExpansionType;

		linearExpansions?: {
			secondsBetweenExpansions: number;
			delta: number;
			limit: number;
		}

		customExpansions?: {
			secondsBetweenExpansions: number;
			overrideValue: number[];
		}
	}
}

export interface SetIntersectionRule extends RuleBase {
	attributeSource: RuleAttributeSource;
	attributePath: string;

	type: RuleType.SetIntersection;

	min: number;
	defaultValue: string[];

	advancedSettings?: {
		secondsUntilOptional: number;

		expansionType: RuleExpansionType;

		linearExpansions?: {
			secondsBetweenExpansions: number;
			delta: number;
		}

		customExpansions?: {
			secondsBetweenExpansions: number;
			overrideValue: number[];
		}
	}
}

export interface MatchTotalRule extends RuleBase {
	attributeSource: RuleAttributeSource;
	attributePath: string;

	type: RuleType.MatchTotal;

	min: number;
	max: number;

	advancedSettings?: {
		secondsUntilOptional: number;

		expansionType: RuleExpansionType.None | RuleExpansionType.Custom;

		customExpansions?: {
			secondsBetweenExpansions: number;
			overrideMin?: number[];
			overrideMax?: number[];
		}
	}
}

export interface RegionSelectionRule extends RuleBase {
	attributePath: string;

	type: RuleType.RegionSelection;

	max: number;

	advancedSettings?: {
		secondsUntilOptional: number;

		expansionType: RuleExpansionType;

		linearExpansions?: {
			secondsBetweenExpansions: number;
			delta: number;
			limit: number;
		}

		customExpansions?: {
			secondsBetweenExpansions: number;
			overrideValue: number[];
		}
	}
}

export interface TeamSizeBalanceRule extends RuleBase {
	type: RuleType.TeamSizeBalance;

	allowedDifference: number;

	advancedSettings?: {
		secondsUntilOptional: number,

		expansionType: RuleExpansionType,

		linearExpansions?: {
			secondsBetweenExpansions: number,
			delta: number,
			limit: number,
		}

		customExpansions?: {
			secondsBetweenExpansions: number,
			overrideValue: number[],
		}
	}
}

export interface TeamDifferenceRule extends RuleBase {
	attributeSource: RuleAttributeSource;
	attributePath: string;

	type: RuleType.TeamDifference;

	allowedDifference: number;
	defaultValue: number,

	advancedSettings?: {
		secondsUntilOptional: number,

		expansionType: RuleExpansionType,

		linearExpansions?: {
			secondsBetweenExpansions: number,
			delta: number,
			limit: number,
		}

		customExpansions?: {
			secondsBetweenExpansions: number,
			overrideValue: number[],
		}
	}
}

export interface TeamTicketSizeSimilarityRule extends RuleBase {
	type: RuleType.TeamTicketSizeSimilarity;

	advancedSettings?: {
		secondsUntilOptional: number;
	}
}

export interface xMatchmakingQueueSettings {
	queueName: string;
	matchSize: {
		min: number,
		max: number
	},
	ticketSize: {
		min: number,
		max: number
	},
	serverAllocation: {
		enable: boolean,

	},
	teams?: {
		teamId: string,
		teamSize: {
			min: number,
			max: number
		},
	}[],
	rules?: (StringRule | DifferenceRule | SetIntersectionRule | MatchTotalRule | RegionSelectionRule | TeamSizeBalanceRule | TeamDifferenceRule | TeamTicketSizeSimilarityRule)[]
}
