export class xDatetime {
    // Stores the ONE SECOND MILLISECOND value used by this instance.
    public static readonly ONE_SECOND_MILLISECOND: number = 1 * 1000;
    // Stores the ONE MINUTE MILLISECOND value used by this instance.
    public static readonly ONE_MINUTE_MILLISECOND: number = this.ONE_SECOND_MILLISECOND * 60;
    // Stores the ONE HOUR MILLISECOND value used by this instance.
    public static readonly ONE_HOUR_MILLISECOND: number = this.ONE_MINUTE_MILLISECOND * 60;
    // Stores the ONE DAY MILLISECOND value used by this instance.
    public static readonly ONE_DAY_MILLISECOND: number = this.ONE_HOUR_MILLISECOND * 24;
    // Stores the ONE WEEK MILLISECOND value used by this instance.
    public static readonly ONE_WEEK_MILLISECOND: number = this.ONE_DAY_MILLISECOND * 7;
    // Stores the ONE MONTH MILLISECOND value used by this instance.
    public static readonly ONE_MONTH_MILLISECOND: number = this.ONE_DAY_MILLISECOND * 30;
    // Stores the ONE YEAR MILLISECOND value used by this instance.
    public static readonly ONE_YEAR_MILLISECOND: number = this.ONE_DAY_MILLISECOND * 365;

    /**
     * Returns the current milliseconds.
     * @returns Returns the current milliseconds.
     */
    public static getCurrentMilliseconds(): number {
        return Date.now();
    }

    /**
     * Returns the current date.
     * @returns Returns the current date.
     */
    public static getCurrentDate(): Date {
        return new Date();
    }

    /**
     * Returns the milliseconds.
     * @param date Provides the date value used by this operation.
     * @returns Returns the milliseconds.
     */
    public static getMilliseconds(date: Date): number {
        return Math.round(date.getTime());
    }

    /**
     * Returns the date at milliseconds.
     * @param milliseconds Provides the milliseconds value used by this operation.
     * @returns Returns the date at milliseconds.
     */
    public static getDateAtMilliseconds(milliseconds: number): Date {
        return new Date(milliseconds);
    }

    /**
     * Returns the today 0 h milliseconds.
     * @returns Returns the today 0 h milliseconds.
     */
    public static getToday0hMilliseconds(): number {
        // Stores the now value used in the current execution flow.
        let now = new Date();
        // Stores the today 0 h value used in the current execution flow.
        let today0h = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return this.getMilliseconds(today0h);
    }
}
