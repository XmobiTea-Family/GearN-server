import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";
import { ItemType } from "./../../../../../GN-common/constant/enumType/ItemType";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { DisplayNameUtility } from "./../../../../../GN-common/helper/DisplayNameUtility";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class CreatePlayerItemOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
	public characterId: string;

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

export class CreatePlayerItemRequestHandler extends CharacterPlayerBaseRequestHandler {

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

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.createPlayerItem);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
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

		if (!secretInfo.getPermission().characterPlayer.createPlayerItem.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
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

		if (!secretInfo.getPermission().characterPlayer.createPlayerItem.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			catalogId: request.catalogId,
			classId: request.classId,
			displayName: request.displayName,
			amount: request.amount,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { characterId: string, catalogId: string, classId: string, displayName: string, amount: number }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_CreatePlayerItem", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
			playerInventories: true,
		}

		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
		let playerItemCatalogSettingsItem = characterPlayerSettings.playerItemCatalogSettings.find(x => x.catalogId == request.catalogId);

		if (playerItemCatalogSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CatalogIdNotFound);
			return operationResponse;
		}

		let itemClassSettingsItem = playerItemCatalogSettingsItem.itemClassSettings.find(x => x.classId == request.classId);
		if (itemClassSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ClassIdNotFound);
			return operationResponse;
		}

		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

		if (characterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
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
		result["owner"] = { "id": request.characterId, "type": <number>OwnerType.CharacterPlayer };
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

		characterPlayer.setPlayerInventory(itemId, request.catalogId, request.classId);
		characterPlayer.saveAsync();

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

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_CreatePlayerItem", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
