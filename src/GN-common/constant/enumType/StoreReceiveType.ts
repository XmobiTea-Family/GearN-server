/**
 * Enumerates how a store item was received.
 */
export enum StoreReceiveType {
	/**
	 * The item was obtained from a normal in-game buy flow.
	 */
	Buy = 1,

	/**
	 * The item was received as a present/gift flow.
	 */
	Present = 2,

	/**
	 * The item was granted through Apple App Store receipt validation.
	 */
	AppleAppStore = 3,

	/**
	 * The item was granted through Facebook Store receipt validation.
	 */
	FacebookStore = 4,

	/**
	 * The item was granted through Google Play receipt validation.
	 */
	GooglePlayStore = 5,

}
