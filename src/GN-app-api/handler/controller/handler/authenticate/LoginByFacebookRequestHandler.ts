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
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";

class LoginByFacebookOperationRequest extends OperationRequest {
	@StringDataMember({ code: AuthenticateParameterCode.Token, minLength: 32, maxLength: 512, mustNonNull: true })
	token: string;

	@BooleanDataMember({ code: AuthenticateParameterCode.CreatePlayerIfNotExists })
	createPlayerIfNotExists: boolean;

	@GNHashtableDataMember({ code: AuthenticateParameterCode.InfoGetParameters, mustNonNull: true })
	infoGetParameters: GNHashtable;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LoginByFacebookRequestHandler extends LoginBaseRequestHandler {
	public override getCode() {
		return OperationCode.LoginByFacebook;
	}

	public override getCommonOperationRequest() {
		return LoginByFacebookOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().authenticate.loginByFacebook.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

        let result = await this.gnServer.getFacebookService().getBasicInfoByAccessToken(request.token);

		if (result["error"] != null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, AuthenticateErrorCode.VerifyTokenError);
			return operationResponse;
		}

		let facebookId = result["id"];

        let masterPlayerFindOptions: MasterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoGetParameters);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByFacebookAsync(facebookId, masterPlayerFindOptions);

		if (masterPlayer == null) {
            if (!request.createPlayerIfNotExists) {
                operationResponse.setParameter(ParameterCode.ErrorCode, AuthenticateErrorCode.PlayerDoesNotExists);
    
                return operationResponse;
            }
            else {
				let newMasterPlayerResult = this.generateNewMasterPlayerResult((request as any).originRequest.getIP());
				newMasterPlayerResult["external"]["facebook"] = {
					"facebookId": facebookId
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
