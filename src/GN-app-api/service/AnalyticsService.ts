import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { GNServer } from "./../../GNServer";
import { AnalyticsItem, IAnalyticsService } from "./IAnalyticsService";

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

    public setGNServer(gnServer: GNServer): void {
        this.gnServer = gnServer;
    }

    public async getAnalyticsItem(tsDate?: number): Promise<AnalyticsItem> {
        if (tsDate == null) {
            let answer: AnalyticsItem = {
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
            };

            return answer;
        }
        else {
            let analyticsCollection = this.gnServer.getDatabase().systemCollection("Analytics");

            let result = await analyticsCollection.findOne({ "TsCreate": tsDate });
            if (result == null) return null;

            let answer: AnalyticsItem = {
                CCU: result["CCU"],

                DAU: result["DAU"],
                DAUSince0h: result["DAUSince0h"],
                DNU: result["DNU"],
                DNUSince0h: result["DNUSince0h"],
                DRT: result["DRT"],
                DRTSince0h: result["DRTSince0h"],

                MAU: result["MAU"],
                MAUSince0h1: result["MAUSince0h1"],
                MNU: result["MNU"],
                MNUSince0h1: result["MNUSince0h1"],
                MRT: result["MRT"],
                MRTSince0h1: result["MRTSince0h1"],
            };

            return answer;
        }
    }

    public run(): void {
        this.getAnalytics();

        this.gnServer.getTimerService().subscriberEveryMinute(() => {
            let currentDate = xDatetime.getCurrentDate();
            if (currentDate.getMinutes() % 15 == 0)
                this.analytics();
        });
    }

    private async analytics(): Promise<void> {
        await this.getAnalytics();
        await this.saveAnalytics();
    }

    private async getAnalytics(): Promise<void> {
        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
        let millisecondsSince0h = xDatetime.getToday0hMilliseconds();
        let playerCollection = this.gnServer.getDatabase().systemCollection("Player");

        // CCU
        {
            let millisecondsAt30MinutesAgo = currentMilliseconds - 30 * xDatetime.ONE_MINUTE_MILLISECOND;
            this.currentCCU = await playerCollection.countDocuments({
                "TsLastSeen": {
                    "$gt": millisecondsAt30MinutesAgo
                }
            });
        }

        // DAU
        {
            let millisecondsAt1DayAgo = currentMilliseconds - xDatetime.ONE_DAY_MILLISECOND;
            this.currentDAU = await playerCollection.countDocuments({
                "TsLastSeen": {
                    "$gt": millisecondsAt1DayAgo
                }
            });
        }

        // DAUSince0h
        {
            this.currentDAUSince0h = await playerCollection.countDocuments({
                "TsLastSeen": {
                    "$gt": millisecondsSince0h
                }
            });
        }

        // DNU
        {
            let millisecondsAt1DayAgo = currentMilliseconds - xDatetime.ONE_DAY_MILLISECOND;
            this.currentDNU = await playerCollection.countDocuments({
                "TsCreate": {
                    "$gt": millisecondsAt1DayAgo
                }
            });
        }

        // DNUSince0h
        {
            this.currentDNUSince0h = await playerCollection.countDocuments({
                "TsCreate": {
                    "$gt": millisecondsSince0h
                }
            });
        }

        // MAU
        {
            let millisecondsAt1MonthAgo = currentMilliseconds - xDatetime.ONE_MONTH_MILLISECOND;

            this.currentMAU = await playerCollection.countDocuments({
                "TsLastSeen": {
                    "$gt": millisecondsAt1MonthAgo
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
                "TsLastSeen": {
                    "$gt": millisecondsSince0h1
                }
            });
        }

        // MNU
        {
            let millisecondsAt1DayAgo = currentMilliseconds - xDatetime.ONE_MONTH_MILLISECOND;

            this.currentMNU = await playerCollection.countDocuments({
                "TsCreate": {
                    "$gt": millisecondsAt1DayAgo
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
                "TsCreate": {
                    "$gt": millisecondsSince0h1
                }
            });
        }

        this.currentDRT = this.currentDAU - this.currentDNU;
        this.currentDRTSince0h = this.currentDAUSince0h - this.currentDNUSince0h;

        this.currentMRT = this.currentMAU - this.currentMNU;
        this.currentMRTSince0h1 = this.currentMAUSince0h1 - this.currentMNUSince0h1;
    }

    private async saveAnalytics(): Promise<void> {
        let analyticsCollection = this.gnServer.getDatabase().systemCollection("Analytics");

        let currentDate = xDatetime.getCurrentDate();
        currentDate.setMinutes(Math.floor(currentDate.getMinutes() / 15) * 15);
        currentDate.setSeconds(0);
        currentDate.setMilliseconds(0);

        analyticsCollection.insertOne({
            "CCU": this.currentCCU,

            "DAU": this.currentDAU,
            "DAUSince0h": this.currentDAUSince0h,
            "DNU": this.currentDNU,
            "DNUSince0h": this.currentDNUSince0h,
            "DRT": this.currentDRT,
            "DRTSince0h": this.currentDRTSince0h,

            "MAU": this.currentMAU,
            "MAUSince0h1": this.currentMAUSince0h1,
            "MNU": this.currentMNU,
            "MNUSince0h1": this.currentMNUSince0h1,
            "MRT": this.currentMRT,
            "MRTSince0h1": this.currentMRTSince0h1,

            "TsCreate": currentDate.getTime()
        });
    }
}
