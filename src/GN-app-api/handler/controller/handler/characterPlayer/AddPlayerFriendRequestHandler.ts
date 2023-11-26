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
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { FriendStatus } from "./../../../../../GN-common/constant/enumType/FriendStatus";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";
import { OperationEvent } from "./../../../../../GN-common/entity/operationEvent/OperationEvent";
import { EventCode } from "./../../../../../GN-common/constant/EventCode";

class AddPlayerFriendOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
    characterId: string;

    @StringDataMember({ code: GNParameterCode.FriendId, minLength: 11, maxLength: 11, mustNonNull: true })
    friendId: string;

    @StringDataMember({ code: GNParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true })
    catalogId: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerAddPlayerFriendOperationRequest extends AddPlayerFriendOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminAddPlayerFriendOperationRequest extends ServerAddPlayerFriendOperationRequest {

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class AddPlayerFriendRequestHandler extends CharacterPlayerBaseRequestHandler {
    public override getCode() {
        return OperationCode.AddPlayerFriend;
    }

    public override getCommonOperationRequest() {
        return AddPlayerFriendOperationRequest;
    }

    public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.addPlayerFriend);

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            characterId: request.characterId,
            friendId: request.friendId,
            catalogId: request.catalogId,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerAddPlayerFriendOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.addPlayerFriend.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            characterId: request.characterId,
            friendId: request.friendId,
            catalogId: request.catalogId,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminAddPlayerFriendOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.addPlayerFriend.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            characterId: request.characterId,
            friendId: request.friendId,
            catalogId: request.catalogId,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { characterId: string, friendId: string, catalogId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_AddPlayerFriend", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let gamePlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
        let playerFriendCatalogSettingsItem = gamePlayerSettings.playerFriendCatalogSettings.find(x => x.catalogId == request.catalogId);

        if (playerFriendCatalogSettingsItem == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.CatalogIdNotFound);

            return operationResponse;
        }

        if (request.characterId != request.friendId) {
            let gamePlayerFindOptions: CharacterPlayerFindOptions = {
                playerFriends: true,
                owner: true
            }

            let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), gamePlayerFindOptions);
            let friendPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.friendId, secretInfo.getGameId(), gamePlayerFindOptions);

            if (characterPlayer == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.CharacterPlayerNotFound);
                return operationResponse;
            }

            if (friendPlayer == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.CharacterPlayerNotFound);
                return operationResponse;
            }

            let currentMilliseconds = xDatetime.getCurrentMilliseconds();

            if (!characterPlayer.hasPlayerFriend(request.friendId)) {
                if (playerFriendCatalogSettingsItem.forceAcceptFriend) {
                    characterPlayer.setPlayerFriend(request.friendId, request.catalogId, <number>FriendStatus.Friend, currentMilliseconds);
                    characterPlayer.saveAsync();

                    friendPlayer.setPlayerFriend(request.characterId, request.catalogId, <number>FriendStatus.Friend, currentMilliseconds);
                    friendPlayer.saveAsync();

                    {
                        let gnPlayerFriends = new GNArray();

                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                        gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.Friend);
                        gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null, operationRequest.isEncrypted());

                        characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);
                        characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.CharacterId, request.characterId);

                        this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                    }

                    {
                        let gnPlayerFriends = new GNArray();

                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                        gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.Friend);
                        gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null, operationRequest.isEncrypted());

                        characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);
                        characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.CharacterId, request.friendId);

                        this.gnServer.sendEventTo(friendPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                    }
                }
                else {
                    characterPlayer.setPlayerFriend(request.friendId, request.catalogId, <number>FriendStatus.SentRequestAndWaitingAccept, currentMilliseconds);
                    characterPlayer.saveAsync();

                    friendPlayer.setPlayerFriend(request.friendId, request.catalogId, <number>FriendStatus.WaitingAccept, currentMilliseconds);
                    friendPlayer.saveAsync();

                    {
                        let gnPlayerFriends = new GNArray();

                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                        gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.SentRequestAndWaitingAccept);
                        gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null, operationRequest.isEncrypted());

                        characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);
                        characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.CharacterId, request.characterId);

                        this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                    }

                    {
                        let gnPlayerFriends = new GNArray();

                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                        gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.WaitingAccept);
                        gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null, operationRequest.isEncrypted());

                        characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);
                        characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.CharacterId, request.friendId);

                        this.gnServer.sendEventTo(friendPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                    }
                }
            }
            else {
                let friendItem = characterPlayer.getPlayerFriend(request.friendId);

                if (friendItem.status == <number>FriendStatus.WaitingAccept) {
                    characterPlayer.setPlayerFriend(request.friendId, request.catalogId, <number>FriendStatus.Friend, currentMilliseconds);
                    characterPlayer.saveAsync();

                    friendPlayer.setPlayerFriend(request.friendId, request.catalogId, <number>FriendStatus.Friend, currentMilliseconds);
                    friendPlayer.saveAsync();

                    {
                        let gnPlayerFriends = new GNArray();

                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                        gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.Friend);
                        gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null, operationRequest.isEncrypted());

                        characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);
                        characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.CharacterId, request.characterId);

                        this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                    }

                    {
                        let gnPlayerFriends = new GNArray();

                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                        gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.Friend);
                        gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null, operationRequest.isEncrypted());

                        characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);
                        characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.CharacterId, request.friendId);

                        this.gnServer.sendEventTo(friendPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                    }
                }
                else {
                    if (friendItem.catalogId != request.catalogId) {
                        if (playerFriendCatalogSettingsItem.forceAcceptFriend) {
                            characterPlayer.setPlayerFriend(request.friendId, request.catalogId, <number>FriendStatus.Friend, currentMilliseconds);
                            characterPlayer.saveAsync();

                            friendPlayer.setPlayerFriend(request.friendId, request.catalogId, <number>FriendStatus.Friend, currentMilliseconds);
                            friendPlayer.saveAsync();

                            {
                                let gnPlayerFriends = new GNArray();

                                let gnPlayerFriend = new GNHashtable();
                                gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                                gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                                gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.Friend);
                                gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                                gnPlayerFriends.add(gnPlayerFriend);

                                let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null, operationRequest.isEncrypted());

                                characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);
                                characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.CharacterId, request.characterId);

                                this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                            }

                            {
                                let gnPlayerFriends = new GNArray();

                                let gnPlayerFriend = new GNHashtable();
                                gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                                gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                                gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.Friend);
                                gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                                gnPlayerFriends.add(gnPlayerFriend);

                                let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null, operationRequest.isEncrypted());

                                characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);
                                characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.CharacterId, request.friendId);

                                this.gnServer.sendEventTo(friendPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                            }
                        }
                        else {
                            characterPlayer.setPlayerFriend(request.friendId, request.catalogId, <number>FriendStatus.SentRequestAndWaitingAccept, currentMilliseconds);
                            characterPlayer.saveAsync();

                            friendPlayer.setPlayerFriend(request.friendId, request.catalogId, <number>FriendStatus.WaitingAccept, currentMilliseconds);
                            friendPlayer.saveAsync();

                            {
                                let gnPlayerFriends = new GNArray();

                                let gnPlayerFriend = new GNHashtable();
                                gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                                gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                                gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.SentRequestAndWaitingAccept);
                                gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                                gnPlayerFriends.add(gnPlayerFriend);

                                let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null, operationRequest.isEncrypted());

                                characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);
                                characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.CharacterId, request.characterId);

                                this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                            }

                            {
                                let gnPlayerFriends = new GNArray();

                                let gnPlayerFriend = new GNHashtable();
                                gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                                gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                                gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.WaitingAccept);
                                gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                                gnPlayerFriends.add(gnPlayerFriend);

                                let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null, operationRequest.isEncrypted());

                                characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);
                                characterPlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.CharacterId, request.friendId);

                                this.gnServer.sendEventTo(friendPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                            }
                        }
                    }
                }
            }
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_AddPlayerFriend", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
