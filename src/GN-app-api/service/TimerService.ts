import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { ITimerService } from "./ITimerService";

export class TimerService implements ITimerService {
	// Stores the every second runnable lst list used by this instance.
	private everySecondRunnableLst: (() => void)[];
	// Stores the every minute runnable lst list used by this instance.
	private everyMinuteRunnableLst: (() => void)[];
	// Stores the every hour runnable lst list used by this instance.
	private everyHourRunnableLst: (() => void)[];
	// Stores the every day runnable lst list used by this instance.
	private everyDayRunnableLst: (() => void)[];

	/**
	 * Runs the current workflow.
	 */
	public run(): void {
		setInterval(() => {
			this.onEverySecond();

			// Stores the now value used in the current execution flow.
			let now = xDatetime.getCurrentDate();

			if (now.getUTCSeconds() == 0) {
				this.onEveryMinute();

				if (now.getUTCMinutes() == 0) {
					this.onEveryHour();

					if (now.getUTCHours() == 0) {
						this.onEveryDay();
					}
				}
			}
		}, 1000);
	}

	/**
	 * Executes the on every second workflow.
	 */
	private onEverySecond(): void {
		for (let i = 0; i < this.everySecondRunnableLst.length; i++) {
			try {
				this.everySecondRunnableLst[i]();
			} catch (err) {
				Debug.logError("onEverySecond", err);
			}
		}
	}

	/**
	 * Executes the on every minute workflow.
	 */
	private onEveryMinute(): void {
		for (let i = 0; i < this.everyMinuteRunnableLst.length; i++) {
			try {
				this.everyMinuteRunnableLst[i]();
			} catch (err) {
				Debug.logError("onEveryMinute", err);
			}
		}
	}

	/**
	 * Executes the on every hour workflow.
	 */
	private onEveryHour(): void {
		for (let i = 0; i < this.everyHourRunnableLst.length; i++) {
			try {
				this.everyHourRunnableLst[i]();
			} catch (err) {
				Debug.logError("onEveryHour", err);
			}
		}
	}

	/**
	 * Executes the on every day workflow.
	 */
	private onEveryDay(): void {
		for (let i = 0; i < this.everyDayRunnableLst.length; i++) {
			try {
				this.everyDayRunnableLst[i]();
			} catch (err) {
				Debug.logError("onEveryDay", err);
			}
		}
	}

	/**
	 * Initializes a new timer service instance.
	 */
	public constructor() {
		this.everySecondRunnableLst = [];
		this.everyMinuteRunnableLst = [];
		this.everyHourRunnableLst = [];
		this.everyDayRunnableLst = [];
	}

	/**
	 * Executes the subscriber every second workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	public subscriberEverySecond(runnable: () => void): void {
		this.everySecondRunnableLst.push(runnable);
	}

	/**
	 * Executes the un subscriber every second workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	public unSubscriberEverySecond(runnable: () => void): void {
		// Stores the index of value used in the current execution flow.
		let indexOf = this.everySecondRunnableLst.indexOf(runnable);
		if (indexOf != -1) this.everySecondRunnableLst.splice(indexOf, 1);
	}

	/**
	 * Executes the subscriber every minute workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	public subscriberEveryMinute(runnable: () => void): void {
		this.everyMinuteRunnableLst.push(runnable);
	}

	/**
	 * Executes the un subscriber every minute workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	public unSubscriberEveryMinute(runnable: () => void): void {
		// Stores the index of value used in the current execution flow.
		let indexOf = this.everyMinuteRunnableLst.indexOf(runnable);
		if (indexOf != -1) this.everyMinuteRunnableLst.splice(indexOf, 1);
	}

	/**
	 * Executes the subscriber every hour workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	public subscriberEveryHour(runnable: () => void): void {
		this.everyHourRunnableLst.push(runnable);
	}

	/**
	 * Executes the un subscriber every hour workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	public unSubscriberEveryHour(runnable: () => void): void {
		// Stores the index of value used in the current execution flow.
		let indexOf = this.everyHourRunnableLst.indexOf(runnable);
		if (indexOf != -1) this.everyHourRunnableLst.splice(indexOf, 1);
	}

	/**
	 * Executes the subscriber every day workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	public subscriberEveryDay(runnable: () => void): void {
		this.everyDayRunnableLst.push(runnable);
	}

	/**
	 * Executes the un subscriber every day workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	public unSubscriberEveryDay(runnable: () => void): void {
		// Stores the index of value used in the current execution flow.
		let indexOf = this.everyDayRunnableLst.indexOf(runnable);
		if (indexOf != -1) this.everyDayRunnableLst.splice(indexOf, 1);
	}

}
