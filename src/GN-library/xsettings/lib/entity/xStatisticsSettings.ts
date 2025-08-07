export interface xStatisticsSettings {
    key: string;
    statisticsAggregationMethod: number;

    maximumValue?: number;
    minimumValue?: number;

    description: string;
    initialValue: number;
    index: boolean;
    
}
