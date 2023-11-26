import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { GNServer } from "./../../GNServer";
import { BigAnalyticsItem, IAnalyticsService } from "./IAnalyticsService";

export class AnalyticsService implements IAnalyticsService {
    private gnServer: GNServer;

    private currentCCU: number;

    private currentDAU: number;
    private currentDAUSince0h: number;
    private currentDNU: number;
    private currentDNUSince0h: number;
    private currentDRT: number;
    private currentDRTSince0h: number;

    private currentMAU: number;
    private currentMAUSince0h1: number;
    private currentMNU: number;
    private currentMNUSince0h1: number;
    private currentMRT: number;
    private currentMRTSince0h1: number;
    private analyticsPrice: number;

    private currentCountry: {
        countryCode: string,
        regions: {
            regionCode: string,
            regionName: string,
            ccu: number,
            latidute: number,
            longitude: number,
        }[]
    }[];

    public setGNServer(gnServer: GNServer): void {
        this.gnServer = gnServer;
    }

    public async getBigAnalyticsItem(tsDate?: number): Promise<BigAnalyticsItem> {
        let answer: BigAnalyticsItem;

        if (!tsDate) {
            answer = {
                CCU: this.currentCCU,

                DAU: this.currentDAU,
                DAUSince0h: this.currentDAUSince0h,
                DNU: this.currentDNU,
                DNUSince0h: this.currentDNUSince0h,
                DRT: this.currentDRT,
                DRTSince0h: this.currentDRTSince0h,

                MAU: this.currentMAU,
                MAUSince0h1: this.currentMAUSince0h1,
                MNU: this.currentMNU,
                MNUSince0h1: this.currentMNUSince0h1,
                MRT: this.currentMRT,
                MRTSince0h1: this.currentMRTSince0h1,

                analyticsPrice: this.analyticsPrice,
                country: this.currentCountry,
            };
        }
        else {
            let analyticsCollection = this.gnServer.getDatabase().systemCollection("Analytics");

            let result = await analyticsCollection.findOne({ tsCreate: tsDate });

            if (result == null) {
                answer = {
                    CCU: 0,

                    DAU: 0,
                    DAUSince0h: 0,
                    DNU: 0,
                    DNUSince0h: 0,
                    DRT: 0,
                    DRTSince0h: 0,

                    MAU: 0,
                    MAUSince0h1: 0,
                    MNU: 0,
                    MNUSince0h1: 0,
                    MRT: 0,
                    MRTSince0h1: 0,

                    analyticsPrice: 0,
                    country: null,
                };
            }
            else {
                answer = {
                    CCU: result["ccu"],

                    DAU: result["dau"],
                    DAUSince0h: result["dauSince0h"],
                    DNU: result["dnu"],
                    DNUSince0h: result["dnuSince0h"],
                    DRT: result["drt"],
                    DRTSince0h: result["drtSince0h"],

                    MAU: result["mau"],
                    MAUSince0h1: result["mauSince0h1"],
                    MNU: result["mnu"],
                    MNUSince0h1: result["mnuSince0h1"],
                    MRT: result["mrt"],
                    MRTSince0h1: result["mrtSince0h1"],

                    analyticsPrice: result["analyticsPrice"],
                    country: result["country"],
                };
            }
        }

        return answer;
    }

    public run(): void {
        this.getAnalytics();

        let thiz = this;
        this.gnServer.getTimerService().subscriberEveryMinute(() => {
            let currentDate = xDatetime.getCurrentDate();
            if (currentDate.getMinutes() % 15 == 0)
                thiz.analytics();
        });
    }

    private async analytics(): Promise<void> {
        await this.getAnalytics();
        await this.saveAnalytics();
    }

    private async getAnalytics(): Promise<void> {
        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
        let millisecondsSince0h = xDatetime.getToday0hMilliseconds();
        let playerCollection = this.gnServer.getDatabase().systemCollection("MasterPlayer");

        // CCU
        {
            let millisecondsAt15MinutesAgo = currentMilliseconds - 15 * xDatetime.ONE_MINUTE_MILLISECOND;
            this.currentCCU = await playerCollection.countDocuments({
                tsLastLogin: {
                    $gt: millisecondsAt15MinutesAgo
                }
            });
        }

        {
            let millisecondsAt15MinutesAgo = currentMilliseconds - 15 * xDatetime.ONE_MINUTE_MILLISECOND;

            this.analyticsPrice = await this.gnServer.getDatabase().systemCollection("StoreAnalytics").countDocuments({
                tsLastLogin: {
                    $gt: millisecondsAt15MinutesAgo
                }
            });
        }

        // DAU
        {
            let millisecondsAt1DayAgo = currentMilliseconds - xDatetime.ONE_DAY_MILLISECOND;
            this.currentDAU = await playerCollection.countDocuments({
                tsLastLogin: {
                    $gt: millisecondsAt1DayAgo
                }
            });
        }

        // DAUSince0h
        {
            this.currentDAUSince0h = await playerCollection.countDocuments({
                tsLastLogin: {
                    $gt: millisecondsSince0h
                }
            });
        }

        // DNU
        {
            let millisecondsAt1DayAgo = currentMilliseconds - xDatetime.ONE_DAY_MILLISECOND;
            this.currentDNU = await playerCollection.countDocuments({
                tsCreate: {
                    $gt: millisecondsAt1DayAgo
                }
            });
        }

        // DNUSince0h
        {
            this.currentDNUSince0h = await playerCollection.countDocuments({
                tsCreate: {
                    $gt: millisecondsSince0h
                }
            });
        }

        // MAU
        {
            let millisecondsAt1MonthAgo = currentMilliseconds - xDatetime.ONE_MONTH_MILLISECOND;

            this.currentMAU = await playerCollection.countDocuments({
                tsLastLogin: {
                    $gt: millisecondsAt1MonthAgo
                }
            });
        }

        // MAUSince0h1
        {
            let currentDate = xDatetime.getCurrentDate();
            currentDate.setHours(0);
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            currentDate.setMilliseconds(0);

            currentDate.setDate(1);

            let millisecondsSince0h1 = currentDate.getTime();

            this.currentMAUSince0h1 = await playerCollection.countDocuments({
                tsLastLogin: {
                    $gt: millisecondsSince0h1
                }
            });
        }

        // MNU
        {
            let millisecondsAt1DayAgo = currentMilliseconds - xDatetime.ONE_MONTH_MILLISECOND;

            this.currentMNU = await playerCollection.countDocuments({
                tsCreate: {
                    $gt: millisecondsAt1DayAgo
                }
            });
        }

        // MNUSince0h1
        {
            let currentDate = xDatetime.getCurrentDate();
            currentDate.setHours(0);
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            currentDate.setMilliseconds(0);

            currentDate.setDate(1);

            let millisecondsSince0h1 = currentDate.getTime();

            this.currentMNUSince0h1 = await playerCollection.countDocuments({
                tsCreate: {
                    $gt: millisecondsSince0h1
                }
            });
        }

        this.currentDRT = this.currentDAU - this.currentDNU;
        this.currentDRTSince0h = this.currentDAUSince0h - this.currentDNUSince0h;

        this.currentMRT = this.currentMAU - this.currentMNU;
        this.currentMRTSince0h1 = this.currentMAUSince0h1 - this.currentMNUSince0h1;

        {
            let gnCountrys: {
                countryCode: string,
                regions: {
                    regionCode: string,
                    regionName: string,
                    ccu: number,
                    latidute: number,
                    longitude: number,
                }[]
            }[] = [];

            let countryRegionCollection = this.gnServer.getDatabase().systemCollection("CountryRegion");

            let results = await countryRegionCollection.find({});

            while (await results.hasNext()) {
                let result = await results.next();

                let regions = result["regions"];
                let nameRegions = result["nameRegions"];
                let ipAddressRegions = result["ipAddressRegions"];

                if (!regions || !nameRegions || !ipAddressRegions) continue;

                let gnCountry: {
                    countryCode: string,
                    regions: {
                        regionCode: string,
                        regionName: string,
                        ccu: number,
                        latidute: number,
                        longitude: number,
                    }[]
                } = {
                    countryCode: result["countryCode"],
                    regions: [],
                };

                let regionKeys = Object.keys(regions);

                for (let i = 0; i < regionKeys.length; i++) {
                    let key = regionKeys[i];
                    let ipAddressRegion = ipAddressRegions[key];
                    if (!ipAddressRegion) continue;

                    let region = regions[key];
                    if (!region) continue;

                    let gnRegion: {
                        regionCode: string,
                        regionName: string,
                        ccu: number,
                        latidute: number,
                        longitude: number,
                    } = {
                        regionCode: key,
                        regionName: nameRegions[key],
                        ccu: Object.keys(region).length,
                        latidute: 0,
                        longitude: 0,
                    };

                    let ipAddressRegionIPKeys = Object.keys(ipAddressRegion);
                    let ipAddressRegionIPKey = ipAddressRegionIPKeys[0];
                    if (ipAddressRegionIPKey) {
                        let ipAddressRegionIP = ipAddressRegion[ipAddressRegionIPKey];

                        gnRegion.latidute = ipAddressRegionIP["latitude"];
                        gnRegion.longitude = ipAddressRegionIP["longitude"];
                    }

                    gnCountry.regions.push(gnRegion);
                }

                gnCountrys.push(gnCountry);
            }

            this.currentCountry = gnCountrys;
        }
    }

    private async saveAnalytics(): Promise<void> {
        let analyticsCollection = this.gnServer.getDatabase().systemCollection("Analytics");

        let currentDate = xDatetime.getCurrentDate();
        currentDate.setMinutes(Math.floor(currentDate.getMinutes() / 15) * 15);
        currentDate.setSeconds(0);
        currentDate.setMilliseconds(0);

        analyticsCollection.insertOne({
            ccu: this.currentCCU,

            dau: this.currentDAU,
            dauSince0h: this.currentDAUSince0h,
            dnu: this.currentDNU,
            dnuSince0h: this.currentDNUSince0h,
            drt: this.currentDRT,
            drtSince0h: this.currentDRTSince0h,

            mau: this.currentMAU,
            mauSince0h1: this.currentMAUSince0h1,
            mnu: this.currentMNU,
            mnuSince0h1: this.currentMNUSince0h1,
            mrt: this.currentMRT,
            mrtSince0h1: this.currentMRTSince0h1,

            analyticsPrice: this.analyticsPrice,
            country: this.currentCountry,

            tsCreate: currentDate.getTime()
        });
    }
}
