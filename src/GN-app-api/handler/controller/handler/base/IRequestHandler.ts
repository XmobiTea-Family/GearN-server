import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { AuthInfo } from "../../../../../GN-common/entity/AuthInfo";

export interface IRequestHandler {
	getCode(): number;

	handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse>;
}
