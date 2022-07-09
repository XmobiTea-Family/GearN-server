export class ReturnCode {
	public static readonly MaxSizeRequestReject: number = -10;
	public static readonly MaxRequestReject: number = -9;
	public static readonly MaxCCUReject: number = -8;

	public static readonly OperationNotAuthorized: number = -7;
	public static readonly InvalidRequestParameters: number = -6;
	public static readonly OperationInvalid: number = -3;
	public static readonly InternalServerError: number = -2;
	public static readonly OperationTimeout: number = -1;

	public static readonly UnknownError: number = 0;

	public static readonly Ok: number = 1;
}
