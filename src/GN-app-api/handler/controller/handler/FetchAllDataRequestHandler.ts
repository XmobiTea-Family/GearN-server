import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { FetchAllDataParameterCode } from "../../../../GN-common/constant/parameterCode/FetchAllDataParameterCode";
import { FetchAllDataErrorCode } from "../../../../GN-common/constant/errorCode/FetchAllDataErrorCode";
import { xDatetime } from "../../../../GN-library/xdatetime/lib/xDatetime";

class FetchAllDataOperationRequest extends OperationRequest {
	constructor(operationRequest: OperationRequest) {
		super(operationRequest);
	}

	public isValidRequest() {
		return true;
	}
}

export class FetchAllDataRequestHandler extends RequestHandler {
	public getCode() {
		return OperationCode.FetchAllData;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = new FetchAllDataOperationRequest(operationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let gamePlayer = await this.gameApplication.getDatabase().loadGamePlayer(authInfo.getUserId());
		if (!gamePlayer) {
			return this.newOperationInternalServerError(request);
		}

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let banNormal = gamePlayer.getUserBan("Normal");
		if (banNormal != null) {
			if (banNormal["IsBan"]) {
				let currentMillisecond = xDatetime.getCurrentMilliseconds();

				if (banNormal["TsExpire"] > currentMillisecond) {
					operationResponse.setParameter(ParameterCode.ErrorCode, FetchAllDataErrorCode.UserHadBanned);

					operationResponse.setParameter(FetchAllDataParameterCode.TsExpire, banNormal["TsExpire"]);
					operationResponse.setParameter(FetchAllDataParameterCode.Reason, banNormal["Reason"]);

					return operationResponse;
				} else {
					banNormal["IsBan"] = false;
					gamePlayer.setUserBan("Normal", banNormal);
				}
			}
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, FetchAllDataErrorCode.Ok);

		gamePlayer.updateTsLastSeen();

		operationResponse.setParameter(FetchAllDataParameterCode.UserId, gamePlayer.getUserId());
		operationResponse.setParameter(FetchAllDataParameterCode.UserRole, gamePlayer.getSegmentValue("UserRole"));
		operationResponse.setParameter(FetchAllDataParameterCode.DisplayName, gamePlayer.getDisplayName());

		if (this.postHandle != null) {
			await this.postHandle(authInfo, operationRequest, operationResponse, [gamePlayer]);
		}

		return operationResponse;
	}
}
