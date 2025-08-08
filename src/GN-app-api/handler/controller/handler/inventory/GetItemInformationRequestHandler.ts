import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { ItemBaseRequestHandler } from "./ItemBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";

class GetItemInformationOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.ItemId, minLength: 12, maxLength: 12, mustNonNull: true })
	public itemId: string;

	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	public infoRequestParam: InfoRequestParam;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetItemInformationOperationRequest extends GetItemInformationOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetItemInformationOperationRequest extends ServerGetItemInformationOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetItemInformationRequestHandler extends ItemBaseRequestHandler {

	public override getCode() {
		return OperationCode.GetItemInformation;
	}

	public override getCommonOperationRequest() {
		return GetItemInformationOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.getItemInformation.otherSelfEnable && !secretInfo.getPermission().inventory.getItemInformation.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		let allowMethod = false;
		let owned = false;

		if (secretInfo.getPermission().inventory.getItemInformation.otherSelfEnable) {
			allowMethod = true;
		}

		if (secretInfo.getPermission().inventory.getItemInformation.selfEnable) {
			let inventory = await this.gnServer.getDatabase().loadInventoryAsync(request.itemId, secretInfo.getGameId(), { owner: true });
			if (inventory != null) {
				let owner = inventory.getOwner();
				if (owner != null) {
					if (owner.type == <number>OwnerType.GamePlayer) {
						if (owner.id == authInfo.getUserId()) {
							allowMethod = true;
							owned = true;
						}
					}
					else if (owner.type == <number>OwnerType.CharacterPlayer) {
						let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(authInfo.getUserId(), secretInfo.getGameId(), { playerCharacters: true });

						if (gamePlayer != null) {
							if (gamePlayer.hasPlayerCharacter(owner.id)) {
								allowMethod = true;
								owned = true;
							}
						}
					}
					else if (owner.type == <number>OwnerType.Group) {
						let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(authInfo.getUserId(), secretInfo.getGameId(), { playerGroups: true });

						if (gamePlayer != null) {
							let playerGroup = gamePlayer.getPlayerGroup(owner.id);
							if (playerGroup != null && playerGroup.status == <number>GroupStatus.Member) {
								allowMethod = true;
								owned = true;
							}
						}
					}
				}
			}
		}

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		if (owned) {
			this.generateInfoRequestParamForOwner(secretInfo, request.infoRequestParam);
		}
		else {
			this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);
		}

		return this.execute({
			itemId: request.itemId,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetItemInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.getItemInformation.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			itemId: request.itemId,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetItemInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().inventory.getItemInformation.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			itemId: request.itemId,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { itemId: string, infoRequestParam: InfoRequestParam }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_GetItemInformation", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let inventoryFindOptions = this.convertToInventoryFindOptions(request.infoRequestParam);

		let inventory = await this.gnServer.getDatabase().loadInventoryAsync(request.itemId, secretInfo.getGameId(), inventoryFindOptions);

		if (inventory == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
			return operationResponse;
		}

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(inventory, request.infoRequestParam, secretInfo.getGameId()));

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("inventory_GetItemInformation", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
