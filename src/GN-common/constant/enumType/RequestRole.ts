/**
 * Enumerates the trust boundary used when building a request route and selecting a secret key.
 */
export enum RequestRole {
	/**
	 * Administrative route intended for operations tooling and privileged dashboards.
	 */
	Admin = 1,

	/**
	 * Trusted backend/server route intended for game servers and internal services.
	 */
	Server = 2,

	/**
	 * Public client route intended for player applications.
	 */
	Client = 3,

}
