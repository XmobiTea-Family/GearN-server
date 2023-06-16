import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { IRequestHandler } from "./IRequestHandler";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { GNServer } from "./../../../../../GNServer";
import { Constructor, IRequestConverterService } from "./../../../../service/IRequestConverterService";
import { OperationHelper } from "./../../../../../GN-common/entity/operationHelper/OperationHelper";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";

export abstract class RequestHandler implements IRequestHandler {
	protected gnServer: GNServer;
	protected requestConverterService: IRequestConverterService;
	
	public abstract getCode(): number;
	
	public abstract getCommonOperationRequest(): Constructor<OperationRequest>;

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		return this.newOperationInvalid(operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		return this.newOperationInvalid(operationRequest);
	}
	
	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		return this.newOperationInvalid(operationRequest);
	}

	protected init(): void {

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

	protected newOperationNotAllowError(operationRequest: OperationRequest, debugMessage?: string): OperationResponse {
		return OperationHelper.newOperationNotAllowError(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted(), debugMessage);
	}

	constructor(gnServer: GNServer) {
		this.gnServer = gnServer;
		this.requestConverterService = gnServer.getRequestConverterService();

		this.init();
	}

}
