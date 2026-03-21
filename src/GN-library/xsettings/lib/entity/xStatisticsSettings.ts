export interface xStatisticsSettings {
	// Stores the key value used by this contract.
	key: string;
	// Stores the statistics aggregation method value used by this contract.
	statisticsAggregationMethod: number;

	// Stores the maximum value value used by this contract.
	maximumValue?: number;
	// Stores the minimum value value used by this contract.
	minimumValue?: number;

	// Stores the description value used by this contract.
	description: string;
	// Stores the initial value value used by this contract.
	initialValue: number;
	// Indicates whether index.
	index: boolean;

}
