import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { RegisterSocketParameterCode } from "./../../../../GN-common/constant/parameterCode/RegisterSocketParameterCode";
import { RegisterSocketErrorCode } from "./../../../../GN-common/constant/errorCode/RegisterSocketErrorCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";

class RegisterSocketOperationRequest extends OperationRequest {
	@StringDataMember({ code: RegisterSocketParameterCode.SId, mustNonNull: true, minLength: 16, maxLength: 24 })
	sid: string;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}

}

export class RegisterSocketRequestHandler extends RequestHandler {
	public getCode() {
		return OperationCode.RegisterSocket;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, RegisterSocketOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let sid = request.sid;
		this.setAuthInfoSocket(sid, authInfo);

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);
		operationResponse.setScriptData(ParameterCode.ErrorCode, RegisterSocketErrorCode.Ok);

		if (this.postHandle != null) {
			await this.postHandle(authInfo, request, operationResponse);
		}

		return operationResponse;
	}

	private setAuthInfoSocket(sid: string, authInfo: AuthInfo): void {
		let socket = this.gameApplication.getSocketApp().getIO().of("/").sockets.get(sid);
		if (socket) {
			socket.data.authInfo = authInfo;
			socket.data.isAuthenticated = true;

			let userId = authInfo.getUserId();
			socket.data.userId = userId;

			socket.join(userId);

			authInfo.setSocketId(sid);
		}
	}

}
