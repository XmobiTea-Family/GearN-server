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

class LoginByAndroidDeviceIdOperationRequest extends OperationRequest {
	@StringDataMember({ code: AuthenticateParameterCode.AndroidDeviceId, minLength: 6, maxLength: 256, mustNonNull: true })
	androidDeviceId: string;

	@BooleanDataMember({ code: AuthenticateParameterCode.CreatePlayerIfNotExists })
	createPlayerIfNotExists: boolean;

	@GNHashtableDataMember({ code: AuthenticateParameterCode.InfoGetParameters, mustNonNull: true })
	infoGetParameters: GNHashtable;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LoginByAndroidDeviceIdRequestHandler extends LoginBaseRequestHandler {
	public override getCode() {
		return OperationCode.LoginByAccount;
	}

	public override getCommonOperationRequest() {
		return LoginByAndroidDeviceIdOperationRequest;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());

		let masterPlayerFindOptions: MasterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoGetParameters);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByAndroidDeviceIdAsync(request.androidDeviceId);

		if (masterPlayer == null) {
            if (!request.createPlayerIfNotExists) {
                operationResponse.setReturnCode(ReturnCode.Ok);
                operationResponse.setParameter(ParameterCode.ErrorCode, AuthenticateErrorCode.PlayerDoesNotExists);
    
                return operationResponse;
            }
            else {
                masterPlayer = await this.gnServer.getDatabase().createMasterPlayerAsync(this.generateNewMasterPlayerResult((request as any).originRequest.getIP()));
                operationResponse.setParameter(AuthenticateParameterCode.NewlyCreated, true);
            }
		}
		else {
			masterPlayer.setTsLastLogin(xDatetime.getCurrentMilliseconds());
			masterPlayer.saveAsync();
		}

        operationResponse.setParameter(AuthenticateParameterCode.UserId, masterPlayer.getUserId());
        operationResponse.setParameter(AuthenticateParameterCode.InfoGetParameters, this.generateMasterPlayerOperationResponse(masterPlayer, masterPlayerFindOptions, request.infoGetParameters));
        
		this.setupAuthInfo(operationResponse, masterPlayer);

		return operationResponse;
	}
}


