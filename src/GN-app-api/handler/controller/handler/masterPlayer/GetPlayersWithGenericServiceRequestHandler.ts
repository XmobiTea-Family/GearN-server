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

class GetPlayersWithGenericServiceOperationRequest extends OperationRequest {
	@StringDataMember({ code: MasterPlayerParameterCode.ServiceName, minLength: 1, maxLength: 32, mustNonNull: true })
	serviceName: string;

    @GNArrayDataMember({ code: MasterPlayerParameterCode.GenericIds, mustNonNull: true })
	genericIds: GNArray;

	@GNHashtableDataMember({ code: MasterPlayerParameterCode.InfoGetParameters, mustNonNull: true })
	infoGetParameters: GNHashtable;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetPlayersWithGenericServiceOperationRequest extends GetPlayersWithGenericServiceOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetPlayersWithGenericServiceOperationRequest extends ServerGetPlayersWithGenericServiceOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetPlayersWithGenericServiceRequestHandler extends GetPlayersBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetPlayersWithGenericService;
	}

	public override getCommonOperationRequest() {
		return GetPlayersWithGenericServiceOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.getPlayersWithGenericService.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.serviceName, request.genericIds, request.infoGetParameters, operationRequest, secretInfo);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayersWithGenericServiceOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.getPlayersWithGenericService.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.serviceName, request.genericIds, request.infoGetParameters, operationRequest, secretInfo);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayersWithGenericServiceOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.getPlayersWithGenericService.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.serviceName, request.genericIds, request.infoGetParameters, operationRequest, secretInfo);
    }

    private async execute(genericServiceName: string, genericIds: GNArray, infoGetParameters: GNHashtable, operationRequest: OperationRequest, secretInfo: SecretInfo): Promise<OperationResponse> {
		let masterPlayerFindOptions = this.convertToMasterPlayerFindOptions(infoGetParameters);

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gnResults = new GNArray();

		let masterPlayers = await this.gnServer.getDatabase().loadMasterPlayersWithGenericServiceAsync(genericServiceName, (<any>genericIds).array, masterPlayerFindOptions);

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
