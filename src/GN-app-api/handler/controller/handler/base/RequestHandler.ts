import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { IRequestHandler, PostHandle } from "./IRequestHandler";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { GNServer } from "./../../../../../GNServer";
import { IRequestConverterService } from "./../../../../service/IRequestConverterService";
import { OperationHelper } from "./../../../../../GN-common/entity/operationHelper/OperationHelper";

export abstract class RequestHandler implements IRequestHandler {
	protected gnServer: GNServer;
	protected postHandle: PostHandle;
	protected requestConverterService: IRequestConverterService;

	public abstract getCode(): number;

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		return null;
	}

	protected init(): void {

	}

	public setPostHandle(postHandle: PostHandle) {
		this.postHandle = postHandle;
	}

	protected newInvalidRequestParameters(operationRequest: OperationRequest, debugMessage?: string): OperationResponse {
		return OperationHelper.newOperationResponseInvalidRequestParameters(operationRequest.getOperationCode(), operationRequest.getRequestId(), (operationRequest as any).invalidMembers, operationRequest.isEncrypted(), debugMessage);
	}

	protected newOperationInvalid(operationRequest: OperationRequest, debugMessage?: string): OperationResponse {
		return OperationHelper.newOperationResponseInvalid(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted(), debugMessage);
	}

	protected newOperationInternalServerError(operationRequest: OperationRequest, debugMessage?: string): OperationResponse {
		return OperationHelper.newOperationResponseInternalServerError(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted(), debugMessage);
	}

	constructor(gnServer: GNServer) {
		this.gnServer = gnServer;
		this.requestConverterService = gnServer.getRequestConverterService();

		this.init();
	}

}
