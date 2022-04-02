import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { RegisterSocketParameterCode } from "./../../../../GN-common/constant/parameterCode/RegisterSocketParameterCode";
import { RegisterSocketErrorCode } from "./../../../../GN-common/constant/errorCode/RegisterSocketErrorCode";

class RegisterSocketOperationRequest extends OperationRequest {
	sid: string;

	constructor(operationRequest: OperationRequest) {
		super(operationRequest);

		this.sid = this.parameters.getString(RegisterSocketParameterCode.SId);
	}

	public isValidRequest() {
		return true;
	}
}

export class RegisterSocketRequestHandler extends RequestHandler {
	public getCode() {
		return OperationCode.RegisterSocket;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = new RegisterSocketOperationRequest(operationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let sid = request.sid;
		this.setAuthInfoSocket(sid, authInfo);

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);
		operationResponse.setParameter(ParameterCode.ErrorCode, RegisterSocketErrorCode.Ok);

		if (this.postHandle != null) {
			await this.postHandle(authInfo, request, operationResponse);
		}

		return operationResponse;
	}

	private setAuthInfoSocket(sid: string, authInfo: AuthInfo): void {
		let socket = this.gameApplication.getSocketApp().getIO().of('/').sockets.get(sid);
		if (socket) {
            authInfo.setOtherData("SocketId", sid);

            let socketAny = socket as any;
		    socketAny.authInfo = authInfo;
		    socketAny.isAuthenticated = true;

            let userId = authInfo.getUserId();
		    socketAny.userId = userId;
		    socket.join(userId);
		}
	}
}
