import { ITimerService } from "./ITimerService";

export class TimerService implements ITimerService {
	private everySecondRunnableLst: [void];
	private everyMinuteRunnableLst: [void];
	private everyHourRunnableLst: [void];
	private everyDayRunnableLst: [void];

	private handle(): void {
		let now = new Date();

		this.onEverySecond();
		if (now.getSeconds() == 0) this.onEveryMinute();
		if (now.getMinutes() == 0) this.onEveryHour();
		if (now.getHours() == 0) this.onEveryDay();
	}

	private onEverySecond(): void {
		for (let i = 0; i < this.everySecondRunnableLst.length; i++) {
			try {
				this.everySecondRunnableLst[i];
			} catch (err) {
				console.error("onEverySecond", err);
			}
		}
	}

	private onEveryMinute(): void {
		for (let i = 0; i < this.everyMinuteRunnableLst.length; i++) {
			try {
				this.everyMinuteRunnableLst[i];
			} catch (err) {
				console.error("onEveryMinute", err);
			}
		}
	}

	private onEveryHour(): void {
		for (let i = 0; i < this.everyHourRunnableLst.length; i++) {
			try {
				this.everyHourRunnableLst[i];
			} catch (err) {
				console.error("onEveryHour", err);
			}
		}
	}

	private onEveryDay(): void {
		for (let i = 0; i < this.everyDayRunnableLst.length; i++) {
			try {
				this.everyDayRunnableLst[i];
			} catch (err) {
				console.error("onEveryDay", err);
			}
		}
	}

	private constructor() {
		this.everySecondRunnableLst = void [];
		this.everyMinuteRunnableLst = void [];
		this.everyHourRunnableLst = void [];
		this.everyDayRunnableLst = void [];

		setInterval(this.handle, 1000);
	}

	public subscriberEverySecond(runnable: void): void {
		this.everySecondRunnableLst.push(runnable);
	}

	public unSbscriberEverySecond(runnable: void): void {
		let indexOf = this.everySecondRunnableLst.indexOf(runnable);
		if (indexOf != -1) this.everySecondRunnableLst.splice(indexOf, 1);
	}

	public subscriberEveryMinute(runnable: void): void {
		this.everyMinuteRunnableLst.push(runnable);
	}

	public unSubscriberEveryMinute(runnable: void): void {
		let indexOf = this.everyMinuteRunnableLst.indexOf(runnable);
		if (indexOf != -1) this.everyMinuteRunnableLst.splice(indexOf, 1);
	}

	public subscriberEveryHour(runnable: void): void {
		this.everyHourRunnableLst.push(runnable);
	}

	public unSubscriberEveryHour(runnable: void): void {
		let indexOf = this.everyHourRunnableLst.indexOf(runnable);
		if (indexOf != -1) this.everyHourRunnableLst.splice(indexOf, 1);
	}

	public subscriberEveryDay(runnable: void): void {
		this.everyDayRunnableLst.push(runnable);
	}

	public unSubscriberEveryDay(runnable: void): void {
		let indexOf = this.everyDayRunnableLst.indexOf(runnable);
		if (indexOf != -1) this.everyDayRunnableLst.splice(indexOf, 1);
	}
}
