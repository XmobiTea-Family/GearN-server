import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";

import { SecretInfoItem } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/SecretInfoItem";
import { PermissionParam } from "./model/PermissionParam";

class SetSecretInfoInformationOperationRequest extends OperationRequest {

	// Stores the secret key value used by this instance.
	@StringDataMember({ code: ParameterCode.SecretKey, minLength: 6, maxLength: 64, mustNonNull: true })
	public secretKey: string;

	// Indicates whether remove.
	@BooleanDataMember({ code: ParameterCode.Remove, isOptional: true })
	public remove?: boolean;

	// Stores the timestamp expire value used by this instance.
	@NumberDataMember({ code: ParameterCode.TsExpire, isOptional: true })
	public tsExpire?: number;

	// Stores the permission parameter value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.PermissionParam, isOptional: true })
	public permissionParam?: PermissionParam;

	// Stores the description value used by this instance.
	@StringDataMember({ code: ParameterCode.Description, isOptional: true })
	public description?: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class SetSecretInfoInformationRequestHandler extends RequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.SetSecretInfoInformation;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return SetSecretInfoInformationOperationRequest;
	}

	/**
	 * Executes the handle workflow asynchronously.
	 * @param authInfo Provides the auth info value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().masterAdmin.setSecretInfoInformation.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			secretKey: request.secretKey,
			remove: request.remove,
			tsExpire: request.tsExpire,
			permissionParam: request.permissionParam,
			description: request.description,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { secretKey: string, remove: boolean, tsExpire: number, permissionParam: PermissionParam, description: string, }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_SetSecretInfoInformation", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the collection value used in the current execution flow.
		let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ type: "secretInfo", secretKey: request.secretKey });

		if (result == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.SecretInfoNotFound);
			return operationResponse;
		}

		// Stores the secret info item value used in the current execution flow.
		let secretInfoItem = new SecretInfoItem(result, collection);

		if (request.remove != null) {
			secretInfoItem.setRemove(request.remove);
		}

		if (request.tsExpire != null) {
			secretInfoItem.setTsExpire(request.tsExpire);
		}

		if (request.description != null) {
			secretInfoItem.setDescription(request.description);
		}

		// let secretRole = <SecretRole>secretInfoItem.getRole();

		if (request.permissionParam) {
			// Stores the permission any value used in the current execution flow.
			let permissionAny = secretInfoItem.getPermission() as any;

			// Stores the permission parameter any value used in the current execution flow.
			let permissionParamAny = request.permissionParam as any;
			// Stores the key layer 0 s value used in the current execution flow.
			let keyLayer0s = Object.keys(permissionParamAny); // authenticate

			for (let i = 0; i < keyLayer0s.length; i++) {
				// Stores the key layer 0 value used in the current execution flow.
				let keyLayer0 = keyLayer0s[i]; // authenticate
				let thisLayer0Any = permissionParamAny[keyLayer0]; // authenticate data

				if (thisLayer0Any != null) {
					// Stores the permission any for layer 0 any value used in the current execution flow.
					let permissionAnyForLayer0Any = permissionAny[keyLayer0]; // authenticate data

					let keyLayer1s = Object.keys(thisLayer0Any);

					for (let j = 0; j < keyLayer1s.length; j++) {
						// Stores the key layer 1 value used in the current execution flow.
						let keyLayer1 = keyLayer1s[j]; // loginByAccount

						let thisLayer1Any = thisLayer0Any[keyLayer1]; // loginByAccount data
						if (thisLayer1Any != null) {

							// Stores the permission any for layer 1 any value used in the current execution flow.
							let permissionAnyForLayer1Any = permissionAnyForLayer0Any[keyLayer1];

							if (permissionAnyForLayer1Any == null) {
								permissionAnyForLayer1Any = {
									selfEnable: false,
									otherSelfEnable: false,
									adminSelfEnable: false,
									serverSelfEnable: false,
								};

								permissionAnyForLayer0Any[keyLayer1] = permissionAnyForLayer1Any;
							}

							// Stores the self enable value used in the current execution flow.
							let selfEnable: boolean = thisLayer1Any.selfEnable;
							// Stores the other self enable value used in the current execution flow.
							let otherSelfEnable: boolean = thisLayer1Any.otherSelfEnable;
							// Stores the admin self enable value used in the current execution flow.
							let adminSelfEnable: boolean = thisLayer1Any.adminSelfEnable;
							// Stores the server self enable value used in the current execution flow.
							let serverSelfEnable: boolean = thisLayer1Any.serverSelfEnable;

							permissionAnyForLayer1Any.selfEnable = selfEnable != null && selfEnable;
							permissionAnyForLayer1Any.otherSelfEnable = otherSelfEnable != null && otherSelfEnable;
							permissionAnyForLayer1Any.adminSelfEnable = adminSelfEnable != null && adminSelfEnable;
							permissionAnyForLayer1Any.serverSelfEnable = serverSelfEnable != null && serverSelfEnable;

							if (permissionAnyForLayer1Any.otherSelfEnable) {
								permissionAnyForLayer1Any.selfEnable = true;
							}

							// if (secretRole == SecretRole.Player) {
							// 	if (permissionAnyForLayer1Any.otherSelfEnable) {
							// 		permissionAnyForLayer1Any.selfEnable = true;
							// 	}
							// }
							// else if (secretRole == SecretRole.Server) {
							// 	permissionAnyForLayer1Any.selfEnable = false;
							// 	permissionAnyForLayer1Any.otherSelfEnable = false;
							// 	permissionAnyForLayer1Any.adminSelfEnable = false;
							// }
							// else if (secretRole == SecretRole.Admin) {
							// 	permissionAnyForLayer1Any.selfEnable = false;
							// 	permissionAnyForLayer1Any.otherSelfEnable = false;
							// 	permissionAnyForLayer1Any.serverSelfEnable = false;
							// }
						}
					}
				}
			}

			secretInfoItem.setPermission(permissionAny);
		}

		secretInfoItem.saveAsync();

		// Stores the new secret info value used in the current execution flow.
		let newSecretInfo = SecretInfo.Builder()
			.setGameId(secretInfoItem.getGameId())
			.setIsRemove(secretInfoItem.getRemove())
			.setPermission(secretInfoItem.getPermission())
			.setRole(secretInfoItem.getRole())
			.setSecretKey(secretInfoItem.getSecretKey())
			.setTsExpire(secretInfoItem.getTsExpire())
			.setDescription(secretInfoItem.getDescription())
			.build();

		this.gnServer.getApiMiddleware().updateSecretInfo(newSecretInfo);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("dashboard_SetSecretInformation", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
