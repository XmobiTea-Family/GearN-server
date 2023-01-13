export class xRandom {

	public static randomFloat(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}

	public static randomInt(min: number, max: number): number {
		return Math.floor(this.randomFloat(min, max));
	}

}
