/**
 * Enumerates top-level request domains used to build transport routes.
 */
export enum RequestType {
	/**
	 * Custom application-defined operation domain.
	 */
	Custom = 0,

	/**
	 * Authentication domain.
	 */
	Authenticate = 1,

	/**
	 * Character-player domain.
	 */
	CharacterPlayer = 2,

	/**
	 * Content/file domain.
	 */
	Content = 3,

	/**
	 * Game-player domain.
	 */
	GamePlayer = 4,

	/**
	 * Group domain.
	 */
	Group = 5,

	/**
	 * Inventory/item domain.
	 */
	Inventory = 6,

	/**
	 * Master-player domain.
	 */
	MasterPlayer = 7,

	/**
	 * Store-inventory domain.
	 */
	StoreInventory = 8,

	/**
	 * Dashboard/administration domain.
	 */
	Dashboard = 9,

	/**
	 * Multiplayer/matchmaking domain.
	 */
	Multiplayer = 10,

	/**
	 * CloudScript domain.
	 */
	CloudScript = 11,

}
