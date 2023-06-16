import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { AuthenticateParameterCode } from "./../../../../../GN-common/constant/parameterCode/AuthenticateParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { AuthenticateErrorCode } from "../../../../../GN-common/constant/errorCode/AuthenticateErrorCode";

import { MasterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { xDatetime } from "../../../../../GN-library/xdatetime/lib/xDatetime";
import { LoginBaseRequestHandler } from "./LoginBaseRequestHandler";
import { GoogleLoginType } from "../../../../../GN-common/constant/enumType/GoogleLoginType";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";

class LoginByGoogleOperationRequest extends OperationRequest {
	@StringDataMember({ code: AuthenticateParameterCode.Token, maxLength: 512, minLength: 32, mustNonNull: true })
	token: string;

	@NumberDataMember({ code: AuthenticateParameterCode.Type, minValue: 1, maxValue: 2 })
	type: number;

	@BooleanDataMember({ code: AuthenticateParameterCode.CreatePlayerIfNotExists })
	createPlayerIfNotExists: boolean;

	@GNHashtableDataMember({ code: AuthenticateParameterCode.InfoGetParameters, mustNonNull: true })
	infoGetParameters: GNHashtable;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LoginByGoogleRequestHandler extends LoginBaseRequestHandler {
	public override getCode() {
		return OperationCode.LoginByGoogle;
	}

	public override getCommonOperationRequest() {
		return LoginByGoogleOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().authenticate.loginByGoogle.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let googleLoginType = request.type;

		let result = googleLoginType == GoogleLoginType.AccessToken ? await this.gnServer.getGoogleService().verifyGoogleTokenViaAccessToken(request.token) : googleLoginType == GoogleLoginType.IdToken ? await this.gnServer.getGoogleService().verifyGoogleTokenViaIdToken(request.token) : { "error": "Invalid GoogleLoginType" };

		if (result["error"] != null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, AuthenticateErrorCode.VerifyTokenError);
            return operationResponse;
		}

		let googleUserId = result["sub"];

        let masterPlayerFindOptions: MasterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoGetParameters);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByGoogleAsync(googleUserId, masterPlayerFindOptions);

		if (masterPlayer == null) {
            if (!request.createPlayerIfNotExists) {
                operationResponse.setParameter(ParameterCode.ErrorCode, AuthenticateErrorCode.PlayerDoesNotExists);
    
                return operationResponse;
            }
            else {
				let newMasterPlayerResult = this.generateNewMasterPlayerResult((request as any).originRequest.getIP());
				newMasterPlayerResult["external"]["google"] = {
					"googleId": googleUserId
				}

                masterPlayer = await this.gnServer.getDatabase().createMasterPlayerAsync(newMasterPlayerResult);
                operationResponse.setParameter(AuthenticateParameterCode.NewlyCreated, true);
            }
		}
		else {
			masterPlayer.setTsLastLogin(xDatetime.getCurrentMilliseconds());
			masterPlayer.saveAsync();
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, AuthenticateErrorCode.Ok);

        operationResponse.setParameter(AuthenticateParameterCode.UserId, masterPlayer.getUserId());
        operationResponse.setParameter(AuthenticateParameterCode.InfoGetParameters, this.generateMasterPlayerOperationResponse(masterPlayer, masterPlayerFindOptions, request.infoGetParameters));
        
		this.setupAuthInfo(operationResponse, masterPlayer);

		return operationResponse;
	}
}
