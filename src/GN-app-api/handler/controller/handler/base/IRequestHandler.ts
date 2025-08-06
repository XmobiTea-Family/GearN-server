import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { Constructor } from "./../../../../service/IRequestConverterService";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";

export interface IRequestHandler {
	getCode(): string;

	getCommonOperationRequest(): Constructor<OperationRequest>;

	adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse>;

	serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse>;

	handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse>;

}
