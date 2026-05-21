import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { DisplayNameUtility } from "./../../../../../GN-common/helper/DisplayNameUtility";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";

class CreatePlayerCharacterOperationRequest extends OperationRequest {
    // Indicates whether r ID should be used.
    @StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
    public userId?: string;

    // Stores the catalog ID value used by this instance.
    @StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true })
    public catalogId: string;

    // Stores the display name value used by this instance.
    @StringDataMember({ code: ParameterCode.DisplayName, defaultValue: "", isOptional: true, mustNonNull: true })
    public displayName?: string;

    // Indicates whether unique display name.
    @BooleanDataMember({ code: ParameterCode.UniqueDisplayName, defaultValue: false, isOptional: true })
    public uniqueDisplayName?: boolean;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class ServerCreatePlayerCharacterOperationRequest extends CreatePlayerCharacterOperationRequest {
    // Indicates whether r ID should be used.
    @StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
    declare public userId: string;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

class AdminCreatePlayerCharacterOperationRequest extends ServerCreatePlayerCharacterOperationRequest {
    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class CreatePlayerCharacterRequestHandler extends GamePlayerBaseRequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.CreatePlayerCharacter;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return CreatePlayerCharacterOperationRequest;
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

        if (!request.userId) {
            if (!secretInfo.getPermission().gamePlayer.createPlayerCharacter.selfEnable) {
                return this.newOperationNotAllowError(request);
            }

            request.userId = authInfo.getUserId();
        } else if (request.userId != authInfo.getUserId()) {
            if (!secretInfo.getPermission().gamePlayer.createPlayerCharacter.otherSelfEnable) {
                return this.newOperationNotAllowError(request);
            }
        } else {
            if (!secretInfo.getPermission().gamePlayer.createPlayerCharacter.selfEnable) {
                return this.newOperationNotAllowError(request);
            }
        }

        return this.execute(
            {
                userId: request.userId,
                catalogId: request.catalogId,
                displayName: request.displayName,
                ipAddress: (request as any).originRequest.getIP(),
                uniqueDisplayName: request.uniqueDisplayName,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerCreatePlayerCharacterOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().gamePlayer.createPlayerCharacter.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                userId: request.userId,
                catalogId: request.catalogId,
                displayName: request.displayName,
                ipAddress: (request as any).originRequest.getIP(),
                uniqueDisplayName: request.uniqueDisplayName,
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
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminCreatePlayerCharacterOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        if (!secretInfo.getPermission().gamePlayer.createPlayerCharacter.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(
            {
                userId: request.userId,
                catalogId: request.catalogId,
                displayName: request.displayName,
                ipAddress: (request as any).originRequest.getIP(),
                uniqueDisplayName: request.uniqueDisplayName,
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
    private async execute(request: { userId: string; catalogId: string; displayName: string; uniqueDisplayName: boolean; ipAddress: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_CreatePlayerCharacter", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the game player find options value used in the current execution flow.
        let gamePlayerFindOptions: GamePlayerFindOptions = {
            playerCharacters: true,
            playerBan: true,
        };

        // Stores the resolved game player settings instance for the current execution flow.
        let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
        // Stores the player character catalog settings item value used in the current execution flow.
        let playerCharacterCatalogSettingsItem = gamePlayerSettings.playerCharacterCatalogSettings.find((x) => x.catalogId == request.catalogId);

        if (playerCharacterCatalogSettingsItem == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CatalogIdNotFound);
            return operationResponse;
        }

        if (request.uniqueDisplayName && request.displayName) {
            // Stores the character player with this display name value used in the current execution flow.
            let characterPlayerWithThisDisplayName = await this.gnServer.getDatabase().characterPlayerRepository.loadCharacterPlayerWithDisplayNameAsync(request.displayName, secretInfo.getGameId(), { displayName: true });

            if (characterPlayerWithThisDisplayName != null) {
                operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.DisplayNameUsed);
                return operationResponse;
            }
        }

        // Stores the game player value used in the current execution flow.
        let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

        if (gamePlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
            return operationResponse;
        }
        if (role == SecretRole.Client) {
            // Stores the player ban value used in the current execution flow.
            let playerBan = gamePlayer.getPlayerBan();

            if (playerBan.tsExpire != 0) {
                let currentMilliseconds = xDatetime.getCurrentMilliseconds();
                if (playerBan.tsExpire == -1 || playerBan.tsExpire > currentMilliseconds) {
                    operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.PlayerBan);
                    operationResponse.setDebugMessage("GamePlayer is banned, reason " + playerBan.reason);

                    return operationResponse;
                }
            }
        }

        // Stores the character ID value used in the current execution flow.
        let characterId = StringUtility.generateRandomString(11, this.gnServer.getIdTypeCase());

        // Stores the current milliseconds value used in the current execution flow.
        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        let countryCode = "";

        // Stores the IP detail response value used in the current execution flow.
        let ipDetailResponse = await this.gnServer.getCountryIPDetailService().getIPDetailResponse(request.ipAddress);
        if (ipDetailResponse.statusCode == "Ok") {
            if (ipDetailResponse.detail.countryCode) {
                countryCode = ipDetailResponse.detail.countryCode;
            }
        }

        const session = this.gnServer.getDatabase().startSession();

        try {
            session.startTransaction();

            // Stores the character player value used in the current execution flow.
            let characterPlayer = await this.gnServer.getDatabase().characterPlayerRepository.createCharacterPlayerAsync(
                {
                    _id: undefined,
                    characterId: characterId,
                    catalogId: request.catalogId,
                    owner: { id: request.userId, type: OwnerType.GamePlayer },
                    removeStatus: { tsRemove: 0 },
                    playerInventories: [],
                    playerGroups: [],
                    playerFriends: [],
                    playerBan: { tsExpire: 0, reason: "" },
                    playerCurrencies: {},
                    playerStatistics: {},
                    playerDatas: {},
                    ipAddressCreate: "",
                    countryCode: countryCode,
                    tsLastLogin: currentMilliseconds,
                    segments: [],
                    customDatas: {},
                    tsCreate: currentMilliseconds,
                    displayName: request.displayName,
                    displayNameNormalize: DisplayNameUtility.normalizeString(request.displayName),
                    avatar: { type: 0, value: "0" },
                    tags: {},
                },
                secretInfo.getGameId(),
                session,
            );

            gamePlayer.setPlayerCharacter(characterId, request.catalogId);
            await gamePlayer.saveAsync(session);

            await session.commitTransaction();
        } catch (err) {
            await session.abortTransaction();

            Debug.logError(err);

            throw err;
        } finally {
            await session.endSession();
        }

        // Stores the GearN player characters value used in the current execution flow.
        let gnPlayerCharacters = new GNArray();

        // Stores the GearN player character value used in the current execution flow.
        let gnPlayerCharacter = new GNHashtable();

        gnPlayerCharacter.add(ParameterCode.CharacterId, characterId);
        gnPlayerCharacter.add(ParameterCode.CatalogId, request.catalogId);

        gnPlayerCharacters.add(gnPlayerCharacter);

        // Stores the GearN info response parameters value used in the current execution flow.
        let gnInfoResponseParameters = new GNHashtable();
        gnInfoResponseParameters.add(ParameterCode.PlayerCharacters, gnPlayerCharacters);

        operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_CreatePlayerCharacter", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }
}
