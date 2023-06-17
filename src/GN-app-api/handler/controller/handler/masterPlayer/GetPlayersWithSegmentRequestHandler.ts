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

class GetPlayersWithSegmentOperationRequest extends OperationRequest {
	@StringDataMember({ code: MasterPlayerParameterCode.Value, minLength: 6, maxLength: 32, mustNonNull: true })
	value: string;

	@GNHashtableDataMember({ code: MasterPlayerParameterCode.InfoGetParameters, mustNonNull: true })
	infoGetParameters: GNHashtable;

    @NumberDataMember({ code: MasterPlayerParameterCode.Skip, defaultValue: 0, isOptional: true })
	skip: number;

    @NumberDataMember({ code: MasterPlayerParameterCode.Limit, defaultValue: 10, isOptional: true })
	limit: number;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetPlayersWithSegmentOperationRequest extends GetPlayersWithSegmentOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetPlayersWithSegmentOperationRequest extends ServerGetPlayersWithSegmentOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetPlayersWithSegmentRequestHandler extends GetPlayersBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetPlayersWithSegment;
	}

	public override getCommonOperationRequest() {
		return GetPlayersWithSegmentOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterPlayer.getPlayersWithSegment.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

        return this.execute(request.value, request.skip, request.limit, request.infoGetParameters, operationRequest, secretInfo);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetPlayersWithSegmentOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.getPlayersWithSegment.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.value, request.skip, request.limit, request.infoGetParameters, operationRequest, secretInfo);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetPlayersWithSegmentOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.getPlayersWithSegment.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.value, request.skip, request.limit, request.infoGetParameters, operationRequest, secretInfo);
    }

    private async execute(segment: string, skip: number, limit: number, infoGetParameters: GNHashtable, operationRequest: OperationRequest, secretInfo: SecretInfo): Promise<OperationResponse> {
		let masterPlayerFindOptions = this.convertToMasterPlayerFindOptions(infoGetParameters);

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gnResults = new GNArray();

		let masterPlayers = await this.gnServer.getDatabase().loadMasterPlayersWithSegmentAsync(segment, skip, limit, masterPlayerFindOptions);

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
