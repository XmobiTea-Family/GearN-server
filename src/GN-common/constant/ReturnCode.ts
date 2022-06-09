export class ReturnCode {
	public static readonly MaxSizeRequestReject = -10;
	public static readonly MaxRequestReject = -9;
	public static readonly MaxCCUReject = -8;

	public static readonly OperationNotAuthorized = -7;
	public static readonly InvalidRequestParameters = -6;
	public static readonly OperationInvalid = -3;
	public static readonly InternalServerError = -2;
	public static readonly OperationTimeout = -1;

	public static readonly UnknownError = 0;

	public static readonly Ok = 1;
}
