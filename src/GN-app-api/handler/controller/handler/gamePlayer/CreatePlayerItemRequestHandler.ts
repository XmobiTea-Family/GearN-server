import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { ItemType } from "./../../../../../GN-common/constant/enumType/ItemType";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { DisplayNameUtility } from "./../../../../../GN-common/helper/DisplayNameUtility";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class CreatePlayerItemOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	@StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true })
	public catalogId: string;

	@StringDataMember({ code: ParameterCode.ClassId, minLength: 2, maxLength: 32, mustNonNull: true })
	public classId: string;

	@StringDataMember({ code: ParameterCode.DisplayName, defaultValue: "", isOptional: true })
	public displayName?: string;

	@NumberDataMember({ code: ParameterCode.Amount, defaultValue: 1, mustInt: true, isOptional: true })
	public amount?: number;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerCreatePlayerItemOperationRequest extends CreatePlayerItemOperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminCreatePlayerItemOperationRequest extends ServerCreatePlayerItemOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class CreatePlayerItemRequestHandler extends GamePlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.CreatePlayerItem;
	}

	public override getCommonOperationRequest() {
		return CreatePlayerItemOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().gamePlayer.createPlayerItem.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.createPlayerItem.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().gamePlayer.createPlayerItem.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			catalogId: request.catalogId,
			classId: request.classId,
			displayName: request.displayName,
			amount: request.amount,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerCreatePlayerItemOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.createPlayerItem.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			catalogId: request.catalogId,
			classId: request.classId,
			displayName: request.displayName,
			amount: request.amount,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminCreatePlayerItemOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.createPlayerItem.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			catalogId: request.catalogId,
			classId: request.classId,
			displayName: request.displayName,
			amount: request.amount,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, catalogId: string, classId: string, displayName: string, amount: number }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_CreatePlayerItem", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayerFindOptions: GamePlayerFindOptions = {
			playerInventories: true,
		}

		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
		let playerItemCatalogSettingsItem = gamePlayerSettings.playerItemCatalogSettings.find(x => x.catalogId == request.catalogId);

		if (playerItemCatalogSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CatalogIdNotFound);
			return operationResponse;
		}

		let itemClassSettingsItem = playerItemCatalogSettingsItem.itemClassSettings.find(x => x.classId == request.classId);
		if (itemClassSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ClassIdNotFound);
			return operationResponse;
		}

		let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

		if (gamePlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
			return operationResponse;
		}

		let amount = request.amount;

		if (playerItemCatalogSettingsItem.itemType == <number>ItemType.NonStackable) {
			amount = 1;
		}

		let itemId = StringUtility.generateRandomString(12, this.gnServer.getIdTypeCase());
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let result = {} as any;
		result["itemId"] = itemId;
		result["catalogId"] = request.catalogId;
		result["classId"] = request.classId;
		result["amount"] = amount;
		result["itemType"] = playerItemCatalogSettingsItem.itemType;
		result["owner"] = { "id": request.userId, "type": <number>OwnerType.GamePlayer };
		result["itemDatas"] = [];
		result["itemStatistics"] = {};
		result["removeStatus"] = { "tsRemove": 0, "reason": "" };
		result["segments"] = [];
		result["customDatas"] = {};
		result["tsCreate"] = currentMilliseconds;
		result["displayName"] = request.displayName;
		result["displayNameNormalize"] = DisplayNameUtility.normalizeString(request.displayName);
		result["avatar"] = { "type": 0, "value": "0" };
		result["tags"] = {};

		let inventory = await this.gnServer.getDatabase().createInventoryAsync(result, secretInfo.getGameId());

		gamePlayer.setPlayerInventory(itemId, request.catalogId, request.classId);
		gamePlayer.saveAsync();

		let gnPlayerInventories = new GNArray();

		let gnPlayerInventory = new GNHashtable();

		gnPlayerInventory.add(ParameterCode.ItemId, inventory.getItemId());
		gnPlayerInventory.add(ParameterCode.CatalogId, inventory.getCatalogId());
		gnPlayerInventory.add(ParameterCode.ClassId, inventory.getClassId());

		gnPlayerInventories.add(gnPlayerInventory);

		let gnInfoResponseParameters = new GNHashtable();
		gnInfoResponseParameters.add(ParameterCode.PlayerInventories, gnPlayerInventories);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_CreatePlayerItem", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
