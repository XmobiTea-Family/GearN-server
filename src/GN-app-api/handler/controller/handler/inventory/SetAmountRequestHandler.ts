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

import { InventoryFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/InventoryFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { ItemBaseRequestHandler } from "./ItemBaseRequestHandler";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { ItemType } from "./../../../../../GN-common/constant/enumType/ItemType";

class SetAmountOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.ItemId, minLength: 12, maxLength: 12, mustNonNull: true })
    itemId: string;

    @NumberDataMember({ code: GNParameterCode.Amount, mustInt: true })
    amount: number;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerSetAmountOperationRequest extends SetAmountOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminSetAmountOperationRequest extends ServerSetAmountOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class SetAmountRequestHandler extends ItemBaseRequestHandler {
    public override getCode() {
        return OperationCode.SetAmount;
    }

    public override getCommonOperationRequest() {
        return SetAmountOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.itemId, secretInfo.getGameId(), secretInfo.getPermission().inventory.setAmount);

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            itemId: request.itemId,
            amount: request.amount,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerSetAmountOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().inventory.setAmount.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            itemId: request.itemId,
            amount: request.amount,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminSetAmountOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().inventory.setAmount.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            itemId: request.itemId,
            amount: request.amount,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { itemId: string, amount: number }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("inventory_SetAmount", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let inventoryFindOptions: InventoryFindOptions = {
            amount: true,
            itemType: true,
            owner: true,
        }

        let inventory = await this.gnServer.getDatabase().loadInventoryAsync(request.itemId, secretInfo.getGameId(), inventoryFindOptions);

        if (inventory == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ItemNotFound);
            return operationResponse;
        }

        let itemType = <ItemType>inventory.getItemType();
        if (itemType == ItemType.NonConsumable) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.ItemNotConsumable);
            return operationResponse;
        }

        inventory.setAmount(inventory.getAmount() + request.amount);

        if (inventory.getAmount() <= 0) {
            let removeStatus = inventory.getRemoveStatus();
            if (removeStatus.tsRemove == 0) {
                inventory.setRemoveStatus(xDatetime.getCurrentMilliseconds(), "");

                let owner = inventory.getOwner();
                let ownerType = <OwnerType>owner.type;
                if (ownerType == OwnerType.Group) {
                    let group = await this.gnServer.getDatabase().loadGroupAsync(owner.id, secretInfo.getGameId(), { groupInventories: true });
                    if (group != null) {
                        if (group.hasGroupInventory(request.itemId)) {
                            group.removeGroupInventory(request.itemId);

                            group.saveAsync();
                        }
                    }
                }
                else if (ownerType == OwnerType.GamePlayer) {
                    let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(owner.id, secretInfo.getGameId(), { playerInventories: true });
                    if (gamePlayer != null) {
                        if (gamePlayer.hasPlayerInventory(request.itemId)) {
                            gamePlayer.removePlayerInventory(request.itemId);

                            gamePlayer.saveAsync();
                        }
                    }
                }
                else if (ownerType == OwnerType.CharacterPlayer) {
                    let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(owner.id, secretInfo.getGameId(), { playerInventories: true });
                    if (characterPlayer != null) {
                        if (characterPlayer.hasPlayerInventory(request.itemId)) {
                            characterPlayer.removePlayerInventory(request.itemId);

                            characterPlayer.saveAsync();
                        }
                    }
                }
            }
        }

        inventory.saveAsync();

        let gnInfoResponseParameters = new GNHashtable();
        gnInfoResponseParameters.add(GNParameterCode.Amount, inventory.getAmount());

        operationResponse.setParameter(GNParameterCode.InfoResponseParameters, gnInfoResponseParameters);

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("inventory_SetAmount", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
