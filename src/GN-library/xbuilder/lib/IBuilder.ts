export interface IBuilder<T> {
	/**
	 * Builds the configured instance.
	 * @returns Returns the built t.
	 */
	build(): T;

}
