/**
 * Enumerates which Google token type is being supplied to Google login/link flows.
 */
export enum GoogleLoginType {
	/**
	 * The provided Google credential is an OAuth access token.
	 */
	AccessToken = 1,

	/**
	 * The provided Google credential is an OpenID Connect ID token.
	 */
	IdToken = 2,

}
