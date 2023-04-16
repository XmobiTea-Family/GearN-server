import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import bcrypt from "bcrypt";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { MasterAdminPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/MasterAdminPlayer";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";

class GrantAdminAccountOperationRequest extends OperationRequest {
	@StringDataMember({ code: GNParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true })
	username: string;

	@StringDataMember({ code: GNParameterCode.Password, minLength: 6, maxLength: 64, mustNonNull: true })
	password: string;

	@StringDataMember({ code: GNParameterCode.SecretKey, minLength: 6, maxLength: 64, mustNonNull: true })
	secretKey: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GrantAdminAccountRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.GrantAdminAccount;
	}

	public override getCommonOperationRequest() {
		return GrantAdminAccountOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		if (!secretInfo.getPermission().masterAdmin.grantAdminAccount.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			username: request.username,
			password: request.password,
			secretKey: request.secretKey,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { username: string, password: string, secretKey: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_GrantAdminAccount", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let thisUser = await collection.findOne({ type: "account", username: request.username });

		if (thisUser != null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.AccountUsernameExists);
			return operationResponse;
		}

		let result = {
			type: "account",
			userId: StringUtility.generateRandomString(10, 0),
			username: request.username,
			password: await bcrypt.hash(request.password, 10),
			secretKey: request.secretKey,
		} as any;

		await collection.insertOne(result);

		let masterAdminPlayer = new MasterAdminPlayer(result, collection);

		operationResponse.setParameter(GNParameterCode.UserId, masterAdminPlayer.getUserId());

		operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_GrantAdminAccount", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
