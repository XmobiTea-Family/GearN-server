import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { FriendStatus } from "./../../../../../GN-common/constant/enumType/FriendStatus";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";
import { OperationEvent } from "./../../../../../GN-common/entity/operationEvent/OperationEvent";
import { EventCode } from "./../../../../../GN-common/constant/EventCode";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";

class AddPlayerFriendOperationRequest extends OperationRequest {
    // Stores the character ID value used by this instance.
    @StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
    public characterId: string;

    // Stores the friend ID value used by this instance.
    @StringDataMember({ code: ParameterCode.FriendId, minLength: 11, maxLength: 11, mustNonNull: true })
    public friendId: string;

    // Stores the catalog ID value used by this instance.
    @StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true })
    public catalogId: string;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerAddPlayerFriendOperationRequest extends AddPlayerFriendOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminAddPlayerFriendOperationRequest extends ServerAddPlayerFriendOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class AddPlayerFriendRequestHandler extends CharacterPlayerBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.AddPlayerFriend;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return AddPlayerFriendOperationRequest;
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

        // Tracks whether method is allowed.
        let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.addPlayerFriend);

        if (!allowMethod) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                characterId: request.characterId,
                friendId: request.friendId,
                catalogId: request.catalogId,
            },
            SecretRole.Client,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the server handle workflow asynchronously.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the request value used in the current execution flow.
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerAddPlayerFriendOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.addPlayerFriend.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                characterId: request.characterId,
                friendId: request.friendId,
                catalogId: request.catalogId,
            },
            SecretRole.Server,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the admin handle workflow asynchronously.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the request value used in the current execution flow.
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminAddPlayerFriendOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().characterPlayer.addPlayerFriend.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                characterId: request.characterId,
                friendId: request.friendId,
                catalogId: request.catalogId,
            },
            SecretRole.Admin,
            secretInfo,
            operationRequest,
        );
    }

    /**
     * Executes the execute workflow asynchronously.
     * @param request Provides the request value used by this operation.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async execute(request: { characterId: string; friendId: string; catalogId: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_AddPlayerFriend", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the resolved character player settings instance for the current execution flow.
        let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
        // Stores the player friend catalog settings item value used in the current execution flow.
        let playerFriendCatalogSettingsItem = characterPlayerSettings.playerFriendCatalogSettings.find((x) => x.catalogId == request.catalogId);

        if (playerFriendCatalogSettingsItem == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CatalogIdNotFound);

            return operationResponse;
        }

        if (request.characterId != request.friendId) {
            // Stores the character player find options value used in the current execution flow.
            let characterPlayerFindOptions: CharacterPlayerFindOptions = {
                playerFriends: true,
                owner: true,
                playerBan: true,
                removeStatus: true,
            };

            // Stores the character player value used in the current execution flow.
            let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

            if (characterPlayer == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
                return operationResponse;
            }

            // Stores the current milliseconds value used in the current execution flow.
            let currentMilliseconds = xDatetime.getCurrentMilliseconds();

            if (role == SecretRole.Client) {
                // Stores the character ban value used in the current execution flow.
                let playerBan = characterPlayer.getPlayerBan();

                if (playerBan.tsExpire != 0) {
                    if (playerBan.tsExpire == -1 || playerBan.tsExpire > currentMilliseconds) {
                        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.PlayerBan);
                        operationResponse.setDebugMessage("CharacterPlayer is banned, reason " + playerBan.reason);

                        return operationResponse;
                    }
                }

                let removeStatus = characterPlayer.getRemoveStatus();

                if (removeStatus.tsRemove != 0) {
                    operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
                    operationResponse.setDebugMessage("CharacterPlayer is removed, reason " + removeStatus.reason);

                    return operationResponse;
                }
            }

            // Stores the friend player value used in the current execution flow.
            let friendPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(request.friendId, secretInfo.getGameId(), characterPlayerFindOptions);

            if (friendPlayer == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
                return operationResponse;
            }

            if (!characterPlayer.hasPlayerFriend(request.friendId)) {
                if (playerFriendCatalogSettingsItem.forceAcceptFriend) {
                    const session = this.gnServer.getDatabase().startSession();

                    try {
                        session.startTransaction();

                        characterPlayer.setPlayerFriend(request.friendId, request.catalogId, FriendStatus.Friend, currentMilliseconds);
                        await characterPlayer.saveAsync(session);

                        friendPlayer.setPlayerFriend(request.characterId, request.catalogId, FriendStatus.Friend, currentMilliseconds);
                        await friendPlayer.saveAsync(session);

                        await session.commitTransaction();
                    } catch (err) {
                        await session.abortTransaction();

                        Debug.logError(err);

                        throw err;
                    } finally {
                        await session.endSession();
                    }

                    {
                        // Stores the GearN player friends value used in the current execution flow.
                        let gnPlayerFriends = new GNArray();

                        // Stores the GearN player friend value used in the current execution flow.
                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(ParameterCode.FriendId, request.friendId);
                        gnPlayerFriend.add(ParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(ParameterCode.Status, FriendStatus.Friend);
                        gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        // Stores the character player friend update operation event value used in the current execution flow.
                        let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null);

                        characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.PlayerFriends, gnPlayerFriends);
                        characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.characterId);

                        this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                    }

                    {
                        // Stores the GearN player friends value used in the current execution flow.
                        let gnPlayerFriends = new GNArray();

                        // Stores the GearN player friend value used in the current execution flow.
                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(ParameterCode.FriendId, request.characterId);
                        gnPlayerFriend.add(ParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(ParameterCode.Status, FriendStatus.Friend);
                        gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        // Stores the character player friend update operation event value used in the current execution flow.
                        let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null);

                        characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.PlayerFriends, gnPlayerFriends);
                        characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.friendId);

                        this.gnServer.sendEventTo(friendPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                    }
                } else {
                    const session = this.gnServer.getDatabase().startSession();

                    try {
                        session.startTransaction();

                        characterPlayer.setPlayerFriend(request.friendId, request.catalogId, FriendStatus.SentRequestAndWaitingAccept, currentMilliseconds);
                        await characterPlayer.saveAsync(session);

                        friendPlayer.setPlayerFriend(request.characterId, request.catalogId, FriendStatus.WaitingAccept, currentMilliseconds);
                        await friendPlayer.saveAsync(session);

                        await session.commitTransaction();
                    } catch (err) {
                        await session.abortTransaction();

                        Debug.logError(err);

                        throw err;
                    } finally {
                        await session.endSession();
                    }

                    {
                        // Stores the GearN player friends value used in the current execution flow.
                        let gnPlayerFriends = new GNArray();

                        // Stores the GearN player friend value used in the current execution flow.
                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(ParameterCode.FriendId, request.friendId);
                        gnPlayerFriend.add(ParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(ParameterCode.Status, FriendStatus.SentRequestAndWaitingAccept);
                        gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        // Stores the character player friend update operation event value used in the current execution flow.
                        let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null);

                        characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.PlayerFriends, gnPlayerFriends);
                        characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.characterId);

                        this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                    }

                    {
                        // Stores the GearN player friends value used in the current execution flow.
                        let gnPlayerFriends = new GNArray();

                        // Stores the GearN player friend value used in the current execution flow.
                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(ParameterCode.FriendId, request.characterId);
                        gnPlayerFriend.add(ParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(ParameterCode.Status, FriendStatus.WaitingAccept);
                        gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        // Stores the character player friend update operation event value used in the current execution flow.
                        let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null);

                        characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.PlayerFriends, gnPlayerFriends);
                        characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.friendId);

                        this.gnServer.sendEventTo(friendPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                    }
                }
            } else {
                // Stores the friend item value used in the current execution flow.
                let friendItem = characterPlayer.getPlayerFriend(request.friendId);

                if (friendItem.status == FriendStatus.WaitingAccept) {
                    const session = this.gnServer.getDatabase().startSession();

                    try {
                        session.startTransaction();

                        characterPlayer.setPlayerFriend(request.friendId, request.catalogId, FriendStatus.Friend, currentMilliseconds);
                        await characterPlayer.saveAsync(session);

                        friendPlayer.setPlayerFriend(request.characterId, request.catalogId, FriendStatus.Friend, currentMilliseconds);
                        await friendPlayer.saveAsync(session);

                        await session.commitTransaction();
                    } catch (err) {
                        await session.abortTransaction();

                        Debug.logError(err);

                        throw err;
                    } finally {
                        await session.endSession();
                    }

                    {
                        // Stores the GearN player friends value used in the current execution flow.
                        let gnPlayerFriends = new GNArray();

                        // Stores the GearN player friend value used in the current execution flow.
                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(ParameterCode.FriendId, request.friendId);
                        gnPlayerFriend.add(ParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(ParameterCode.Status, FriendStatus.Friend);
                        gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        // Stores the character player friend update operation event value used in the current execution flow.
                        let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null);

                        characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.PlayerFriends, gnPlayerFriends);
                        characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.characterId);

                        this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                    }

                    {
                        // Stores the GearN player friends value used in the current execution flow.
                        let gnPlayerFriends = new GNArray();

                        // Stores the GearN player friend value used in the current execution flow.
                        let gnPlayerFriend = new GNHashtable();
                        gnPlayerFriend.add(ParameterCode.FriendId, request.characterId);
                        gnPlayerFriend.add(ParameterCode.CatalogId, request.catalogId);
                        gnPlayerFriend.add(ParameterCode.Status, FriendStatus.Friend);
                        gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
                        gnPlayerFriends.add(gnPlayerFriend);

                        // Stores the character player friend update operation event value used in the current execution flow.
                        let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null);

                        characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.PlayerFriends, gnPlayerFriends);
                        characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.friendId);

                        this.gnServer.sendEventTo(friendPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                    }
                } else {
                    if (friendItem.catalogId != request.catalogId) {
                        if (playerFriendCatalogSettingsItem.forceAcceptFriend) {
                            const session = this.gnServer.getDatabase().startSession();

                            try {
                                session.startTransaction();

                                characterPlayer.setPlayerFriend(request.friendId, request.catalogId, FriendStatus.Friend, currentMilliseconds);
                                await characterPlayer.saveAsync(session);

                                friendPlayer.setPlayerFriend(request.characterId, request.catalogId, FriendStatus.Friend, currentMilliseconds);
                                await friendPlayer.saveAsync(session);

                                await session.commitTransaction();
                            } catch (err) {
                                await session.abortTransaction();

                                Debug.logError(err);

                                throw err;
                            } finally {
                                await session.endSession();
                            }

                            {
                                // Stores the GearN player friends value used in the current execution flow.
                                let gnPlayerFriends = new GNArray();

                                // Stores the GearN player friend value used in the current execution flow.
                                let gnPlayerFriend = new GNHashtable();
                                gnPlayerFriend.add(ParameterCode.FriendId, request.friendId);
                                gnPlayerFriend.add(ParameterCode.CatalogId, request.catalogId);
                                gnPlayerFriend.add(ParameterCode.Status, FriendStatus.Friend);
                                gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
                                gnPlayerFriends.add(gnPlayerFriend);

                                // Stores the character player friend update operation event value used in the current execution flow.
                                let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null);

                                characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.PlayerFriends, gnPlayerFriends);
                                characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.characterId);

                                this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                            }

                            {
                                // Stores the GearN player friends value used in the current execution flow.
                                let gnPlayerFriends = new GNArray();

                                // Stores the GearN player friend value used in the current execution flow.
                                let gnPlayerFriend = new GNHashtable();
                                gnPlayerFriend.add(ParameterCode.FriendId, request.characterId);
                                gnPlayerFriend.add(ParameterCode.CatalogId, request.catalogId);
                                gnPlayerFriend.add(ParameterCode.Status, FriendStatus.Friend);
                                gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
                                gnPlayerFriends.add(gnPlayerFriend);

                                // Stores the character player friend update operation event value used in the current execution flow.
                                let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null);

                                characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.PlayerFriends, gnPlayerFriends);
                                characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.friendId);

                                this.gnServer.sendEventTo(friendPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                            }
                        } else {
                            const session = this.gnServer.getDatabase().startSession();

                            try {
                                session.startTransaction();

                                characterPlayer.setPlayerFriend(request.friendId, request.catalogId, FriendStatus.SentRequestAndWaitingAccept, currentMilliseconds);
                                await characterPlayer.saveAsync(session);

                                friendPlayer.setPlayerFriend(request.characterId, request.catalogId, FriendStatus.WaitingAccept, currentMilliseconds);
                                await friendPlayer.saveAsync(session);

                                await session.commitTransaction();
                            } catch (err) {
                                await session.abortTransaction();

                                Debug.logError(err);

                                throw err;
                            } finally {
                                await session.endSession();
                            }

                            {
                                // Stores the GearN player friends value used in the current execution flow.
                                let gnPlayerFriends = new GNArray();

                                // Stores the GearN player friend value used in the current execution flow.
                                let gnPlayerFriend = new GNHashtable();
                                gnPlayerFriend.add(ParameterCode.FriendId, request.friendId);
                                gnPlayerFriend.add(ParameterCode.CatalogId, request.catalogId);
                                gnPlayerFriend.add(ParameterCode.Status, FriendStatus.SentRequestAndWaitingAccept);
                                gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
                                gnPlayerFriends.add(gnPlayerFriend);

                                // Stores the character player friend update operation event value used in the current execution flow.
                                let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null);

                                characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.PlayerFriends, gnPlayerFriends);
                                characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.characterId);

                                this.gnServer.sendEventTo(characterPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                            }

                            {
                                // Stores the GearN player friends value used in the current execution flow.
                                let gnPlayerFriends = new GNArray();

                                // Stores the GearN player friend value used in the current execution flow.
                                let gnPlayerFriend = new GNHashtable();
                                gnPlayerFriend.add(ParameterCode.FriendId, request.characterId);
                                gnPlayerFriend.add(ParameterCode.CatalogId, request.catalogId);
                                gnPlayerFriend.add(ParameterCode.Status, FriendStatus.WaitingAccept);
                                gnPlayerFriend.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);
                                gnPlayerFriends.add(gnPlayerFriend);

                                // Stores the character player friend update operation event value used in the current execution flow.
                                let characterPlayerFriendUpdateOperationEvent = new OperationEvent(EventCode.OnCharacterPlayerFriendUpdate, null);

                                characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.PlayerFriends, gnPlayerFriends);
                                characterPlayerFriendUpdateOperationEvent.setParameter(ParameterCode.CharacterId, request.friendId);

                                this.gnServer.sendEventTo(friendPlayer.getOwner().id, characterPlayerFriendUpdateOperationEvent);
                            }
                        }
                    }
                }
            }
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_AddPlayerFriend", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
