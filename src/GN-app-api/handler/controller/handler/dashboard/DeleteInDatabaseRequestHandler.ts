import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { MasterPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MasterPlayer";
import { GamePlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/GamePlayer";
import { CharacterPlayer } from "./../../../../../GN-library/xdatabase/lib/entity/pro/CharacterPlayer";
import { Group } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Group";
import { Inventory } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Inventory";
import { StoreInventory } from "./../../../../../GN-library/xdatabase/lib/entity/pro/StoreInventory";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import * as mongodb from "mongodb";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";
import { GamePlayerBase } from "./../../../../../GN-library/xdatabase/lib/entity/pro/GamePlayerBase";

interface MasterPlayerDelete {
    masterPlayer: MasterPlayer;
    gamePlayersDelete: Array<GamePlayerDelete>;

    currencyLogResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    statisticsLogResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    statisticsBackupResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
}

interface GamePlayerDelete {
    gameId: string;

    gamePlayer: GamePlayer;
    friendPlayers: Array<GamePlayer>;

    characterPlayersDelete: Array<CharacterPlayerDelete>;
    groups: Array<Group>;
    inventoriesDelete: Array<InventoryDelete>;

    groupMessageResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    currencyLogResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    statisticsLogResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    statisticsBackupResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    storeInventoryStoreLogResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
}

interface CharacterPlayerDelete {
    gameId: string;

    characterPlayer: CharacterPlayer;
    friendPlayers: Array<CharacterPlayer>;

    groups: Array<Group>;
    inventoriesDelete: Array<InventoryDelete>;

    groupMessageResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    currencyLogResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    statisticsLogResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    statisticsBackupResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    storeInventoryStoreLogResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
}

interface GroupDelete {
    gameId: string;

    group: Group;

    members: Array<GamePlayerBase>;
    inventoriesDelete: Array<InventoryDelete>;

    groupMessageResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    currencyLogResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    statisticsLogResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    statisticsBackupResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    storeInventoryStoreLogResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
}

interface InventoryDelete {
    gameId: string;

    inventory: Inventory;

    statisticsLogResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
    statisticsBackupResults: mongodb.FindCursor<mongodb.WithId<mongodb.BSON.Document>>;
}

interface StoreInventoryDelete {
    gameId: string;

    storeInventory: StoreInventory;
}

class DeleteInDatabaseOperationRequest extends OperationRequest {
    // Stores the type value used by this instance.
    @NumberDataMember({ code: ParameterCode.Type, mustInt: true })
    public type: number;

    // Stores the ID value used by this instance.
    @StringDataMember({ code: ParameterCode.Id, minLength: 2, maxLength: 32 })
    public id: string;

    // Stores the game ID value used by this instance.
    @StringDataMember({ code: ParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
    public gameId: string;

    // Stores the log value used by this instance.
    @StringDataMember({ code: ParameterCode.Log, minLength: 1, maxLength: 256, mustNonNull: true, isOptional: true })
    public log?: string;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class DeleteInDatabaseRequestHandler extends RequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.DeleteInDatabase;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return DeleteInDatabaseOperationRequest;
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

        if (!secretInfo.getPermission().dashboard.deleteInDatabase.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                id: request.id,
                type: request.type,
                gameId: request.gameId,
                log: request.log,
            },
            SecretRole.Client,
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
    private async execute(request: { id: string; type: number; gameId: string; log: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_DeleteInDatabase", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        if (request.type == OwnerType.MasterPlayer) {
            // Xoa toan bo du lieu nguoi choi, gom data co trong game data
            const masterPlayerDelete = await this.getMasterPlayerDelete(request.id);

            if (masterPlayerDelete == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
                return operationResponse;
            }

            const masterPlayer = masterPlayerDelete.masterPlayer;

            let result: any;

            const session = this.gnServer.getDatabase().startSession();

            try {
                session.startTransaction();

                // Stores the result value used in the current execution flow.
                result = {
                    type: "MasterPlayer",
                    log: request.log,
                    tsCreate: xDatetime.getCurrentMilliseconds(),
                    objs: await this.deleteMasterPlayer(masterPlayerDelete, session),
                };

                await this.gnServer.getDatabase().systemCollection("MasterPlayer").deleteOne({ userId: masterPlayer.getUserId() }, { session: session });

                await session.commitTransaction();
            } catch (err) {
                await session.abortTransaction();

                Debug.logError(err);

                throw err;
            } finally {
                await session.endSession();
            }

            this.gnServer.getDatabase().logRuntimeCollection("DeleteInDatabase.Log").insertOne(result);
        } else if (request.type == OwnerType.GamePlayer) {
            // Stores the game player value used in the current execution flow.
            const gamePlayerDelete = await this.getGamePlayerDelete(request.id, request.gameId);

            if (gamePlayerDelete == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
                return operationResponse;
            }

            const gamePlayer = gamePlayerDelete.gamePlayer;

            let result: any;

            const session = this.gnServer.getDatabase().startSession();

            try {
                session.startTransaction();

                // Stores the result value used in the current execution flow.
                result = {
                    type: "GamePlayer",
                    gameId: request.gameId,
                    log: request.log,
                    tsCreate: xDatetime.getCurrentMilliseconds(),
                    objs: await this.deleteGamePlayer(gamePlayerDelete, session),
                };

                await this.gnServer.getDatabase().systemGameCollection("GamePlayer", request.gameId).deleteOne({ userId: gamePlayer.getUserId() }, { session: session });

                await session.commitTransaction();
            } catch (err) {
                await session.abortTransaction();

                Debug.logError(err);

                throw err;
            } finally {
                await session.endSession();
            }

            this.gnServer.getDatabase().logRuntimeCollection("DeleteInDatabase.Log").insertOne(result);
        } else if (request.type == OwnerType.CharacterPlayer) {
            // Stores the character player value used in the current execution flow.
            const characterPlayerDelete = await this.getCharacterPlayerDelete(request.id, request.gameId, []);

            if (characterPlayerDelete == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
                return operationResponse;
            }

            const characterPlayer = characterPlayerDelete.characterPlayer;

            let result: any;

            const session = this.gnServer.getDatabase().startSession();

            try {
                session.startTransaction();

                // Stores the result value used in the current execution flow.
                result = {
                    type: "CharacterPlayer",
                    gameId: request.gameId,
                    log: request.log,
                    tsCreate: xDatetime.getCurrentMilliseconds(),
                    objs: await this.deleteCharacterPlayer(characterPlayerDelete, session),
                };

                await this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", request.gameId).deleteOne({ characterId: characterPlayer.getCharacterId() }, { session: session });

                // Stores the game player value used in the current execution flow.
                let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(characterPlayer.getOwner().id, request.gameId);
                if (gamePlayer != null) {
                    if (gamePlayer.hasPlayerCharacter(characterPlayer.getCharacterId())) {
                        gamePlayer.removePlayerCharacter(characterPlayer.getCharacterId());
                        await gamePlayer.saveAsync(session);
                    }
                }

                await session.commitTransaction();
            } catch (err) {
                await session.abortTransaction();

                Debug.logError(err);

                throw err;
            } finally {
                await session.endSession();
            }

            this.gnServer.getDatabase().logRuntimeCollection("DeleteInDatabase.Log").insertOne(result);
        } else if (request.type == OwnerType.Inventory) {
            // Stores the inventory value used in the current execution flow.
            const inventoryDelete = await this.getInventoryDelete(request.id, request.gameId);

            if (inventoryDelete == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
                return operationResponse;
            }

            const inventory = inventoryDelete.inventory;

            let result: any;

            const session = this.gnServer.getDatabase().startSession();

            try {
                session.startTransaction();

                // Stores the result value used in the current execution flow.
                result = {
                    type: "Inventory",
                    gameId: request.gameId,
                    log: request.log,
                    tsCreate: xDatetime.getCurrentMilliseconds(),
                    objs: await this.deleteInventory(inventoryDelete, session),
                };

                await this.gnServer.getDatabase().systemGameCollection("Inventory", request.gameId).deleteOne({ itemId: inventory.getItemId() }, { session: session });

                // Stores the owner value used in the current execution flow.
                let owner = inventory.getOwner();
                if (owner.type == OwnerType.GamePlayer) {
                    // Stores the game player value used in the current execution flow.
                    let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(inventory.getOwner().id, request.gameId);
                    if (gamePlayer != null) {
                        if (gamePlayer.hasPlayerInventory(inventory.getItemId())) {
                            gamePlayer.removePlayerInventory(inventory.getItemId());
                            await gamePlayer.saveAsync(session);
                        }
                    }
                } else if (owner.type == OwnerType.CharacterPlayer) {
                    // Stores the character player value used in the current execution flow.
                    let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(inventory.getOwner().id, request.gameId);
                    if (characterPlayer != null) {
                        if (characterPlayer.hasPlayerInventory(inventory.getItemId())) {
                            characterPlayer.removePlayerInventory(inventory.getItemId());
                            await characterPlayer.saveAsync(session);
                        }
                    }
                } else if (owner.type == OwnerType.Group) {
                    // Stores the group value used in the current execution flow.
                    let group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(inventory.getOwner().id, request.gameId);
                    if (group != null) {
                        if (group.hasGroupInventory(inventory.getItemId())) {
                            group.removeGroupInventory(inventory.getItemId());
                            await group.saveAsync(session);
                        }
                    }
                }

                await session.commitTransaction();
            } catch (err) {
                await session.abortTransaction();

                Debug.logError(err);

                throw err;
            } finally {
                await session.endSession();
            }

            this.gnServer.getDatabase().logRuntimeCollection("DeleteInDatabase.Log").insertOne(result);
        } else if (request.type == OwnerType.Group) {
            // Stores the group value used in the current execution flow.
            const groupDelete = await this.getGroupDelete(request.id, request.gameId);

            if (groupDelete == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
                return operationResponse;
            }

            const group = groupDelete.group;

            // Stores the group ID value used in the current execution flow.
            const groupId = group.getGroupId();

            let result: any;

            const session = this.gnServer.getDatabase().startSession();

            try {
                session.startTransaction();

                // Stores the result value used in the current execution flow.
                result = {
                    type: "Group",
                    gameId: request.gameId,
                    log: request.log,
                    tsCreate: xDatetime.getCurrentMilliseconds(),
                    objs: await this.deleteGroup(groupDelete, session),
                };

                await this.gnServer.getDatabase().systemGameCollection("Group", request.gameId).deleteOne({ groupId: groupId }, { session: session });

                await session.commitTransaction();
            } catch (err) {
                await session.abortTransaction();

                Debug.logError(err);

                throw err;
            } finally {
                await session.endSession();
            }

            this.gnServer.getDatabase().logRuntimeCollection("DeleteInDatabase.Log").insertOne(result);
        } else if (request.type == OwnerType.StoreInventory) {
            // Stores the store inventory value used in the current execution flow.
            const storeInventoryDelete = await this.getStoreInventoryDelete(request.id, request.gameId);

            if (storeInventoryDelete == null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
                return operationResponse;
            }

            const storeInventory = storeInventoryDelete.storeInventory;

            // Stores the group ID value used in the current execution flow.
            const storeId = storeInventory.getStoreId();

            let result: any;

            const session = this.gnServer.getDatabase().startSession();

            try {
                session.startTransaction();

                // Stores the result value used in the current execution flow.
                result = {
                    type: "StoreInventory",
                    gameId: request.gameId,
                    log: request.log,
                    tsCreate: xDatetime.getCurrentMilliseconds(),
                    objs: await this.deleteStoreInventory(storeInventoryDelete, session),
                };

                await this.gnServer.getDatabase().systemGameCollection("StoreInventory", request.gameId).deleteOne({ storeId: storeId }, { session: session });

                await session.commitTransaction();
            } catch (err) {
                await session.abortTransaction();

                Debug.logError(err);

                throw err;
            } finally {
                await session.endSession();
            }

            this.gnServer.getDatabase().logRuntimeCollection("DeleteInDatabase.Log").insertOne(result);
        } else {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.ItemNotFound);
            return operationResponse;
        }

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("dashboard_DeleteInDatabase", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }

    private async getMasterPlayerDelete(userId: string): Promise<MasterPlayerDelete> {
        // Xoa toan bo du lieu nguoi choi, gom data co trong game data
        const masterPlayer = await this.gnServer.getDatabase().masterPlayerRepository.loadMasterPlayerAsync(userId);

        if (masterPlayer == null) {
            return null;
        }

        const masterPlayerDelete: MasterPlayerDelete = {
            masterPlayer: masterPlayer,
            gamePlayersDelete: [],
            currencyLogResults: await this.gnServer.getDatabase().logRuntimeCollection("MasterPlayer.CurrencyLog").find({ userId: userId }),
            statisticsLogResults: await this.gnServer.getDatabase().logRuntimeCollection("MasterPlayer.StatisticsLog").find({ userId: userId }),
            statisticsBackupResults: await this.gnServer.getDatabase().runtimeCollection("MasterPlayer.StatisticsBackup").find({}),
        }

        const gameIds = this.gnServer.getGameIds();

        for (let i = 0; i < gameIds.length; i++) {
            const gameId = gameIds[i];

            const gamePlayerDelete = await this.getGamePlayerDelete(userId, gameId);

            if (gamePlayerDelete != null) {
                masterPlayerDelete.gamePlayersDelete.push(gamePlayerDelete);
            }
        }

        return masterPlayerDelete;
    }

    private async getGamePlayerDelete(userId: string, gameId: string): Promise<GamePlayerDelete> {
        const gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(userId, gameId);

        if (gamePlayer == null) {
            return null;
        }

        const groups: Group[] = [];

        const gamePlayerDelete: GamePlayerDelete = {
            gameId: gameId,
            gamePlayer: gamePlayer,
            friendPlayers: [],
            characterPlayersDelete: [],
            groups: [],
            inventoriesDelete: [],

            groupMessageResults: await this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId).find({ senderId: userId }),
            currencyLogResults: await this.gnServer.getDatabase().logRuntimeGameCollection("GamePlayer.CurrencyLog", gameId).find({ userId: userId }),
            statisticsLogResults: await this.gnServer.getDatabase().logRuntimeGameCollection("GamePlayer.StatisticsLog", gameId).find({ userId: userId }),
            statisticsBackupResults: await this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsBackup", gameId).find({}),
            storeInventoryStoreLogResults: await this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId).find({ id: userId })
        }

        {
            // Stores the player friends value used in the current execution flow.
            const playerFriends = gamePlayer.getAllPlayerFriends();

            for (let i = 0; i < playerFriends.length; i++) {
                // Stores the player friend value used in the current execution flow.
                const playerFriend = playerFriends[i];

                // Stores the friend player value used in the current execution flow.
                const friendPlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(playerFriend.friendId, gameId);
                if (friendPlayer != null) {
                    gamePlayerDelete.friendPlayers.push(friendPlayer);
                }
            }
        }

        {
            // Stores the player groups value used in the current execution flow.
            const playerGroups = gamePlayer.getAllPlayerGroups();

            for (let i = 0; i < playerGroups.length; i++) {
                // Stores the player group value used in the current execution flow.
                const playerGroup = playerGroups[i];

                // Stores the group value used in the current execution flow.
                const group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(playerGroup.groupId, gameId);

                if (group != null) {
                    gamePlayerDelete.groups.push(group);

                    if (!groups.includes(group)) groups.push(group);
                }
            }
        }

        {
            // Stores the player characters value used in the current execution flow.
            const playerCharacters = gamePlayer.getAllPlayerCharacters();

            for (let i = 0; i < playerCharacters.length; i++) {
                // Stores the player character value used in the current execution flow.
                const playerCharacter = playerCharacters[i];

                const characterPlayerDelete = await this.getCharacterPlayerDelete(playerCharacter.characterId, gameId, groups);

                if (characterPlayerDelete != null) {
                    gamePlayerDelete.characterPlayersDelete.push(characterPlayerDelete);
                }
            }
        }

        {
            // Stores the player inventories value used in the current execution flow.
            const playerInventories = gamePlayer.getAllPlayerInventories();

            for (let i = 0; i < playerInventories.length; i++) {
                // Stores the player inventory value used in the current execution flow.
                const playerInventory = playerInventories[i];

                const inventoryDelete = await this.getInventoryDelete(playerInventory.itemId, gameId);

                if (inventoryDelete != null) {
                    gamePlayerDelete.inventoriesDelete.push(inventoryDelete);
                }
            }
        }

        return gamePlayerDelete;
    }

    private async getCharacterPlayerDelete(characterId: string, gameId: string, groups: Group[]): Promise<CharacterPlayerDelete> {
        // Stores the character player value used in the current execution flow.
        const characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(characterId, gameId);

        if (characterPlayer == null) {
            return null;
        }

        const characterPlayerDelete: CharacterPlayerDelete = {
            gameId: gameId,
            characterPlayer: characterPlayer,
            friendPlayers: [],
            groups: [],
            inventoriesDelete: [],
            groupMessageResults: await this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId).find({ senderId: characterPlayer.getCharacterId() }),
            currencyLogResults: await this.gnServer.getDatabase().logRuntimeGameCollection("CharacterPlayer.CurrencyLog", gameId).find({ characterId: characterPlayer.getCharacterId() }),
            statisticsLogResults: await this.gnServer.getDatabase().logRuntimeGameCollection("CharacterPlayer.StatisticsLog", gameId).find({ characterId: characterPlayer.getCharacterId() }),
            statisticsBackupResults: await this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsBackup", gameId).find({}),
            storeInventoryStoreLogResults: await this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId).find({ id: characterPlayer.getCharacterId() })
        }

        {
            // Stores the player friends value used in the current execution flow.
            const playerFriends = characterPlayer.getAllPlayerFriends();

            for (let i = 0; i < playerFriends.length; i++) {
                // Stores the player friend value used in the current execution flow.
                const playerFriend = playerFriends[i];

                // Stores the friend player value used in the current execution flow.
                const friendPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(playerFriend.friendId, gameId)
                if (friendPlayer != null) {
                    characterPlayerDelete.friendPlayers.push(friendPlayer);
                }
            }
        }

        {
            // Stores the player groups value used in the current execution flow.
            const playerGroups = characterPlayer.getAllPlayerGroups();

            for (let i = 0; i < playerGroups.length; i++) {
                // Stores the player group value used in the current execution flow.
                const playerGroup = playerGroups[i];

                // Stores the group value used in the current execution flow.
                const group = groups.find(x => x.getGroupId() == playerGroup.groupId) ?? await this.gnServer.getDatabase().groupRepository.loadGroupAsync(playerGroup.groupId, gameId);

                if (group != null) {
                    characterPlayerDelete.groups.push(group);

                    if (!groups.includes(group)) groups.push(group);
                }
            }
        }

        {
            // Stores the player inventories value used in the current execution flow.
            const playerInventories = characterPlayer.getAllPlayerInventories();

            for (let i = 0; i < playerInventories.length; i++) {
                // Stores the player inventory value used in the current execution flow.
                const playerInventory = playerInventories[i];

                const inventoryDelete = await this.getInventoryDelete(playerInventory.itemId, gameId);

                if (inventoryDelete != null) {
                    characterPlayerDelete.inventoriesDelete.push(inventoryDelete);
                }
            }
        }

        return characterPlayerDelete;
    }

    private async getInventoryDelete(itemId: string, gameId: string): Promise<InventoryDelete> {
        // Stores the inventory value used in the current execution flow.
        const inventory = await this.gnServer.getDatabase().inventoryRepository.loadInventoryAsync(itemId, gameId);

        if (inventory == null) {
            return null;
        }

        const inventoryDelete: InventoryDelete = {
            gameId: gameId,
            inventory: inventory,

            statisticsLogResults: await this.gnServer.getDatabase().logRuntimeGameCollection("Inventory.StatisticsLog", gameId).find({ itemId: inventory.getItemId() }),
            statisticsBackupResults: await this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsBackup", gameId).find({}),
        }

        return inventoryDelete;
    }

    private async getGroupDelete(groupId: string, gameId: string): Promise<GroupDelete> {
        const group = await this.gnServer.getDatabase().groupRepository.loadGroupAsync(groupId, gameId);

        if (group == null) {
            return null;
        }

        const groupDelete: GroupDelete = {
            gameId: gameId,
            group: group,
            members: [],
            inventoriesDelete: [],

            groupMessageResults: await this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId).find({ groupId: groupId }),
            currencyLogResults: await this.gnServer.getDatabase().logRuntimeGameCollection("Group.CurrencyLog", gameId).find({ groupId: groupId }),
            statisticsLogResults: await this.gnServer.getDatabase().logRuntimeGameCollection("Group.StatisticsLog", gameId).find({ groupId: groupId }),
            statisticsBackupResults: await this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsBackup", gameId).find({}),
            storeInventoryStoreLogResults: await this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId).find({ id: groupId }),
        };

        {
            // Stores the complete members collection used in the current execution flow.
            let allMembers = group.getAllMembers();

            for (let i = 0; i < allMembers.length; i++) {
                // Stores the member value used in the current execution flow.
                let member = allMembers[i];
                // Stores the member ID value used in the current execution flow.
                let memberId = member.memberId;

                if (memberId.length == 11) {
                    // Stores the character player value used in the current execution flow.
                    let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerAsync(memberId, gameId);
                    if (characterPlayer != null) {
                        groupDelete.members.push(characterPlayer);
                    }
                } else if (memberId.length == 10) {
                    // Stores the game player value used in the current execution flow.
                    let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(memberId, gameId);
                    if (gamePlayer != null) {
                        groupDelete.members.push(gamePlayer);
                    }
                }
            }
        }

        {
            // Stores the group inventories value used in the current execution flow.
            const groupInventories = group.getAllGroupInventories();

            for (let i = 0; i < groupInventories.length; i++) {
                // Stores the group inventory value used in the current execution flow.
                const groupInventory = groupInventories[i];

                const inventoryDelete = await this.getInventoryDelete(groupInventory.itemId, gameId);

                if (inventoryDelete != null) {
                    groupDelete.inventoriesDelete.push(inventoryDelete);
                }
            }
        }

        return groupDelete;
    }

    private async getStoreInventoryDelete(storeId: string, gameId: string): Promise<StoreInventoryDelete> {
        // Stores the store inventory value used in the current execution flow.
        const storeInventory = await this.gnServer.getDatabase().storeInventoryRepository.loadStoreInventoryAsync(storeId, gameId);

        if (storeInventory == null) {
            return null;
        }

        const storeInventoryDelete: StoreInventoryDelete = {
            gameId: gameId,
            storeInventory: storeInventory
        };

        return storeInventoryDelete;
    }

    /**
     * Deletes the master player.
     * @param masterPlayer Provides the master player value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async deleteMasterPlayer(masterPlayerDelete: MasterPlayerDelete, session: mongodb.ClientSession): Promise<Array<{ [key: string]: any }>> {
        // Stores the answer value used in the current execution flow.
        const answer: Array<{ [key: string]: any }> = [];

        answer.push({
            type: "MasterPlayer",
            obj: masterPlayerDelete.masterPlayer.getOriginResult(),
        });

        // Tracks whether r ID should be used.
        const userId = masterPlayerDelete.masterPlayer.getUserId();

        for (let i = 0; i < masterPlayerDelete.gamePlayersDelete.length; i++) {
            const gamePlayersDelete = masterPlayerDelete.gamePlayersDelete[i];

            // Stores the results value used in the current execution flow.
            const results = await this.deleteGamePlayer(gamePlayersDelete, session);

            answer.push({
                type: "GamePlayer",
                gameId: gamePlayersDelete.gameId,
                objs: results,
            });

            await this.gnServer.getDatabase().systemGameCollection("GamePlayer", gamePlayersDelete.gameId).deleteOne({ userId: userId }, { session: session });
        }

        {
            while (await masterPlayerDelete.currencyLogResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await masterPlayerDelete.currencyLogResults.next();

                answer.push({
                    type: "MasterPlayer.CurrencyLog",
                    obj: result,
                });
            }

            this.gnServer.getDatabase().logRuntimeCollection("MasterPlayer.CurrencyLog").deleteMany({ userId: userId });
        }

        {
            while (await masterPlayerDelete.statisticsLogResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await masterPlayerDelete.statisticsLogResults.next();

                answer.push({
                    type: "MasterPlayer.StatisticsLog",
                    obj: result,
                });
            }

            this.gnServer.getDatabase().logRuntimeCollection("MasterPlayer.StatisticsLog").deleteMany({ userId: userId });
        }

        {
            while (await masterPlayerDelete.statisticsBackupResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await masterPlayerDelete.statisticsBackupResults.next();

                // Stores the backup results value used in the current execution flow.
                const backupResults = result.results as { userId: string; position: number }[];

                // Stores the backup result value used in the current execution flow.
                const backupResult = backupResults.find((x) => x.userId == userId);
                if (backupResult != null) {
                    backupResults.splice(backupResult.position, 1);

                    for (let i = backupResult.position; i < backupResults.length; i++) {
                        backupResults[i].position -= 1;
                    }

                    await this.gnServer.getDatabase().runtimeCollection("MasterPlayer.StatisticsBackup").updateOne({ _id: result._id }, { $set: { results: backupResults } }, { session: session });

                    answer.push({
                        type: "MasterPlayer.StatisticsBackup",
                        obj: {
                            key: result.key,
                            version: result.version,
                            result: backupResult,
                        },
                    });
                }
            }
        }

        return answer;
    }

    /**
     * Deletes the game player.
     * @param gamePlayer Provides the game player value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async deleteGamePlayer(gamePlayerDelete: GamePlayerDelete, session: mongodb.ClientSession): Promise<Array<{ [key: string]: any }>> {
        // Stores the answer value used in the current execution flow.
        const answer: Array<{ [key: string]: any }> = [];

        answer.push({
            type: "GamePlayer",
            obj: gamePlayerDelete.gamePlayer.getOriginResult(),
        });

        const gameId = gamePlayerDelete.gameId;

        // Tracks whether r ID should be used.
        const userId = gamePlayerDelete.gamePlayer.getUserId();

        {
            for (let i = 0; i < gamePlayerDelete.characterPlayersDelete.length; i++) {
                // Stores the player character value used in the current execution flow.
                const characterPlayerDelete = gamePlayerDelete.characterPlayersDelete[i];

                // Stores the results value used in the current execution flow.
                const results = await this.deleteCharacterPlayer(characterPlayerDelete, session);
                answer.push(...results);
            }

            await this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", gameId).deleteMany({ "owner.id": userId }, { session: session });
        }

        {
            for (let i = 0; i < gamePlayerDelete.friendPlayers.length; i++) {
                // Stores the player friend value used in the current execution flow.
                const friendPlayer = gamePlayerDelete.friendPlayers[i];

                // Stores the results value used in the current execution flow.
                const results = await this.deleteFriendPlayerInGamePlayer(gamePlayerDelete.gamePlayer, friendPlayer);
                answer.push(...results);

                await friendPlayer.saveAsync(session);
            }
        }

        {
            while (await gamePlayerDelete.groupMessageResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await gamePlayerDelete.groupMessageResults.next();

                answer.push({
                    type: "Group.Message",
                    obj: result,
                });
            }

            await this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId).deleteMany({ senderId: userId }, { session: session });

            for (let i = 0; i < gamePlayerDelete.groups.length; i++) {
                // Stores the group value used in the current execution flow.
                const group = gamePlayerDelete.groups[i];

                // Stores the results value used in the current execution flow.
                const results = await this.deleteGroupInGamePlayer(gamePlayerDelete.gamePlayer, gameId, group);
                answer.push(...results);

                await group.saveAsync(session);
            }
        }

        {
            for (let i = 0; i < gamePlayerDelete.inventoriesDelete.length; i++) {
                // Stores the player inventory value used in the current execution flow.
                const inventoryDelete = gamePlayerDelete.inventoriesDelete[i];

                // Stores the results value used in the current execution flow.
                const results = await this.deleteInventory(inventoryDelete, session);
                answer.push(...results);
            }

            await this.gnServer.getDatabase().systemGameCollection("Inventory", gameId).deleteMany({ "owner.id": userId }, { session: session });
        }

        {
            while (await gamePlayerDelete.currencyLogResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await gamePlayerDelete.currencyLogResults.next();

                answer.push({
                    type: "GamePlayer.CurrencyLog",
                    obj: result,
                });
            }

            this.gnServer.getDatabase().logRuntimeGameCollection("GamePlayer.CurrencyLog", gameId).deleteMany({ userId: userId });
        }

        {
            while (await gamePlayerDelete.statisticsLogResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await gamePlayerDelete.statisticsLogResults.next();

                answer.push({
                    type: "GamePlayer.StatisticsLog",
                    obj: result,
                });
            }

            this.gnServer.getDatabase().logRuntimeGameCollection("GamePlayer.StatisticsLog", gameId).deleteMany({ userId: userId });
        }

        {
            while (await gamePlayerDelete.statisticsBackupResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await gamePlayerDelete.statisticsBackupResults.next();

                // Stores the backup results value used in the current execution flow.
                const backupResults = result.results as { userId: string; position: number }[];

                // Stores the backup result value used in the current execution flow.
                const backupResult = backupResults.find((x) => x.userId == userId);
                if (backupResult != null) {
                    backupResults.splice(backupResult.position, 1);

                    for (let i = backupResult.position; i < backupResults.length; i++) {
                        backupResults[i].position -= 1;
                    }

                    await this.gnServer.getDatabase().runtimeGameCollection("GamePlayer.StatisticsBackup", gameId).updateOne({ _id: result._id }, { $set: { results: backupResults } }, { session: session });

                    answer.push({
                        type: "GamePlayer.StatisticsBackup",
                        obj: {
                            key: result.key,
                            version: result.version,
                            result: backupResult,
                        },
                    });
                }
            }
        }

        {
            while (await gamePlayerDelete.storeInventoryStoreLogResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await gamePlayerDelete.storeInventoryStoreLogResults.next();

                answer.push({
                    type: "StoreInventory.StoreLog",
                    obj: result,
                });
            }

            this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId).deleteMany({ id: userId });
        }

        return answer;
    }

    /**
     * Deletes the character player.
     * @param characterPlayer Provides the character player value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async deleteCharacterPlayer(characterPlayerDelete: CharacterPlayerDelete, session: mongodb.ClientSession): Promise<Array<{ [key: string]: any }>> {
        // Stores the answer value used in the current execution flow.
        const answer: Array<{ [key: string]: any }> = [];

        answer.push({
            type: "CharacterPlayer",
            obj: characterPlayerDelete.characterPlayer.getOriginResult(),
        });

        const gameId = characterPlayerDelete.gameId;

        // Stores the character ID value used in the current execution flow.
        const characterId = characterPlayerDelete.characterPlayer.getCharacterId();

        {
            for (let i = 0; i < characterPlayerDelete.friendPlayers.length; i++) {
                // Stores the friend player value used in the current execution flow.
                const friendPlayer = characterPlayerDelete.friendPlayers[i];

                // Stores the results value used in the current execution flow.
                const results = await this.deleteFriendPlayerInCharacterPlayer(characterPlayerDelete.characterPlayer, friendPlayer);
                answer.push(...results);

                await friendPlayer.saveAsync(session);
            }
        }

        {
            while (await characterPlayerDelete.groupMessageResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await characterPlayerDelete.groupMessageResults.next();

                answer.push({
                    type: "Group.Message",
                    obj: result,
                });
            }

            await this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId).deleteMany({ senderId: characterId }, { session: session });

            for (let i = 0; i < characterPlayerDelete.groups.length; i++) {
                // Stores the group value used in the current execution flow.
                const group = characterPlayerDelete.groups[i];

                // Stores the results value used in the current execution flow.
                const results = await this.deleteGroupInCharacterPlayer(characterPlayerDelete.characterPlayer, gameId, group);
                answer.push(...results);

                await group.saveAsync(session);
            }
        }

        {
            for (let i = 0; i < characterPlayerDelete.inventoriesDelete.length; i++) {
                // Stores the player inventory value used in the current execution flow.
                const inventoryDelete = characterPlayerDelete.inventoriesDelete[i];

                // Stores the results value used in the current execution flow.
                const results = await this.deleteInventory(inventoryDelete, session);
                answer.push(...results);
            }

            await this.gnServer.getDatabase().systemGameCollection("Inventory", gameId).deleteMany({ "owner.id": characterId }, { session: session });
        }

        {
            while (await characterPlayerDelete.currencyLogResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await characterPlayerDelete.currencyLogResults.next();

                answer.push({
                    type: "CharacterPlayer.CurrencyLog",
                    obj: result,
                });
            }

            this.gnServer.getDatabase().logRuntimeGameCollection("CharacterPlayer.CurrencyLog", gameId).deleteMany({ characterId: characterId });
        }

        {
            while (await characterPlayerDelete.statisticsLogResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await characterPlayerDelete.statisticsLogResults.next();

                answer.push({
                    type: "CharacterPlayer.StatisticsLog",
                    obj: result,
                });
            }

            this.gnServer.getDatabase().logRuntimeGameCollection("CharacterPlayer.StatisticsLog", gameId).deleteMany({ characterId: characterId });
        }

        {
            while (await characterPlayerDelete.statisticsBackupResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await characterPlayerDelete.statisticsBackupResults.next();

                // Stores the backup results value used in the current execution flow.
                const backupResults = result.results as { characterId: string; position: number }[];

                // Stores the backup result value used in the current execution flow.
                const backupResult = backupResults.find((x) => x.characterId == characterId);
                if (backupResult != null) {
                    backupResults.splice(backupResult.position, 1);

                    for (let i = backupResult.position; i < backupResults.length; i++) {
                        backupResults[i].position -= 1;
                    }

                    await this.gnServer.getDatabase().runtimeGameCollection("CharacterPlayer.StatisticsBackup", gameId).updateOne({ _id: result._id }, { $set: { results: backupResults } }, { session: session });

                    answer.push({
                        type: "CharacterPlayer.StatisticsBackup",
                        obj: {
                            key: result.key,
                            version: result.version,
                            result: backupResult,
                        },
                    });
                }
            }
        }

        {
            while (await characterPlayerDelete.storeInventoryStoreLogResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await characterPlayerDelete.storeInventoryStoreLogResults.next();

                answer.push({
                    type: "StoreInventory.StoreLog",
                    obj: result,
                });
            }

            this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId).deleteMany({ id: characterId });
        }

        return answer;
    }

    /**
     * Deletes the inventory.
     * @param inventoryDelete Provides the inventory delete value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async deleteInventory(inventoryDelete: InventoryDelete, session: mongodb.ClientSession): Promise<Array<{ [key: string]: any }>> {
        // Stores the answer value used in the current execution flow.
        const answer: Array<{ [key: string]: any }> = [];

        answer.push({
            type: "Inventory",
            obj: inventoryDelete.inventory.getOriginResult(),
        });

        const gameId = inventoryDelete.gameId;

        // Stores the item ID value used in the current execution flow.
        const itemId = inventoryDelete.inventory.getItemId();

        {
            while (await inventoryDelete.statisticsLogResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await inventoryDelete.statisticsLogResults.next();

                answer.push({
                    type: "Inventory.StatisticsLog",
                    obj: result,
                });
            }

            this.gnServer.getDatabase().logRuntimeGameCollection("Inventory.StatisticsLog", gameId).deleteMany({ itemId: itemId });
        }

        {
            while (await inventoryDelete.statisticsBackupResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await inventoryDelete.statisticsBackupResults.next();

                // Stores the backup results value used in the current execution flow.
                const backupResults = result.results as { itemId: string; position: number }[];

                // Stores the backup result value used in the current execution flow.
                const backupResult = backupResults.find((x) => x.itemId == itemId);
                if (backupResult != null) {
                    backupResults.splice(backupResult.position, 1);

                    for (let i = backupResult.position; i < backupResults.length; i++) {
                        backupResults[i].position -= 1;
                    }

                    await this.gnServer.getDatabase().runtimeGameCollection("Inventory.StatisticsBackup", gameId).updateOne({ _id: result._id }, { $set: { results: backupResults } }, { session: session });

                    answer.push({
                        type: "Inventory.StatisticsBackup",
                        obj: {
                            key: result.key,
                            version: result.version,
                            result: backupResult,
                        },
                    });
                }
            }
        }

        return answer;
    }

    /**
     * Deletes the group.
     * @param group Provides the group value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async deleteGroup(groupDelete: GroupDelete, session: mongodb.ClientSession): Promise<Array<{ [key: string]: any }>> {
        // Stores the answer value used in the current execution flow.
        const answer: Array<{ [key: string]: any }> = [];

        answer.push({
            type: "Group",
            obj: groupDelete.group.getOriginResult(),
        });

        const gameId = groupDelete.gameId;

        // Stores the group ID value used in the current execution flow.
        const groupId = groupDelete.group.getGroupId();

        {
            for (let i = 0; i < groupDelete.members.length; i++) {
                // Stores the member value used in the current execution flow.
                let player = groupDelete.members[i];

                if (player.hasPlayerGroup(groupId)) {
                    player.removePlayerGroup(groupId);
                    await player.saveAsync(session);
                }
            }
        }

        // Stores the cache data value used in the current execution flow.
        const cacheData = this.gnServer.getCacheService(gameId);

        {
            while (await groupDelete.groupMessageResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await groupDelete.groupMessageResults.next();

                answer.push({
                    type: "Group.Message",
                    obj: result,
                });
            }

            await this.gnServer.getDatabase().runtimeGameCollection("Group.Message", gameId).deleteMany({ groupId: groupId }, { session: session });
            cacheData.removeData("GroupMessages_" + groupId);
        }

        {
            for (let i = 0; i < groupDelete.inventoriesDelete.length; i++) {
                // Stores the group inventory value used in the current execution flow.
                const inventoryDelete = groupDelete.inventoriesDelete[i];

                // Stores the results value used in the current execution flow.
                const results = await this.deleteInventory(inventoryDelete, session);
                answer.push(...results);
            }

            await this.gnServer.getDatabase().systemGameCollection("Inventory", gameId).deleteMany({ "owner.id": groupId }, { session: session });
        }

        {
            while (await groupDelete.currencyLogResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await groupDelete.currencyLogResults.next();

                answer.push({
                    type: "Group.CurrencyLog",
                    obj: result,
                });
            }

            this.gnServer.getDatabase().logRuntimeGameCollection("Group.CurrencyLog", gameId).deleteMany({ groupId: groupId });
        }

        {
            while (await groupDelete.statisticsLogResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await groupDelete.statisticsLogResults.next();

                answer.push({
                    type: "Group.StatisticsLog",
                    obj: result,
                });
            }

            this.gnServer.getDatabase().logRuntimeGameCollection("Group.StatisticsLog", gameId).deleteMany({ groupId: groupId });
        }

        {
            while (await groupDelete.statisticsBackupResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await groupDelete.statisticsBackupResults.next();

                // Stores the backup results value used in the current execution flow.
                const backupResults = result.results as { groupId: string; position: number }[];

                // Stores the backup result value used in the current execution flow.
                const backupResult = backupResults.find((x) => x.groupId == groupId);
                if (backupResult != null) {
                    backupResults.splice(backupResult.position, 1);

                    for (let i = backupResult.position; i < backupResults.length; i++) {
                        backupResults[i].position -= 1;
                    }

                    await this.gnServer.getDatabase().runtimeGameCollection("Group.StatisticsBackup", gameId).updateOne({ _id: result._id }, { $set: { results: backupResults } }, { session: session });

                    answer.push({
                        type: "Group.StatisticsBackup",
                        obj: {
                            key: result.key,
                            version: result.version,
                            result: backupResult,
                        },
                    });
                }
            }
        }

        {
            while (await groupDelete.storeInventoryStoreLogResults.hasNext()) {
                // Stores the result value used in the current execution flow.
                const result = await groupDelete.storeInventoryStoreLogResults.next();

                answer.push({
                    type: "StoreInventory.StoreLog",
                    obj: result,
                });
            }

            this.gnServer.getDatabase().logRuntimeGameCollection("StoreInventory.StoreLog", gameId).deleteMany({ id: groupId });
        }

        return answer;
    }

    /**
     * Deletes the friend player in game player.
     * @param gamePlayer Provides the game player value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param friendPlayer Provides the friend player value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async deleteFriendPlayerInGamePlayer(gamePlayer: GamePlayer, friendPlayer: GamePlayer): Promise<Array<{ [key: string]: any }>> {
        // Stores the answer value used in the current execution flow.
        const answer: Array<{ [key: string]: any }> = [];

        // Tracks whether r ID should be used.
        const userId = gamePlayer.getUserId();

        if (friendPlayer.hasPlayerFriend(userId)) {
            friendPlayer.removePlayerFriend(userId);
        }

        return answer;
    }

    /**
     * Deletes the friend player in character player.
     * @param characterPlayer Provides the character player value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param friendPlayer Provides the friend player value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async deleteFriendPlayerInCharacterPlayer(characterPlayer: CharacterPlayer, friendPlayer: CharacterPlayer): Promise<Array<{ [key: string]: any }>> {
        // Stores the answer value used in the current execution flow.
        const answer: Array<{ [key: string]: any }> = [];

        // Stores the character ID value used in the current execution flow.
        const characterId = characterPlayer.getCharacterId();

        if (friendPlayer.hasPlayerFriend(characterId)) {
            friendPlayer.removePlayerFriend(characterId);
        }

        return answer;
    }

    /**
     * Deletes the group in game player.
     * @param gamePlayer Provides the game player value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param group Provides the group value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async deleteGroupInGamePlayer(gamePlayer: GamePlayer, gameId: string, group: Group): Promise<Array<{ [key: string]: any }>> {
        // Stores the answer value used in the current execution flow.
        const answer: Array<{ [key: string]: any }> = [];

        // Tracks whether r ID should be used.
        const userId = gamePlayer.getUserId();

        if (group.hasMember(userId)) {
            group.removeMember(userId);
        }

        // Stores the group ID value used in the current execution flow.
        const groupId = group.getGroupId();

        // Stores the cache data value used in the current execution flow.
        const cacheData = this.gnServer.getCacheService(gameId);
        cacheData.removeData("GroupMessages_" + groupId);

        return answer;
    }

    /**
     * Deletes the group in character player.
     * @param characterPlayer Provides the character player value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @param group Provides the group value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async deleteGroupInCharacterPlayer(characterPlayer: CharacterPlayer, gameId: string, group: Group): Promise<Array<{ [key: string]: any }>> {
        // Stores the answer value used in the current execution flow.
        const answer: Array<{ [key: string]: any }> = [];

        // Stores the character ID value used in the current execution flow.
        const characterId = characterPlayer.getCharacterId();

        if (group.hasMember(characterId)) {
            group.removeMember(characterId);
        }

        // Stores the group ID value used in the current execution flow.
        const groupId = group.getGroupId();

        // Stores the cache data value used in the current execution flow.
        const cacheData = this.gnServer.getCacheService(gameId);
        cacheData.removeData("GroupMessages_" + groupId);

        return answer;
    }

    /**
     * Deletes the store inventory.
     * @param storeInventoryDelete Provides the store inventory value used by this operation.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Resolves with the operation result.
     */
    private async deleteStoreInventory(storeInventoryDelete: StoreInventoryDelete, session: mongodb.ClientSession): Promise<Array<{ [key: string]: any }>> {
        // Stores the answer value used in the current execution flow.
        const answer: Array<{ [key: string]: any }> = [];

        answer.push({
            type: "StoreInventory",
            obj: storeInventoryDelete.storeInventory.getOriginResult(),
        });

        return answer;
    }
}
