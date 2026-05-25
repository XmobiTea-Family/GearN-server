import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { GameItem } from "./../../../../../GN-library/xdatabase/lib/entity/pro/masterAdmin/GameItem";

import { GNArrayDataMember, GNHashtableDataMember, StringDataMember } from "./../../../../../GN-common/entity/DataMember";
import { GameSettingsParam } from "./model/GameSettingsParam";
import { xCurrencySettings } from "./../../../../../GN-library/xsettings/lib/entity/xCurrencySettings";
import { xStatisticsSettings } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsSettings";
import { xDataSettings } from "./../../../../../GN-library/xsettings/lib/entity/xDataSettings";
import { xTagSettings } from "./../../../../../GN-library/xsettings/lib/entity/xTagSettings";
import { xGroupCatalogSettings } from "./../../../../../GN-library/xsettings/lib/entity/xGroupCatalogSettings";
import { xItemCatalogSettings } from "./../../../../../GN-library/xsettings/lib/entity/xItemCatalogSettings";
import { xFriendCatalogSettings } from "./../../../../../GN-library/xsettings/lib/entity/xFriendCatalogSettings";
import { xCharacterCatalogSettings } from "./../../../../../GN-library/xsettings/lib/entity/xCharacterCatalogSettings";
import { MatchmakingQueueSettingsParam } from "./model/MatchmakingQueueSettingsParam";
import { DifferenceRule, MatchTotalRule, RegionSelectionRule, RuleExpansionType, RuleType, SetIntersectionRule, StringRule, TeamDifferenceRule, TeamSizeBalanceRule, TeamTicketSizeSimilarityRule } from "./../../../../../GN-library/xsettings/lib/entity/xMatchmakingQueueSettings";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";
import { xStatisticsAggregationMethod } from "./../../../../../GN-library/xsettings/lib/entity/xStatisticsAggregationMethod";

class SetGameInformationOperationRequest extends OperationRequest {
    // Stores the game ID value used by this instance.
    @StringDataMember({ code: ParameterCode.GameId, minLength: 2, maxLength: 32, mustNonNull: true })
    public gameId: string;

    // Stores the game name value used by this instance.
    @StringDataMember({ code: ParameterCode.GameName, isOptional: true })
    public gameName?: string;

    // Stores the game description value used by this instance.
    @StringDataMember({ code: ParameterCode.GameDescription, isOptional: true })
    public gameDescription?: string;

    // Stores the game icon URL value used by this instance.
    @StringDataMember({ code: ParameterCode.GameIconUrl, isOptional: true })
    public gameIconUrl?: string;

    // Stores the game settings value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GameSettings, isOptional: true })
    public gameSettings?: GameSettingsParam;

    // Stores the matchmaking queue settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.MatchmakingQueueSettings, isOptional: true, elementCls: MatchmakingQueueSettingsParam })
    public matchmakingQueueSettings?: Array<MatchmakingQueueSettingsParam>;

    /**
     * Checks whether valid request.
     */
    public override isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class SetGameInformationRequestHandler extends RequestHandler {
    /**
     * Returns the code.
     */
    public override getCode() {
        return OperationCode.SetGameInformation;
    }

    /**
     * Returns the common operation request.
     */
    public override getCommonOperationRequest() {
        return SetGameInformationOperationRequest;
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

        if (!secretInfo.getPermission().dashboard.setGameInformation.selfEnable) {
            return this.newOperationNotAllowError(request);
        }

        if (request.matchmakingQueueSettings != null) {
            for (let i = 0; i < request.matchmakingQueueSettings.length; i++) {
                // Stores the request matchmaking queue setting value used in the current execution flow.
                let requestMatchmakingQueueSetting = request.matchmakingQueueSettings[i];

                if (!requestMatchmakingQueueSetting.remove && requestMatchmakingQueueSetting.rules != null) {
                    for (let j = 0; j < requestMatchmakingQueueSetting.rules.length; j++) {
                        // Stores the request rule value used in the current execution flow.
                        let requestRule = requestMatchmakingQueueSetting.rules[j];

                        if (requestRule.type == RuleType.String) {
                            if (!requestRule.attributePath) {
                                return this.newOperationInvalid(operationRequest, "AttributePath not found");
                            }

                            if (!requestRule.attributeSource) {
                                return this.newOperationInvalid(operationRequest, "AttributeSource not found");
                            }

                            if (requestRule.defaultValue == null || typeof requestRule.defaultValue != "string") {
                                return this.newOperationInvalid(operationRequest, "DefaultValue not found");
                            }

                            if (requestRule.compairType == null) {
                                return this.newOperationInvalid(operationRequest, "CompairType not found");
                            }

                            if (requestRule.advancedSettings != null) {
                                if (requestRule.advancedSettings.expansionType == null) {
                                    return this.newOperationInvalid(operationRequest, "AdvancedSettings.ExpansionType not found");
                                }

                                if (requestRule.advancedSettings.expansionType == RuleExpansionType.None) {
                                } else if (requestRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
                                    return this.newOperationInvalid(operationRequest, "AdvancedSettings.ExpansionType must be Custom");
                                } else if (requestRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
                                    if (requestRule.advancedSettings.customExpansions == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions not found");
                                    }

                                    if (requestRule.advancedSettings.customExpansions.overrideValue == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions.OverrideValue not found");
                                    }
                                }
                            }
                        } else if (requestRule.type == RuleType.Difference) {
                            if (!requestRule.attributePath) {
                                return this.newOperationInvalid(operationRequest, "AttributePath not found");
                            }

                            if (!requestRule.attributeSource) {
                                return this.newOperationInvalid(operationRequest, "AttributeSource not found");
                            }

                            if (requestRule.defaultValue == null || typeof requestRule.defaultValue != "number") {
                                return this.newOperationInvalid(operationRequest, "DefaultValue not found");
                            }

                            if (requestRule.allowedDifference == null) {
                                return this.newOperationInvalid(operationRequest, "AllowedDifference not found");
                            }

                            if (requestRule.advancedSettings != null) {
                                if (requestRule.advancedSettings.expansionType == null) {
                                    return this.newOperationInvalid(operationRequest, "AdvancedSettings.ExpansionType not found");
                                }

                                if (requestRule.advancedSettings.expansionType == RuleExpansionType.None) {
                                } else if (requestRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
                                    if (requestRule.advancedSettings.linearExpansions == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.LinearExpansions not found");
                                    }

                                    if (requestRule.advancedSettings.linearExpansions.delta == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.LinearExpansions.Delta not found");
                                    }

                                    if (requestRule.advancedSettings.linearExpansions.limit == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.LinearExpansions.Limit not found");
                                    }
                                } else if (requestRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
                                    if (requestRule.advancedSettings.customExpansions == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions not found");
                                    }

                                    if (requestRule.advancedSettings.customExpansions.overrideValue == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions.OverrideValue not found");
                                    }
                                }
                            }
                        } else if (requestRule.type == RuleType.SetIntersection) {
                            if (!requestRule.attributePath) {
                                return this.newOperationInvalid(operationRequest, "AttributePath not found");
                            }

                            if (!requestRule.attributeSource) {
                                return this.newOperationInvalid(operationRequest, "AttributeSource not found");
                            }

                            if (requestRule.defaultValue == null || typeof requestRule.defaultValue != "object" || !Array.isArray(requestRule.defaultValue)) {
                                return this.newOperationInvalid(operationRequest, "DefaultValue not found");
                            }

                            if (requestRule.min == null) {
                                return this.newOperationInvalid(operationRequest, "Min not found");
                            }

                            if (requestRule.advancedSettings != null) {
                                if (requestRule.advancedSettings.expansionType == null) {
                                    return this.newOperationInvalid(operationRequest, "AdvancedSettings.ExpansionType not found");
                                }

                                if (requestRule.advancedSettings.expansionType == RuleExpansionType.None) {
                                } else if (requestRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
                                    if (requestRule.advancedSettings.linearExpansions == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.LinearExpansions not found");
                                    }

                                    if (requestRule.advancedSettings.linearExpansions.delta == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.LinearExpansions.Delta not found");
                                    }
                                } else if (requestRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
                                    if (requestRule.advancedSettings.customExpansions == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions not found");
                                    }

                                    if (requestRule.advancedSettings.customExpansions.overrideValue == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions.OverrideValue not found");
                                    }
                                }
                            }
                        } else if (requestRule.type == RuleType.MatchTotal) {
                            if (!requestRule.attributePath) {
                                return this.newOperationInvalid(operationRequest, "AttributePath not found");
                            }

                            if (!requestRule.attributeSource) {
                                return this.newOperationInvalid(operationRequest, "AttributeSource not found");
                            }

                            if (requestRule.min == null) {
                                return this.newOperationInvalid(operationRequest, "Min not found");
                            }

                            if (requestRule.max == null) {
                                return this.newOperationInvalid(operationRequest, "Max not found");
                            }

                            if (requestRule.advancedSettings != null) {
                                if (requestRule.advancedSettings.expansionType == null) {
                                    return this.newOperationInvalid(operationRequest, "AdvancedSettings.ExpansionType not found");
                                }

                                if (requestRule.advancedSettings.expansionType == RuleExpansionType.None) {
                                } else if (requestRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
                                    return this.newOperationInvalid(operationRequest, "AdvancedSettings.ExpansionType must be Custom");
                                } else if (requestRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
                                    if (requestRule.advancedSettings.customExpansions == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions not found");
                                    }

                                    if (requestRule.advancedSettings.customExpansions.overrideMax == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions.OverrideMax not found");
                                    }

                                    if (requestRule.advancedSettings.customExpansions.overrideMin == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions.OverrideMin not found");
                                    }
                                }
                            }
                        } else if (requestRule.type == RuleType.RegionSelection) {
                            if (!requestRule.attributePath) {
                                return this.newOperationInvalid(operationRequest, "AttributePath not found");
                            }

                            if (requestRule.max == null) {
                                return this.newOperationInvalid(operationRequest, "Max not found");
                            }

                            if (requestRule.advancedSettings != null) {
                                if (requestRule.advancedSettings.expansionType == null) {
                                    return this.newOperationInvalid(operationRequest, "AdvancedSettings.ExpansionType not found");
                                }

                                if (requestRule.advancedSettings.expansionType == RuleExpansionType.None) {
                                } else if (requestRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
                                    if (requestRule.advancedSettings.linearExpansions == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.LinearExpansions not found");
                                    }

                                    if (requestRule.advancedSettings.linearExpansions.delta == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.LinearExpansions.Delta not found");
                                    }

                                    if (requestRule.advancedSettings.linearExpansions.limit == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.LinearExpansions.Limit not found");
                                    }
                                } else if (requestRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
                                    if (requestRule.advancedSettings.customExpansions == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions not found");
                                    }

                                    if (requestRule.advancedSettings.customExpansions.overrideValue == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions.OverrideValue not found");
                                    }
                                }
                            }
                        } else if (requestRule.type == RuleType.TeamSizeBalance) {
                            if (requestRule.allowedDifference == null) {
                                return this.newOperationInvalid(operationRequest, "AllowedDifference not found");
                            }

                            if (requestRule.advancedSettings != null) {
                                if (requestRule.advancedSettings.expansionType == null) {
                                    return this.newOperationInvalid(operationRequest, "AdvancedSettings.ExpansionType not found");
                                }

                                if (requestRule.advancedSettings.expansionType == RuleExpansionType.None) {
                                } else if (requestRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
                                    if (requestRule.advancedSettings.linearExpansions == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.LinearExpansions not found");
                                    }

                                    if (requestRule.advancedSettings.linearExpansions.delta == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.LinearExpansions.Delta not found");
                                    }

                                    if (requestRule.advancedSettings.linearExpansions.limit == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.LinearExpansions.Limit not found");
                                    }
                                } else if (requestRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
                                    if (requestRule.advancedSettings.customExpansions == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions not found");
                                    }

                                    if (requestRule.advancedSettings.customExpansions.overrideValue == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions.OverrideValue not found");
                                    }
                                }
                            }
                        } else if (requestRule.type == RuleType.TeamDifference) {
                            if (!requestRule.attributePath) {
                                return this.newOperationInvalid(operationRequest, "AttributePath not found");
                            }

                            if (!requestRule.attributeSource) {
                                return this.newOperationInvalid(operationRequest, "AttributeSource not found");
                            }

                            if (requestRule.defaultValue == null || typeof requestRule.defaultValue != "number") {
                                return this.newOperationInvalid(operationRequest, "DefaultValue not found");
                            }

                            if (requestRule.allowedDifference == null) {
                                return this.newOperationInvalid(operationRequest, "AllowedDifference not found");
                            }

                            if (requestRule.advancedSettings != null) {
                                if (requestRule.advancedSettings.expansionType == null) {
                                    return this.newOperationInvalid(operationRequest, "AdvancedSettings.ExpansionType not found");
                                }

                                if (requestRule.advancedSettings.expansionType == RuleExpansionType.None) {
                                } else if (requestRule.advancedSettings.expansionType == RuleExpansionType.Linear) {
                                    if (requestRule.advancedSettings.linearExpansions == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.LinearExpansions not found");
                                    }

                                    if (requestRule.advancedSettings.linearExpansions.delta == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.LinearExpansions.Delta not found");
                                    }

                                    if (requestRule.advancedSettings.linearExpansions.limit == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.LinearExpansions.Limit not found");
                                    }
                                } else if (requestRule.advancedSettings.expansionType == RuleExpansionType.Custom) {
                                    if (requestRule.advancedSettings.customExpansions == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions not found");
                                    }

                                    if (requestRule.advancedSettings.customExpansions.overrideValue == null) {
                                        return this.newOperationInvalid(operationRequest, "AdvancedSettings.CustomExpansions.OverrideValue not found");
                                    }
                                }
                            }
                        } else if (requestRule.type == RuleType.TeamTicketSizeSimilarity) {
                        }
                    }
                }
            }
        }

        return this.execute(
            {
                gameId: request.gameId,
                gameName: request.gameName,
                gameDescription: request.gameDescription,
                gameIconUrl: request.gameIconUrl,
                gameSettings: request.gameSettings,
                matchmakingQueueSettings: request.matchmakingQueueSettings,
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
    private async execute(request: { gameId: string; gameName: string; gameDescription: string; gameIconUrl: string; gameSettings: GameSettingsParam; matchmakingQueueSettings: Array<MatchmakingQueueSettingsParam> }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        // Stores the operation response value used in the current execution flow.
        let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("dashboard_SetGameInformation", request, role, secretInfo, operationRequest);
        if (operationResponse != null) {
            return operationResponse;
        }

        operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
        operationResponse.setReturnCode(ReturnCode.Ok);

        // Stores the collection value used in the current execution flow.
        let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

        // Stores the result value used in the current execution flow.
        let result = await collection.findOne({ type: "gameSettings", gameId: request.gameId });

        if (result == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GameNotFound);
            return operationResponse;
        }

        // Stores the game item value used in the current execution flow.
        let gameItem = new GameItem(result, collection);

        if (request.gameName) gameItem.setGameName(request.gameName);

        if (request.gameDescription) gameItem.setGameDescription(request.gameDescription);

        if (request.gameIconUrl) gameItem.setGameIconUrl(request.gameIconUrl);

        if (request.gameSettings) {
            // Stores the resolved game settings instance for the current execution flow.
            let gameSettings = gameItem.getGameSettings();

            if (request.gameSettings.characterPlayerSettings != null) {
                // Stores the resolved character player settings instance for the current execution flow.
                let characterPlayerSettings = gameSettings.characterPlayerSettings;
                // Stores the resolved current character player settings instance for the current execution flow.
                let currentCharacterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(request.gameId);
                // Stores the character player collection value used in the current execution flow.
                let characterPlayerCollection = this.gnServer.getDatabase().systemGameCollection("CharacterPlayer", request.gameId);

                if (request.gameSettings.characterPlayerSettings.playerCurrenciesSettings != null) {
                    // Stores the resolved player currencies settings instance for the current execution flow.
                    let playerCurrenciesSettings = new Array<xCurrencySettings>();

                    // Stores the remove key lst value used in the current execution flow.
                    let removeKeyLst = new Array<string>();
                    // Stores the add key lst value used in the current execution flow.
                    let addKeyLst = new Array<string>();

                    for (let i = 0; i < currentCharacterPlayerSettings.playerCurrenciesSettings.length; i++) {
                        // Stores the player currencies setting value used in the current execution flow.
                        let playerCurrenciesSetting = currentCharacterPlayerSettings.playerCurrenciesSettings[i];
                        removeKeyLst.push(playerCurrenciesSetting.key);
                    }

                    for (let i = 0; i < request.gameSettings.characterPlayerSettings.playerCurrenciesSettings.length; i++) {
                        // Stores the player currencies setting value used in the current execution flow.
                        let playerCurrenciesSetting = request.gameSettings.characterPlayerSettings.playerCurrenciesSettings[i];

                        playerCurrenciesSettings.push({
                            key: playerCurrenciesSetting.key,
                            initialValue: playerCurrenciesSetting.initialValue,
                            description: playerCurrenciesSetting.description,
                            index: playerCurrenciesSetting.index,
                        });

                        if (playerCurrenciesSetting.index) addKeyLst.push(playerCurrenciesSetting.key);
                    }

                    currentCharacterPlayerSettings.playerCurrenciesSettings = playerCurrenciesSettings;
                    characterPlayerSettings.playerCurrenciesSettings = playerCurrenciesSettings;

                    for (let i = 0; i < addKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = addKeyLst[i];

                        // Stores the remove index of value used in the current execution flow.
                        let removeIndexOf = removeKeyLst.indexOf(key);

                        if (removeIndexOf != -1) {
                            removeKeyLst.splice(removeIndexOf, 1);

                            addKeyLst.splice(i, 1);
                            i -= 1;
                        }
                    }

                    for (let i = 0; i < removeKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = removeKeyLst[i];

                        {
                            // Stores the index name value used in the current execution flow.
                            let indexName = "playerCurrencies." + key + ".value_-1";
                            characterPlayerCollection.dropIndex(indexName);

                            Debug.log("[GearN] [Database] drop index " + indexName + " at " + characterPlayerCollection.collectionName);
                        }

                        {
                            // Stores the index name value used in the current execution flow.
                            let indexName = "catalogId_1_" + "playerCurrencies." + key + ".value_-1";
                            characterPlayerCollection.dropIndex(indexName);

                            Debug.log("[GearN] [Database] drop index " + indexName + " at " + characterPlayerCollection.collectionName);
                        }
                    }

                    for (let i = 0; i < addKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = addKeyLst[i];

                        {
                            // Stores the index doc value used in the current execution flow.
                            let indexDoc = {} as any;
                            indexDoc["playerCurrencies." + key + ".value"] = -1;

                            // Stores the index name value used in the current execution flow.
                            let indexName = "playerCurrencies." + key + ".value_-1";
                            characterPlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                            Debug.log("[GearN] [Database] create new index " + indexName + " at " + characterPlayerCollection.collectionName);
                        }

                        {
                            // Stores the index doc value used in the current execution flow.
                            let indexDoc = {} as any;
                            indexDoc["catalogId"] = 1;
                            indexDoc["playerCurrencies." + key + ".value"] = -1;

                            // Stores the index name value used in the current execution flow.
                            let indexName = "catalogId_1_" + "playerCurrencies." + key + ".value_-1";
                            characterPlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                            Debug.log("[GearN] [Database] create new index " + indexName + " at " + characterPlayerCollection.collectionName);
                        }
                    }
                }

                if (request.gameSettings.characterPlayerSettings.playerStatisticsSettings != null) {
                    // Stores the resolved player statistics settings instance for the current execution flow.
                    let playerStatisticsSettings = new Array<xStatisticsSettings>();

                    // Stores the remove key asc lst value used in the current execution flow.
                    let removeKeyAscLst = new Array<string>();
                    // Stores the remove key lst value used in the current execution flow.
                    let removeKeyLst = removeKeyAscLst; //new Array<string>();

                    let addKeyAscLst = new Array<string>();
                    // Stores the add key lst value used in the current execution flow.
                    let addKeyLst = addKeyAscLst; //new Array<string>();

                    for (let i = 0; i < currentCharacterPlayerSettings.playerStatisticsSettings.length; i++) {
                        // Stores the player statistics setting value used in the current execution flow.
                        let playerStatisticsSetting = currentCharacterPlayerSettings.playerStatisticsSettings[i];

                        if (playerStatisticsSetting.index) {
                            if (playerStatisticsSetting.statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) removeKeyAscLst.push(playerStatisticsSetting.key);
                            else removeKeyLst.push(playerStatisticsSetting.key);
                        }
                    }

                    for (let i = 0; i < request.gameSettings.characterPlayerSettings.playerStatisticsSettings.length; i++) {
                        // Stores the player statistics setting value used in the current execution flow.
                        let playerStatisticsSetting = request.gameSettings.characterPlayerSettings.playerStatisticsSettings[i];

                        playerStatisticsSettings.push({
                            key: playerStatisticsSetting.key,
                            statisticsAggregationMethod: playerStatisticsSetting.statisticsAggregationMethod,
                            maximumValue: playerStatisticsSetting.maximumValue,
                            minimumValue: playerStatisticsSetting.minimumValue,
                            initialValue: playerStatisticsSetting.initialValue,
                            description: playerStatisticsSetting.description,
                            index: playerStatisticsSetting.index,
                        });

                        if (playerStatisticsSetting.index) {
                            if (playerStatisticsSetting.statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) addKeyAscLst.push(playerStatisticsSetting.key);
                            else addKeyLst.push(playerStatisticsSetting.key);
                        }
                    }

                    currentCharacterPlayerSettings.playerStatisticsSettings = playerStatisticsSettings;
                    characterPlayerSettings.playerStatisticsSettings = playerStatisticsSettings;

                    {
                        for (let i = 0; i < addKeyLst.length; i++) {
                            // Stores the key value used in the current execution flow.
                            let key = addKeyLst[i];

                            // Stores the remove index of value used in the current execution flow.
                            let removeIndexOf = removeKeyLst.indexOf(key);

                            if (removeIndexOf != -1) {
                                removeKeyLst.splice(removeIndexOf, 1);

                                addKeyLst.splice(i, 1);
                                i -= 1;
                            }
                        }

                        for (let i = 0; i < removeKeyLst.length; i++) {
                            // Stores the key value used in the current execution flow.
                            let key = removeKeyLst[i];

                            {
                                // Stores the index name value used in the current execution flow.
                                let indexName = "playerStatistics." + key + ".value_-1";
                                characterPlayerCollection.dropIndex(indexName);

                                Debug.log("[GearN] [Database] drop index " + indexName + " at " + characterPlayerCollection.collectionName);
                            }

                            {
                                // Stores the index name value used in the current execution flow.
                                let indexName = "catalogId_1_" + "playerStatistics." + key + ".value_-1";
                                characterPlayerCollection.dropIndex(indexName);

                                Debug.log("[GearN] [Database] drop index " + indexName + " at " + characterPlayerCollection.collectionName);
                            }
                        }

                        for (let i = 0; i < addKeyLst.length; i++) {
                            // Stores the key value used in the current execution flow.
                            let key = addKeyLst[i];

                            {
                                // Stores the index doc value used in the current execution flow.
                                let indexDoc = {} as any;
                                indexDoc["playerStatistics." + key + ".value"] = -1;

                                // Stores the index name value used in the current execution flow.
                                let indexName = "playerStatistics." + key + ".value_-1";
                                characterPlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                                Debug.log("[GearN] [Database] create new index " + indexName + " at " + characterPlayerCollection.collectionName);
                            }

                            {
                                // Stores the index doc value used in the current execution flow.
                                let indexDoc = {} as any;
                                indexDoc["catalogId"] = 1;
                                indexDoc["playerStatistics." + key + ".value"] = -1;

                                // Stores the index name value used in the current execution flow.
                                let indexName = "catalogId_1_" + "playerStatistics." + key + ".value_-1";
                                characterPlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                                Debug.log("[GearN] [Database] create new index " + indexName + " at " + characterPlayerCollection.collectionName);
                            }
                        }
                    }
                }

                if (request.gameSettings.characterPlayerSettings.playerDatasSettings != null) {
                    // Stores the resolved player datas settings instance for the current execution flow.
                    let playerDatasSettings = new Array<xDataSettings>();

                    for (let i = 0; i < request.gameSettings.characterPlayerSettings.playerDatasSettings.length; i++) {
                        // Stores the player datas setting value used in the current execution flow.
                        let playerDatasSetting = request.gameSettings.characterPlayerSettings.playerDatasSettings[i];

                        playerDatasSettings.push({
                            key: playerDatasSetting.key,
                            permission: playerDatasSetting.permission,
                            description: playerDatasSetting.description,
                        });
                    }

                    currentCharacterPlayerSettings.playerDatasSettings = playerDatasSettings;
                    characterPlayerSettings.playerDatasSettings = playerDatasSettings;
                }

                if (request.gameSettings.characterPlayerSettings.customDatasSettings != null) {
                    // Stores the resolved custom datas settings instance for the current execution flow.
                    let customDatasSettings = new Array<xDataSettings>();

                    for (let i = 0; i < request.gameSettings.characterPlayerSettings.customDatasSettings.length; i++) {
                        // Stores the custom datas setting value used in the current execution flow.
                        let customDatasSetting = request.gameSettings.characterPlayerSettings.customDatasSettings[i];

                        customDatasSettings.push({
                            key: customDatasSetting.key,
                            permission: customDatasSetting.permission,
                            description: customDatasSetting.description,
                        });
                    }

                    currentCharacterPlayerSettings.customDatasSettings = customDatasSettings;
                    characterPlayerSettings.customDatasSettings = customDatasSettings;
                }

                if (request.gameSettings.characterPlayerSettings.tagsSettings != null) {
                    // Stores the resolved tags settings instance for the current execution flow.
                    let tagsSettings = new Array<xTagSettings>();

                    // Stores the remove key lst value used in the current execution flow.
                    let removeKeyLst = new Array<string>();
                    // Stores the add key lst value used in the current execution flow.
                    let addKeyLst = new Array<string>();

                    for (let i = 0; i < currentCharacterPlayerSettings.tagsSettings.length; i++) {
                        // Stores the tags setting value used in the current execution flow.
                        let tagsSetting = currentCharacterPlayerSettings.tagsSettings[i];
                        removeKeyLst.push(tagsSetting.key);
                    }

                    for (let i = 0; i < request.gameSettings.characterPlayerSettings.tagsSettings.length; i++) {
                        // Stores the tags setting value used in the current execution flow.
                        let tagsSetting = request.gameSettings.characterPlayerSettings.tagsSettings[i];

                        tagsSettings.push({
                            key: tagsSetting.key,
                            description: tagsSetting.description,
                            index: tagsSetting.index,
                        });

                        if (tagsSetting.index) addKeyLst.push(tagsSetting.key);
                    }

                    currentCharacterPlayerSettings.tagsSettings = tagsSettings;
                    characterPlayerSettings.tagsSettings = tagsSettings;

                    for (let i = 0; i < addKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = addKeyLst[i];

                        // Stores the remove index of value used in the current execution flow.
                        let removeIndexOf = removeKeyLst.indexOf(key);

                        if (removeIndexOf != -1) {
                            removeKeyLst.splice(removeIndexOf, 1);

                            addKeyLst.splice(i, 1);
                            i -= 1;
                        }
                    }

                    for (let i = 0; i < removeKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = removeKeyLst[i];

                        // Stores the index name value used in the current execution flow.
                        let indexName = "tags." + key + "_1";
                        characterPlayerCollection.dropIndex(indexName);

                        Debug.log("[GearN] [Database] drop index " + indexName + " at " + characterPlayerCollection.collectionName);
                    }

                    for (let i = 0; i < addKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = addKeyLst[i];
                        // Stores the index doc value used in the current execution flow.
                        let indexDoc = {} as any;
                        indexDoc["tags." + key] = 1;

                        // Stores the index name value used in the current execution flow.
                        let indexName = "tags." + key + "_1";
                        characterPlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                        Debug.log("[GearN] [Database] create new index " + indexName + " at " + characterPlayerCollection.collectionName);
                    }
                }

                if (request.gameSettings.characterPlayerSettings.playerGroupCatalogSettings != null) {
                    // Stores the resolved player group catalog settings instance for the current execution flow.
                    let playerGroupCatalogSettings = new Array<xGroupCatalogSettings>();

                    for (let i = 0; i < request.gameSettings.characterPlayerSettings.playerGroupCatalogSettings.length; i++) {
                        // Stores the player group catalog setting value used in the current execution flow.
                        let playerGroupCatalogSetting = request.gameSettings.characterPlayerSettings.playerGroupCatalogSettings[i];

                        playerGroupCatalogSettings.push({
                            catalogId: playerGroupCatalogSetting.catalogId,
                            description: playerGroupCatalogSetting.description,
                            forceAcceptMember: playerGroupCatalogSetting.forceAcceptMember,
                        });
                    }

                    currentCharacterPlayerSettings.playerGroupCatalogSettings = playerGroupCatalogSettings;
                    characterPlayerSettings.playerGroupCatalogSettings = playerGroupCatalogSettings;
                }

                if (request.gameSettings.characterPlayerSettings.playerItemCatalogSettings != null) {
                    // Stores the resolved player item catalog settings instance for the current execution flow.
                    let playerItemCatalogSettings = new Array<xItemCatalogSettings>();

                    for (let i = 0; i < request.gameSettings.characterPlayerSettings.playerItemCatalogSettings.length; i++) {
                        // Stores the player item catalog setting value used in the current execution flow.
                        let playerItemCatalogSetting = request.gameSettings.characterPlayerSettings.playerItemCatalogSettings[i];

                        playerItemCatalogSettings.push({
                            catalogId: playerItemCatalogSetting.catalogId,
                            itemType: playerItemCatalogSetting.itemType,
                            itemClassSettings: playerItemCatalogSetting.itemClassSettings,
                        });
                    }

                    currentCharacterPlayerSettings.playerItemCatalogSettings = playerItemCatalogSettings;
                    characterPlayerSettings.playerItemCatalogSettings = playerItemCatalogSettings;
                }

                if (request.gameSettings.characterPlayerSettings.playerFriendCatalogSettings != null) {
                    // Stores the resolved player friend catalog settings instance for the current execution flow.
                    let playerFriendCatalogSettings = new Array<xFriendCatalogSettings>();

                    for (let i = 0; i < request.gameSettings.characterPlayerSettings.playerFriendCatalogSettings.length; i++) {
                        // Stores the player friend catalog setting value used in the current execution flow.
                        let playerFriendCatalogSetting = request.gameSettings.characterPlayerSettings.playerFriendCatalogSettings[i];

                        characterPlayerSettings.playerFriendCatalogSettings.push({
                            catalogId: playerFriendCatalogSetting.catalogId,
                            description: playerFriendCatalogSetting.description,
                            forceAcceptFriend: playerFriendCatalogSetting.forceAcceptFriend,
                        });
                    }

                    currentCharacterPlayerSettings.playerFriendCatalogSettings = playerFriendCatalogSettings;
                    characterPlayerSettings.playerFriendCatalogSettings = playerFriendCatalogSettings;
                }
            }

            if (request.gameSettings.gamePlayerSettings != null) {
                // Stores the resolved game player settings instance for the current execution flow.
                let gamePlayerSettings = gameSettings.gamePlayerSettings;
                // Stores the resolved current game player settings instance for the current execution flow.
                let currentGamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(request.gameId);
                // Stores the game player collection value used in the current execution flow.
                let gamePlayerCollection = this.gnServer.getDatabase().systemGameCollection("GamePlayer", request.gameId);

                if (request.gameSettings.gamePlayerSettings.playerCurrenciesSettings != null) {
                    // Stores the resolved player currencies settings instance for the current execution flow.
                    let playerCurrenciesSettings = new Array<xCurrencySettings>();

                    // Stores the remove key lst value used in the current execution flow.
                    let removeKeyLst = new Array<string>();
                    // Stores the add key lst value used in the current execution flow.
                    let addKeyLst = new Array<string>();

                    for (let i = 0; i < currentGamePlayerSettings.playerCurrenciesSettings.length; i++) {
                        // Stores the player currencies setting value used in the current execution flow.
                        let playerCurrenciesSetting = currentGamePlayerSettings.playerCurrenciesSettings[i];
                        removeKeyLst.push(playerCurrenciesSetting.key);
                    }

                    for (let i = 0; i < request.gameSettings.gamePlayerSettings.playerCurrenciesSettings.length; i++) {
                        // Stores the player currencies setting value used in the current execution flow.
                        let playerCurrenciesSetting = request.gameSettings.gamePlayerSettings.playerCurrenciesSettings[i];

                        playerCurrenciesSettings.push({
                            key: playerCurrenciesSetting.key,
                            initialValue: playerCurrenciesSetting.initialValue,
                            description: playerCurrenciesSetting.description,
                            index: playerCurrenciesSetting.index,
                        });

                        if (playerCurrenciesSetting.index) addKeyLst.push(playerCurrenciesSetting.key);
                    }

                    currentGamePlayerSettings.playerCurrenciesSettings = playerCurrenciesSettings;
                    gamePlayerSettings.playerCurrenciesSettings = playerCurrenciesSettings;

                    for (let i = 0; i < addKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = addKeyLst[i];

                        // Stores the remove index of value used in the current execution flow.
                        let removeIndexOf = removeKeyLst.indexOf(key);

                        if (removeIndexOf != -1) {
                            removeKeyLst.splice(removeIndexOf, 1);

                            addKeyLst.splice(i, 1);
                            i -= 1;
                        }
                    }

                    for (let i = 0; i < removeKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = removeKeyLst[i];

                        // Stores the index name value used in the current execution flow.
                        let indexName = "playerCurrencies." + key + ".value_-1";
                        gamePlayerCollection.dropIndex(indexName);

                        Debug.log("[GearN] [Database] drop index " + indexName + " at " + gamePlayerCollection.collectionName);
                    }

                    for (let i = 0; i < addKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = addKeyLst[i];
                        // Stores the index doc value used in the current execution flow.
                        let indexDoc = {} as any;
                        indexDoc["playerCurrencies." + key + ".value"] = -1;

                        // Stores the index name value used in the current execution flow.
                        let indexName = "playerCurrencies." + key + ".value_-1";
                        gamePlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                        Debug.log("[GearN] [Database] create new index " + indexName + " at " + gamePlayerCollection.collectionName);
                    }
                }

                if (request.gameSettings.gamePlayerSettings.playerStatisticsSettings != null) {
                    // Stores the resolved player statistics settings instance for the current execution flow.
                    let playerStatisticsSettings = new Array<xStatisticsSettings>();

                    // Stores the remove key asc lst value used in the current execution flow.
                    let removeKeyAscLst = new Array<string>();
                    // Stores the remove key lst value used in the current execution flow.
                    let removeKeyLst = removeKeyAscLst; //new Array<string>();

                    let addKeyAscLst = new Array<string>();
                    // Stores the add key lst value used in the current execution flow.
                    let addKeyLst = addKeyAscLst; //new Array<string>();

                    for (let i = 0; i < currentGamePlayerSettings.playerStatisticsSettings.length; i++) {
                        // Stores the player statistics setting value used in the current execution flow.
                        let playerStatisticsSetting = currentGamePlayerSettings.playerStatisticsSettings[i];

                        if (playerStatisticsSetting.index) {
                            if (playerStatisticsSetting.statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) removeKeyAscLst.push(playerStatisticsSetting.key);
                            else removeKeyLst.push(playerStatisticsSetting.key);
                        }
                    }

                    for (let i = 0; i < request.gameSettings.gamePlayerSettings.playerStatisticsSettings.length; i++) {
                        // Stores the player statistics setting value used in the current execution flow.
                        let playerStatisticsSetting = request.gameSettings.gamePlayerSettings.playerStatisticsSettings[i];

                        playerStatisticsSettings.push({
                            key: playerStatisticsSetting.key,
                            statisticsAggregationMethod: playerStatisticsSetting.statisticsAggregationMethod,
                            maximumValue: playerStatisticsSetting.maximumValue,
                            minimumValue: playerStatisticsSetting.minimumValue,
                            initialValue: playerStatisticsSetting.initialValue,
                            description: playerStatisticsSetting.description,
                            index: playerStatisticsSetting.index,
                        });

                        if (playerStatisticsSetting.index) {
                            if (playerStatisticsSetting.statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) addKeyAscLst.push(playerStatisticsSetting.key);
                            else addKeyLst.push(playerStatisticsSetting.key);
                        }
                    }

                    currentGamePlayerSettings.playerStatisticsSettings = playerStatisticsSettings;
                    gamePlayerSettings.playerStatisticsSettings = playerStatisticsSettings;

                    {
                        for (let i = 0; i < addKeyLst.length; i++) {
                            // Stores the key value used in the current execution flow.
                            let key = addKeyLst[i];

                            // Stores the remove index of value used in the current execution flow.
                            let removeIndexOf = removeKeyLst.indexOf(key);

                            if (removeIndexOf != -1) {
                                removeKeyLst.splice(removeIndexOf, 1);

                                addKeyLst.splice(i, 1);
                                i -= 1;
                            }
                        }

                        for (let i = 0; i < removeKeyLst.length; i++) {
                            // Stores the key value used in the current execution flow.
                            let key = removeKeyLst[i];

                            // Stores the index name value used in the current execution flow.
                            let indexName = "playerStatistics." + key + ".value_-1";
                            gamePlayerCollection.dropIndex(indexName);

                            Debug.log("[GearN] [Database] drop index " + indexName + " at " + gamePlayerCollection.collectionName);
                        }

                        for (let i = 0; i < addKeyLst.length; i++) {
                            // Stores the key value used in the current execution flow.
                            let key = addKeyLst[i];
                            // Stores the index doc value used in the current execution flow.
                            let indexDoc = {} as any;
                            indexDoc["playerStatistics." + key + ".value"] = -1;

                            // Stores the index name value used in the current execution flow.
                            let indexName = "playerStatistics." + key + ".value_-1";
                            gamePlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                            Debug.log("[GearN] [Database] create new index " + indexName + " at " + gamePlayerCollection.collectionName);
                        }
                    }
                }

                if (request.gameSettings.gamePlayerSettings.playerDatasSettings != null) {
                    // Stores the resolved player datas settings instance for the current execution flow.
                    let playerDatasSettings = new Array<xDataSettings>();

                    for (let i = 0; i < request.gameSettings.gamePlayerSettings.playerDatasSettings.length; i++) {
                        // Stores the player datas setting value used in the current execution flow.
                        let playerDatasSetting = request.gameSettings.gamePlayerSettings.playerDatasSettings[i];

                        playerDatasSettings.push({
                            key: playerDatasSetting.key,
                            permission: playerDatasSetting.permission,
                            description: playerDatasSetting.description,
                        });
                    }

                    currentGamePlayerSettings.playerDatasSettings = playerDatasSettings;
                    gamePlayerSettings.playerDatasSettings = playerDatasSettings;
                }

                if (request.gameSettings.gamePlayerSettings.customDatasSettings != null) {
                    // Stores the resolved custom datas settings instance for the current execution flow.
                    let customDatasSettings = new Array<xDataSettings>();

                    for (let i = 0; i < request.gameSettings.gamePlayerSettings.customDatasSettings.length; i++) {
                        // Stores the custom datas setting value used in the current execution flow.
                        let customDatasSetting = request.gameSettings.gamePlayerSettings.customDatasSettings[i];

                        customDatasSettings.push({
                            key: customDatasSetting.key,
                            permission: customDatasSetting.permission,
                            description: customDatasSetting.description,
                        });
                    }

                    currentGamePlayerSettings.customDatasSettings = customDatasSettings;
                    gamePlayerSettings.customDatasSettings = customDatasSettings;
                }

                if (request.gameSettings.gamePlayerSettings.tagsSettings != null) {
                    // Stores the resolved tags settings instance for the current execution flow.
                    let tagsSettings = new Array<xTagSettings>();

                    // Stores the remove key lst value used in the current execution flow.
                    let removeKeyLst = new Array<string>();
                    // Stores the add key lst value used in the current execution flow.
                    let addKeyLst = new Array<string>();

                    for (let i = 0; i < gamePlayerSettings.tagsSettings.length; i++) {
                        // Stores the tags setting value used in the current execution flow.
                        let tagsSetting = gamePlayerSettings.tagsSettings[i];
                        removeKeyLst.push(tagsSetting.key);
                    }

                    for (let i = 0; i < request.gameSettings.gamePlayerSettings.tagsSettings.length; i++) {
                        // Stores the tags setting value used in the current execution flow.
                        let tagsSetting = request.gameSettings.gamePlayerSettings.tagsSettings[i];

                        tagsSettings.push({
                            key: tagsSetting.key,
                            description: tagsSetting.description,
                            index: tagsSetting.index,
                        });

                        if (tagsSetting.index) addKeyLst.push(tagsSetting.key);
                    }

                    currentGamePlayerSettings.tagsSettings = tagsSettings;
                    gamePlayerSettings.tagsSettings = tagsSettings;

                    for (let i = 0; i < addKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = addKeyLst[i];

                        // Stores the remove index of value used in the current execution flow.
                        let removeIndexOf = removeKeyLst.indexOf(key);

                        if (removeIndexOf != -1) {
                            removeKeyLst.splice(removeIndexOf, 1);

                            addKeyLst.splice(i, 1);
                            i -= 1;
                        }
                    }

                    for (let i = 0; i < removeKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = removeKeyLst[i];

                        // Stores the index name value used in the current execution flow.
                        let indexName = "tags." + key + "_1";
                        gamePlayerCollection.dropIndex(indexName);

                        Debug.log("[GearN] [Database] drop index " + indexName + " at " + gamePlayerCollection.collectionName);
                    }

                    for (let i = 0; i < addKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = addKeyLst[i];
                        // Stores the index doc value used in the current execution flow.
                        let indexDoc = {} as any;
                        indexDoc["tags." + key] = 1;

                        // Stores the index name value used in the current execution flow.
                        let indexName = "tags." + key + "_1";
                        gamePlayerCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                        Debug.log("[GearN] [Database] create new index " + indexName + " at " + gamePlayerCollection.collectionName);
                    }
                }

                if (request.gameSettings.gamePlayerSettings.playerCharacterCatalogSettings != null) {
                    // Stores the resolved player character catalog settings instance for the current execution flow.
                    let playerCharacterCatalogSettings = new Array<xCharacterCatalogSettings>();

                    for (let i = 0; i < request.gameSettings.gamePlayerSettings.playerCharacterCatalogSettings.length; i++) {
                        // Stores the player character catalog setting value used in the current execution flow.
                        let playerCharacterCatalogSetting = request.gameSettings.gamePlayerSettings.playerCharacterCatalogSettings[i];

                        playerCharacterCatalogSettings.push({
                            catalogId: playerCharacterCatalogSetting.catalogId,
                            description: playerCharacterCatalogSetting.description,
                        });
                    }

                    currentGamePlayerSettings.playerCharacterCatalogSettings = playerCharacterCatalogSettings;
                    gamePlayerSettings.playerCharacterCatalogSettings = playerCharacterCatalogSettings;
                }

                if (request.gameSettings.gamePlayerSettings.playerGroupCatalogSettings != null) {
                    // Stores the resolved player group catalog settings instance for the current execution flow.
                    let playerGroupCatalogSettings = new Array<xGroupCatalogSettings>();

                    for (let i = 0; i < request.gameSettings.gamePlayerSettings.playerGroupCatalogSettings.length; i++) {
                        // Stores the player group catalog setting value used in the current execution flow.
                        let playerGroupCatalogSetting = request.gameSettings.gamePlayerSettings.playerGroupCatalogSettings[i];

                        playerGroupCatalogSettings.push({
                            catalogId: playerGroupCatalogSetting.catalogId,
                            description: playerGroupCatalogSetting.description,
                            forceAcceptMember: playerGroupCatalogSetting.forceAcceptMember,
                        });
                    }

                    currentGamePlayerSettings.playerGroupCatalogSettings = playerGroupCatalogSettings;
                    gamePlayerSettings.playerGroupCatalogSettings = playerGroupCatalogSettings;
                }

                if (request.gameSettings.gamePlayerSettings.playerItemCatalogSettings != null) {
                    // Stores the resolved player item catalog settings instance for the current execution flow.
                    let playerItemCatalogSettings = new Array<xItemCatalogSettings>();

                    for (let i = 0; i < request.gameSettings.gamePlayerSettings.playerItemCatalogSettings.length; i++) {
                        // Stores the player item catalog setting value used in the current execution flow.
                        let playerItemCatalogSetting = request.gameSettings.gamePlayerSettings.playerItemCatalogSettings[i];

                        playerItemCatalogSettings.push({
                            catalogId: playerItemCatalogSetting.catalogId,
                            itemType: playerItemCatalogSetting.itemType,
                            itemClassSettings: playerItemCatalogSetting.itemClassSettings,
                        });
                    }

                    currentGamePlayerSettings.playerItemCatalogSettings = playerItemCatalogSettings;
                    gamePlayerSettings.playerItemCatalogSettings = playerItemCatalogSettings;
                }

                if (request.gameSettings.gamePlayerSettings.playerFriendCatalogSettings != null) {
                    // Stores the resolved player friend catalog settings instance for the current execution flow.
                    let playerFriendCatalogSettings = new Array<xFriendCatalogSettings>();

                    for (let i = 0; i < request.gameSettings.gamePlayerSettings.playerFriendCatalogSettings.length; i++) {
                        // Stores the player friend catalog setting value used in the current execution flow.
                        let playerFriendCatalogSetting = request.gameSettings.gamePlayerSettings.playerFriendCatalogSettings[i];

                        playerFriendCatalogSettings.push({
                            catalogId: playerFriendCatalogSetting.catalogId,
                            description: playerFriendCatalogSetting.description,
                            forceAcceptFriend: playerFriendCatalogSetting.forceAcceptFriend,
                        });
                    }

                    currentGamePlayerSettings.playerFriendCatalogSettings = playerFriendCatalogSettings;
                    gamePlayerSettings.playerFriendCatalogSettings = playerFriendCatalogSettings;
                }
            }

            if (request.gameSettings.groupSettings != null) {
                // Stores the resolved group settings instance for the current execution flow.
                let groupSettings = gameSettings.groupSettings;
                // Stores the resolved current group settings instance for the current execution flow.
                let currentGroupSettings = this.gnServer.getGNSettings().getGroupSettings(request.gameId);
                // Stores the group collection value used in the current execution flow.
                let groupCollection = this.gnServer.getDatabase().systemGameCollection("Group", request.gameId);

                if (request.gameSettings.groupSettings.groupCurrenciesSettings != null) {
                    // Stores the resolved group currencies settings instance for the current execution flow.
                    let groupCurrenciesSettings = new Array<xCurrencySettings>();

                    // Stores the remove key lst value used in the current execution flow.
                    let removeKeyLst = new Array<string>();
                    // Stores the add key lst value used in the current execution flow.
                    let addKeyLst = new Array<string>();

                    for (let i = 0; i < groupSettings.groupCurrenciesSettings.length; i++) {
                        // Stores the group currencies setting value used in the current execution flow.
                        let groupCurrenciesSetting = groupSettings.groupCurrenciesSettings[i];
                        removeKeyLst.push(groupCurrenciesSetting.key);
                    }

                    for (let i = 0; i < request.gameSettings.groupSettings.groupCurrenciesSettings.length; i++) {
                        // Stores the group currencies setting value used in the current execution flow.
                        let groupCurrenciesSetting = request.gameSettings.groupSettings.groupCurrenciesSettings[i];

                        groupCurrenciesSettings.push({
                            key: groupCurrenciesSetting.key,
                            initialValue: groupCurrenciesSetting.initialValue,
                            description: groupCurrenciesSetting.description,
                            index: groupCurrenciesSetting.index,
                        });

                        if (groupCurrenciesSetting.index) addKeyLst.push(groupCurrenciesSetting.key);
                    }

                    currentGroupSettings.groupCurrenciesSettings = groupCurrenciesSettings;
                    groupSettings.groupCurrenciesSettings = groupCurrenciesSettings;

                    for (let i = 0; i < addKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = addKeyLst[i];

                        // Stores the remove index of value used in the current execution flow.
                        let removeIndexOf = removeKeyLst.indexOf(key);

                        if (removeIndexOf != -1) {
                            removeKeyLst.splice(removeIndexOf, 1);

                            addKeyLst.splice(i, 1);
                            i -= 1;
                        }
                    }

                    for (let i = 0; i < removeKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = removeKeyLst[i];

                        {
                            // Stores the index name value used in the current execution flow.
                            let indexName = "groupCurrencies." + key + ".value_-1";
                            groupCollection.dropIndex(indexName);

                            Debug.log("[GearN] [Database] drop index " + indexName + " at " + groupCollection.collectionName);
                        }

                        {
                            // Stores the index name value used in the current execution flow.
                            let indexName = "catalogId_1_" + "groupCurrencies." + key + ".value_-1";
                            groupCollection.dropIndex(indexName);

                            Debug.log("[GearN] [Database] drop index " + indexName + " at " + groupCollection.collectionName);
                        }
                    }

                    for (let i = 0; i < addKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = addKeyLst[i];

                        {
                            // Stores the index doc value used in the current execution flow.
                            let indexDoc = {} as any;
                            indexDoc["groupCurrencies." + key + ".value"] = -1;

                            // Stores the index name value used in the current execution flow.
                            let indexName = "groupCurrencies." + key + ".value_-1";
                            groupCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                            Debug.log("[GearN] [Database] create new index " + indexName + " at " + groupCollection.collectionName);
                        }

                        {
                            // Stores the index doc value used in the current execution flow.
                            let indexDoc = {} as any;
                            indexDoc["catalogId"] = 1;
                            indexDoc["groupCurrencies." + key + ".value"] = -1;

                            // Stores the index name value used in the current execution flow.
                            let indexName = "catalogId_1_" + "groupCurrencies." + key + ".value_-1";
                            groupCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                            Debug.log("[GearN] [Database] create new index " + indexName + " at " + groupCollection.collectionName);
                        }
                    }
                }

                if (request.gameSettings.groupSettings.groupStatisticsSettings != null) {
                    // Stores the resolved group statistics settings instance for the current execution flow.
                    let groupStatisticsSettings = new Array<xStatisticsSettings>();

                    // Stores the remove key asc lst value used in the current execution flow.
                    let removeKeyAscLst = new Array<string>();
                    // Stores the remove key lst value used in the current execution flow.
                    let removeKeyLst = removeKeyAscLst; //new Array<string>();

                    let addKeyAscLst = new Array<string>();
                    // Stores the add key lst value used in the current execution flow.
                    let addKeyLst = addKeyAscLst; //new Array<string>();

                    for (let i = 0; i < groupSettings.groupStatisticsSettings.length; i++) {
                        // Stores the group statistics setting value used in the current execution flow.
                        let groupStatisticsSetting = groupSettings.groupStatisticsSettings[i];

                        if (groupStatisticsSetting.index) {
                            if (groupStatisticsSetting.statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) removeKeyAscLst.push(groupStatisticsSetting.key);
                            else removeKeyLst.push(groupStatisticsSetting.key);
                        }
                    }

                    for (let i = 0; i < request.gameSettings.groupSettings.groupStatisticsSettings.length; i++) {
                        // Stores the group statistics setting value used in the current execution flow.
                        let groupStatisticsSetting = request.gameSettings.groupSettings.groupStatisticsSettings[i];

                        groupStatisticsSettings.push({
                            key: groupStatisticsSetting.key,
                            statisticsAggregationMethod: groupStatisticsSetting.statisticsAggregationMethod,
                            maximumValue: groupStatisticsSetting.maximumValue,
                            minimumValue: groupStatisticsSetting.minimumValue,
                            initialValue: groupStatisticsSetting.initialValue,
                            description: groupStatisticsSetting.description,
                            index: groupStatisticsSetting.index,
                        });

                        if (groupStatisticsSetting.index) {
                            if (groupStatisticsSetting.statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) addKeyAscLst.push(groupStatisticsSetting.key);
                            else addKeyLst.push(groupStatisticsSetting.key);
                        }
                    }

                    currentGroupSettings.groupStatisticsSettings = groupStatisticsSettings;
                    groupSettings.groupStatisticsSettings = groupStatisticsSettings;

                    {
                        for (let i = 0; i < addKeyLst.length; i++) {
                            // Stores the key value used in the current execution flow.
                            let key = addKeyLst[i];

                            // Stores the remove index of value used in the current execution flow.
                            let removeIndexOf = removeKeyLst.indexOf(key);

                            if (removeIndexOf != -1) {
                                removeKeyLst.splice(removeIndexOf, 1);

                                addKeyLst.splice(i, 1);
                                i -= 1;
                            }
                        }

                        for (let i = 0; i < removeKeyLst.length; i++) {
                            // Stores the key value used in the current execution flow.
                            let key = removeKeyLst[i];

                            {
                                // Stores the index name value used in the current execution flow.
                                let indexName = "groupStatistics." + key + ".value_-1";
                                groupCollection.dropIndex(indexName);

                                Debug.log("[GearN] [Database] drop index " + indexName + " at " + groupCollection.collectionName);
                            }

                            {
                                // Stores the index name value used in the current execution flow.
                                let indexName = "catalogId_1_" + "groupStatistics." + key + ".value_-1";
                                groupCollection.dropIndex(indexName);

                                Debug.log("[GearN] [Database] drop index " + indexName + " at " + groupCollection.collectionName);
                            }
                        }

                        for (let i = 0; i < addKeyLst.length; i++) {
                            // Stores the key value used in the current execution flow.
                            let key = addKeyLst[i];

                            {
                                // Stores the index doc value used in the current execution flow.
                                let indexDoc = {} as any;
                                indexDoc["groupStatistics." + key + ".value"] = -1;

                                // Stores the index name value used in the current execution flow.
                                let indexName = "groupStatistics." + key + ".value_-1";
                                groupCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                                Debug.log("[GearN] [Database] create new index " + indexName + " at " + groupCollection.collectionName);
                            }

                            {
                                // Stores the index doc value used in the current execution flow.
                                let indexDoc = {} as any;
                                indexDoc["catalogId"] = 1;
                                indexDoc["groupStatistics." + key + ".value"] = -1;

                                // Stores the index name value used in the current execution flow.
                                let indexName = "catalogId_1_" + "groupStatistics." + key + ".value_-1";
                                groupCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                                Debug.log("[GearN] [Database] create new index " + indexName + " at " + groupCollection.collectionName);
                            }
                        }
                    }
                }

                if (request.gameSettings.groupSettings.groupDatasSettings != null) {
                    // Stores the resolved group datas settings instance for the current execution flow.
                    let groupDatasSettings = new Array<xDataSettings>();

                    for (let i = 0; i < request.gameSettings.groupSettings.groupDatasSettings.length; i++) {
                        // Stores the group datas setting value used in the current execution flow.
                        let groupDatasSetting = request.gameSettings.groupSettings.groupDatasSettings[i];

                        groupDatasSettings.push({
                            key: groupDatasSetting.key,
                            permission: groupDatasSetting.permission,
                            description: groupDatasSetting.description,
                        });
                    }

                    currentGroupSettings.groupDatasSettings = groupDatasSettings;
                    groupSettings.groupDatasSettings = groupDatasSettings;
                }

                if (request.gameSettings.groupSettings.customDatasSettings != null) {
                    // Stores the resolved custom datas settings instance for the current execution flow.
                    let customDatasSettings = new Array<xDataSettings>();

                    for (let i = 0; i < request.gameSettings.groupSettings.customDatasSettings.length; i++) {
                        // Stores the custom datas setting value used in the current execution flow.
                        let customDatasSetting = request.gameSettings.groupSettings.customDatasSettings[i];

                        customDatasSettings.push({
                            key: customDatasSetting.key,
                            permission: customDatasSetting.permission,
                            description: customDatasSetting.description,
                        });
                    }

                    currentGroupSettings.customDatasSettings = customDatasSettings;
                    groupSettings.customDatasSettings = customDatasSettings;
                }

                if (request.gameSettings.groupSettings.tagsSettings != null) {
                    // Stores the resolved tags settings instance for the current execution flow.
                    let tagsSettings = new Array<xTagSettings>();

                    // Stores the remove key lst value used in the current execution flow.
                    let removeKeyLst = new Array<string>();
                    // Stores the add key lst value used in the current execution flow.
                    let addKeyLst = new Array<string>();

                    for (let i = 0; i < groupSettings.tagsSettings.length; i++) {
                        // Stores the tags setting value used in the current execution flow.
                        let tagsSetting = groupSettings.tagsSettings[i];
                        removeKeyLst.push(tagsSetting.key);
                    }

                    for (let i = 0; i < request.gameSettings.groupSettings.tagsSettings.length; i++) {
                        // Stores the tags setting value used in the current execution flow.
                        let tagsSetting = request.gameSettings.groupSettings.tagsSettings[i];

                        tagsSettings.push({
                            key: tagsSetting.key,
                            description: tagsSetting.description,
                            index: tagsSetting.index,
                        });

                        if (tagsSetting.index) addKeyLst.push(tagsSetting.key);
                    }

                    currentGroupSettings.tagsSettings = tagsSettings;
                    groupSettings.tagsSettings = tagsSettings;

                    for (let i = 0; i < addKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = addKeyLst[i];

                        // Stores the remove index of value used in the current execution flow.
                        let removeIndexOf = removeKeyLst.indexOf(key);

                        if (removeIndexOf != -1) {
                            removeKeyLst.splice(removeIndexOf, 1);

                            addKeyLst.splice(i, 1);
                            i -= 1;
                        }
                    }

                    for (let i = 0; i < removeKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = removeKeyLst[i];
                        groupCollection.dropIndex("tags." + key + "_1");

                        // Stores the index name value used in the current execution flow.
                        let indexName = "tags." + key + "_1";
                        groupCollection.dropIndex(indexName);

                        Debug.log("[GearN] [Database] drop index " + indexName + " at " + groupCollection.collectionName);
                    }

                    for (let i = 0; i < addKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = addKeyLst[i];
                        // Stores the index doc value used in the current execution flow.
                        let indexDoc = {} as any;
                        indexDoc["tags." + key] = 1;

                        // Stores the index name value used in the current execution flow.
                        let indexName = "tags." + key + "_1";
                        groupCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                        Debug.log("[GearN] [Database] create new index " + indexName + " at " + groupCollection.collectionName);
                    }
                }

                if (request.gameSettings.groupSettings.groupItemCatalogSettings != null) {
                    // Stores the resolved group item catalog settings instance for the current execution flow.
                    let groupItemCatalogSettings = new Array<xItemCatalogSettings>();

                    for (let i = 0; i < request.gameSettings.groupSettings.groupItemCatalogSettings.length; i++) {
                        // Stores the group item catalog setting value used in the current execution flow.
                        let groupItemCatalogSetting = request.gameSettings.groupSettings.groupItemCatalogSettings[i];

                        groupItemCatalogSettings.push({
                            catalogId: groupItemCatalogSetting.catalogId,
                            itemType: groupItemCatalogSetting.itemType,
                            itemClassSettings: groupItemCatalogSetting.itemClassSettings,
                        });
                    }

                    currentGroupSettings.groupItemCatalogSettings = groupItemCatalogSettings;
                    groupSettings.groupItemCatalogSettings = groupItemCatalogSettings;
                }
            }

            if (request.gameSettings.inventorySettings != null) {
                // Stores the resolved inventory settings instance for the current execution flow.
                let inventorySettings = gameSettings.inventorySettings;
                // Stores the resolved current inventory settings instance for the current execution flow.
                let currentInventorySettings = this.gnServer.getGNSettings().getInventorySettings(request.gameId);
                // Stores the inventory collection value used in the current execution flow.
                let inventoryCollection = this.gnServer.getDatabase().systemGameCollection("Inventory", request.gameId);

                if (request.gameSettings.inventorySettings.itemStatisticsSettings != null) {
                    // Stores the resolved item statistics settings instance for the current execution flow.
                    let itemStatisticsSettings = new Array<xStatisticsSettings>();

                    // Stores the remove key asc lst value used in the current execution flow.
                    let removeKeyAscLst = new Array<string>();
                    // Stores the remove key lst value used in the current execution flow.
                    let removeKeyLst = removeKeyAscLst; //new Array<string>();

                    let addKeyAscLst = new Array<string>();
                    // Stores the add key lst value used in the current execution flow.
                    let addKeyLst = addKeyAscLst; //new Array<string>();

                    for (let i = 0; i < inventorySettings.itemStatisticsSettings.length; i++) {
                        // Stores the item statistics setting value used in the current execution flow.
                        let itemStatisticsSetting = inventorySettings.itemStatisticsSettings[i];

                        if (itemStatisticsSetting.index) {
                            if (itemStatisticsSetting.statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) removeKeyAscLst.push(itemStatisticsSetting.key);
                            else removeKeyLst.push(itemStatisticsSetting.key);
                        }
                    }

                    for (let i = 0; i < request.gameSettings.inventorySettings.itemStatisticsSettings.length; i++) {
                        // Stores the item statistics setting value used in the current execution flow.
                        let itemStatisticsSetting = request.gameSettings.inventorySettings.itemStatisticsSettings[i];

                        itemStatisticsSettings.push({
                            key: itemStatisticsSetting.key,
                            statisticsAggregationMethod: itemStatisticsSetting.statisticsAggregationMethod,
                            maximumValue: itemStatisticsSetting.maximumValue,
                            minimumValue: itemStatisticsSetting.minimumValue,
                            initialValue: itemStatisticsSetting.initialValue,
                            description: itemStatisticsSetting.description,
                            index: itemStatisticsSetting.index,
                        });

                        if (itemStatisticsSetting.index) {
                            if (itemStatisticsSetting.statisticsAggregationMethod == xStatisticsAggregationMethod.Minimum) addKeyAscLst.push(itemStatisticsSetting.key);
                            else addKeyLst.push(itemStatisticsSetting.key);
                        }
                    }

                    currentInventorySettings.itemStatisticsSettings = itemStatisticsSettings;
                    inventorySettings.itemStatisticsSettings = itemStatisticsSettings;

                    {
                        for (let i = 0; i < addKeyLst.length; i++) {
                            // Stores the key value used in the current execution flow.
                            let key = addKeyLst[i];

                            // Stores the remove index of value used in the current execution flow.
                            let removeIndexOf = removeKeyLst.indexOf(key);

                            if (removeIndexOf != -1) {
                                removeKeyLst.splice(removeIndexOf, 1);

                                addKeyLst.splice(i, 1);
                                i -= 1;
                            }
                        }

                        for (let i = 0; i < removeKeyLst.length; i++) {
                            // Stores the key value used in the current execution flow.
                            let key = removeKeyLst[i];

                            {
                                // Stores the index name value used in the current execution flow.
                                let indexName = "itemStatistics." + key + ".value_-1";
                                inventoryCollection.dropIndex(indexName);

                                Debug.log("[GearN] [Database] drop index " + indexName + " at " + inventoryCollection.collectionName);
                            }

                            {
                                // Stores the index name value used in the current execution flow.
                                let indexName = "catalogId_1_" + "itemStatistics." + key + ".value_-1";
                                inventoryCollection.dropIndex(indexName);

                                Debug.log("[GearN] [Database] drop index " + indexName + " at " + inventoryCollection.collectionName);
                            }
                        }

                        for (let i = 0; i < addKeyLst.length; i++) {
                            // Stores the key value used in the current execution flow.
                            let key = addKeyLst[i];
                            {
                                // Stores the index doc value used in the current execution flow.
                                let indexDoc = {} as any;
                                indexDoc["itemStatistics." + key + ".value"] = -1;

                                // Stores the index name value used in the current execution flow.
                                let indexName = "itemStatistics." + key + ".value_-1";
                                inventoryCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                                Debug.log("[GearN] [Database] create new index " + indexName + " at " + inventoryCollection.collectionName);
                            }

                            {
                                // Stores the index doc value used in the current execution flow.
                                let indexDoc = {} as any;
                                indexDoc["catalogId"] = 1;
                                indexDoc["itemStatistics." + key + ".value"] = -1;

                                // Stores the index name value used in the current execution flow.
                                let indexName = "catalogId_1_" + "itemStatistics." + key + ".value_-1";
                                inventoryCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                                Debug.log("[GearN] [Database] create new index " + indexName + " at " + inventoryCollection.collectionName);
                            }
                        }
                    }
                }

                if (request.gameSettings.inventorySettings.itemDatasSettings != null) {
                    // Stores the resolved item datas settings instance for the current execution flow.
                    let itemDatasSettings = new Array<xDataSettings>();

                    for (let i = 0; i < request.gameSettings.inventorySettings.itemDatasSettings.length; i++) {
                        // Stores the item datas setting value used in the current execution flow.
                        let itemDatasSetting = request.gameSettings.inventorySettings.itemDatasSettings[i];

                        itemDatasSettings.push({
                            key: itemDatasSetting.key,
                            permission: itemDatasSetting.permission,
                            description: itemDatasSetting.description,
                        });
                    }

                    currentInventorySettings.itemDatasSettings = itemDatasSettings;
                    inventorySettings.itemDatasSettings = itemDatasSettings;
                }

                if (request.gameSettings.inventorySettings.customDatasSettings != null) {
                    // Stores the resolved custom datas settings instance for the current execution flow.
                    let customDatasSettings = new Array<xDataSettings>();

                    for (let i = 0; i < request.gameSettings.inventorySettings.customDatasSettings.length; i++) {
                        // Stores the custom datas setting value used in the current execution flow.
                        let customDatasSetting = request.gameSettings.inventorySettings.customDatasSettings[i];

                        customDatasSettings.push({
                            key: customDatasSetting.key,
                            permission: customDatasSetting.permission,
                            description: customDatasSetting.description,
                        });
                    }

                    currentInventorySettings.customDatasSettings = customDatasSettings;
                    inventorySettings.customDatasSettings = customDatasSettings;
                }

                if (request.gameSettings.inventorySettings.tagsSettings != null) {
                    // Stores the resolved tags settings instance for the current execution flow.
                    let tagsSettings = new Array<xTagSettings>();

                    // Stores the remove key lst value used in the current execution flow.
                    let removeKeyLst = new Array<string>();
                    // Stores the add key lst value used in the current execution flow.
                    let addKeyLst = new Array<string>();

                    for (let i = 0; i < inventorySettings.tagsSettings.length; i++) {
                        // Stores the tags setting value used in the current execution flow.
                        let tagsSetting = inventorySettings.tagsSettings[i];
                        removeKeyLst.push(tagsSetting.key);
                    }

                    for (let i = 0; i < request.gameSettings.inventorySettings.tagsSettings.length; i++) {
                        // Stores the tags setting value used in the current execution flow.
                        let tagsSetting = request.gameSettings.inventorySettings.tagsSettings[i];

                        tagsSettings.push({
                            key: tagsSetting.key,
                            description: tagsSetting.description,
                            index: tagsSetting.index,
                        });

                        if (tagsSetting.index) addKeyLst.push(tagsSetting.key);
                    }

                    currentInventorySettings.tagsSettings = tagsSettings;
                    inventorySettings.tagsSettings = tagsSettings;

                    for (let i = 0; i < addKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = addKeyLst[i];

                        // Stores the remove index of value used in the current execution flow.
                        let removeIndexOf = removeKeyLst.indexOf(key);

                        if (removeIndexOf != -1) {
                            removeKeyLst.splice(removeIndexOf, 1);

                            addKeyLst.splice(i, 1);
                            i -= 1;
                        }
                    }

                    for (let i = 0; i < removeKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = removeKeyLst[i];

                        // Stores the index name value used in the current execution flow.
                        let indexName = "tags." + key + "_1";
                        inventoryCollection.dropIndex(indexName);

                        Debug.log("[GearN] [Database] drop index " + indexName + " at " + inventoryCollection.collectionName);
                    }

                    for (let i = 0; i < addKeyLst.length; i++) {
                        // Stores the key value used in the current execution flow.
                        let key = addKeyLst[i];
                        // Stores the index doc value used in the current execution flow.
                        let indexDoc = {} as any;
                        indexDoc["tags." + key] = 1;

                        // Stores the index name value used in the current execution flow.
                        let indexName = "tags." + key + "_1";
                        inventoryCollection.createIndex(indexDoc, { background: true, sparse: true, name: indexName });

                        Debug.log("[GearN] [Database] create new index " + indexName + " at " + inventoryCollection.collectionName);
                    }
                }
            }

            gameItem.setGameSettings(gameSettings);
        }

        if (request.matchmakingQueueSettings) {
            // Stores the resolved matchmaking queue settings instance for the current execution flow.
            let matchmakingQueueSettings = gameItem.getMatchmakingQueueSettings();
            if (matchmakingQueueSettings == null) {
                matchmakingQueueSettings = [];
            }

            for (let i = 0; i < request.matchmakingQueueSettings.length; i++) {
                // Stores the request matchmaking queue setting value used in the current execution flow.
                let requestMatchmakingQueueSetting = request.matchmakingQueueSettings[i];

                // Stores the matchmaking queue setting value used in the current execution flow.
                let matchmakingQueueSetting = matchmakingQueueSettings.find((x) => x.queueName == requestMatchmakingQueueSetting.queueName);

                if (requestMatchmakingQueueSetting.remove) {
                    if (matchmakingQueueSetting != null) {
                        matchmakingQueueSettings.splice(matchmakingQueueSettings.indexOf(matchmakingQueueSetting), 1);
                    }
                } else {
                    if (matchmakingQueueSetting == null) {
                        matchmakingQueueSetting = {
                            queueName: requestMatchmakingQueueSetting.queueName,
                        } as any;

                        matchmakingQueueSettings.push(matchmakingQueueSetting);
                    }

                    matchmakingQueueSetting.matchSize = requestMatchmakingQueueSetting.matchSize;
                    matchmakingQueueSetting.ticketSize = requestMatchmakingQueueSetting.ticketSize;
                    matchmakingQueueSetting.serverAllocation = requestMatchmakingQueueSetting.serverAllocation;

                    matchmakingQueueSetting.teams = null;
                    matchmakingQueueSetting.rules = null;

                    if (requestMatchmakingQueueSetting.teams != null) {
                        matchmakingQueueSetting.teams = [];

                        for (let j = 0; j < requestMatchmakingQueueSetting.teams.length; j++) {
                            // Stores the request team value used in the current execution flow.
                            let requestTeam = requestMatchmakingQueueSetting.teams[j];

                            matchmakingQueueSetting.teams.push({
                                teamId: requestTeam.teamId,
                                teamSize: requestTeam.teamSize,
                            });
                        }
                    }

                    if (requestMatchmakingQueueSetting.rules != null) {
                        matchmakingQueueSetting.rules = [];

                        for (let j = 0; j < requestMatchmakingQueueSetting.rules.length; j++) {
                            // Stores the request rule value used in the current execution flow.
                            let requestRule = requestMatchmakingQueueSetting.rules[j];

                            if (requestRule.type == RuleType.String) {
                                // Stores the rule value used in the current execution flow.
                                let rule: StringRule = {
                                    name: requestRule.name,
                                    type: requestRule.type,

                                    attributePath: requestRule.attributePath,
                                    attributeSource: requestRule.attributeSource,

                                    defaultValue: requestRule.defaultValue,
                                    compairType: requestRule.compairType,
                                };

                                if (requestRule.advancedSettings != null) {
                                    rule.advancedSettings = {
                                        secondsUntilOptional: requestRule.advancedSettings.secondsUntilOptional,
                                        expansionType: requestRule.advancedSettings.expansionType,
                                    };

                                    if (requestRule.advancedSettings.customExpansions != null) {
                                        rule.advancedSettings.customExpansions = {
                                            secondsBetweenExpansions: requestRule.advancedSettings.customExpansions.secondsBetweenExpansions,
                                            overrideValue: requestRule.advancedSettings.customExpansions.overrideValue,
                                        };
                                    }
                                }

                                matchmakingQueueSetting.rules.push(rule);
                            } else if (requestRule.type == RuleType.Difference) {
                                // Stores the rule value used in the current execution flow.
                                let rule: DifferenceRule = {
                                    name: requestRule.name,
                                    type: requestRule.type,

                                    attributePath: requestRule.attributePath,
                                    attributeSource: requestRule.attributeSource,

                                    defaultValue: requestRule.defaultValue,
                                    allowedDifference: requestRule.allowedDifference,
                                };

                                if (requestRule.advancedSettings != null) {
                                    rule.advancedSettings = {
                                        secondsUntilOptional: requestRule.advancedSettings.secondsUntilOptional,
                                        expansionType: requestRule.advancedSettings.expansionType,
                                    };

                                    if (requestRule.advancedSettings.linearExpansions != null) {
                                        rule.advancedSettings.linearExpansions = {
                                            secondsBetweenExpansions: requestRule.advancedSettings.linearExpansions.secondsBetweenExpansions,
                                            delta: requestRule.advancedSettings.linearExpansions.delta,
                                            limit: requestRule.advancedSettings.linearExpansions.limit,
                                        };
                                    }

                                    if (requestRule.advancedSettings.customExpansions != null) {
                                        rule.advancedSettings.customExpansions = {
                                            secondsBetweenExpansions: requestRule.advancedSettings.customExpansions.secondsBetweenExpansions,
                                            overrideValue: requestRule.advancedSettings.customExpansions.overrideValue,
                                        };
                                    }
                                }

                                matchmakingQueueSetting.rules.push(rule);
                            } else if (requestRule.type == RuleType.SetIntersection) {
                                // Stores the rule value used in the current execution flow.
                                let rule: SetIntersectionRule = {
                                    name: requestRule.name,
                                    type: requestRule.type,

                                    attributePath: requestRule.attributePath,
                                    attributeSource: requestRule.attributeSource,

                                    min: requestRule.min,
                                    defaultValue: requestRule.defaultValue,
                                };

                                if (requestRule.advancedSettings != null) {
                                    rule.advancedSettings = {
                                        secondsUntilOptional: requestRule.advancedSettings.secondsUntilOptional,
                                        expansionType: requestRule.advancedSettings.expansionType,
                                    };

                                    if (requestRule.advancedSettings.linearExpansions != null) {
                                        rule.advancedSettings.linearExpansions = {
                                            secondsBetweenExpansions: requestRule.advancedSettings.linearExpansions.secondsBetweenExpansions,
                                            delta: requestRule.advancedSettings.linearExpansions.delta,
                                        };
                                    }

                                    if (requestRule.advancedSettings.customExpansions != null) {
                                        rule.advancedSettings.customExpansions = {
                                            secondsBetweenExpansions: requestRule.advancedSettings.customExpansions.secondsBetweenExpansions,
                                            overrideValue: requestRule.advancedSettings.customExpansions.overrideValue,
                                        };
                                    }
                                }

                                matchmakingQueueSetting.rules.push(rule);
                            } else if (requestRule.type == RuleType.MatchTotal) {
                                // Stores the rule value used in the current execution flow.
                                let rule: MatchTotalRule = {
                                    name: requestRule.name,
                                    type: requestRule.type,

                                    attributePath: requestRule.attributePath,
                                    attributeSource: requestRule.attributeSource,

                                    min: requestRule.min,
                                    max: requestRule.max,
                                };

                                if (requestRule.advancedSettings != null) {
                                    rule.advancedSettings = {
                                        secondsUntilOptional: requestRule.advancedSettings.secondsUntilOptional,
                                        expansionType: requestRule.advancedSettings.expansionType,
                                    };

                                    if (requestRule.advancedSettings.customExpansions != null) {
                                        rule.advancedSettings.customExpansions = {
                                            secondsBetweenExpansions: requestRule.advancedSettings.customExpansions.secondsBetweenExpansions,
                                            overrideMax: requestRule.advancedSettings.customExpansions.overrideMax,
                                            overrideMin: requestRule.advancedSettings.customExpansions.overrideMin,
                                        };
                                    }
                                }

                                matchmakingQueueSetting.rules.push(rule);
                            } else if (requestRule.type == RuleType.RegionSelection) {
                                // Stores the rule value used in the current execution flow.
                                let rule: RegionSelectionRule = {
                                    name: requestRule.name,
                                    type: requestRule.type,

                                    attributePath: requestRule.attributePath,
                                    max: requestRule.max,
                                };

                                if (requestRule.advancedSettings != null) {
                                    rule.advancedSettings = {
                                        secondsUntilOptional: requestRule.advancedSettings.secondsUntilOptional,
                                        expansionType: requestRule.advancedSettings.expansionType,
                                    };

                                    if (requestRule.advancedSettings.linearExpansions != null) {
                                        rule.advancedSettings.linearExpansions = {
                                            secondsBetweenExpansions: requestRule.advancedSettings.linearExpansions.secondsBetweenExpansions,
                                            delta: requestRule.advancedSettings.linearExpansions.delta,
                                            limit: requestRule.advancedSettings.linearExpansions.limit,
                                        };
                                    }

                                    if (requestRule.advancedSettings.customExpansions != null) {
                                        rule.advancedSettings.customExpansions = {
                                            secondsBetweenExpansions: requestRule.advancedSettings.customExpansions.secondsBetweenExpansions,
                                            overrideValue: requestRule.advancedSettings.customExpansions.overrideValue,
                                        };
                                    }
                                }

                                matchmakingQueueSetting.rules.push(rule);
                            } else if (requestRule.type == RuleType.TeamSizeBalance) {
                                // Stores the rule value used in the current execution flow.
                                let rule: TeamSizeBalanceRule = {
                                    name: requestRule.name,
                                    type: requestRule.type,

                                    allowedDifference: requestRule.allowedDifference,
                                };

                                if (requestRule.advancedSettings != null) {
                                    rule.advancedSettings = {
                                        secondsUntilOptional: requestRule.advancedSettings.secondsUntilOptional,
                                        expansionType: requestRule.advancedSettings.expansionType,
                                    };

                                    if (requestRule.advancedSettings.linearExpansions != null) {
                                        rule.advancedSettings.linearExpansions = {
                                            secondsBetweenExpansions: requestRule.advancedSettings.linearExpansions.secondsBetweenExpansions,
                                            delta: requestRule.advancedSettings.linearExpansions.delta,
                                            limit: requestRule.advancedSettings.linearExpansions.limit,
                                        };
                                    }

                                    if (requestRule.advancedSettings.customExpansions != null) {
                                        rule.advancedSettings.customExpansions = {
                                            secondsBetweenExpansions: requestRule.advancedSettings.customExpansions.secondsBetweenExpansions,
                                            overrideValue: requestRule.advancedSettings.customExpansions.overrideValue,
                                        };
                                    }
                                }

                                matchmakingQueueSetting.rules.push(rule);
                            } else if (requestRule.type == RuleType.TeamDifference) {
                                // Stores the rule value used in the current execution flow.
                                let rule: TeamDifferenceRule = {
                                    name: requestRule.name,
                                    type: requestRule.type,

                                    attributePath: requestRule.attributePath,
                                    attributeSource: requestRule.attributeSource,

                                    allowedDifference: requestRule.allowedDifference,
                                    defaultValue: requestRule.defaultValue,
                                };

                                if (requestRule.advancedSettings != null) {
                                    rule.advancedSettings = {
                                        secondsUntilOptional: requestRule.advancedSettings.secondsUntilOptional,
                                        expansionType: requestRule.advancedSettings.expansionType,
                                    };

                                    if (requestRule.advancedSettings.linearExpansions != null) {
                                        rule.advancedSettings.linearExpansions = {
                                            secondsBetweenExpansions: requestRule.advancedSettings.linearExpansions.secondsBetweenExpansions,
                                            delta: requestRule.advancedSettings.linearExpansions.delta,
                                            limit: requestRule.advancedSettings.linearExpansions.limit,
                                        };
                                    }

                                    if (requestRule.advancedSettings.customExpansions != null) {
                                        rule.advancedSettings.customExpansions = {
                                            secondsBetweenExpansions: requestRule.advancedSettings.customExpansions.secondsBetweenExpansions,
                                            overrideValue: requestRule.advancedSettings.customExpansions.overrideValue,
                                        };
                                    }
                                }

                                matchmakingQueueSetting.rules.push(rule);
                            } else if (requestRule.type == RuleType.TeamTicketSizeSimilarity) {
                                // Stores the rule value used in the current execution flow.
                                let rule: TeamTicketSizeSimilarityRule = {
                                    name: requestRule.name,
                                    type: requestRule.type,
                                };

                                if (requestRule.advancedSettings != null) {
                                    rule.advancedSettings = {
                                        secondsUntilOptional: requestRule.advancedSettings.secondsUntilOptional,
                                    };
                                }

                                matchmakingQueueSetting.rules.push(rule);
                            }
                        }
                    }
                }
            }

            gameItem.setMatchmakingQueueSettings(matchmakingQueueSettings);
        }

        await gameItem.saveAsync();

        operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

        await this.gnServer.getPostEventCallbackService().onEvent("dashboard_SetGameInformation", request, role, secretInfo, operationRequest, operationResponse);

        return operationResponse;
    }

    /**
     * Executes the init workflow.
     */
    protected override init(): void {
        this.startStreamWatch();
    }

    private startStreamWatch() {
        let collection = this.gnServer.getDatabase().systemCollection("MasterAdmin");

        const thiz = this;

        const startWatch = () => {
            Debug.log("[GearN] [SetGameInformationRequestHandler] stream start on collection: " + collection.collectionName);

            const stream = collection.watch([
                {
                    $match: {
                        operationType: {
                            $in: [
                                "update",
                            ]
                        },
                        "fullDocument.type": "gameSettings",
                    }
                }
            ], {
                fullDocument: "updateLookup"
            });

            stream.on("change", (change) => {
                if (change.operationType == "update") {
                    const gameItem = new GameItem(change.fullDocument as any, collection);

                    const gameId = gameItem.getGameId();

                    {
                        const gameSettings = gameItem.getGameSettings();

                        {
                            const gamePlayerSettings = gameSettings.gamePlayerSettings;

                            const currentGamePlayerSettings = thiz.gnServer.getGNSettings().getGamePlayerSettings(gameId);

                            currentGamePlayerSettings.playerCurrenciesSettings = gamePlayerSettings.playerCurrenciesSettings;
                            currentGamePlayerSettings.playerStatisticsSettings = gamePlayerSettings.playerStatisticsSettings;
                            currentGamePlayerSettings.playerDatasSettings = gamePlayerSettings.playerDatasSettings;
                            currentGamePlayerSettings.customDatasSettings = gamePlayerSettings.customDatasSettings;
                            currentGamePlayerSettings.tagsSettings = gamePlayerSettings.tagsSettings;

                            currentGamePlayerSettings.playerCharacterCatalogSettings = gamePlayerSettings.playerCharacterCatalogSettings;
                            currentGamePlayerSettings.playerGroupCatalogSettings = gamePlayerSettings.playerGroupCatalogSettings;
                            currentGamePlayerSettings.playerItemCatalogSettings = gamePlayerSettings.playerItemCatalogSettings;
                            currentGamePlayerSettings.playerFriendCatalogSettings = gamePlayerSettings.playerFriendCatalogSettings;

                        }

                        {
                            const characterPlayerSettings = gameSettings.characterPlayerSettings;

                            const currentCharacterPlayerSettings = thiz.gnServer.getGNSettings().getCharacterPlayerSettings(gameId);

                            currentCharacterPlayerSettings.playerCurrenciesSettings = characterPlayerSettings.playerCurrenciesSettings;
                            currentCharacterPlayerSettings.playerStatisticsSettings = characterPlayerSettings.playerStatisticsSettings;
                            currentCharacterPlayerSettings.playerDatasSettings = characterPlayerSettings.playerDatasSettings;
                            currentCharacterPlayerSettings.customDatasSettings = characterPlayerSettings.customDatasSettings;
                            currentCharacterPlayerSettings.tagsSettings = characterPlayerSettings.tagsSettings;

                            currentCharacterPlayerSettings.playerGroupCatalogSettings = characterPlayerSettings.playerGroupCatalogSettings;
                            currentCharacterPlayerSettings.playerItemCatalogSettings = characterPlayerSettings.playerItemCatalogSettings;
                            currentCharacterPlayerSettings.playerFriendCatalogSettings = characterPlayerSettings.playerFriendCatalogSettings;
                        }

                        {
                            const groupSettings = gameSettings.groupSettings;

                            const currentGroupSettings = thiz.gnServer.getGNSettings().getGroupSettings(gameId);

                            currentGroupSettings.groupCurrenciesSettings = groupSettings.groupCurrenciesSettings;
                            currentGroupSettings.groupStatisticsSettings = groupSettings.groupStatisticsSettings;
                            currentGroupSettings.groupDatasSettings = groupSettings.groupDatasSettings;
                            currentGroupSettings.customDatasSettings = groupSettings.customDatasSettings;
                            currentGroupSettings.tagsSettings = groupSettings.tagsSettings;
                            currentGroupSettings.groupItemCatalogSettings = groupSettings.groupItemCatalogSettings;
                        }

                        {
                            const inventorySettings = gameSettings.inventorySettings;

                            const currentInventorySettings = thiz.gnServer.getGNSettings().getInventorySettings(gameId);

                            currentInventorySettings.itemStatisticsSettings = inventorySettings.itemStatisticsSettings;
                            currentInventorySettings.itemDatasSettings = inventorySettings.itemDatasSettings;
                            currentInventorySettings.customDatasSettings = inventorySettings.customDatasSettings;
                            currentInventorySettings.tagsSettings = inventorySettings.tagsSettings;
                        }
                    }

                    {
                        // Stores the resolved matchmaking queue settings instance for the current execution flow.
                        const matchmakingQueueSettings = gameItem.getMatchmakingQueueSettings() ?? [];

                        const currentMatchmakingQueueSettings = thiz.gnServer.getGNSettings().getMatchmakingQueueSettings(gameId);
                        currentMatchmakingQueueSettings.length = 0;

                        if (matchmakingQueueSettings != null) {
                            matchmakingQueueSettings.forEach((matchmakingQueueSetting) => {
                                currentMatchmakingQueueSettings.push(matchmakingQueueSetting);
                            });
                        }
                    }

                    Debug.log("[GearN] [SetGameInformationRequestHandler] stream update game config on " + gameId);
                }
            });

            stream.on("error", (err) => {
                Debug.logError("[GearN] [SetGameInformationRequestHandler] stream error: " + err.message);

                stream.close();

                setTimeout(() => {
                    startWatch();
                }, 1000);
            });
        };

        startWatch();
    }
}
