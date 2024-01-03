export interface BigAnalyticsItem {
    CCU: number;

    DAU: number;
    DAUSince0h: number;
    DNU: number;
    DNUSince0h: number;
    DRT: number;
    DRTSince0h: number;

    MAU: number;
    MAUSince0h1: number;
    MNU: number;
    MNUSince0h1: number;
    MRT: number;
    MRTSince0h1: number;

    analyticsPrice: number;

    country: {
        countryCode: string;
        regions: {
            regionCode: string;
            regionName: string;
            ccu: number;
            latidute: number;
            longitude: number;
        }[]
    }[];

    operationSystem: {
        cpuUsage: number;
        memoryUsage: {
            totalMemoryInBytes: number;
            freeMemoryInBytes: number;
        };
        storageUsage: {
            name: string;
            fsTotalSizeInBytes: number;
            fsUsedSizeInBytes: number;
        }[];
    };

    databaseSystem: {
        fsTotalSizeInBytes: number;
        fsUsedSizeInBytes: number;
        totalSizeInBytes: number;
        collections: number;
        objects: number;
        indexes: number;
    };

    requestComplete: {
        eventName: string;
        results: 
        {
            errorCode: number;
            count: number;
        }[]
    }[];

    cost: {
        requestCount: number;
        matchmakingRequestCount: number;
        cloudScriptGBs: number;
        storageSizeInBytes: number;
        dataTransferSizeInBytes: number;
    };

    monthlyCost: {
        requestCount: number;
        matchmakingRequestCount: number;
        cloudScriptGBs: number;
        storageSizeInBytes: number;
        dataTransferSizeInBytes: number;
    };
}

export interface IAnalyticsService {
    getBigAnalyticsItem(tsDate?: number): Promise<BigAnalyticsItem>;
}
