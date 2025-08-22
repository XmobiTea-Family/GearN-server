import { MatchmakingTicketStatus } from "./../../GN-common/constant/enumType/MatchmakingTicketStatus";
import { StringUtility } from "./../../GN-common/helper/StringUtility";
import { MatchmakingTicket } from "./../../GN-library/xdatabase/lib/entity/pro/MatchmakingTicket";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { DifferenceRule, MatchTotalRule, RegionSelectionRule, RuleExpansionType, RuleType, SetIntersectionRule, StringRule, TeamDifferenceRule, TeamSizeBalanceRule, xMatchmakingQueueSettings, RuleStringCompairType, TeamTicketSizeSimilarityRule } from "./../../GN-library/xsettings/lib/entity/xMatchmakingQueueSettings";
import { GNServer } from "./../../GNServer";
import { IMatchmakingService, MatchmakingTicketCanMatch } from "./IMatchmakingService";

export class MatchmakingService implements IMatchmakingService {
	private gnServer: GNServer;

	public setGNServer(gnServer: GNServer): void {
		this.gnServer = gnServer;
	}

	public async handle(gameId: string): Promise<MatchmakingTicketCanMatch[]> {
		try {
			let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);

			// find tat ca nhung cai ticket nay
			let results = await matchmakingTicketCollection.find({ status: <number>MatchmakingTicketStatus.WaitingForMatch }, {
				projection: {
					status: true,
					members: true,
				}
			});

			let matchmakingTickets: MatchmakingTicket[] = [];

			while (await results.hasNext()) {
				let result = await results.next();

				matchmakingTickets.push(new MatchmakingTicket(result, matchmakingTicketCollection));
			}

			let matchmakingTicketCanMatchs = this.getMatchmakingTicketCanMatchs(gameId, matchmakingTickets);

			if (matchmakingTicketCanMatchs.length != 0) {
				this.removeMatchmakingTicketNotCorrect(matchmakingTicketCanMatchs);

				this.createMatch(gameId, matchmakingTicketCanMatchs, matchmakingTickets);

				this.removeGiveUpTickets(matchmakingTickets);

				Debug.log("Matchmaking handler " + matchmakingTicketCanMatchs.length + " matched success!");
			}

			return matchmakingTicketCanMatchs;
		}
		catch (err) {
			console.error(err);
		}

		return null;
	}

	private getMatchmakingTicketCanMatchs(gameId: string, matchmakingTickets: MatchmakingTicket[]): MatchmakingTicketCanMatch[] {
		let matchmakingQueueSettings = this.gnServer.getGNSettings().getMatchmakingQueueSettings(gameId);

		let matchmakingTicketCanMatchs: MatchmakingTicketCanMatch[] = [];

		// match cac ticket lai voi nhau
		for (let i = 0; i < matchmakingTickets.length; i++) {
			try {
				let matchmakingTicket = matchmakingTickets[i];

				let matchmakingQueueSetting = matchmakingQueueSettings.find(x => x.queueName == matchmakingTicketCanMatch.queueName);

				if (matchmakingQueueSetting == null) continue;

				let matchmakingTicketCanMatch: MatchmakingTicketCanMatch = {
					matchId: StringUtility.generateRandomString(15, 0),
					queueName: matchmakingTicket.getQueueName(),
					matchmakingTicketTeams: [],
					ticketIds: [],
					memberIds: [],
					tempMemberIds: [],
					tempTicketIds: [],
					tsCreate: matchmakingTicket.getTsCreate(),
					matchSize: matchmakingQueueSetting.matchSize,
					status: <number>MatchmakingTicketStatus.Matched,
				};

				if (matchmakingQueueSetting.teams == null || matchmakingQueueSetting.teams.length == 0) {
					matchmakingTicketCanMatch.matchmakingTicketTeams.push({
						teamId: "",
						tickets: [],
						members: [],
						tempTickets: [],
						tempMembers: [],
						teamSize: matchmakingTicketCanMatch.matchSize
					});
				}
				else {
					for (let j = 0; j < matchmakingQueueSetting.teams.length; j++) {
						let team = matchmakingQueueSetting.teams[j];
						matchmakingTicketCanMatch.matchmakingTicketTeams.push({
							teamId: team.teamId,
							tickets: [],
							members: [],
							tempTickets: [],
							tempMembers: [],
							teamSize: team.teamSize
						});
					}
				}

				let myTeamMatchmakingTicketCanMatch = matchmakingTicketCanMatch.matchmakingTicketTeams.find(x => x.teamSize.max >= matchmakingTicket.getMembers().length);
				if (myTeamMatchmakingTicketCanMatch == null) continue;

				if (matchmakingQueueSetting.rules == null || matchmakingQueueSetting.rules.length == 0) {
					matchmakingTicketCanMatch.ticketIds.push(matchmakingTicket.getTicketId());
					myTeamMatchmakingTicketCanMatch.tickets.push({
						ticketId: matchmakingTicket.getTicketId(),
						memberCount: matchmakingTicket.getMembers().length
					});

					matchmakingTicket.getMembers().forEach(member => {
						myTeamMatchmakingTicketCanMatch.members.push({
							userId: member.userId,
							attributeForQueue: member.attributeForQueue
						});

						matchmakingTicketCanMatch.memberIds.push(member.userId);
					});

					for (let j = 0; j < matchmakingTickets.length; j++) {
						let nextMatchmakingTicket = matchmakingTickets[j];

						if (nextMatchmakingTicket.getQueueName() != matchmakingTicket.getQueueName()) continue;

						if (matchmakingTicketCanMatch.ticketIds.includes(nextMatchmakingTicket.getTicketId())) continue;

						let teamMatchmakingTicketCanMatch = matchmakingTicketCanMatch.matchmakingTicketTeams.sort((a, b) => a.members.length - b.members.length)[0];

						if (matchmakingTicketCanMatch.memberIds.length + nextMatchmakingTicket.getMembers().length <= matchmakingQueueSetting.matchSize.max && teamMatchmakingTicketCanMatch.members.length + nextMatchmakingTicket.getMembers().length <= teamMatchmakingTicketCanMatch.teamSize.max) {
							nextMatchmakingTicket.getMembers().forEach(member => {
								teamMatchmakingTicketCanMatch.members.push({
									userId: member.userId,
									attributeForQueue: member.attributeForQueue
								});

								matchmakingTicketCanMatch.memberIds.push(member.userId);
							});

							matchmakingTicketCanMatch.ticketIds.push(matchmakingTicket.getTicketId());
							teamMatchmakingTicketCanMatch.tickets.push({
								ticketId: nextMatchmakingTicket.getTicketId(),
								memberCount: nextMatchmakingTicket.getMembers().length
							});
						}
					}
				}
				else {
					let lastMemberCount = matchmakingTicket.getMembers().length;

					matchmakingTicketCanMatch.tempTicketIds.push(matchmakingTicket.getTicketId());
					myTeamMatchmakingTicketCanMatch.tempTickets.push({
						ticketId: matchmakingTicket.getTicketId(),
						memberCount: matchmakingTicket.getMembers().length
					});

					matchmakingTicket.getMembers().forEach(member => {
						myTeamMatchmakingTicketCanMatch.tempMembers.push({
							userId: member.userId,
							attributeForQueue: member.attributeForQueue
						});

						matchmakingTicketCanMatch.tempMemberIds.push(member.userId);
					});

					for (let j = 0; j < matchmakingTickets.length; j++) {
						let nextMatchmakingTicket = matchmakingTickets[j];

						if (nextMatchmakingTicket.getQueueName() != matchmakingTicket.getQueueName()) continue;

						if (matchmakingTicketCanMatch.ticketIds.includes(nextMatchmakingTicket.getTicketId())) continue;
						if (matchmakingTicketCanMatch.tempTicketIds.includes(nextMatchmakingTicket.getTicketId())) continue;

						if (!this.isStringValid(matchmakingTicket, nextMatchmakingTicket, matchmakingQueueSetting)) continue;

						if (!this.isDifferenceValid(matchmakingTicket, nextMatchmakingTicket, matchmakingQueueSetting)) continue;

						if (!this.isRegionSelectionValid(matchmakingTicket, nextMatchmakingTicket, matchmakingQueueSetting)) continue;

						if (!this.isSetIntersectionValid(matchmakingTicket, nextMatchmakingTicket, matchmakingQueueSetting)) continue;

						let teamMatchmakingTicketCanMatch = matchmakingTicketCanMatch.matchmakingTicketTeams.sort((a, b) => a.tempMembers.length - b.tempMembers.length)[0];

						if (matchmakingTicketCanMatch.tempMemberIds.length + nextMatchmakingTicket.getMembers().length <= matchmakingQueueSetting.matchSize.max && teamMatchmakingTicketCanMatch.tempMembers.length + nextMatchmakingTicket.getMembers().length <= teamMatchmakingTicketCanMatch.teamSize.max) {
							if (teamMatchmakingTicketCanMatch != myTeamMatchmakingTicketCanMatch) {
								if (!this.isTeamTicketSizeSimilarityValid(matchmakingTicket, lastMemberCount, nextMatchmakingTicket, matchmakingQueueSetting)) continue;
							}
							else {
								lastMemberCount = nextMatchmakingTicket.getMembers().length;
							}

							nextMatchmakingTicket.getMembers().forEach(member => {
								teamMatchmakingTicketCanMatch.tempMembers.push({
									userId: member.userId,
									attributeForQueue: member.attributeForQueue
								});

								matchmakingTicketCanMatch.tempMemberIds.push(member.userId);
							});

							matchmakingTicketCanMatch.tempTicketIds.push(matchmakingTicket.getTicketId());
							teamMatchmakingTicketCanMatch.tempTickets.push({
								ticketId: nextMatchmakingTicket.getTicketId(),
								memberCount: nextMatchmakingTicket.getMembers().length
							});

							let canAddToMain = matchmakingTicketCanMatch.matchmakingTicketTeams.sort((a, b) => a.tempMembers.length - b.tempMembers.length)[0] == myTeamMatchmakingTicketCanMatch;
							if (canAddToMain) {
								for (let l = 0; l < matchmakingTicketCanMatch.matchmakingTicketTeams.length; l++) {
									let matchmakingTicketTeam = matchmakingTicketCanMatch.matchmakingTicketTeams[l];

									matchmakingTicketTeam.tempMembers.forEach(member => {
										matchmakingTicketTeam.members.push(member);
									});

									matchmakingTicketTeam.tempTickets.forEach(ticket => {
										matchmakingTicketTeam.tickets.push(ticket);
									});

									matchmakingTicketTeam.tempMembers.length = 0;
									matchmakingTicketTeam.tempTickets.length = 0;
								}

								matchmakingTicketCanMatch.tempMemberIds.forEach(memberId => {
									matchmakingTicketCanMatch.memberIds.push(memberId);
								});

								matchmakingTicketCanMatch.tempTicketIds.forEach(ticketId => {
									matchmakingTicketCanMatch.ticketIds.push(ticketId);
								});

								matchmakingTicketCanMatch.tempMemberIds.length = 0;
								matchmakingTicketCanMatch.tempTicketIds.length = 0;
							}
						}
					}

					if (matchmakingTicketCanMatch.ticketIds.length == 0) {
						for (let l = 0; l < matchmakingTicketCanMatch.matchmakingTicketTeams.length; l++) {
							let matchmakingTicketTeam = matchmakingTicketCanMatch.matchmakingTicketTeams[l];

							matchmakingTicketTeam.tempMembers.forEach(member => {
								matchmakingTicketTeam.members.push(member);
							});

							matchmakingTicketTeam.tempTickets.forEach(ticket => {
								matchmakingTicketTeam.tickets.push(ticket);
							});

							matchmakingTicketTeam.tempMembers.length = 0;
							matchmakingTicketTeam.tempTickets.length = 0;
						}

						matchmakingTicketCanMatch.tempMemberIds.forEach(memberId => {
							matchmakingTicketCanMatch.memberIds.push(memberId);
						});

						matchmakingTicketCanMatch.tempTicketIds.forEach(ticketId => {
							matchmakingTicketCanMatch.ticketIds.push(ticketId);
						});

						matchmakingTicketCanMatch.tempMemberIds.length = 0;
						matchmakingTicketCanMatch.tempTicketIds.length = 0;
					}
				}

				if (!this.isMatchSizeValid(matchmakingTicketCanMatch, matchmakingQueueSetting)) continue;

				if (!this.isTeamSizeValid(matchmakingTicketCanMatch, matchmakingQueueSetting)) continue;

				if (!this.isTeamTicketSizeBalanceValid(matchmakingTicketCanMatch, matchmakingQueueSetting)) continue;

				if (!this.isTeamDifferenceValid(matchmakingTicketCanMatch, matchmakingQueueSetting)) continue;

				if (!this.isMatchTotalValid(matchmakingTicketCanMatch, matchmakingQueueSetting)) continue;

				matchmakingTicketCanMatchs.push(matchmakingTicketCanMatch);
			}
			catch (err) {
				console.error(err);
			}
		}

		return matchmakingTicketCanMatchs;
	}

	private isMatchSizeValid(matchmakingTicketCanMatch: MatchmakingTicketCanMatch, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
		return matchmakingTicketCanMatch.memberIds.length >= matchmakingQueueSetting.matchSize.min && matchmakingTicketCanMatch.memberIds.length <= matchmakingQueueSetting.matchSize.max;
	}

	private isTeamSizeValid(matchmakingTicketCanMatch: MatchmakingTicketCanMatch, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
		if (matchmakingQueueSetting.teams != null && matchmakingQueueSetting.teams.length != 0) {
			for (let k = 0; k < matchmakingTicketCanMatch.matchmakingTicketTeams.length; k++) {
				let matchmakingTicketTeam = matchmakingTicketCanMatch.matchmakingTicketTeams[k];
				let matchmakingQueueSettingTeam = matchmakingQueueSetting.teams.find(x => x.teamId == matchmakingTicketTeam.teamId);

				if (matchmakingTicketTeam.members.length < matchmakingQueueSettingTeam.teamSize.min
					|| matchmakingTicketTeam.members.length > matchmakingQueueSettingTeam.teamSize.max) {
					return false;
				}
			}
		}

		return true;
	}

	private isTeamTicketSizeBalanceValid(matchmakingTicketCanMatch: MatchmakingTicketCanMatch, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
		if (matchmakingQueueSetting.rules != null) {
			let teamSizeBalanceRules = matchmakingQueueSetting.rules.find(x => x.type == RuleType.TeamSizeBalance) as TeamSizeBalanceRule;
			if (teamSizeBalanceRules != null) {
				let scoreToCompair = matchmakingTicketCanMatch.matchmakingTicketTeams[0].members.length;
				let delta = teamSizeBalanceRules.allowedDifference;

				if (teamSizeBalanceRules.advancedSettings != null) {
					let currentMilliseconds = xDatetime.getCurrentMilliseconds();
					if (teamSizeBalanceRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicketCanMatch.tsCreate < currentMilliseconds) return true;

					if (teamSizeBalanceRules.advancedSettings.expansionType == RuleExpansionType.Linear) {
						// Moi bao nhieu giay se tang
						let secondsFromStart = (currentMilliseconds - matchmakingTicketCanMatch.tsCreate) / 1000;

						let count = Math.floor(secondsFromStart / teamSizeBalanceRules.advancedSettings.linearExpansions.secondsBetweenExpansions);

						delta += count * teamSizeBalanceRules.advancedSettings.linearExpansions.delta;

						if (delta > teamSizeBalanceRules.advancedSettings.linearExpansions.limit) delta = teamSizeBalanceRules.advancedSettings.linearExpansions.limit;
					}
					else if (teamSizeBalanceRules.advancedSettings.expansionType == RuleExpansionType.Custom) {
						let secondsFromStart = (currentMilliseconds - matchmakingTicketCanMatch.tsCreate) / 1000;

						let count = Math.floor(secondsFromStart / teamSizeBalanceRules.advancedSettings.customExpansions.secondsBetweenExpansions);

						if (count < teamSizeBalanceRules.advancedSettings.customExpansions.overrideValue.length) {
							delta = teamSizeBalanceRules.advancedSettings.customExpansions.overrideValue[count];
						}
						else if (teamSizeBalanceRules.advancedSettings.customExpansions.overrideValue.length != 0) {
							delta = teamSizeBalanceRules.advancedSettings.customExpansions.overrideValue[teamSizeBalanceRules.advancedSettings.customExpansions.overrideValue.length - 1];
						}
					}
				}

				for (let i = 1; i < matchmakingTicketCanMatch.matchmakingTicketTeams.length; i++) {
					let nextScoreToCompair = matchmakingTicketCanMatch.matchmakingTicketTeams[i].members.length;
					if (Math.abs(nextScoreToCompair - scoreToCompair) > delta) return false;
				}
			}
		}

		return true;
	}

	private isTeamDifferenceValid(matchmakingTicketCanMatch: MatchmakingTicketCanMatch, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
		if (matchmakingQueueSetting.rules != null) {
			for (let k = 0; k < matchmakingQueueSetting.rules.length; k++) {
				let rules = matchmakingQueueSetting.rules[k];

				if (rules.type == RuleType.TeamDifference) {
					let teamDifferenceRules = rules as TeamDifferenceRule;

					let myTeam = matchmakingTicketCanMatch.matchmakingTicketTeams[0];
					let scoreToCompair = 0;

					for (let j = 0; j < myTeam.members.length; j++) {
						let member = myTeam.members[j];

						let value = member.attributeForQueue[rules.name];
						if (value == null) value = teamDifferenceRules.defaultValue;

						scoreToCompair += value as number;
					}

					let delta = teamDifferenceRules.allowedDifference;

					if (teamDifferenceRules.advancedSettings != null) {
						let currentMilliseconds = xDatetime.getCurrentMilliseconds();
						if (teamDifferenceRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicketCanMatch.tsCreate < currentMilliseconds) continue;

						if (teamDifferenceRules.advancedSettings.expansionType == RuleExpansionType.Linear) {
							// Moi bao nhieu giay se tang
							let secondsFromStart = (currentMilliseconds - matchmakingTicketCanMatch.tsCreate) / 1000;

							let count = Math.floor(secondsFromStart / teamDifferenceRules.advancedSettings.linearExpansions.secondsBetweenExpansions);

							delta += count * teamDifferenceRules.advancedSettings.linearExpansions.delta;

							if (delta > teamDifferenceRules.advancedSettings.linearExpansions.limit) delta = teamDifferenceRules.advancedSettings.linearExpansions.limit;
						}
						else if (teamDifferenceRules.advancedSettings.expansionType == RuleExpansionType.Custom) {
							let secondsFromStart = (currentMilliseconds - matchmakingTicketCanMatch.tsCreate) / 1000;

							let count = Math.floor(secondsFromStart / teamDifferenceRules.advancedSettings.customExpansions.secondsBetweenExpansions);

							if (count < teamDifferenceRules.advancedSettings.customExpansions.overrideValue.length) {
								delta = teamDifferenceRules.advancedSettings.customExpansions.overrideValue[count];
							}
							else if (teamDifferenceRules.advancedSettings.customExpansions.overrideValue.length != 0) {
								delta = teamDifferenceRules.advancedSettings.customExpansions.overrideValue[teamDifferenceRules.advancedSettings.customExpansions.overrideValue.length - 1];
							}
						}
					}

					for (let i = 1; i < matchmakingTicketCanMatch.matchmakingTicketTeams.length; i++) {
						let nextTeam = matchmakingTicketCanMatch.matchmakingTicketTeams[i];

						let nextScoreToCompair = 0;
						for (let j = 0; j < nextTeam.members.length; j++) {
							let member = nextTeam.members[j];

							let value = member.attributeForQueue[rules.name];
							if (value == null) value = teamDifferenceRules.defaultValue;

							nextScoreToCompair += value as number;
						}

						if (Math.abs(nextScoreToCompair - scoreToCompair) > delta) return false;
					}
				}
			}
		}

		return true;
	}

	private isMatchTotalValid(matchmakingTicketCanMatch: MatchmakingTicketCanMatch, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
		if (matchmakingQueueSetting.rules != null) {
			for (let k = 0; k < matchmakingQueueSetting.rules.length; k++) {
				let rules = matchmakingQueueSetting.rules[k];

				if (rules.type == RuleType.MatchTotal) {
					let matchTotalRules = rules as MatchTotalRule;

					let min = matchTotalRules.min;
					let max = matchTotalRules.max;

					if (matchTotalRules.advancedSettings != null) {
						let currentMilliseconds = xDatetime.getCurrentMilliseconds();
						if (matchTotalRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicketCanMatch.tsCreate < currentMilliseconds) continue;

						if (matchTotalRules.advancedSettings.expansionType == RuleExpansionType.Custom) {
							let secondsFromStart = (currentMilliseconds - matchmakingTicketCanMatch.tsCreate) / 1000;

							let count = Math.floor(secondsFromStart / matchTotalRules.advancedSettings.customExpansions.secondsBetweenExpansions);

							if (matchTotalRules.advancedSettings.customExpansions.overrideMin != null) {
								if (count < matchTotalRules.advancedSettings.customExpansions.overrideMin.length) {
									min = matchTotalRules.advancedSettings.customExpansions.overrideMin[count];
								}
								else if (matchTotalRules.advancedSettings.customExpansions.overrideMin.length != 0) {
									min = matchTotalRules.advancedSettings.customExpansions.overrideMin[matchTotalRules.advancedSettings.customExpansions.overrideMin.length - 1];
								}
							}

							if (matchTotalRules.advancedSettings.customExpansions.overrideMax != null) {
								if (count < matchTotalRules.advancedSettings.customExpansions.overrideMax.length) {
									max = matchTotalRules.advancedSettings.customExpansions.overrideMax[count];
								}
								else if (matchTotalRules.advancedSettings.customExpansions.overrideMax.length != 0) {
									max = matchTotalRules.advancedSettings.customExpansions.overrideMax[matchTotalRules.advancedSettings.customExpansions.overrideMax.length - 1];
								}
							}
						}
					}

					let score = 0;

					for (let i = 0; i < matchmakingTicketCanMatch.matchmakingTicketTeams.length; i++) {
						let nextTeam = matchmakingTicketCanMatch.matchmakingTicketTeams[i];

						for (let j = 0; j < nextTeam.members.length; j++) {
							let member = nextTeam.members[j];

							let value = member.attributeForQueue[rules.name];
							if (value != null) score += value as number;
						}
					}

					if (score < min || score > max) return false;
				}
			}
		}

		return true;
	}

	private isStringValid(matchmakingTicket: MatchmakingTicket, nextMatchmakingTicket: MatchmakingTicket, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
		if (matchmakingQueueSetting.rules != null) {
			for (let k = 0; k < matchmakingQueueSetting.rules.length; k++) {
				let rules = matchmakingQueueSetting.rules[k];

				if (rules.type == RuleType.String) {
					let stringRules = rules as StringRule;

					let stringToCompair = matchmakingTicket.getMembers()[0].attributeForQueue[rules.name];
					if (stringToCompair == null) stringToCompair = stringRules.defaultValue;

					if (stringRules.advancedSettings != null) {
						let currentMilliseconds = xDatetime.getCurrentMilliseconds();
						if (stringRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicket.getTsCreate() < currentMilliseconds) continue;

						if (stringRules.advancedSettings.expansionType == RuleExpansionType.Custom) {
							let secondsFromStart = (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;

							let count = Math.floor(secondsFromStart / stringRules.advancedSettings.customExpansions.secondsBetweenExpansions);

							if (count < stringRules.advancedSettings.customExpansions.overrideValue.length) {
								stringToCompair = stringRules.advancedSettings.customExpansions.overrideValue[count];
							}
							else if (stringRules.advancedSettings.customExpansions.overrideValue.length != 0) {
								stringToCompair = stringRules.advancedSettings.customExpansions.overrideValue[stringRules.advancedSettings.customExpansions.overrideValue.length - 1];
							}
						}
					}

					let nextStringToCompair = nextMatchmakingTicket.getMembers()[0].attributeForQueue[rules.name];
					if (nextStringToCompair == null) nextStringToCompair = stringRules.defaultValue;

					if (stringRules.compairType == RuleStringCompairType.Equals) {
						if (stringToCompair != nextStringToCompair) return false;
					}
					else if (stringRules.compairType == RuleStringCompairType.NotEquals) {
						if (stringToCompair == nextStringToCompair) return false;
					}
				}
			}
		}

		return true;
	}

	private isDifferenceValid(matchmakingTicket: MatchmakingTicket, nextMatchmakingTicket: MatchmakingTicket, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
		if (matchmakingQueueSetting.rules != null) {
			for (let k = 0; k < matchmakingQueueSetting.rules.length; k++) {
				let rules = matchmakingQueueSetting.rules[k];

				if (rules.type == RuleType.Difference) {
					let differenceRules = rules as DifferenceRule;

					let scoreToCompair = matchmakingTicket.getMembers()[0].attributeForQueue[rules.name] as number;
					if (scoreToCompair == null) scoreToCompair = differenceRules.defaultValue;

					let delta = differenceRules.allowedDifference;

					if (differenceRules.advancedSettings != null) {
						let currentMilliseconds = xDatetime.getCurrentMilliseconds();
						if (differenceRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicket.getTsCreate() < currentMilliseconds) continue;

						if (differenceRules.advancedSettings.expansionType == RuleExpansionType.Linear) {
							// Moi bao nhieu giay se tang
							let secondsFromStart = (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;

							let count = Math.floor(secondsFromStart / differenceRules.advancedSettings.linearExpansions.secondsBetweenExpansions);

							delta += count * differenceRules.advancedSettings.linearExpansions.delta;

							if (delta > differenceRules.advancedSettings.linearExpansions.limit) delta = differenceRules.advancedSettings.linearExpansions.limit;
						}
						else if (differenceRules.advancedSettings.expansionType == RuleExpansionType.Custom) {
							let secondsFromStart = (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;

							let count = Math.floor(secondsFromStart / differenceRules.advancedSettings.customExpansions.secondsBetweenExpansions);

							if (count < differenceRules.advancedSettings.customExpansions.overrideValue.length) {
								delta = differenceRules.advancedSettings.customExpansions.overrideValue[count];
							}
							else if (differenceRules.advancedSettings.customExpansions.overrideValue.length != 0) {
								delta = differenceRules.advancedSettings.customExpansions.overrideValue[differenceRules.advancedSettings.customExpansions.overrideValue.length - 1];
							}
						}
					}

					let nextScoreToCompair = nextMatchmakingTicket.getMembers()[0].attributeForQueue[rules.name] as number;
					if (nextScoreToCompair == null) nextScoreToCompair = differenceRules.defaultValue;

					if (Math.abs(nextScoreToCompair - scoreToCompair) > delta) return false;
				}
			}
		}

		return true;
	}

	private isRegionSelectionValid(matchmakingTicket: MatchmakingTicket, nextMatchmakingTicket: MatchmakingTicket, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
		if (matchmakingQueueSetting.rules != null) {
			let regionSelectionRules = matchmakingQueueSetting.rules.find(x => x.type == RuleType.RegionSelection) as RegionSelectionRule;
			if (regionSelectionRules != null) {
				let valueToCompair: {
					region: string,
					ping: number
				} = matchmakingTicket.getMembers()[0].attributeForQueue[regionSelectionRules.name] as any;

				if (valueToCompair == null) return false;

				let nextValueToCompair: {
					region: string,
					ping: number
				} = nextMatchmakingTicket.getMembers()[0].attributeForQueue[regionSelectionRules.name] as any;

				if (nextValueToCompair == null) return false;

				if (valueToCompair.region != nextValueToCompair.region) return false;

				let maximumLatency = regionSelectionRules.max;

				if (regionSelectionRules.advancedSettings != null) {
					let currentMilliseconds = xDatetime.getCurrentMilliseconds();
					if (regionSelectionRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicket.getTsCreate() > currentMilliseconds) {
						if (regionSelectionRules.advancedSettings.expansionType == RuleExpansionType.Linear) {
							// Moi bao nhieu giay se tang
							let secondsFromStart = (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;

							let count = Math.floor(secondsFromStart / regionSelectionRules.advancedSettings.linearExpansions.secondsBetweenExpansions);

							maximumLatency += count * regionSelectionRules.advancedSettings.linearExpansions.delta;

							if (maximumLatency > regionSelectionRules.advancedSettings.linearExpansions.limit) maximumLatency = regionSelectionRules.advancedSettings.linearExpansions.limit;
						}
						else if (regionSelectionRules.advancedSettings.expansionType == RuleExpansionType.Custom) {
							let secondsFromStart = (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;

							let count = Math.floor(secondsFromStart / regionSelectionRules.advancedSettings.customExpansions.secondsBetweenExpansions);

							if (count < regionSelectionRules.advancedSettings.customExpansions.overrideValue.length) {
								maximumLatency = regionSelectionRules.advancedSettings.customExpansions.overrideValue[count];
							}
							else if (regionSelectionRules.advancedSettings.customExpansions.overrideValue.length != 0) {
								maximumLatency = regionSelectionRules.advancedSettings.customExpansions.overrideValue[regionSelectionRules.advancedSettings.customExpansions.overrideValue.length - 1];
							}
						}
					}
				}

				if (valueToCompair.ping > maximumLatency) return false;
			}
		}

		return true;
	}

	private isSetIntersectionValid(matchmakingTicket: MatchmakingTicket, nextMatchmakingTicket: MatchmakingTicket, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
		if (matchmakingQueueSetting.rules != null) {
			for (let k = 0; k < matchmakingQueueSetting.rules.length; k++) {
				let rules = matchmakingQueueSetting.rules[k];

				if (rules.type == RuleType.SetIntersection) {
					let setIntersectionRules = rules as SetIntersectionRule;

					let valueToCompair = matchmakingTicket.getMembers()[0].attributeForQueue[rules.name] as string[];
					if (valueToCompair == null) valueToCompair = setIntersectionRules.defaultValue;

					let min = setIntersectionRules.min;

					if (setIntersectionRules.advancedSettings != null) {
						let currentMilliseconds = xDatetime.getCurrentMilliseconds();
						if (setIntersectionRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicket.getTsCreate() < currentMilliseconds) continue;

						if (setIntersectionRules.advancedSettings.expansionType == RuleExpansionType.Linear) {
							// Moi bao nhieu giay se tang
							let secondsFromStart = (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;

							let count = Math.floor(secondsFromStart / setIntersectionRules.advancedSettings.linearExpansions.secondsBetweenExpansions);

							min += count * setIntersectionRules.advancedSettings.linearExpansions.delta;
						}
						else if (setIntersectionRules.advancedSettings.expansionType == RuleExpansionType.Custom) {
							let secondsFromStart = (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;

							let count = Math.floor(secondsFromStart / setIntersectionRules.advancedSettings.customExpansions.secondsBetweenExpansions);

							if (count < setIntersectionRules.advancedSettings.customExpansions.overrideValue.length) {
								min = setIntersectionRules.advancedSettings.customExpansions.overrideValue[count];
							}
							else if (setIntersectionRules.advancedSettings.customExpansions.overrideValue.length != 0) {
								min = setIntersectionRules.advancedSettings.customExpansions.overrideValue[setIntersectionRules.advancedSettings.customExpansions.overrideValue.length - 1];
							}
						}
					}

					let nextScoreToCompair = nextMatchmakingTicket.getMembers()[0].attributeForQueue[rules.name] as string[];
					if (nextScoreToCompair == null) nextScoreToCompair = setIntersectionRules.defaultValue;

					let countMatch = 0;

					for (let i = 0; i < valueToCompair.length; i++) {
						if (nextScoreToCompair.includes(valueToCompair[i])) countMatch += 1;
					}

					if (countMatch < min) return false;
				}
			}
		}

		return true;
	}

	private isTeamTicketSizeSimilarityValid(matchmakingTicket: MatchmakingTicket, ticketSize: number, nextMatchmakingTicket: MatchmakingTicket, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
		if (matchmakingQueueSetting.rules != null) {
			let teamTicketSizeSimilarityRules = matchmakingQueueSetting.rules.find(x => x.type == RuleType.TeamTicketSizeSimilarity) as TeamTicketSizeSimilarityRule;

			if (teamTicketSizeSimilarityRules != null) {
				if (teamTicketSizeSimilarityRules.advancedSettings != null) {
					let currentMilliseconds = xDatetime.getCurrentMilliseconds();
					if (teamTicketSizeSimilarityRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicket.getTsCreate() < currentMilliseconds) return true;
				}
			}

			if (ticketSize != nextMatchmakingTicket.getMembers().length) return false;
		}

		return true;
	}

	private removeMatchmakingTicketNotCorrect(matchmakingTicketCanMatchs: MatchmakingTicketCanMatch[]) {
		for (let i = 0; i < matchmakingTicketCanMatchs.length; i++) {
			let matchmakingTicketCanMatch = matchmakingTicketCanMatchs[i];

			for (let j = i + 1; j < matchmakingTicketCanMatchs.length; j++) {
				let nextMatchmakingTicketCanMatch = matchmakingTicketCanMatchs[j];

				let needRemoveThisMatch = false;

				for (let k = 0; k < nextMatchmakingTicketCanMatch.ticketIds.length; k++) {
					if (matchmakingTicketCanMatch.ticketIds.includes(nextMatchmakingTicketCanMatch.ticketIds[k])) {
						needRemoveThisMatch = true;

						break;
					}

					if (needRemoveThisMatch) break;
				}

				if (needRemoveThisMatch) {
					matchmakingTicketCanMatchs.splice(j, 1);

					j -= 1;
				}
			}
		}
	}

	private createMatch(gameId: string, matchmakingTicketCanMatchs: MatchmakingTicketCanMatch[], matchmakingTickets: MatchmakingTicket[]): void {
		let matchCollection = this.gnServer.getDatabase().systemGameCollection("Match", gameId);

		let matchmakingQueueSettings = this.gnServer.getGNSettings().getMatchmakingQueueSettings(gameId);
		if (matchmakingQueueSettings == null) return;

		for (let i = 0; i < matchmakingTicketCanMatchs.length; i++) {
			let matchmakingTicketCanMatch = matchmakingTicketCanMatchs[i];

			let matchResult = {
				matchId: matchmakingTicketCanMatch.matchId,
				queueName: matchmakingTicketCanMatch.queueName,
				members: [] as any,
				serverDetail: null as any,
				// serverDetail: {
				//     ipV4Address: "127.0.0.1",
				//     ports: [{
				//         name: "GamePort",
				//         publicPort: 8080,
				//         privatePort: 27001,
				//         protocol: 2,
				//     }, {
				//         name: "HttpPort",
				//         publicPort: 8081,
				//         privatePort: 27002,
				//         protocol: 1,
				//     }]
				// },
				tsCreate: xDatetime.getCurrentDate(),
				timeToMatchInSeconds: -1,
				ticketIds: [] as any,
			};

			let matchmakingQueueSetting = matchmakingQueueSettings.find(x => x.queueName == matchmakingTicketCanMatch.queueName);
			if (matchmakingQueueSetting == null) continue;

			if (matchmakingQueueSetting.serverAllocation.enable) {
				matchmakingTicketCanMatch.status = <number>MatchmakingTicketStatus.WaitingForServer;
			}

			// if (matchmakingQueueSetting.serverAllocation.enable) {
			//     // tao server thoi
			//     matchResult.serverDetail = {
			//         ipV4Address: "127.0.0.1",
			//         ports: [{
			//             name: "GamePort",
			//             publicPort: 8080,
			//             privatePort: 27001,
			//             protocol: 2,
			//         }, {
			//             name: "HttpPort",
			//             publicPort: 8081,
			//             privatePort: 27002,
			//             protocol: 1,
			//         }]
			//     };
			// }

			let currentMilliseconds = xDatetime.getCurrentMilliseconds();

			let totalMatchSuccess = 0;
			let totalMatchSuccessTimeInSeconds = 0;

			for (let j = 0; j < matchmakingTicketCanMatch.matchmakingTicketTeams.length; j++) {
				let matchmakingTicketTeam = matchmakingTicketCanMatch.matchmakingTicketTeams[j];

				for (let k = 0; k < matchmakingTicketTeam.tickets.length; k++) {
					let ticketId = matchmakingTicketTeam.tickets[k].ticketId;
					let matchmakingTicket = matchmakingTickets.find(x => x.getTicketId() == ticketId);

					if (!matchmakingTicketCanMatch.ticketIds.includes(ticketId))
						matchmakingTicketCanMatch.ticketIds.push(ticketId);

					matchmakingTicket.setMatchId(matchmakingTicketCanMatch.matchId);

					matchmakingTicket.setStatus(matchmakingTicketCanMatch.status);

					matchmakingTicket.saveAsync();

					let members = matchmakingTicket.getMembers();

					for (let u = 0; u < members.length; u++) {
						let member = members[u];

						matchResult.members.push({
							teamId: matchmakingTicketTeam.teamId,
							userId: member.userId,
							attribute: member.attribute,
						});
					}

					totalMatchSuccess += 1;
					totalMatchSuccessTimeInSeconds += currentMilliseconds - matchmakingTicket.getTsCreate();
				}
			}

			if (totalMatchSuccess != 0)
				matchResult.timeToMatchInSeconds = totalMatchSuccessTimeInSeconds / totalMatchSuccess;

			matchCollection.insertOne(matchResult);
		}
	}

	private removeGiveUpTickets(matchmakingTickets: MatchmakingTicket[]): void {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		for (let i = 0; i < matchmakingTickets.length; i++) {
			let matchmakingTicket = matchmakingTickets[i];

			if (matchmakingTicket.getStatus() == <number>MatchmakingTicketStatus.WaitingForMatch) {
				if (matchmakingTicket.getTsCreate() + matchmakingTicket.getGiveUpAfterSeconds() * 1000 < currentMilliseconds) {
					matchmakingTicket.setStatus(<number>MatchmakingTicketStatus.Canceled);

					matchmakingTicket.saveAsync();
				}
			}
		}
	}
}
