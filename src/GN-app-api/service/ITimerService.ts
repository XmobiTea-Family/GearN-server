export interface ITimerService {
	/**
	 * Executes the subscriber every second workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	subscriberEverySecond(runnable: () => void): void;

	/**
	 * Executes the un subscriber every second workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	unSubscriberEverySecond(runnable: () => void): void;

	/**
	 * Executes the subscriber every minute workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	subscriberEveryMinute(runnable: () => void): void;

	/**
	 * Executes the un subscriber every minute workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	unSubscriberEveryMinute(runnable: () => void): void;

	/**
	 * Executes the subscriber every hour workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	subscriberEveryHour(runnable: () => void): void;

	/**
	 * Executes the un subscriber every hour workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	unSubscriberEveryHour(runnable: () => void): void;

	/**
	 * Executes the subscriber every day workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	subscriberEveryDay(runnable: () => void): void;

	/**
	 * Executes the un subscriber every day workflow.
	 * @param runnable Provides the runnable value used by this operation.
	 */
	unSubscriberEveryDay(runnable: () => void): void;

}
