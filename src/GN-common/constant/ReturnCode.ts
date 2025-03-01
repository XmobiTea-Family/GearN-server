export class ReturnCode {
	public static readonly SecretInvalid: number = -10;
	public static readonly MaxSizeRequestReject: number = -9;
	public static readonly MaxRequestReject: number = -8;
	public static readonly MaxCCUReject: number = -7;

	public static readonly OperationNotAuthorized: number = -6;
	public static readonly InvalidRequestParameters: number = -5;
	public static readonly OperationInvalid: number = -4;
	public static readonly InternalServerError: number = -3;
	public static readonly OperationNotAllow: number = -2;
	public static readonly OperationTimeout: number = -1;

	public static readonly UnknownError: number = 0;

	public static readonly Ok: number = 1;
}
