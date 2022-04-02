export interface ITimerService {
	subscriberEverySecond(runnable: () => void): void;

	unSubscriberEverySecond(runnable: () => void): void;

	subscriberEveryMinute(runnable: () => void): void;

	unSubscriberEveryMinute(runnable: () => void): void;

	subscriberEveryHour(runnable: () => void): void;

	unSubscriberEveryHour(runnable: () => void): void;

	subscriberEveryDay(runnable: () => void): void;

	unSubscriberEveryDay(runnable: () => void): void;
}
