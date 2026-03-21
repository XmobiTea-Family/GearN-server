import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { Constructor } from "./../../../../service/IRequestConverterService";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";

export interface IRequestHandler {
	/**
	 * Returns the code.
	 * @returns Returns the code.
	 */
	getCode(): string;

	/**
	 * Returns the common operation request.
	 * @returns Returns the common operation request.
	 */
	getCommonOperationRequest(): Constructor<OperationRequest>;

	/**
	 * Executes the admin handle workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse>;

	/**
	 * Executes the server handle workflow.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse>;

	/**
	 * Executes the handle workflow.
	 * @param authInfo Provides the auth info value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse>;

}
