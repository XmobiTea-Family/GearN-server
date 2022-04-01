import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { AuthInfo } from "../../../../../GN-common/entity/AuthInfo";

export interface PostHandle {
	(
		authInfo: AuthInfo,
		operationRequest: OperationRequest,
		operationResponse: OperationResponse,
		otherParams: any[]
	): Promise<void>;
}

export interface IRequestHandler {
	getCode(): number;

	handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse>;

	setPostHandle(postHandle: PostHandle): void;
}
