export class xDatetime {
	public static readonly ONE_SECOND_MILLISECOND: number = 1 * 1000;
	public static readonly ONE_MINUTE_MILLISECOND: number = this.ONE_SECOND_MILLISECOND * 60;
	public static readonly ONE_HOUR_MILLISECOND: number = this.ONE_MINUTE_MILLISECOND * 60;
	public static readonly ONE_DAY_MILLISECOND: number = this.ONE_HOUR_MILLISECOND * 24;
	public static readonly ONE_WEEK_MILLISECOND: number = this.ONE_DAY_MILLISECOND * 7;
	public static readonly ONE_MONTH_MILLISECOND: number = this.ONE_DAY_MILLISECOND * 30;
	public static readonly ONE_YEAR_MILLISECOND: number = this.ONE_DAY_MILLISECOND * 365;

	public static getCurrentMilliseconds(): number {
		return this.getMilliseconds(new Date());
	}

	public static getMilliseconds(date: Date): number {
		return Math.round(date.getTime());
	}

	public static getDateAtMilliseconds(milliseconds: number): Date {
		return new Date(milliseconds);
	}

	public static getToday0hMilliseconds(): number {
		let now = new Date();
		let today0h = new Date(now.getFullYear(), now.getMonth(), now.getDate());

		return this.getMilliseconds(today0h);
	}

}
