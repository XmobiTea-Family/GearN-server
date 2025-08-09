export class ErrorCode {
	public static readonly Ok: number = 1;

	public static readonly AccountNotFound: number = 2;
	public static readonly AccountPasswordWrong: number = 3;
	public static readonly AccountUsernameExists: number = 4;
	public static readonly VerifyTokenError: number = 5;
	public static readonly VerifyFailed: number = 6;
	public static readonly CharacterPlayerNotFound: number = 7;
	public static readonly NotEnoughCurrency: number = 8;
	public static readonly KeyNotFound: number = 9;
	public static readonly ItemNotFound: number = 10;
	public static readonly CatalogIdNotFound: number = 11;
	public static readonly GroupNotFound: number = 12;
	public static readonly OwnerNotFound: number = 13;
	public static readonly ClassIdNotFound: number = 14;
	public static readonly MemberNotFound: number = 15;
	public static readonly PlayerNotMember: number = 16;
	public static readonly GamePlayerNotFound: number = 17;
	public static readonly FileNotFound: number = 18;
	public static readonly FileNotUpload: number = 19;
	public static readonly OwnerTypeNotSupport: number = 20;
	public static readonly ItemNotStackable: number = 21;
	public static readonly GameNotFound: number = 22;
	public static readonly GameIsExists: number = 23;
	public static readonly SecretInfoNotFound: number = 24;
	public static readonly SecretInfoIsExists: number = 25;
	public static readonly ExternalNotLinked: number = 26;
	public static readonly ExternalLinkedOtherAccount: number = 27;
	public static readonly ExternalLinkedOtherValue: number = 28;
	public static readonly MasterPlayerNotFound: number = 29;
	public static readonly StoreItemNotFound: number = 30;
	public static readonly BuyerNotFound: number = 31;
	public static readonly CanNotBuyThisStoreItem: number = 32;
	public static readonly ExceptionWhenValidateReceipt: number = 33;
	public static readonly StoreInvalid: number = 34;
	public static readonly ReceiptInvalid: number = 35;
	public static readonly StoreItemHadBeenRemove: number = 36;
	public static readonly DisplayNameHasUse: number = 37;
	public static readonly PlayerBan: number = 38;

	public static readonly MatchmakingTicketNotFound: number = 39;
	public static readonly MatchmakingTicketAlreadyCompleted: number = 40;
	public static readonly MatchmakingPlayerHasNotJoinedTicket: number = 41;
	public static readonly MatchNotFound: number = 42;
	public static readonly MatchmakingPlayerHasJoinedOtherTicket: number = 43;
	public static readonly MatchmakingQueueNotFound: number = 44;
	public static readonly TicketSizeError: number = 45;

	public static readonly ExecuteError: number = 46;
	public static readonly VersionInvalid: number = 47;
	public static readonly EmailInvalid: number = 48;

	public static readonly StoreItemHadPurchaseAndNonConsumable: number = 49;
	public static readonly StoreItemHadExists: number = 50;

}
