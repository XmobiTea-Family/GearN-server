import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { GNParameterCode } from "./../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNErrorCode } from "./../../../../../GN-common/constant/errorCode/GNErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { DifferenceRule, MatchTotalRule, RegionSelectionRule, RuleAttributeSource, RuleType, SetIntersectionRule, StringRule, TeamDifferenceRule, TeamSizeBalanceRule, TeamTicketSizeSimilarityRule, xMatchmakingQueueSettings } from "./../../../../../GN-library/xsettings/lib/entity/xMatchmakingQueueSettings";
import { GNHashtable } from "./../../../../../GN-common/common/GNData";
import { DataValueType } from "./../../../../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";

export abstract class MultiplayerBaseRequestHandler extends RequestHandler {
    protected getMatchmakingQueueSettings(queueName: string, gameId: string): xMatchmakingQueueSettings {
        let matchmakingQueueSettings = this.gnServer.getGNSettings().getMatchmakingQueueSettings(gameId);
        return matchmakingQueueSettings.find(x => x.queueName == queueName);
    }

    protected async getAttributeForQueue(userId: string, gameId: string, attribute: GNHashtable, matchmakingQueueSettings: xMatchmakingQueueSettings): Promise<{ [k: string]: DataValueType }> {
        let answer: { [k: string]: DataValueType } = {};

        if (attribute != null && matchmakingQueueSettings.rules != null) {
            let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(userId, gameId, {
                playerDatas: true,
                
            });

            if (gamePlayer != null) {
                for (let i = 0; i < matchmakingQueueSettings.rules.length; i++) {
                    let matchmakingRules = matchmakingQueueSettings.rules[i];

                    if (matchmakingRules.type == RuleType.String) {
                        let stringRule = <StringRule>matchmakingRules;

                        let value: string = null;

                        if (stringRule.attributeSource == RuleAttributeSource.UserInput) {
                            value = attribute.getString(stringRule.attributePath, null);
                        }
                        else if (stringRule.attributeSource == RuleAttributeSource.PlayerData) {
                            let tempValue = gamePlayer.getPlayerData(stringRule.attributePath);

                            if (typeof (tempValue) == "string") {
                                value = <string>tempValue;
                            }
                        }

                        if (value == null) {
                            value = stringRule.defaultValue;
                        }

                        answer[matchmakingRules.name] = value;
                    }
                    else if (matchmakingRules.type == RuleType.Difference) {
                        let differenceRule = <DifferenceRule>matchmakingRules;

                        let value: number = 0;

                        if (differenceRule.attributeSource == RuleAttributeSource.UserInput) {
                            value = attribute.getNumber(differenceRule.attributePath, 0);
                        }
                        else if (differenceRule.attributeSource == RuleAttributeSource.PlayerData) {
                            let tempValue = gamePlayer.getPlayerData(differenceRule.attributePath);

                            if (typeof (tempValue) == "number") {
                                value = <number>tempValue;
                            }
                        }

                        if (value == null) {
                            value = differenceRule.defaultValue;
                        }

                        answer[matchmakingRules.name] = value;
                    }
                    else if (matchmakingRules.type == RuleType.SetIntersection) {
                        let setIntersectionRule = <SetIntersectionRule>matchmakingRules;

                        let value: string[] = [];

                        if (setIntersectionRule.attributeSource == RuleAttributeSource.UserInput) {
                            let tempValue = attribute.getGNArray(setIntersectionRule.attributePath, null);

                            if (tempValue != null) {
                                value = tempValue.toData();
                            }
                        }
                        else if (setIntersectionRule.attributeSource == RuleAttributeSource.PlayerData) {
                            let tempValue = gamePlayer.getPlayerData(setIntersectionRule.attributePath);

                            if (typeof (tempValue) == "object") {
                                if (Array.isArray(tempValue)) {
                                    value = <any>tempValue;
                                }
                            }
                        }

                        if (value == null) {
                            if (setIntersectionRule.defaultValue == null) setIntersectionRule.defaultValue = [];

                            for (let i = 0; i < setIntersectionRule.defaultValue.length; i++) {
                                value.push(setIntersectionRule.defaultValue[i]);
                            }
                        }

                        answer[matchmakingRules.name] = value;
                    }
                    else if (matchmakingRules.type == RuleType.MatchTotal) {
                        let matchTotalRule = <MatchTotalRule>matchmakingRules;

                        let value: number = 0;

                        if (matchTotalRule.attributeSource == RuleAttributeSource.UserInput) {
                            value = attribute.getNumber(matchTotalRule.attributePath, 0);
                        }
                        else if (matchTotalRule.attributeSource == RuleAttributeSource.PlayerData) {
                            let tempValue = gamePlayer.getPlayerData(matchTotalRule.attributePath);

                            if (typeof (tempValue) == "number") {
                                value = <number>tempValue;
                            }
                        }

                        answer[matchmakingRules.name] = value;
                    }
                    else if (matchmakingRules.type == RuleType.RegionSelection) {
                        let regionSelectionRule = <RegionSelectionRule>matchmakingRules;

                        let value = {
                            region: "",
                            ping: 0
                        };

                        let tempValue = attribute.getGNHashtable(regionSelectionRule.attributePath, null);

                        if (tempValue != null) {
                            value.region = tempValue.getString("region", "");
                            value.ping = tempValue.getNumber("ping", 0);
                        }

                        answer[matchmakingRules.name] = value as any;
                    }
                    // else if (matchmakingRules.type == RuleType.TeamSizeBalance) {
                    //     let teamSizeBalanceRule = <TeamSizeBalanceRule>matchmakingRules;

                    //     answer[matchmakingRules.name] = value as any;
                    // }
                    else if (matchmakingRules.type == RuleType.TeamDifference) {
                        let teamDifferenceRule = <TeamDifferenceRule>matchmakingRules;

                        let value: number = 0;

                        if (teamDifferenceRule.attributeSource == RuleAttributeSource.UserInput) {
                            value = attribute.getNumber(teamDifferenceRule.attributePath, 0);
                        }
                        else if (teamDifferenceRule.attributeSource == RuleAttributeSource.PlayerData) {
                            let tempValue = gamePlayer.getPlayerData(teamDifferenceRule.attributePath);

                            if (typeof (tempValue) == "number") {
                                value = <number>tempValue;
                            }
                        }

                        if (value == null) {
                            value = teamDifferenceRule.defaultValue;
                        }

                        answer[matchmakingRules.name] = value;
                    }
                    // else if (matchmakingRules.type == RuleType.TeamTicketSizeSimilarity) {
                    //     let teamTicketSizeSimilarityRule = <TeamTicketSizeSimilarityRule>matchmakingRules;

                    // }
                }
            }
        }

        return answer;
    }
}
