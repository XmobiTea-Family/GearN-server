import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { MasterPlayerParameterCode } from "./../../../../../GN-common/constant/parameterCode/MasterPlayerParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { MasterPlayerErrorCode } from "../../../../../GN-common/constant/errorCode/MasterPlayerErrorCode";

import { MasterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { RequestHandler } from "../base/RequestHandler";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";

class ChangeAccountPasswordOperationRequest extends OperationRequest {
	@StringDataMember({ code: MasterPlayerParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true })
	oldPassword: string;

	@StringDataMember({ code: MasterPlayerParameterCode.Password, minLength: 6, maxLength: 64, mustNonNull: true })
	password: string;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class ChangeAccountPasswordRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.ChangeAccountPassword;
	}

	public override getCommonOperationRequest() {
		return ChangeAccountPasswordOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.addSegment.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        let masterPlayerFindOptions: MasterPlayerFindOptions = {
            segments: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(authInfo.getUserId(), masterPlayerFindOptions);

		if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

        // Change nao
        

        if (!masterPlayer.hasSegment(segment)) {
            masterPlayer.addSegment(segment);

            masterPlayer.saveAsync();
        }

		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);
		return operationResponse;
	}
}
