import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { FetchSparkPlayerParameterCode } from "./../../../../GN-common/constant/parameterCode/FetchSparkPlayerParameterCode";
import { FetchSparkPlayerErrorCode } from "./../../../../GN-common/constant/errorCode/FetchSparkPlayerErrorCode";
import { xDatetime } from "./../../../../GN-library/xdatetime/lib/xDatetime";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";
import { GNHashtable } from "./../../../../GN-common/common/GNData";

class FetchSparkPlayerOperationRequest extends OperationRequest {
	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
 }

export class FetchSparkPlayerRequestHandler extends RequestHandler {
	public getCode() {
		return OperationCode.FetchSparkPlayer;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, FetchSparkPlayerOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayer(authInfo.getUserId());
		if (!sparkPlayer) {
			return this.newOperationInternalServerError(request);
		}

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let banNormal = sparkPlayer.getUserBan("Normal");
		if (banNormal != null) {
			if (banNormal["IsBan"]) {
				let currentMillisecond = xDatetime.getCurrentMilliseconds();

				if (banNormal["TsExpire"] > currentMillisecond) {
					operationResponse.setScriptData(ParameterCode.ErrorCode, FetchSparkPlayerErrorCode.UserHadBanned);

					operationResponse.setScriptData(FetchSparkPlayerParameterCode.TsExpire, banNormal["TsExpire"]);
					operationResponse.setScriptData(FetchSparkPlayerParameterCode.Reason, banNormal["Reason"]);

					return operationResponse;
				} else {
					banNormal["IsBan"] = false;
					sparkPlayer.setUserBan("Normal", banNormal);
				}
			}
		}

		sparkPlayer.updateTsLastSeen();

		operationResponse.setScriptData(ParameterCode.ErrorCode, FetchSparkPlayerErrorCode.Ok);
		operationResponse.setScriptData(FetchSparkPlayerParameterCode.UserId, sparkPlayer.getUserId());
		operationResponse.setScriptData(FetchSparkPlayerParameterCode.UserRole, sparkPlayer.getSegmentValue("UserRole"));
		operationResponse.setScriptData(FetchSparkPlayerParameterCode.Fullname, sparkPlayer.getFullname());
		operationResponse.setScriptData(FetchSparkPlayerParameterCode.TsCreate, sparkPlayer.getTsCreate());

        let gsUserExternal = new GNHashtable();
        gsUserExternal.add(FetchSparkPlayerParameterCode.CustomId, sparkPlayer.getUserExternal("CustomId"));
        gsUserExternal.add(FetchSparkPlayerParameterCode.FacebookId, sparkPlayer.getUserExternal("FacebookId"));
        gsUserExternal.add(FetchSparkPlayerParameterCode.GoogleUserId, sparkPlayer.getUserExternal("GoogleUserId"));
        gsUserExternal.add(FetchSparkPlayerParameterCode.AppleUserId, sparkPlayer.getUserExternal("AppleUserId"));
        gsUserExternal.add(FetchSparkPlayerParameterCode.DeviceInfo, sparkPlayer.getUserExternal("DeviceInfo"));
        gsUserExternal.add(FetchSparkPlayerParameterCode.PublicAddress, sparkPlayer.getUserExternal("PublicAddress"));
		operationResponse.setScriptData(FetchSparkPlayerParameterCode.UserExternal, gsUserExternal);

		if (this.postHandle != null) {
			await this.postHandle(authInfo, request, operationResponse, sparkPlayer);
		}

		return operationResponse;
	}
}
