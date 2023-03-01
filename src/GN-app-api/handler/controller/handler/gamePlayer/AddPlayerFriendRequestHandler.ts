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
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { FriendStatus } from "./../../../../../GN-common/constant/enumType/FriendStatus";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { OperationEvent } from "./../../../../../GN-common/entity/operationEvent/OperationEvent";
import { EventCode } from "./../../../../../GN-common/constant/EventCode";

class AddPlayerFriendOperationRequest extends OperationRequest {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
    userId?: string;

    @StringDataMember({ code: GNParameterCode.FriendId, minLength: 10, maxLength: 10, mustNonNull: true })
    friendId: string;

    @StringDataMember({ code: GNParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true })
    catalogId: string;

    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerAddPlayerFriendOperationRequest extends AddPlayerFriendOperationRequest {
    @StringDataMember({ code: GNParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
    declare userId: string;

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

export class AddPlayerFriendRequestHandler extends GamePlayerBaseRequestHandler {
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

        if (!request.userId) {
            if (!secretInfo.getPermission().gamePlayer.addPlayerFriend.selfEnable) {
                return this.newOperationNotAllowError(request);
            }

            request.userId = authInfo.getUserId();
        }
        else if (request.userId != authInfo.getUserId()) {
            if (!secretInfo.getPermission().gamePlayer.addPlayerFriend.otherSelfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }
        else {
            if (!secretInfo.getPermission().gamePlayer.addPlayerFriend.selfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }

        return this.execute({
            userId: request.userId,
            friendId: request.friendId,
            catalogId: request.catalogId,
        }, secretInfo, operationRequest);
    }

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerAddPlayerFriendOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().gamePlayer.addPlayerFriend.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: request.userId,
            friendId: request.friendId,
            catalogId: request.catalogId,
        }, secretInfo, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminAddPlayerFriendOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().gamePlayer.addPlayerFriend.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute({
            userId: request.userId,
            friendId: request.friendId,
            catalogId: request.catalogId,
        }, secretInfo, operationRequest);
    }

    private async execute(request: { userId: string, friendId: string, catalogId: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_AddPlayerFriend", request, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
        operationResponse.setReturnCode(ReturnCode.Ok);

        let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
        let playerFriendCatalogSettingsItem = gamePlayerSettings.playerFriendCatalogSettings.find(x => x.catalogId == request.catalogId);

        if (playerFriendCatalogSettingsItem == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.CatalogIdNotFound);

            return operationResponse;
        }

        if (request.userId != request.friendId) {
            let gamePlayerFindOptions: GamePlayerFindOptions = {
                playerFriends: true
            }

            let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);
            let friendPlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.friendId, secretInfo.getGameId(), gamePlayerFindOptions);

            if (gamePlayer == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GamePlayerNotFound);
                return operationResponse;
            }

            if (friendPlayer == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.GamePlayerNotFound);
                return operationResponse;
            }

            operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

            let currentMilliseconds = xDatetime.getCurrentMilliseconds();

            if (!gamePlayer.hasPlayerFriend(request.friendId)) {
                if (playerFriendCatalogSettingsItem.forceAcceptFriend) {
                    gamePlayer.setPlayerFriend(request.friendId, request.catalogId, <number>FriendStatus.Friend, currentMilliseconds);
                    gamePlayer.saveAsync();

                    friendPlayer.setPlayerFriend(request.userId, request.catalogId, <number>FriendStatus.Friend, currentMilliseconds);
                    friendPlayer.saveAsync();

                    {
                        let gnPlayerFriends = new GNArray();

                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                        gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.Friend);
                        gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        let gamePlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null, operationRequest.isEncrypted());

                        gamePlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);

                        this.gnServer.sendEventTo(request.userId, gamePlayerFriendUpdateOperationEvent);
                    }

                    {
                        let gnPlayerFriends = new GNArray();

                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(GNParameterCode.FriendId, request.userId);
                        gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.Friend);
                        gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        let gamePlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null, operationRequest.isEncrypted());

                        gamePlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);

                        this.gnServer.sendEventTo(request.friendId, gamePlayerFriendUpdateOperationEvent);
                    }
                }
                else {
                    gamePlayer.setPlayerFriend(request.friendId, request.catalogId, <number>FriendStatus.SentRequestAndWaitingAccept, currentMilliseconds);
                    gamePlayer.saveAsync();

                    friendPlayer.setPlayerFriend(request.userId, request.catalogId, <number>FriendStatus.WaitingAccept, currentMilliseconds);
                    friendPlayer.saveAsync();

                    {
                        let gnPlayerFriends = new GNArray();

                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                        gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.SentRequestAndWaitingAccept);
                        gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        let gamePlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null, operationRequest.isEncrypted());

                        gamePlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);

                        this.gnServer.sendEventTo(request.userId, gamePlayerFriendUpdateOperationEvent);
                    }

                    {
                        let gnPlayerFriends = new GNArray();

                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(GNParameterCode.FriendId, request.userId);
                        gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.WaitingAccept);
                        gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        let gamePlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null, operationRequest.isEncrypted());

                        gamePlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);

                        this.gnServer.sendEventTo(request.friendId, gamePlayerFriendUpdateOperationEvent);
                    }
                }
            }
            else {
                let friendItem = gamePlayer.getPlayerFriend(request.friendId);

                if (friendItem.status == <number>FriendStatus.WaitingAccept) {
                    gamePlayer.setPlayerFriend(request.friendId, request.catalogId, <number>FriendStatus.Friend, currentMilliseconds);
                    gamePlayer.saveAsync();

                    friendPlayer.setPlayerFriend(request.userId, request.catalogId, <number>FriendStatus.Friend, currentMilliseconds);
                    friendPlayer.saveAsync();

                    {
                        let gnPlayerFriends = new GNArray();

                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                        gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.Friend);
                        gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        let gamePlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null, operationRequest.isEncrypted());

                        gamePlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);

                        this.gnServer.sendEventTo(request.userId, gamePlayerFriendUpdateOperationEvent);
                    }

                    {
                        let gnPlayerFriends = new GNArray();

                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(GNParameterCode.FriendId, request.userId);
                        gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.Friend);
                        gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        let gamePlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null, operationRequest.isEncrypted());

                        gamePlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);

                        this.gnServer.sendEventTo(request.friendId, gamePlayerFriendUpdateOperationEvent);
                    }
                }
                else {
                    if (friendItem.catalogId != request.catalogId) {
                        if (playerFriendCatalogSettingsItem.forceAcceptFriend) {
                            gamePlayer.setPlayerFriend(request.friendId, request.catalogId, <number>FriendStatus.Friend, currentMilliseconds);
                            gamePlayer.saveAsync();

                            friendPlayer.setPlayerFriend(request.userId, request.catalogId, <number>FriendStatus.Friend, currentMilliseconds);
                            friendPlayer.saveAsync();

                            {
                                let gnPlayerFriends = new GNArray();

                                let gnPlayerFriend = new GNHashtable();
                                gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                                gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                                gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.Friend);
                                gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                                gnPlayerFriends.add(gnPlayerFriend);

                                let gamePlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null, operationRequest.isEncrypted());

                                gamePlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);

                                this.gnServer.sendEventTo(request.userId, gamePlayerFriendUpdateOperationEvent);
                            }

                            {
                                let gnPlayerFriends = new GNArray();

                                let gnPlayerFriend = new GNHashtable();
                                gnPlayerFriend.add(GNParameterCode.FriendId, request.userId);
                                gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                                gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.Friend);
                                gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                                gnPlayerFriends.add(gnPlayerFriend);

                                let gamePlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null, operationRequest.isEncrypted());

                                gamePlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);

                                this.gnServer.sendEventTo(request.friendId, gamePlayerFriendUpdateOperationEvent);
                            }
                        }
                        else {
                            gamePlayer.setPlayerFriend(request.friendId, request.catalogId, <number>FriendStatus.SentRequestAndWaitingAccept, currentMilliseconds);
                            gamePlayer.saveAsync();

                            friendPlayer.setPlayerFriend(request.userId, request.catalogId, <number>FriendStatus.WaitingAccept, currentMilliseconds);
                            friendPlayer.saveAsync();

                            {
                                let gnPlayerFriends = new GNArray();

                                let gnPlayerFriend = new GNHashtable();
                                gnPlayerFriend.add(GNParameterCode.FriendId, request.friendId);
                                gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                                gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.SentRequestAndWaitingAccept);
                                gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                                gnPlayerFriends.add(gnPlayerFriend);

                                let gamePlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null, operationRequest.isEncrypted());

                                gamePlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);

                                this.gnServer.sendEventTo(request.userId, gamePlayerFriendUpdateOperationEvent);
                            }

                            {
                                let gnPlayerFriends = new GNArray();

                                let gnPlayerFriend = new GNHashtable();
                                gnPlayerFriend.add(GNParameterCode.FriendId, request.userId);
                                gnPlayerFriend.add(GNParameterCode.CatalogId, request.catalogId);
                                gnPlayerFriend.add(GNParameterCode.Status, <number>FriendStatus.WaitingAccept);
                                gnPlayerFriend.add(GNParameterCode.TsLastStatusUpdate, currentMilliseconds);
                                gnPlayerFriends.add(gnPlayerFriend);

                                let gamePlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnGamePlayerFriendUpdate, null, operationRequest.isEncrypted());

                                gamePlayerFriendUpdateOperationEvent.setParameter(GNParameterCode.PlayerFriends, gnPlayerFriends);

                                this.gnServer.sendEventTo(request.friendId, gamePlayerFriendUpdateOperationEvent);
                            }
                        }
                    }
                }
            }
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, GNErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_AddPlayerFriend", request, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
