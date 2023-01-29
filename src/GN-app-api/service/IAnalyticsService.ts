export interface AnalyticsItem {
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
}

export interface IAnalyticsService {
    getAnalyticsItem(tsDate?: number): Promise<AnalyticsItem>;
}
