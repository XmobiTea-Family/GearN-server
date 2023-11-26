import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";
import { ItemType } from "./../../../../../GN-common/constant/enumType/ItemType";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { DisplayNameUtility } from "./../../../../../GN-common/helper/DisplayNameUtility";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class GrantPlayerItemOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
    characterId: string;

    @StringDataMember({ code: GNParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true })
    catalogId: string;

    @StringDataMember({ code: GNParameterCode.ClassId, minLength: 2, maxLength: 32, mustNonNull: true })
    classId: string;

    @StringDataMember({ code: GNParameterCode.DisplayName, defaultValue: "", isOptional: true })
    displayName?: string;

    @NumberDataMember({ code: GNParameterCode.Amount, defaultValue: 1, isOptional: true })
    amount?: number;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerGrantPlayerItemOperationRequest extends GrantPlayerItemOperationRequest {


    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminGrantPlayerItemOperationRequest extends ServerGrantPlayerItemOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GrantPlayerItemRequestHandler extends CharacterPlayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.GrantPlayerItem;
    }

    public override getCommonOperationRequest() {
        return GrantPlayerItemOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.grantPlayerItem);

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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGrantPlayerItemOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.grantPlayerItem.serverSelfEnable) {
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGrantPlayerItemOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.grantPlayerItem.adminSelfEnable) {
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
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_GrantPlayerItem", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let characterPlayerFindOptions: CharacterPlayerFindOptions = {
            playerInventories: true,
        }

        let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
        let playerItemCatalogSettingsItem = characterPlayerSettings.playerItemCatalogSettings.find(x => x.catalogId == request.catalogId);

        if (playerItemCatalogSettingsItem == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.CatalogIdNotFound);
            return operationResponse;
        }

        let itemClassSettingsItem = playerItemCatalogSettingsItem.itemClassSettings.find(x => x.classId == request.classId);
        if (itemClassSettingsItem == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ClassIdNotFound);
            return operationResponse;
        }

        let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

        if (characterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.CharacterPlayerNotFound);
            return operationResponse;
        }

        let amount = request.amount;

        if (playerItemCatalogSettingsItem.itemType == <number>ItemType.NonConsumable) {
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

        gnPlayerInventory.add(GNParameterCode.ItemId, inventory.getItemId());
        gnPlayerInventory.add(GNParameterCode.CatalogId, inventory.getCatalogId());
        gnPlayerInventory.add(GNParameterCode.ClassId, inventory.getClassId());

        gnPlayerInventories.add(gnPlayerInventory);

        let gnInfoResponseParameters = new GNHashtable();
        gnInfoResponseParameters.add(GNParameterCode.PlayerInventories, gnPlayerInventories);

        operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_GrantPlayerItem", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
