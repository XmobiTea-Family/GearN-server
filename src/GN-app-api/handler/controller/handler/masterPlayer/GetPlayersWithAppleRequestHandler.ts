import { OperationRequest } from "../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "../../../../../GN-common/entity/DataMember";
import { MasterPlayerParameterCode } from "../../../../../GN-common/constant/parameterCode/MasterPlayerParameterCode";
import { GNArray, GNHashtable } from "../../../../../GN-common/common/GNData";
import { MasterPlayerErrorCode } from "../../../../../GN-common/constant/errorCode/MasterPlayerErrorCode";

import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";
import { GetPlayersBaseRequestHandler } from "./GetPlayersBaseRequestHandler";

class GetPlayersWithAppleOperationRequest extends OperationRequest {
    @GNArrayDataMember({ code: MasterPlayerParameterCode.AppleIds, mustNonNull: true })
	appleIds: GNArray;

	@GNHashtableDataMember({ code: MasterPlayerParameterCode.InfoGetParameters, mustNonNull: true })
	infoGetParameters: GNHashtable;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetPlayersWithAppleOperationRequest extends GetPlayersWithAppleOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetPlayersWithAppleOperationRequest extends ServerGetPlayersWithAppleOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetPlayersWithAppleRequestHandler extends GetPlayersBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetPlayersWithApple;
	}

	public override getCommonOperationRequest() {
		return GetPlayersWithAppleOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.getPlayersWithApple.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.appleIds, request.infoGetParameters, operationRequest, secretInfo);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayersWithAppleOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.getPlayersWithApple.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.appleIds, request.infoGetParameters, operationRequest, secretInfo);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayersWithAppleOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.getPlayersWithApple.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.appleIds, request.infoGetParameters, operationRequest, secretInfo);
    }

    private async execute(appleIds: GNArray, infoGetParameters: GNHashtable, operationRequest: OperationRequest, secretInfo: SecretInfo): Promise<OperationResponse> {
		let masterPlayerFindOptions = this.convertToMasterPlayerFindOptions(infoGetParameters);

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gnResults = new GNArray();

		let masterPlayers = await this.gnServer.getDatabase().loadMasterPlayersWithAppleAsync((<any>appleIds).array, masterPlayerFindOptions);

		for (let i = 0; i < masterPlayers.length; i++) {
			let masterPlayer = masterPlayers[i];

			let gnResult = new GNHashtable();

			gnResult.add(MasterPlayerParameterCode.UserId, masterPlayer.getUserId());

			gnResult.add(MasterPlayerParameterCode.InfoGetParameters, this.generateMasterPlayerOperationResponse(masterPlayer, masterPlayerFindOptions, infoGetParameters, secretInfo));

			gnResults.add(gnResult);
		}

        operationResponse.setParameter(MasterPlayerParameterCode.Results, gnResults);
        
		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
