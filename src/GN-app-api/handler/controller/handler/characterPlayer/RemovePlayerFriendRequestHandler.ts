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
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { FriendStatus } from "./../../../../../GN-common/constant/enumType/FriendStatus";
import { EventCode } from "./../../../../../GN-common/constant/EventCode";
import { OperationEvent } from "./../../../../../GN-common/entity/operationEvent/OperationEvent";

class RemovePlayerFriendOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
    characterId: string;

    @StringDataMember({ code: GNParameterCode.FriendId, minLength: 11, maxLength: 11, mustNonNull: true })
    friendId: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerRemovePlayerFriendOperationRequest extends RemovePlayerFriendOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminRemovePlayerFriendOperationRequest extends ServerRemovePlayerFriendOperationRequest {
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class RemovePlayerFriendRequestHandler extends CharacterPlayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.RemovePlayerFriend;
    }

    public override getCommonOperationRequest() {
        return RemovePlayerFriendOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.removePlayerFriend);

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            characterId: request.characterId,
            friendId: request.friendId,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerRemovePlayerFriendOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.removePlayerFriend.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            characterId: request.characterId,
            friendId: request.friendId,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminRemovePlayerFriendOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.removePlayerFriend.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            characterId: request.characterId,
            friendId: request.friendId,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { characterId: string, friendId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_RemovePlayerFriend", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        if (request.characterId != request.friendId) {
            let characterPlayerFindOptions: CharacterPlayerFindOptions = {
                playerFriends: true,
                owner: true
            }

            let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);
            let friendPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.friendId, secretInfo.getGameId(), characterPlayerFindOptions);

            if (characterPlayer == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.CharacterPlayerNotFound);
                return operationResponse;
            }

            if (friendPlayer == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.CharacterPlayerNotFound);
                return operationResponse;
            }

            let currentMilliseconds = xDatetime.getCurrentMilliseconds();

            if (characterPlayer.hasPlayerFriend(request.friendId)) {
                let playerFriendItem = characterPlayer.getPlayerFriend(request.friendId);

                characterPlayer.removePlayerFriend(request.friendId);
                characterPlayer.saveAsync();

                {
                    let gnPlayerFriends = new GNArray();

                    let gnPlayerFriend = new GNHashtable();
                    gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                    gnPlayerFriend.add(GNParameterCode.CatalogId, playerFriendItem.catalogId);
                    gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.NotFriend);
                    gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                    gnPlayerFriends.add(gnPlayerFriend);

                    let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null, operationRequest.isEncrypted());

                    characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);
                    characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.CharacterId, request.characterId);

                    this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                }
            }

            if (friendPlayer.hasPlayerFriend(request.characterId)) {
                let playerFriendItem = friendPlayer.getPlayerFriend(request.characterId);

                friendPlayer.removePlayerFriend(request.characterId);
                friendPlayer.saveAsync();

                {
                    let gnPlayerFriends = new GNArray();

                    let gnPlayerFriend = new GNHashtable();
                    gnPlayerFriend.add(GNParameterCode.FriendId, request.characterId);
                    gnPlayerFriend.add(GNParameterCode.CatalogId, playerFriendItem.catalogId);
                    gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.NotFriend);
                    gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                    gnPlayerFriends.add(gnPlayerFriend);

                    let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null, operationRequest.isEncrypted());

                    characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);
                    characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.CharacterId, request.friendId);

                    this.gnServer.sendEventTo(friendPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                }
            }
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_RemovePlayerFriend", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
