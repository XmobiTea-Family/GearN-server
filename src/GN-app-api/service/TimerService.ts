import { Debug } from "../../GN-library/xdebug/lib/xDebug";
import { ITimerService } from "./ITimerService";

export class TimerService implements ITimerService {
	private everySecondRunnableLst: (() => void)[];
	private everyMinuteRunnableLst: (() => void)[];
	private everyHourRunnableLst: (() => void)[];
	private everyDayRunnableLst: (() => void)[];

	public run(): void {
		setInterval(() => {
			this.onEverySecond();

			let now = new Date();

			if (now.getSeconds() == 0) {
				this.onEveryMinute();

				if (now.getMinutes() == 0) {
					this.onEveryHour();

					if (now.getHours() == 0) {
						this.onEveryDay();
					}
				}
			}
		}, 1000);
	}

	private onEverySecond(): void {
		for (let i = 0; i < this.everySecondRunnableLst.length; i++) {
			try {
				this.everySecondRunnableLst[i]();
			} catch (err) {
				Debug.logError("onEverySecond", err);
			}
		}
	}

	private onEveryMinute(): void {
		for (let i = 0; i < this.everyMinuteRunnableLst.length; i++) {
			try {
				this.everyMinuteRunnableLst[i]();
			} catch (err) {
				Debug.logError("onEveryMinute", err);
			}
		}
	}

	private onEveryHour(): void {
		for (let i = 0; i < this.everyHourRunnableLst.length; i++) {
			try {
				this.everyHourRunnableLst[i]();
			} catch (err) {
				Debug.logError("onEveryHour", err);
			}
		}
	}

	private onEveryDay(): void {
		for (let i = 0; i < this.everyDayRunnableLst.length; i++) {
			try {
				this.everyDayRunnableLst[i]();
			} catch (err) {
				Debug.logError("onEveryDay", err);
			}
		}
	}

	public constructor() {
		this.everySecondRunnableLst = [];
		this.everyMinuteRunnableLst = [];
		this.everyHourRunnableLst = [];
		this.everyDayRunnableLst = [];
	}

	public subscriberEverySecond(runnable: () => void): void {
		this.everySecondRunnableLst.push(runnable);
	}

	public unSubscriberEverySecond(runnable: () => void): void {
		let indexOf = this.everySecondRunnableLst.indexOf(runnable);
		if (indexOf != -1) this.everySecondRunnableLst.splice(indexOf, 1);
	}

	public subscriberEveryMinute(runnable: () => void): void {
		this.everyMinuteRunnableLst.push(runnable);
	}

	public unSubscriberEveryMinute(runnable: () => void): void {
		let indexOf = this.everyMinuteRunnableLst.indexOf(runnable);
		if (indexOf != -1) this.everyMinuteRunnableLst.splice(indexOf, 1);
	}

	public subscriberEveryHour(runnable: () => void): void {
		this.everyHourRunnableLst.push(runnable);
	}

	public unSubscriberEveryHour(runnable: () => void): void {
		let indexOf = this.everyHourRunnableLst.indexOf(runnable);
		if (indexOf != -1) this.everyHourRunnableLst.splice(indexOf, 1);
	}

	public subscriberEveryDay(runnable: () => void): void {
		this.everyDayRunnableLst.push(runnable);
	}

	public unSubscriberEveryDay(runnable: () => void): void {
		let indexOf = this.everyDayRunnableLst.indexOf(runnable);
		if (indexOf != -1) this.everyDayRunnableLst.splice(indexOf, 1);
	}
}
