import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { MasterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { LoginBaseRequestHandler } from "./LoginBaseRequestHandler";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { InfoRequestParam } from "./model/InfoRequestParam";

class LoginByWindowsDeviceIdOperationRequest extends OperationRequest {

	// Stores the windows device ID value used by this instance.
	@StringDataMember({ code: ParameterCode.WindowsDeviceId, minLength: 6, maxLength: 64, mustNonNull: true })
	public windowsDeviceId: string;

	// Indicates whether create player if not exists.
	@BooleanDataMember({ code: ParameterCode.CreatePlayerIfNotExists, isOptional: true, defaultValue: false })
	public createPlayerIfNotExists?: boolean;

	// Stores the info request parameter value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	public infoRequestParam: InfoRequestParam;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class LoginByWindowsDeviceIdRequestHandler extends LoginBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.LoginByWindowsDeviceId;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return LoginByWindowsDeviceIdOperationRequest;
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

		if (!secretInfo.getPermission().authenticate.loginByWindowsDeviceId.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForOwner(secretInfo, request.infoRequestParam);

		return this.execute({
			windowsDeviceId: request.windowsDeviceId,
			createPlayerIfNotExists: request.createPlayerIfNotExists,
			infoRequestParam: request.infoRequestParam,
			ipAddress: (request as any).originRequest.getIP(),
		}, SecretRole.Client, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { windowsDeviceId: string, createPlayerIfNotExists: boolean, infoRequestParam: InfoRequestParam, ipAddress: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("authenticate_LoginByWindowsDeviceId", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the master player find options value used in the current execution flow.
		let masterPlayerFindOptions: MasterPlayerFindOptions = this.convertToMasterPlayerFindOptions(request.infoRequestParam);
		if (masterPlayerFindOptions != null) {
			masterPlayerFindOptions.lastIPDetail = true;
			masterPlayerFindOptions.playerBan = true;
		}

		// Stores the master player value used in the current execution flow.
		let masterPlayer = await this.gnServer.getDatabase().masterPlayerRepository.loadMasterPlayerByWindowsDeviceIdAsync(request.windowsDeviceId, masterPlayerFindOptions);

		if (masterPlayer == null) {
			if (!request.createPlayerIfNotExists) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.AccountNotFound);

				return operationResponse;
			}
			else {
				// Stores the new master player result value used in the current execution flow.
				let newMasterPlayerResult = this.generateNewMasterPlayerResult(request.ipAddress);
				newMasterPlayerResult["external"]["device"] = {
					"windowsDeviceId": request.windowsDeviceId
				}

				// Stores the IP detail response value used in the current execution flow.
				let ipDetailResponse = await this.gnServer.getCountryIPDetailService().getIPDetailResponse(request.ipAddress);
				if (ipDetailResponse.statusCode == "Ok") {
					if (ipDetailResponse.detail.countryCode) {
						newMasterPlayerResult["countryCode"] = ipDetailResponse.detail.countryCode;
					}

					// Stores the last IP detail value used in the current execution flow.
					let lastIPDetail = newMasterPlayerResult["lastIPDetail"];
					lastIPDetail.countryCode = ipDetailResponse.detail.countryCode ?? "Unknown";
					lastIPDetail.regionCode = ipDetailResponse.detail.regionCode ?? "Unknown";

					this.gnServer.getCountryIPDetailService().updateUserIP(newMasterPlayerResult["userId"], request.ipAddress, null, null, lastIPDetail.countryCode, lastIPDetail.regionCode);
				}

				masterPlayer = await this.gnServer.getDatabase().masterPlayerRepository.createMasterPlayerAsync(newMasterPlayerResult);
				operationResponse.setParameter(ParameterCode.NewlyCreated, true);
			}
		}
		else {
			// Stores the last IP detail value used in the current execution flow.
			let lastIPDetail = masterPlayer.getLastIPDetail();
			if (lastIPDetail.ipAddress != request.ipAddress) {

				// Stores the IP detail response value used in the current execution flow.
				let ipDetailResponse = await this.gnServer.getCountryIPDetailService().getIPDetailResponse(request.ipAddress);
				if (ipDetailResponse.statusCode == "Ok") {
					lastIPDetail.countryCode = ipDetailResponse.detail.countryCode ?? "Unknown";
					lastIPDetail.regionCode = ipDetailResponse.detail.regionCode ?? "Unknown";
					lastIPDetail.ipAddress = request.ipAddress;

					this.gnServer.getCountryIPDetailService().updateUserIP(masterPlayer.getUserId(), request.ipAddress, null, null, lastIPDetail.countryCode, lastIPDetail.regionCode);
				}

				masterPlayer.setLastIPDetail(lastIPDetail);
			}

			masterPlayer.setTsLastLogin(xDatetime.getCurrentMilliseconds());
			await masterPlayer.saveAsync();
		}

		await this.setupAuthInfo(operationResponse, masterPlayer, secretInfo);

		if (operationResponse.getParameters().getNumber(ParameterCode.ErrorCode) != ErrorCode.PlayerBan) {
			operationResponse.setParameter(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(masterPlayer, request.infoRequestParam));
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);
		}

		await this.gnServer.getEventCallbackCloudScriptService().executeAuthenticate({
			authenticationType: "loginByWindowsDeviceId",
			userId: masterPlayer.getUserId(),
			ipAddress: request.ipAddress,
			isNewUser: operationResponse.getParameters().getBoolean(ParameterCode.NewlyCreated, false),
			subData: {
				windowsDeviceId: request.windowsDeviceId,
				customTags: operationRequest.getParameters().getGNHashtable(ParameterCode.CustomTags)?.toData(),
			}
		}, secretInfo, operationRequest, operationResponse);

		await this.gnServer.getPostEventCallbackService().onEvent("authenticate_LoginByWindowsDeviceId", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
