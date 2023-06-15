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

class LoginByWindowsDeviceIdOperationRequest extends OperationRequest {
	@StringDataMember({ code: AuthenticateParameterCode.WindowsDeviceId, minLength: 8, maxLength: 64, mustNonNull: true })
	windowsDeviceId: string;

	@BooleanDataMember({ code: AuthenticateParameterCode.CreatePlayerIfNotExists })
	createPlayerIfNotExists: boolean;

	@GNHashtableDataMember({ code: AuthenticateParameterCode.InfoGetParameters, mustNonNull: true })
	infoGetParameters: GNHashtable;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LoginByWindowsDeviceIdRequestHandler extends LoginBaseRequestHandler {
	public override getCode() {
		return OperationCode.LoginByWindowsDeviceId;
	}

	public override getCommonOperationRequest() {
		return LoginByWindowsDeviceIdOperationRequest;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);
		
		let masterPlayerFindOptions: MasterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoGetParameters);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerByWindowsDeviceIdAsync(request.windowsDeviceId, masterPlayerFindOptions);

		if (masterPlayer == null) {
            if (!request.createPlayerIfNotExists) {
                operationResponse.setParameter(ParameterCode.ErrorCode, AuthenticateErrorCode.PlayerDoesNotExists);
    
                return operationResponse;
            }
            else {
                let newMasterPlayerResult = this.generateNewMasterPlayerResult((request as any).originRequest.getIP());
				newMasterPlayerResult["external"]["device"] = {
					"windowsDeviceId": request.windowsDeviceId
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
