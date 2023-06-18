export class GamePlayerErrorCode {
	public static readonly Ok: number = 1;
	public static readonly PlayerNotLinked: number = 2;
	public static readonly ExternalLinkedOtherPlayer: number = 3;
	public static readonly ExternalLinked: number = 3;
	public static readonly PlayerNotFound: number = 4;
	public static readonly VerifyTokenError: number = 5;
	public static readonly AccountPasswordWrong: number = 6;
	public static readonly PlayerDoesNotEnoughCurrency: number = 4;
}
