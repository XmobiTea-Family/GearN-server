export class ReturnCode {
	// Stores the secret invalid value used by this instance.
	public static readonly SecretInvalid: number = -10;
	// Stores the max size request reject value used by this instance.
	public static readonly MaxSizeRequestReject: number = -9;
	// Stores the max request reject value used by this instance.
	public static readonly MaxRequestReject: number = -8;
	// Stores the max CCU reject value used by this instance.
	public static readonly MaxCCUReject: number = -7;

	// Stores the operation not authorized value used by this instance.
	public static readonly OperationNotAuthorized: number = -6;
	// Stores the invalid request parameters value used by this instance.
	public static readonly InvalidRequestParameters: number = -5;
	// Stores the operation invalid value used by this instance.
	public static readonly OperationInvalid: number = -4;
	// Stores the internal server error value used by this instance.
	public static readonly InternalServerError: number = -3;
	// Stores the operation not allow value used by this instance.
	public static readonly OperationNotAllow: number = -2;
	// Stores the operation timeout value used by this instance.
	public static readonly OperationTimeout: number = -1;

	// Stores the unknown error value used by this instance.
	public static readonly UnknownError: number = 0;

	// Stores the ok value used by this instance.
	public static readonly Ok: number = 1;

}
