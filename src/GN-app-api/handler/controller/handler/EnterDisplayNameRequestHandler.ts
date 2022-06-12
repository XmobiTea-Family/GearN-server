import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { EnterDisplayNameParameterCode } from "./../../../../GN-common/constant/parameterCode/EnterDisplayNameParameterCode";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { EnterDisplayNameErrorCode } from "./../../../../GN-common/constant/errorCode/EnterDisplayNameErrorCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { xDatetime } from "./../../../../GN-library/xdatetime/lib/xDatetime";
import { UserRoleType } from "./../../../../GN-common/constant/enumType/UserRoleType";
import { DisplayNameUltils } from "./../../../../GN-common/helper/DisplayNameUltils";
import { DataMember, BooleanDataMemberArgs, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";

class EnterDisplayNameOperationRequest extends OperationRequest {
	@StringDataMember({ code: EnterDisplayNameParameterCode.DisplayName, mustNonNull: true, minLength: 3, maxLength: 40 })
	displayName: string;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class EnterDisplayNameRequestHandler extends RequestHandler {
	public getCode() {
		return OperationCode.EnterDisplayName;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, EnterDisplayNameOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let gamePlayer = await this.gameApplication.getDatabase().loadGamePlayer(authInfo.getUserId());
		if (!gamePlayer) {
			return this.newOperationInternalServerError(request);
		}

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);
		operationResponse.setParameter(ParameterCode.ErrorCode, EnterDisplayNameErrorCode.Ok);

		let displayNameNormalizeCollection = this.gameApplication.getDatabase().runtimeGameCollection("DisplayNameNormalizeCollection");
		displayNameNormalizeCollection.updateOne(
			{ UserId: authInfo.getUserId() },
			{
				$set: {
					DisplayName: DisplayNameUltils.normalizeString(request.displayName),
					Ts: xDatetime.getCurrentMilliseconds(),
				},
			},
			{
				upsert: true,
			}
		);

		gamePlayer.setDisplayName(request.displayName);
		operationResponse.setParameter(EnterDisplayNameParameterCode.DisplayName, request.displayName);

		if (gamePlayer.getSegmentValue("UserRole") == UserRoleType.UserNonActivate) {
			gamePlayer.setSegmentValue("UserRole", UserRoleType.User);

			authInfo.setRole(UserRoleType.User);
			this.gameApplication.getApiMiddleware().updateAuthInfo(authInfo);
		}

		operationResponse.setParameter(EnterDisplayNameParameterCode.UserRole, gamePlayer.getSegmentValue("UserRole"));

		if (this.postHandle != null) {
			await this.postHandle(authInfo, request, operationResponse, gamePlayer);
		}

		return operationResponse;
	}
}
