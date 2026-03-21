import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { IRequestHandler } from "./IRequestHandler";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { GNServer } from "./../../../../../GNServer";
import { Constructor, IRequestConverterService } from "./../../../../service/IRequestConverterService";
import { OperationHelper } from "./../../../../../GN-common/entity/operationHelper/OperationHelper";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";

export abstract class RequestHandler implements IRequestHandler {
	// Stores the GearN server value used by this instance.
	protected gnServer: GNServer;
	// Stores the request converter service value used by this instance.
	protected requestConverterService: IRequestConverterService;

	/**
	 * Returns the code.
	 * @returns Returns the code.
	 */
	public abstract getCode(): string;

	/**
	 * Returns the common operation request.
	 * @returns Returns the common operation request.
	 */
	public abstract getCommonOperationRequest(): Constructor<OperationRequest>;

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		return this.newOperationInvalid(operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		return this.newOperationInvalid(operationRequest);
	}

	/**
	 * Executes the handle workflow asynchronously.
	 * @param authInfo Provides the auth info value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		return this.newOperationInvalid(operationRequest);
	}

	/**
	 * Executes the init workflow.
	 */
	protected init(): void {

	}

	/**
	 * Executes the new invalid request parameters workflow.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected newInvalidRequestParameters(operationRequest: OperationRequest): OperationResponse {
		return OperationHelper.newOperationResponseInvalidRequestParameters(operationRequest.getOperationCode(), operationRequest.getRequestId(), (operationRequest as any).invalidMembers);
	}

	/**
	 * Executes the new operation invalid workflow.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @param debugMessage Provides the debug message value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected newOperationInvalid(operationRequest: OperationRequest, debugMessage?: string): OperationResponse {
		return OperationHelper.newOperationResponseInvalid(operationRequest.getOperationCode(), operationRequest.getRequestId(), debugMessage);
	}

	/**
	 * Executes the new operation internal server error workflow.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @param debugMessage Provides the debug message value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected newOperationInternalServerError(operationRequest: OperationRequest, debugMessage?: string): OperationResponse {
		return OperationHelper.newOperationResponseInternalServerError(operationRequest.getOperationCode(), operationRequest.getRequestId(), debugMessage);
	}

	/**
	 * Executes the new operation not allow error workflow.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @param debugMessage Provides the debug message value used by this operation.
	 * @returns Returns the operation result.
	 */
	protected newOperationNotAllowError(operationRequest: OperationRequest, debugMessage?: string): OperationResponse {
		return OperationHelper.newOperationResponseNotAllowError(operationRequest.getOperationCode(), operationRequest.getRequestId(), debugMessage);
	}

	/**
	 * Initializes a new request handler instance.
	 * @param gnServer Provides the GearN server value used by this operation.
	 */
	constructor(gnServer: GNServer) {
		this.gnServer = gnServer;
		this.requestConverterService = gnServer.getRequestConverterService();

		this.init();
	}

}
