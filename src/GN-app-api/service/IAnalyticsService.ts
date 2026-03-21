export interface BigAnalyticsItem {
    // Stores the CCU value used by this contract.
    CCU: number;

    // Stores the DAU value used by this contract.
    DAU: number;
    // Stores the DAU since 0 h value used by this contract.
    DAUSince0h: number;
    // Stores the DNU value used by this contract.
    DNU: number;
    // Stores the DNU since 0 h value used by this contract.
    DNUSince0h: number;
    // Stores the DRT value used by this contract.
    DRT: number;
    // Stores the DRT since 0 h value used by this contract.
    DRTSince0h: number;

    // Stores the MAU value used by this contract.
    MAU: number;
    // Stores the MAU since 0 h 1 value used by this contract.
    MAUSince0h1: number;
    // Stores the MNU value used by this contract.
    MNU: number;
    // Stores the MNU since 0 h 1 value used by this contract.
    MNUSince0h1: number;
    // Stores the MRT value used by this contract.
    MRT: number;
    // Stores the MRT since 0 h 1 value used by this contract.
    MRTSince0h1: number;

    // Stores the analytics price value used by this contract.
    analyticsPrice: number;

    // Stores the country list used by this contract.
    country: {
        // Stores the country code value used by this contract.
        countryCode: string;
        // Stores the regions list used by this contract.
        regions: {
            // Stores the region code value used by this contract.
            regionCode: string;
            // Stores the region name value used by this contract.
            regionName: string;
            // Stores the ccu value used by this contract.
            ccu: number;
            // Stores the latidute value used by this contract.
            latidute: number;
            // Stores the longitude value used by this contract.
            longitude: number;
        }[]
    }[];

    // Stores the operation system value used by this contract.
    operationSystem: {
        // Stores the cpu usage value used by this contract.
        cpuUsage: number;
        // Stores the memory usage value used by this contract.
        memoryUsage: {
            // Stores the total memory in bytes value used by this contract.
            totalMemoryInBytes: number;
            // Stores the free memory in bytes value used by this contract.
            freeMemoryInBytes: number;
        };
        // Stores the storage usage list used by this contract.
        storageUsage: {
            // Stores the name value used by this contract.
            name: string;
            // Stores the fs total size in bytes value used by this contract.
            fsTotalSizeInBytes: number;
            // Stores the fs used size in bytes value used by this contract.
            fsUsedSizeInBytes: number;
        }[];
    };

    // Stores the database system value used by this contract.
    databaseSystem: {
        // Stores the fs total size in bytes value used by this contract.
        fsTotalSizeInBytes: number;
        // Stores the fs used size in bytes value used by this contract.
        fsUsedSizeInBytes: number;
        // Stores the total size in bytes value used by this contract.
        totalSizeInBytes: number;
        // Stores the collections value used by this contract.
        collections: number;
        // Stores the objects value used by this contract.
        objects: number;
        // Stores the indexes value used by this contract.
        indexes: number;
    };

    // Stores the log database system value used by this contract.
    logDatabaseSystem: {
        // Stores the fs total size in bytes value used by this contract.
        fsTotalSizeInBytes: number;
        // Stores the fs used size in bytes value used by this contract.
        fsUsedSizeInBytes: number;
        // Stores the total size in bytes value used by this contract.
        totalSizeInBytes: number;
        // Stores the collections value used by this contract.
        collections: number;
        // Stores the objects value used by this contract.
        objects: number;
        // Stores the indexes value used by this contract.
        indexes: number;
    };

    // Stores the request complete list used by this contract.
    requestComplete: {
        // Stores the event name value used by this contract.
        eventName: string;
        // Stores the results list used by this contract.
        results: 
        {
            // Stores the error code value used by this contract.
            errorCode: number;
            // Stores the count value used by this contract.
            count: number;
        }[]
    }[];

    // Stores the cost value used by this contract.
    cost: {
        // Stores the request count value used by this contract.
        requestCount: number;
        // Stores the matchmaking request count value used by this contract.
        matchmakingRequestCount: number;
        // Stores the cloud script g bs value used by this contract.
        cloudScriptGBs: number;
        // Stores the storage size in bytes value used by this contract.
        storageSizeInBytes: number;
        // Stores the data transfer size in bytes value used by this contract.
        dataTransferSizeInBytes: number;
    };

    // Stores the monthly cost value used by this contract.
    monthlyCost: {
        // Stores the request count value used by this contract.
        requestCount: number;
        // Stores the matchmaking request count value used by this contract.
        matchmakingRequestCount: number;
        // Stores the cloud script g bs value used by this contract.
        cloudScriptGBs: number;
        // Stores the storage size in bytes value used by this contract.
        storageSizeInBytes: number;
        // Stores the data transfer size in bytes value used by this contract.
        dataTransferSizeInBytes: number;
    };
}

export interface IAnalyticsService {
    /**
     * Returns the big analytics item.
     * @param tsDate Provides the timestamp date value used by this operation.
     * @returns Returns the big analytics item.
     */
    getBigAnalyticsItem(tsDate?: number): Promise<BigAnalyticsItem>;
}
