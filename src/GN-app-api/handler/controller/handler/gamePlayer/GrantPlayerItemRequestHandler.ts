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

import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { ItemType } from "./../../../../../GN-common/constant/enumType/ItemType";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { DisplayNameUtility } from "./../../../../../GN-common/helper/DisplayNameUtility";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class GrantPlayerItemOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
    userId?: string;

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
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
    userId: string;

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

export class GrantPlayerItemRequestHandler extends GamePlayerBaseRequestHandler {
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

        if (!request.userId) {
            if (!secretInfo.getPermission().gamePlayer.grantPlayerItem.selfEnable) {
                return this.newOperationNotAllowError(request);
            }

            request.userId = authInfo.getUserId();
        }
        else if (request.userId != authInfo.getUserId()) {
            if (!secretInfo.getPermission().gamePlayer.grantPlayerItem.otherSelfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }
        else {
            if (!secretInfo.getPermission().gamePlayer.grantPlayerItem.selfEnable) {
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGrantPlayerItemOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().gamePlayer.grantPlayerItem.serverSelfEnable) {
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGrantPlayerItemOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().gamePlayer.grantPlayerItem.adminSelfEnable) {
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
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_GrantPlayerItem", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let gamePlayerFindOptions: GamePlayerFindOptions = {
            playerInventories: true,
        }

        let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
        let playerItemCatalogSettingsItem = gamePlayerSettings.playerItemCatalogSettings.find(x => x.catalogId == request.catalogId);

        if (playerItemCatalogSettingsItem == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.CatalogIdNotFound);
            return operationResponse;
        }

        let itemClassSettingsItem = playerItemCatalogSettingsItem.itemClassSettings.find(x => x.classId == request.classId);
        if (itemClassSettingsItem == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ClassIdNotFound);
            return operationResponse;
        }

        let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

        if (gamePlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GamePlayerNotFound);
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

        gnPlayerInventory.add(GNParameterCode.ItemId, inventory.getItemId());
        gnPlayerInventory.add(GNParameterCode.CatalogId, inventory.getCatalogId());
        gnPlayerInventory.add(GNParameterCode.ClassId, inventory.getClassId());

        gnPlayerInventories.add(gnPlayerInventory);

        let gnInfoResponseParameters = new GNHashtable();
        gnInfoResponseParameters.add(GNParameterCode.PlayerInventories, gnPlayerInventories);

        operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_GrantPlayerItem", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
