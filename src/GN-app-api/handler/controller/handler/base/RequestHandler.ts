import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { IRequestHandler } from "./IRequestHandler";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { GameApplication } from "./../../../../../GameApplication";

export abstract class RequestHandler implements IRequestHandler {
	protected gameApplication: GameApplication;

	public abstract getCode(): number;

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		return null;
	}

	protected newInvalidRequestParameters(operationRequest: OperationRequest, debugMessage?: string): OperationResponse {
		return OperationResponse.newOperationInvalidRequestParameters(operationRequest.getOperationCode(), operationRequest.getRequestId(), debugMessage);
	}

	protected newOperationInvalid(operationRequest: OperationRequest, debugMessage?: string): OperationResponse {
		return OperationResponse.newOperationInvalid(operationRequest.getOperationCode(), operationRequest.getRequestId(), debugMessage);
	}

	protected newOperationInternalServerError(operationRequest: OperationRequest, debugMessage?: string): OperationResponse {
		return OperationResponse.newOperationInternalServerError(operationRequest.getOperationCode(), operationRequest.getRequestId(), debugMessage);
	}

	constructor(gameApplication: GameApplication) {
		this.gameApplication = gameApplication;
	}
}
