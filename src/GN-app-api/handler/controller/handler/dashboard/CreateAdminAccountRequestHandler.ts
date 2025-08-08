import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import bcrypt from "bcrypt";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { MasterAdminPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/MasterAdminPlayer";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";

class CreateAdminAccountOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.Username, minLength: 6, maxLength: 32, mustNonNull: true })
	public username: string;

	@StringDataMember({ code: ParameterCode.Password, minLength: 6, maxLength: 64, mustNonNull: true })
	public password: string;

	@StringDataMember({ code: ParameterCode.SecretKey, minLength: 6, maxLength: 64, mustNonNull: true })
	public secretKey: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class CreateAdminAccountRequestHandler extends RequestHandler {

	public override getCode() {
		return OperationCode.CreateAdminAccount;
	}

	public override getCommonOperationRequest() {
		return CreateAdminAccountOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(operationRequest);
		}

		if (!secretInfo.getPermission().masterAdmin.createAdminAccount.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			username: request.username,
			password: request.password,
			secretKey: request.secretKey,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { username: string, password: string, secretKey: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_CreateAdminAccount", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		let thisUser = await collection.findOne({ type: "account", username: request.username });

		if (thisUser != null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountUsernameExists);
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

		operationResponse.setParameter(ParameterCode.UserId, masterAdminPlayer.getUserId());

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_CreateAdminAccount", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
