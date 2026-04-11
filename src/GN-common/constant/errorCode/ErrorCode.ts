/**
 * Enumerates domain-level error codes returned inside successful GearN responses.
 *
 * These codes are business errors carried inside the response payload after
 * `returnCode === ReturnCode.Ok`. They do not replace low-level return codes.
 */
export class ErrorCode {
	/**
	 * The business operation completed successfully.
	 */
	public static readonly Ok: number = 1;

	/**
	 * The requested username/account does not exist.
	 */
	public static readonly AccountNotFound: number = 2;

	/**
	 * The provided account password is incorrect.
	 */
	public static readonly AccountPasswordWrong: number = 3;

	/**
	 * The requested username already exists and cannot be created again.
	 */
	public static readonly AccountUsernameExists: number = 4;

	/**
	 * The provided token could not be verified or decoded.
	 */
	public static readonly VerifyTokenError: number = 5;

	/**
	 * An external/provider verification step failed.
	 */
	public static readonly VerifyFailed: number = 6;

	/**
	 * The target character player does not exist.
	 */
	public static readonly CharacterPlayerNotFound: number = 7;

	/**
	 * The target wallet or owner does not have enough currency to complete the operation.
	 */
	public static readonly NotEnoughCurrency: number = 8;

	/**
	 * The requested key does not exist in the target data set.
	 */
	public static readonly KeyNotFound: number = 9;

	/**
	 * The target inventory item does not exist.
	 */
	public static readonly ItemNotFound: number = 10;

	/**
	 * The referenced catalog id does not exist.
	 */
	public static readonly CatalogIdNotFound: number = 11;

	/**
	 * The target group does not exist.
	 */
	public static readonly GroupNotFound: number = 12;

	/**
	 * The resolved owner entity does not exist.
	 */
	public static readonly OwnerNotFound: number = 13;

	/**
	 * The referenced class id does not exist.
	 */
	public static readonly ClassIdNotFound: number = 14;

	/**
	 * The target group member or relationship member does not exist.
	 */
	public static readonly MemberNotFound: number = 15;

	/**
	 * The player is not currently a member of the target group.
	 */
	public static readonly PlayerNotMember: number = 16;

	/**
	 * The target game player does not exist.
	 */
	public static readonly GamePlayerNotFound: number = 17;

	/**
	 * The requested file metadata or physical file does not exist.
	 */
	public static readonly FileNotFound: number = 18;

	/**
	 * The file metadata exists but the file content has not been uploaded yet.
	 */
	public static readonly FileNotUpload: number = 19;

	/**
	 * The requested owner type is not supported by the target operation.
	 */
	public static readonly OwnerTypeNotSupport: number = 20;

	/**
	 * The item cannot be stacked, so amount-based operations are invalid.
	 */
	public static readonly ItemNotStackable: number = 21;

	/**
	 * The target game does not exist.
	 */
	public static readonly GameNotFound: number = 22;

	/**
	 * The game already exists and cannot be created again with the same identity.
	 */
	public static readonly GameIsExists: number = 23;

	/**
	 * The requested secret-info record does not exist.
	 */
	public static readonly SecretInfoNotFound: number = 24;

	/**
	 * The secret-info record already exists.
	 */
	public static readonly SecretInfoIsExists: number = 25;

	/**
	 * The requested external identity is not linked to the current account.
	 */
	public static readonly ExternalNotLinked: number = 26;

	/**
	 * The external identity is already linked to a different account.
	 */
	public static readonly ExternalLinkedOtherAccount: number = 27;

	/**
	 * The external provider/value pair conflicts with an existing linked value.
	 */
	public static readonly ExternalLinkedOtherValue: number = 28;

	/**
	 * The target master player does not exist.
	 */
	public static readonly MasterPlayerNotFound: number = 29;

	/**
	 * The target store item does not exist.
	 */
	public static readonly StoreItemNotFound: number = 30;

	/**
	 * The buyer entity does not exist.
	 */
	public static readonly BuyerNotFound: number = 31;

	/**
	 * The requested store item cannot be purchased in the current state or by the current buyer.
	 */
	public static readonly CanNotBuyThisStoreItem: number = 32;

	/**
	 * An exception occurred while validating a platform receipt.
	 */
	public static readonly ExceptionWhenValidateReceipt: number = 33;

	/**
	 * The target store/provider configuration is invalid.
	 */
	public static readonly StoreInvalid: number = 34;

	/**
	 * The provided purchase receipt is invalid.
	 */
	public static readonly ReceiptInvalid: number = 35;

	/**
	 * The target store item was removed and can no longer be used for purchase flows.
	 */
	public static readonly StoreItemHadBeenRemove: number = 36;

	/**
	 * The requested display name is already in use.
	 */
	public static readonly DisplayNameHasUse: number = 37;

	/**
	 * The target player is currently banned.
	 */
	public static readonly PlayerBan: number = 38;

	/**
	 * The target matchmaking ticket does not exist.
	 */
	public static readonly MatchmakingTicketNotFound: number = 39;

	/**
	 * The matchmaking ticket already completed and cannot be joined or modified further.
	 */
	public static readonly MatchmakingTicketAlreadyCompleted: number = 40;

	/**
	 * The player is not a member of the referenced matchmaking ticket.
	 */
	public static readonly MatchmakingPlayerHasNotJoinedTicket: number = 41;

	/**
	 * The requested match does not exist.
	 */
	public static readonly MatchNotFound: number = 42;

	/**
	 * The player already joined a different matchmaking ticket that conflicts with this request.
	 */
	public static readonly MatchmakingPlayerHasJoinedOtherTicket: number = 43;

	/**
	 * The referenced matchmaking queue does not exist.
	 */
	public static readonly MatchmakingQueueNotFound: number = 44;

	/**
	 * The requested ticket size violates queue configuration.
	 */
	public static readonly TicketSizeError: number = 45;

	/**
	 * CloudScript execution failed inside the target function.
	 */
	public static readonly ExecuteError: number = 46;

	/**
	 * The requested CloudScript version is invalid or unavailable.
	 */
	public static readonly VersionInvalid: number = 47;

	/**
	 * The provided email address is syntactically or semantically invalid.
	 */
	public static readonly EmailInvalid: number = 48;

	/**
	 * The buyer already owns this non-consumable store item.
	 */
	public static readonly StoreItemHadPurchaseAndNonConsumable: number = 49;

	/**
	 * The store item already exists and cannot be created again with the same identity.
	 */
	public static readonly StoreItemHadExists: number = 50;

}
