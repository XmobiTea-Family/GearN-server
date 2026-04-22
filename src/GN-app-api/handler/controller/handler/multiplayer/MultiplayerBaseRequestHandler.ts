import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { RequestHandler } from "./../base/RequestHandler";
import { DifferenceRule, MatchTotalRule, RegionSelectionRule, RuleAttributeSource, RuleType, SetIntersectionRule, StringRule, TeamDifferenceRule, TeamSizeBalanceRule, TeamTicketSizeSimilarityRule, xMatchmakingQueueSettings } from "./../../../../../GN-library/xsettings/lib/entity/xMatchmakingQueueSettings";
import { GNHashtable } from "./../../../../../GN-common/common/GNData";
import { DataValueType } from "./../../../../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";

export abstract class MultiplayerBaseRequestHandler extends RequestHandler {
	/**
	 * Returns the matchmaking queue settings.
	 * @param queueName Provides the queue name value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Returns the matchmaking queue settings.
	 */
	protected getMatchmakingQueueSettings(queueName: string, gameId: string): xMatchmakingQueueSettings {
		// Stores the resolved matchmaking queue settings instance for the current execution flow.
		let matchmakingQueueSettings = this.gnServer.getGNSettings().getMatchmakingQueueSettings(gameId);
		return matchmakingQueueSettings.find(x => x.queueName == queueName);
	}

	/**
	 * Returns the attribute for queue.
	 * @param userId Indicates whether r ID should be used.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param attribute Provides the attribute value used by this operation.
	 * @param matchmakingQueueSettings Provides the matchmaking queue settings value used by this operation.
	 * @returns Returns the attribute for queue.
	 */
	protected async getAttributeForQueue(userId: string, gameId: string, attribute: GNHashtable, matchmakingQueueSettings: xMatchmakingQueueSettings): Promise<{ [k: string]: DataValueType }> {
		// Stores the answer value used in the current execution flow.
		let answer: { [k: string]: DataValueType } = {};

		if (matchmakingQueueSettings.rules != null) {
			// Stores the game player value used in the current execution flow.
			let gamePlayer = matchmakingQueueSettings.rules.find(x => (x as any).attributeSource == RuleAttributeSource.PlayerData) == null ? null : await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(userId, gameId, {
				playerDatas: true,
			});

			for (let i = 0; i < matchmakingQueueSettings.rules.length; i++) {
				// Stores the matchmaking rules value used in the current execution flow.
				let matchmakingRules = matchmakingQueueSettings.rules[i];

				if (matchmakingRules.type == RuleType.String) {
					// Stores the string rule value used in the current execution flow.
					let stringRule = <StringRule>matchmakingRules;

					// Stores the value value used in the current execution flow.
					let value: string = null;

					if (stringRule.attributeSource == RuleAttributeSource.UserInput) {
						value = attribute == null ? null : attribute.getString(stringRule.attributePath, null);
					}
					else if (stringRule.attributeSource == RuleAttributeSource.PlayerData && gamePlayer != null) {
						// Stores the temp value value used in the current execution flow.
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
					// Stores the difference rule value used in the current execution flow.
					let differenceRule = <DifferenceRule>matchmakingRules;

					// Stores the value value used in the current execution flow.
					let value: number = null;

					if (differenceRule.attributeSource == RuleAttributeSource.UserInput) {
						value = attribute == null ? null : attribute.getNumber(differenceRule.attributePath, null);
					}
					else if (differenceRule.attributeSource == RuleAttributeSource.PlayerData && gamePlayer != null) {
						// Stores the temp value value used in the current execution flow.
						let tempValue = gamePlayer.getPlayerData(differenceRule.attributePath);

						if (typeof tempValue == "number") {
							value = tempValue;
						}
					}

					if (value == null) {
						value = differenceRule.defaultValue;
					}

					answer[matchmakingRules.name] = value;
				}
				else if (matchmakingRules.type == RuleType.SetIntersection) {
					// Stores the set intersection rule value used in the current execution flow.
					let setIntersectionRule = <SetIntersectionRule>matchmakingRules;

					// Stores the value value used in the current execution flow.
					let value: string[] = null;

					if (setIntersectionRule.attributeSource == RuleAttributeSource.UserInput) {
						// Stores the temp value value used in the current execution flow.
						let tempValue = attribute == null ? null : attribute.getGNArray(setIntersectionRule.attributePath, null);

						if (tempValue != null) {
							value = tempValue.toData();
						}
					}
					else if (setIntersectionRule.attributeSource == RuleAttributeSource.PlayerData && gamePlayer != null) {
						// Stores the temp value value used in the current execution flow.
						let tempValue = gamePlayer.getPlayerData(setIntersectionRule.attributePath);

						if (typeof (tempValue) == "object") {
							if (Array.isArray(tempValue)) {
								value = <any>tempValue;
							}
						}
					}

					if (value == null) {
						if (setIntersectionRule.defaultValue == null) setIntersectionRule.defaultValue = [];
						value = [];

						for (let i = 0; i < setIntersectionRule.defaultValue.length; i++) {
							value.push(setIntersectionRule.defaultValue[i]);
						}
					}

					answer[matchmakingRules.name] = value;
				}
				else if (matchmakingRules.type == RuleType.MatchTotal) {
					// Stores the match total rule value used in the current execution flow.
					let matchTotalRule = <MatchTotalRule>matchmakingRules;

					// Stores the value value used in the current execution flow.
					let value: number = null;

					if (matchTotalRule.attributeSource == RuleAttributeSource.UserInput) {
						value = attribute == null ? null : attribute.getNumber(matchTotalRule.attributePath, null);
					}
					else if (matchTotalRule.attributeSource == RuleAttributeSource.PlayerData && gamePlayer != null) {
						// Stores the temp value value used in the current execution flow.
						let tempValue = gamePlayer.getPlayerData(matchTotalRule.attributePath);

						if (typeof tempValue == "number") {
							value = tempValue;
						}
					}

					if (value == null) {
						value = 0;
					}

					answer[matchmakingRules.name] = value;
				}
				else if (matchmakingRules.type == RuleType.RegionSelection) {
					// Stores the region selection rule value used in the current execution flow.
					let regionSelectionRule = <RegionSelectionRule>matchmakingRules;

					// Stores the value value used in the current execution flow.
					let value = {
						region: "",
						ping: 0
					};

					// Stores the temp value value used in the current execution flow.
					let tempValue = attribute == null ? null : attribute.getGNHashtable(regionSelectionRule.attributePath, null);

					if (tempValue != null) {
						value.region = tempValue.getString("region", "");
						value.ping = tempValue.getNumber("ping", 0);
					}

					answer[matchmakingRules.name] = value;
				}
				// else if (matchmakingRules.type == RuleType.TeamSizeBalance) {
				//     let teamSizeBalanceRule = <TeamSizeBalanceRule>matchmakingRules;

				//     answer[matchmakingRules.name] = value as any;
				// }
				else if (matchmakingRules.type == RuleType.TeamDifference) {
					// Stores the team difference rule value used in the current execution flow.
					let teamDifferenceRule = <TeamDifferenceRule>matchmakingRules;

					// Stores the value value used in the current execution flow.
					let value: number = null;

					if (teamDifferenceRule.attributeSource == RuleAttributeSource.UserInput) {
						value = attribute == null ? null : attribute.getNumber(teamDifferenceRule.attributePath, null);
					}
					else if (teamDifferenceRule.attributeSource == RuleAttributeSource.PlayerData && gamePlayer != null) {
						// Stores the temp value value used in the current execution flow.
						let tempValue = gamePlayer.getPlayerData(teamDifferenceRule.attributePath);

						if (typeof tempValue == "number") {
							value = tempValue;
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

		return answer;
	}
}
