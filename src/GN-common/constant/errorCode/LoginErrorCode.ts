export class LoginErrorCode {
	public static readonly Ok: number = 1;
	public static readonly UserDoesNotExists: number = 2;
	public static readonly ErrorWhenLoginFacebook: number = 3;
	public static readonly UserDoesExists: number = 4;
	public static readonly UserHadBanned: number = 5;
	public static readonly ErrorWhenLoginApple: number = 6;
	public static readonly RandomMessageExpired: number = 7;
	public static readonly PublicAddressWrong: number = 8;
	public static readonly MaxCCU: number = 9;
}
