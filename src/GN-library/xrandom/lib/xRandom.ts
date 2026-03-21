export class xRandom {

	/**
	 * Executes the random float workflow.
	 * @param min Provides the min value used by this operation.
	 * @param max Provides the max value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static randomFloat(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}

	/**
	 * Executes the random int workflow.
	 * @param min Provides the min value used by this operation.
	 * @param max Provides the max value used by this operation.
	 * @returns Returns the operation result.
	 */
	public static randomInt(min: number, max: number): number {
		return Math.floor(this.randomFloat(min, max));
	}

}
