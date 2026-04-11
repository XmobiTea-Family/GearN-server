/**
 * Enumerates low-level return codes surfaced through `OperationResponse`.
 *
 * These codes describe transport, gateway, authorization, validation, throttling,
 * or operation-level execution status. They are not business-domain errors.
 *
 * Read order:
 * 1. Check `returnCode` first.
 * 2. Only when `returnCode === ReturnCode.Ok` should callers trust typed `parameters`
 *    and then continue checking the business `errorCode` inside the response payload.
 *
 * Value conventions:
 * - `1`: the request completed successfully at protocol level
 * - `0`: the request failed without a more specific mapped return code
 * - negative values: the request was rejected, timed out, or failed before a valid
 *   business response could be produced
 */
export class ReturnCode {
	/**
	 * The selected secret key is missing, wrong, or does not match the current route/game context.
	 */
	public static readonly SecretInvalid: number = -10;

	/**
	 * The serialized request payload exceeded the maximum size accepted by the backend.
	 */
	public static readonly MaxSizeRequestReject: number = -9;

	/**
	 * The backend rejected the request because the current caller exceeded a request-rate limit.
	 */
	public static readonly MaxRequestReject: number = -8;

	/**
	 * The backend rejected the request because the current concurrent-user/session limit was exceeded.
	 */
	public static readonly MaxCCUReject: number = -7;

	/**
	 * The target operation exists, but the caller is not authorized for the selected role or target resource.
	 */
	public static readonly OperationNotAuthorized: number = -6;

	/**
	 * The request shape or one or more request-member values are invalid.
	 * When available, inspect `invalidMembers` for field-level details.
	 */
	public static readonly InvalidRequestParameters: number = -5;

	/**
	 * The requested operation code is unknown or is not valid for the selected request type/role.
	 */
	public static readonly OperationInvalid: number = -4;

	/**
	 * The backend hit an unhandled internal failure before producing a valid business response.
	 */
	public static readonly InternalServerError: number = -3;

	/**
	 * The operation is known and the secret key is valid, but the permission rules attached
	 * to the current secret key do not allow this operation in the current target context.
	 * This usually maps to missing `selfEnable`, `otherSelfEnable`, `serverSelfEnable`,
	 * or `adminSelfEnable` permission for the resolved request.
	 */
	public static readonly OperationNotAllow: number = -2;

	/**
	 * The request timed out before a response was received.
	 * This code may be synthesized by the SDK timeout layer as well as returned by the backend.
	 */
	public static readonly OperationTimeout: number = -1;

	/**
	 * The request failed, but no more specific low-level return code was mapped.
	 */
	public static readonly UnknownError: number = 0;

	/**
	 * The request completed successfully at protocol level and produced a response payload.
	 * Callers must still validate the business `errorCode` in that payload.
	 */
	public static readonly Ok: number = 1;

}
