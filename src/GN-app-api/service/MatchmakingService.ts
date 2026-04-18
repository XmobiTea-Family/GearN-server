import { DataValueType } from "../../GN-library/xdatabase/lib/entity/pro/type/DataValueType";
import { MatchmakingTicketStatus } from "./../../GN-common/constant/enumType/MatchmakingTicketStatus";
import { MatchStatus } from "./../../GN-common/constant/enumType/MatchStatus";
import { StringUtility } from "./../../GN-common/helper/StringUtility";
import { MatchmakingTicket } from "./../../GN-library/xdatabase/lib/entity/pro/MatchmakingTicket";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { DifferenceRule, MatchTotalRule, RegionSelectionRule, RuleExpansionType, RuleType, SetIntersectionRule, StringRule, TeamDifferenceRule, TeamSizeBalanceRule, xMatchmakingQueueSettings, RuleStringCompairType, TeamTicketSizeSimilarityRule } from "./../../GN-library/xsettings/lib/entity/xMatchmakingQueueSettings";
import { GNServer } from "./../../GNServer";
import { IMatchmakingService, MatchmakingTicketCanMatch } from "./IMatchmakingService";

/**
 * Evaluates waiting matchmaking tickets against queue rules and materializes match documents.
 */
export class MatchmakingService implements IMatchmakingService {
    // Runtime access to queue settings, collections, and other shared services.
    private gnServer: GNServer;

    /**
     * Sets the GearN server.
     * @param gnServer Provides the GearN server value used by this operation.
     */
    public setGNServer(gnServer: GNServer): void {
        this.gnServer = gnServer;
    }

    /**
     * Loads waiting tickets for one game, tries to build valid matches, and persists successful results.
     * @param gameId Provides the game ID value used by this operation.
     * @returns Resolves with the operation result.
     */
    public async handle(gameId: string): Promise<MatchmakingTicketCanMatch[]> {
        try {
            let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);

            // Load active tickets so expiration is applied even when no valid match candidate exists.
            let results = await matchmakingTicketCollection.find({ status: { $in: [MatchmakingTicketStatus.WaitingForMatch, MatchmakingTicketStatus.WaitingForMembers] } });

            let pendingMatchmakingTickets: MatchmakingTicket[] = [];

            while (await results.hasNext()) {
                let result = await results.next();

                pendingMatchmakingTickets.push(new MatchmakingTicket(result, matchmakingTicketCollection));
            }

            await this.removeGiveUpTickets(pendingMatchmakingTickets);

            let matchmakingQueueSettings = this.gnServer.getGNSettings().getMatchmakingQueueSettings(gameId);

            const answer: MatchmakingTicketCanMatch[] = [];

            for (const matchmakingQueueSetting of matchmakingQueueSettings) {
                let waitingForMatchTickets = pendingMatchmakingTickets.filter(x => x.getQueueName() == matchmakingQueueSetting.queueName && x.getStatus() == MatchmakingTicketStatus.WaitingForMatch);

                // Candidate matches are built entirely in memory before any ticket state is persisted.
                let matchmakingTicketCanMatchs = this.getMatchmakingTicketCanMatchs(matchmakingQueueSetting, waitingForMatchTickets);

                if (matchmakingTicketCanMatchs.length != 0) {
                    this.removeMatchmakingTicketNotCorrect(matchmakingTicketCanMatchs);

                    await this.createMatch(gameId, matchmakingTicketCanMatchs, waitingForMatchTickets);

                    Debug.log("Matchmaking handler " + matchmakingTicketCanMatchs.length + " matched success!");

                    answer.push(...matchmakingTicketCanMatchs);
                }
            }

            return answer;
        }
        catch (err) {
            Debug.logException(err);
        }

        return null;
    }

    /**
     * Tries to assemble candidate matches from the waiting tickets of one game.
     * @param matchmakingTickets Provides the matchmaking tickets value used by this operation.
     * @returns Returns the matchmaking ticket can matchs.
     */
    public getMatchmakingTicketCanMatchs(matchmakingQueueSetting: xMatchmakingQueueSettings, matchmakingTickets: MatchmakingTicket[]): MatchmakingTicketCanMatch[] {
        let matchmakingTicketCanMatchs: MatchmakingTicketCanMatch[] = [];

        // Build one candidate around each ticket, then let later filters remove overlapping or invalid results.
        for (let i = 0; i < matchmakingTickets.length; i++) {
            try {
                let matchmakingTicket = matchmakingTickets[i];

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
                    status: MatchmakingTicketStatus.Matched,
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

                // Seed the first team with the current ticket, then try to fill the remaining capacity.
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

                        // When there are no explicit rules, greedily fill the smallest team first.
                        let teamMatchmakingTicketCanMatch = matchmakingTicketCanMatch.matchmakingTicketTeams.sort((a, b) => a.members.length - b.members.length)[0];

                        if (matchmakingTicketCanMatch.memberIds.length + nextMatchmakingTicket.getMembers().length <= matchmakingQueueSetting.matchSize.max && teamMatchmakingTicketCanMatch.members.length + nextMatchmakingTicket.getMembers().length <= teamMatchmakingTicketCanMatch.teamSize.max) {
                            nextMatchmakingTicket.getMembers().forEach(member => {
                                teamMatchmakingTicketCanMatch.members.push({
                                    userId: member.userId,
                                    attributeForQueue: member.attributeForQueue
                                });

                                matchmakingTicketCanMatch.memberIds.push(member.userId);
                            });

                            matchmakingTicketCanMatch.ticketIds.push(nextMatchmakingTicket.getTicketId());
                            teamMatchmakingTicketCanMatch.tickets.push({
                                ticketId: nextMatchmakingTicket.getTicketId(),
                                memberCount: nextMatchmakingTicket.getMembers().length
                            });
                        }
                    }
                }
                else {
                    // Track the last ticket size to support similarity rules when teams are filled progressively.
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

                        if (matchmakingTicketCanMatch.ticketIds.includes(nextMatchmakingTicket.getTicketId())) continue;
                        if (matchmakingTicketCanMatch.tempTicketIds.includes(nextMatchmakingTicket.getTicketId())) continue;

                        if (!this.isStringValid(matchmakingTicket, nextMatchmakingTicket, matchmakingQueueSetting)) continue;

                        if (!this.isDifferenceValid(matchmakingTicket, nextMatchmakingTicket, matchmakingQueueSetting)) continue;

                        if (!this.isRegionSelectionValid(matchmakingTicket, nextMatchmakingTicket, matchmakingQueueSetting)) continue;

                        if (!this.isSetIntersectionValid(matchmakingTicket, nextMatchmakingTicket, matchmakingQueueSetting)) continue;

                        // Rule-based queues must consider both committed and temporary members while filling teams.
                        let teamMatchmakingTicketCanMatch = matchmakingTicketCanMatch.matchmakingTicketTeams.sort((a, b) => (a.members.length + a.tempMembers.length) - (b.members.length + b.tempMembers.length))[0];

                        if (matchmakingTicketCanMatch.memberIds.length + matchmakingTicketCanMatch.tempMemberIds.length + nextMatchmakingTicket.getMembers().length <= matchmakingQueueSetting.matchSize.max && teamMatchmakingTicketCanMatch.members.length + teamMatchmakingTicketCanMatch.tempMembers.length + nextMatchmakingTicket.getMembers().length <= teamMatchmakingTicketCanMatch.teamSize.max) {
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

                            matchmakingTicketCanMatch.tempTicketIds.push(nextMatchmakingTicket.getTicketId());
                            teamMatchmakingTicketCanMatch.tempTickets.push({
                                ticketId: nextMatchmakingTicket.getTicketId(),
                                memberCount: nextMatchmakingTicket.getMembers().length
                            });

                            // Promote temporary teams into the final candidate only when the rule set still holds.
                            let canAddToMain = matchmakingTicketCanMatch.matchmakingTicketTeams.sort((a, b) => (a.members.length + a.tempMembers.length) - (b.members.length + b.tempMembers.length))[0] == myTeamMatchmakingTicketCanMatch;
                            if (canAddToMain) {
                                for (let l = 0; l < matchmakingTicketCanMatch.matchmakingTicketTeams.length; l++) {
                                    // Stores the matchmaking ticket team value used in the current execution flow.
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
                            // Stores the matchmaking ticket team value used in the current execution flow.
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

                matchmakingTicket.setStatus(MatchmakingTicketStatus.Matched);

                matchmakingTicketCanMatchs.push(matchmakingTicketCanMatch);
            }
            catch (err) {
                Debug.logException(err);
            }
        }

        return matchmakingTicketCanMatchs;
    }

    /**
     * Verifies the total member count against the queue match-size bounds.
     */
    private isMatchSizeValid(matchmakingTicketCanMatch: MatchmakingTicketCanMatch, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
        return matchmakingTicketCanMatch.memberIds.length >= matchmakingQueueSetting.matchSize.min && matchmakingTicketCanMatch.memberIds.length <= matchmakingQueueSetting.matchSize.max;
    }

    /**
     * Verifies each team against the configured team-size bounds when the queue is team-based.
     */
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

    /**
     * Verifies balance between team sizes, including optional rule expansion over time.
     */
    private isTeamTicketSizeBalanceValid(matchmakingTicketCanMatch: MatchmakingTicketCanMatch, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
        if (matchmakingQueueSetting.rules != null) {
            let teamSizeBalanceRules = matchmakingQueueSetting.rules.find(x => x.type == RuleType.TeamSizeBalance) as TeamSizeBalanceRule;
            if (teamSizeBalanceRules != null) {
                let delta = teamSizeBalanceRules.allowedDifference;

                if (teamSizeBalanceRules.advancedSettings != null) {
                    let currentMilliseconds = xDatetime.getCurrentMilliseconds();
                    if (teamSizeBalanceRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicketCanMatch.tsCreate < currentMilliseconds) return true;

                    if (teamSizeBalanceRules.advancedSettings.expansionType == RuleExpansionType.Linear) {
                        // Linear expansion gradually relaxes the rule the longer a candidate has been waiting.
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

                let minTeamMemberCount = 0;
                let maxTeamMemberCount = 0;

                for (let i = 0; i < matchmakingTicketCanMatch.matchmakingTicketTeams.length; i++) {
                    let teamMemberCount = matchmakingTicketCanMatch.matchmakingTicketTeams[i].members.length;

                    if (i == 0) {
                        minTeamMemberCount = teamMemberCount;
                        maxTeamMemberCount = teamMemberCount;
                    }
                    else {
                        if (teamMemberCount < minTeamMemberCount) minTeamMemberCount = teamMemberCount;
                        if (teamMemberCount > maxTeamMemberCount) maxTeamMemberCount = teamMemberCount;
                    }
                }

                // Validate the full team-size spread instead of comparing every team to the first team only.
                if (maxTeamMemberCount - minTeamMemberCount > delta) return false;
            }
        }

        return true;
    }

    /**
     * Verifies aggregate per-team numeric-difference rules.
     */
    private isTeamDifferenceValid(matchmakingTicketCanMatch: MatchmakingTicketCanMatch, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
        if (matchmakingQueueSetting.rules != null) {
            for (let k = 0; k < matchmakingQueueSetting.rules.length; k++) {
                // Stores the rules value used in the current execution flow.
                let rules = matchmakingQueueSetting.rules[k];

                if (rules.type == RuleType.TeamDifference) {
                    // Stores the team difference rules value used in the current execution flow.
                    let teamDifferenceRules = rules as TeamDifferenceRule;

                    // Stores the delta value used in the current execution flow.
                    let delta = teamDifferenceRules.allowedDifference;

                    if (teamDifferenceRules.advancedSettings != null) {
                        // Stores the current milliseconds value used in the current execution flow.
                        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
                        if (teamDifferenceRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicketCanMatch.tsCreate < currentMilliseconds) continue;

                        if (teamDifferenceRules.advancedSettings.expansionType == RuleExpansionType.Linear) {
                            // Moi bao nhieu giay se tang
                            let secondsFromStart = (currentMilliseconds - matchmakingTicketCanMatch.tsCreate) / 1000;

                            // Stores the count value used in the current execution flow.
                            let count = Math.floor(secondsFromStart / teamDifferenceRules.advancedSettings.linearExpansions.secondsBetweenExpansions);

                            delta += count * teamDifferenceRules.advancedSettings.linearExpansions.delta;

                            if (delta > teamDifferenceRules.advancedSettings.linearExpansions.limit) delta = teamDifferenceRules.advancedSettings.linearExpansions.limit;
                        }
                        else if (teamDifferenceRules.advancedSettings.expansionType == RuleExpansionType.Custom) {
                            // Stores the seconds from start value used in the current execution flow.
                            let secondsFromStart = (currentMilliseconds - matchmakingTicketCanMatch.tsCreate) / 1000;

                            // Stores the count value used in the current execution flow.
                            let count = Math.floor(secondsFromStart / teamDifferenceRules.advancedSettings.customExpansions.secondsBetweenExpansions);

                            if (count < teamDifferenceRules.advancedSettings.customExpansions.overrideValue.length) {
                                delta = teamDifferenceRules.advancedSettings.customExpansions.overrideValue[count];
                            }
                            else if (teamDifferenceRules.advancedSettings.customExpansions.overrideValue.length != 0) {
                                delta = teamDifferenceRules.advancedSettings.customExpansions.overrideValue[teamDifferenceRules.advancedSettings.customExpansions.overrideValue.length - 1];
                            }
                        }
                    }

                    let minTeamScore = 0;
                    let maxTeamScore = 0;

                    for (let i = 0; i < matchmakingTicketCanMatch.matchmakingTicketTeams.length; i++) {
                        // Stores the next team value used in the current execution flow.
                        let nextTeam = matchmakingTicketCanMatch.matchmakingTicketTeams[i];

                        // Stores the next score to compare value used in the current execution flow.
                        let nextScoreToCompare = 0;
                        for (let j = 0; j < nextTeam.members.length; j++) {
                            // Stores the member value used in the current execution flow.
                            let member = nextTeam.members[j];

                            // Stores the value value used in the current execution flow.
                            let value = member.attributeForQueue[rules.name];
                            if (value == null) value = teamDifferenceRules.defaultValue;

                            nextScoreToCompare += value as number;
                        }

                        if (i == 0) {
                            minTeamScore = nextScoreToCompare;
                            maxTeamScore = nextScoreToCompare;
                        }
                        else {
                            if (nextScoreToCompare < minTeamScore) minTeamScore = nextScoreToCompare;
                            if (nextScoreToCompare > maxTeamScore) maxTeamScore = nextScoreToCompare;
                        }
                    }

                    // Validate the full team-score spread instead of comparing every team to the first team only.
                    if (maxTeamScore - minTeamScore > delta) return false;
                }
            }
        }

        return true;
    }

    /**
     * Checks whether match total valid.
     * @param matchmakingTicketCanMatch Provides the matchmaking ticket can match value used by this operation.
     * @param matchmakingQueueSetting Provides the matchmaking queue setting value used by this operation.
     * @returns Returns the operation result.
     */
    private isMatchTotalValid(matchmakingTicketCanMatch: MatchmakingTicketCanMatch, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
        if (matchmakingQueueSetting.rules != null) {
            for (let k = 0; k < matchmakingQueueSetting.rules.length; k++) {
                // Stores the rules value used in the current execution flow.
                let rules = matchmakingQueueSetting.rules[k];

                if (rules.type == RuleType.MatchTotal) {
                    // Stores the match total rules value used in the current execution flow.
                    let matchTotalRules = rules as MatchTotalRule;

                    // Stores the min value used in the current execution flow.
                    let min = matchTotalRules.min;
                    // Stores the max value used in the current execution flow.
                    let max = matchTotalRules.max;

                    if (matchTotalRules.advancedSettings != null) {
                        // Stores the current milliseconds value used in the current execution flow.
                        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
                        if (matchTotalRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicketCanMatch.tsCreate < currentMilliseconds) continue;

                        if (matchTotalRules.advancedSettings.expansionType == RuleExpansionType.Custom) {
                            // Stores the seconds from start value used in the current execution flow.
                            let secondsFromStart = (currentMilliseconds - matchmakingTicketCanMatch.tsCreate) / 1000;

                            // Stores the count value used in the current execution flow.
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

                    // Stores the score value used in the current execution flow.
                    let score = 0;

                    for (let i = 0; i < matchmakingTicketCanMatch.matchmakingTicketTeams.length; i++) {
                        // Stores the next team value used in the current execution flow.
                        let nextTeam = matchmakingTicketCanMatch.matchmakingTicketTeams[i];

                        for (let j = 0; j < nextTeam.members.length; j++) {
                            // Stores the member value used in the current execution flow.
                            let member = nextTeam.members[j];

                            // Stores the value value used in the current execution flow.
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

    /**
     * Checks whether string valid.
     * @param matchmakingTicket Provides the matchmaking ticket value used by this operation.
     * @param nextMatchmakingTicket Provides the next matchmaking ticket value used by this operation.
     * @param matchmakingQueueSetting Provides the matchmaking queue setting value used by this operation.
     * @returns Returns the operation result.
     */
    private isStringValid(matchmakingTicket: MatchmakingTicket, nextMatchmakingTicket: MatchmakingTicket, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
        if (matchmakingQueueSetting.rules != null) {
            for (let k = 0; k < matchmakingQueueSetting.rules.length; k++) {
                // Stores the rules value used in the current execution flow.
                let rules = matchmakingQueueSetting.rules[k];

                if (rules.type == RuleType.String) {
                    // Stores the string rules value used in the current execution flow.
                    let stringRules = rules as StringRule;

                    // Stores the string to compair value used in the current execution flow.
                    let stringToCompair = matchmakingTicket.getMembers()[0].attributeForQueue[rules.name];
                    if (stringToCompair == null) stringToCompair = stringRules.defaultValue;

                    if (stringRules.advancedSettings != null) {
                        // Stores the current milliseconds value used in the current execution flow.
                        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
                        if (stringRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicket.getTsCreate() < currentMilliseconds) continue;

                        if (stringRules.advancedSettings.expansionType == RuleExpansionType.Custom) {
                            // Stores the seconds from start value used in the current execution flow.
                            let secondsFromStart = (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;

                            // Stores the count value used in the current execution flow.
                            let count = Math.floor(secondsFromStart / stringRules.advancedSettings.customExpansions.secondsBetweenExpansions);

                            if (count < stringRules.advancedSettings.customExpansions.overrideValue.length) {
                                stringToCompair = stringRules.advancedSettings.customExpansions.overrideValue[count];
                            }
                            else if (stringRules.advancedSettings.customExpansions.overrideValue.length != 0) {
                                stringToCompair = stringRules.advancedSettings.customExpansions.overrideValue[stringRules.advancedSettings.customExpansions.overrideValue.length - 1];
                            }
                        }
                    }

                    // Stores the next string to compair value used in the current execution flow.
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

    /**
     * Checks whether difference valid.
     * @param matchmakingTicket Provides the matchmaking ticket value used by this operation.
     * @param nextMatchmakingTicket Provides the next matchmaking ticket value used by this operation.
     * @param matchmakingQueueSetting Provides the matchmaking queue setting value used by this operation.
     * @returns Returns the operation result.
     */
    private isDifferenceValid(matchmakingTicket: MatchmakingTicket, nextMatchmakingTicket: MatchmakingTicket, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
        if (matchmakingQueueSetting.rules != null) {
            for (let k = 0; k < matchmakingQueueSetting.rules.length; k++) {
                // Stores the rules value used in the current execution flow.
                let rules = matchmakingQueueSetting.rules[k];

                if (rules.type == RuleType.Difference) {
                    // Stores the difference rules value used in the current execution flow.
                    let differenceRules = rules as DifferenceRule;

                    // Stores the score to compare value used in the current execution flow.
                    let scoreToCompare = matchmakingTicket.getMembers()[0].attributeForQueue[rules.name] as number;
                    if (scoreToCompare == null) scoreToCompare = differenceRules.defaultValue;

                    // Stores the delta value used in the current execution flow.
                    let delta = differenceRules.allowedDifference;

                    if (differenceRules.advancedSettings != null) {
                        // Stores the current milliseconds value used in the current execution flow.
                        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
                        if (differenceRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicket.getTsCreate() < currentMilliseconds) continue;

                        if (differenceRules.advancedSettings.expansionType == RuleExpansionType.Linear) {
                            // Moi bao nhieu giay se tang
                            let secondsFromStart = (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;

                            // Stores the count value used in the current execution flow.
                            let count = Math.floor(secondsFromStart / differenceRules.advancedSettings.linearExpansions.secondsBetweenExpansions);

                            delta += count * differenceRules.advancedSettings.linearExpansions.delta;

                            if (delta > differenceRules.advancedSettings.linearExpansions.limit) delta = differenceRules.advancedSettings.linearExpansions.limit;
                        }
                        else if (differenceRules.advancedSettings.expansionType == RuleExpansionType.Custom) {
                            // Stores the seconds from start value used in the current execution flow.
                            let secondsFromStart = (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;

                            // Stores the count value used in the current execution flow.
                            let count = Math.floor(secondsFromStart / differenceRules.advancedSettings.customExpansions.secondsBetweenExpansions);

                            if (count < differenceRules.advancedSettings.customExpansions.overrideValue.length) {
                                delta = differenceRules.advancedSettings.customExpansions.overrideValue[count];
                            }
                            else if (differenceRules.advancedSettings.customExpansions.overrideValue.length != 0) {
                                delta = differenceRules.advancedSettings.customExpansions.overrideValue[differenceRules.advancedSettings.customExpansions.overrideValue.length - 1];
                            }
                        }
                    }

                    // Stores the next score to compare value used in the current execution flow.
                    let nextScoreToCompare = nextMatchmakingTicket.getMembers()[0].attributeForQueue[rules.name] as number;
                    if (nextScoreToCompare == null) nextScoreToCompare = differenceRules.defaultValue;

                    if (Math.abs(nextScoreToCompare - scoreToCompare) > delta) return false;
                }
            }
        }

        return true;
    }

    /**
     * Checks whether region selection valid.
     * @param matchmakingTicket Provides the matchmaking ticket value used by this operation.
     * @param nextMatchmakingTicket Provides the next matchmaking ticket value used by this operation.
     * @param matchmakingQueueSetting Provides the matchmaking queue setting value used by this operation.
     * @returns Returns the operation result.
     */
    private isRegionSelectionValid(matchmakingTicket: MatchmakingTicket, nextMatchmakingTicket: MatchmakingTicket, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
        if (matchmakingQueueSetting.rules != null) {
            // Stores the region selection rules value used in the current execution flow.
            let regionSelectionRules = matchmakingQueueSetting.rules.find(x => x.type == RuleType.RegionSelection) as RegionSelectionRule;
            if (regionSelectionRules != null) {
                if (regionSelectionRules.advancedSettings != null) {
                    let currentMilliseconds = xDatetime.getCurrentMilliseconds();

                    // Once the rule becomes optional, region and latency should no longer block matchmaking.
                    if (regionSelectionRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicket.getTsCreate() < currentMilliseconds) return true;
                }

                // Stores the value to compair value used in the current execution flow.
                let valueToCompair: {
                    // Stores the region value used by this contract.
                    region: string,
                    // Stores the ping value used by this contract.
                    ping: number
                } = matchmakingTicket.getMembers()[0].attributeForQueue[regionSelectionRules.name] as any;

                if (valueToCompair == null) return false;

                // Stores the next value to compair value used in the current execution flow.
                let nextValueToCompair: {
                    // Stores the region value used by this contract.
                    region: string,
                    // Stores the ping value used by this contract.
                    ping: number
                } = nextMatchmakingTicket.getMembers()[0].attributeForQueue[regionSelectionRules.name] as any;

                if (nextValueToCompair == null) return false;

                if (valueToCompair.region != nextValueToCompair.region) return false;

                // Stores the maximum latency value used in the current execution flow.
                let maximumLatency = regionSelectionRules.max;

                if (regionSelectionRules.advancedSettings != null) {
                    // Stores the current milliseconds value used in the current execution flow.
                    let currentMilliseconds = xDatetime.getCurrentMilliseconds();
                    if (regionSelectionRules.advancedSettings.expansionType == RuleExpansionType.Linear) {
                        // Moi bao nhieu giay se tang
                        let secondsFromStart = (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;

                        // Stores the count value used in the current execution flow.
                        let count = Math.floor(secondsFromStart / regionSelectionRules.advancedSettings.linearExpansions.secondsBetweenExpansions);

                        maximumLatency += count * regionSelectionRules.advancedSettings.linearExpansions.delta;

                        if (maximumLatency > regionSelectionRules.advancedSettings.linearExpansions.limit) maximumLatency = regionSelectionRules.advancedSettings.linearExpansions.limit;
                    }
                    else if (regionSelectionRules.advancedSettings.expansionType == RuleExpansionType.Custom) {
                        // Stores the seconds from start value used in the current execution flow.
                        let secondsFromStart = (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;

                        // Stores the count value used in the current execution flow.
                        let count = Math.floor(secondsFromStart / regionSelectionRules.advancedSettings.customExpansions.secondsBetweenExpansions);

                        if (count < regionSelectionRules.advancedSettings.customExpansions.overrideValue.length) {
                            maximumLatency = regionSelectionRules.advancedSettings.customExpansions.overrideValue[count];
                        }
                        else if (regionSelectionRules.advancedSettings.customExpansions.overrideValue.length != 0) {
                            maximumLatency = regionSelectionRules.advancedSettings.customExpansions.overrideValue[regionSelectionRules.advancedSettings.customExpansions.overrideValue.length - 1];
                        }
                    }
                }

                if (valueToCompair.ping > maximumLatency || nextValueToCompair.ping > maximumLatency) return false;
            }
        }

        return true;
    }

    /**
     * Checks whether set intersection valid.
     * @param matchmakingTicket Provides the matchmaking ticket value used by this operation.
     * @param nextMatchmakingTicket Provides the next matchmaking ticket value used by this operation.
     * @param matchmakingQueueSetting Provides the matchmaking queue setting value used by this operation.
     * @returns Returns the operation result.
     */
    private isSetIntersectionValid(matchmakingTicket: MatchmakingTicket, nextMatchmakingTicket: MatchmakingTicket, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
        if (matchmakingQueueSetting.rules != null) {
            for (let k = 0; k < matchmakingQueueSetting.rules.length; k++) {
                // Stores the rules value used in the current execution flow.
                let rules = matchmakingQueueSetting.rules[k];

                if (rules.type == RuleType.SetIntersection) {
                    // Stores the set intersection rules value used in the current execution flow.
                    let setIntersectionRules = rules as SetIntersectionRule;

                    // Stores the value to compair value used in the current execution flow.
                    let valueToCompair = matchmakingTicket.getMembers()[0].attributeForQueue[rules.name] as string[];
                    if (valueToCompair == null) valueToCompair = setIntersectionRules.defaultValue;

                    // Stores the min value used in the current execution flow.
                    let min = setIntersectionRules.min;

                    if (setIntersectionRules.advancedSettings != null) {
                        // Stores the current milliseconds value used in the current execution flow.
                        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
                        if (setIntersectionRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicket.getTsCreate() < currentMilliseconds) continue;

                        if (setIntersectionRules.advancedSettings.expansionType == RuleExpansionType.Linear) {
                            // Moi bao nhieu giay se tang
                            let secondsFromStart = (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;

                            // Stores the count value used in the current execution flow.
                            let count = Math.floor(secondsFromStart / setIntersectionRules.advancedSettings.linearExpansions.secondsBetweenExpansions);

                            // Relax the rule over time by requiring fewer shared values.
                            min -= count * setIntersectionRules.advancedSettings.linearExpansions.delta;
                            if (min < 0) min = 0;
                        }
                        else if (setIntersectionRules.advancedSettings.expansionType == RuleExpansionType.Custom) {
                            // Stores the seconds from start value used in the current execution flow.
                            let secondsFromStart = (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;

                            // Stores the count value used in the current execution flow.
                            let count = Math.floor(secondsFromStart / setIntersectionRules.advancedSettings.customExpansions.secondsBetweenExpansions);

                            if (count < setIntersectionRules.advancedSettings.customExpansions.overrideValue.length) {
                                min = setIntersectionRules.advancedSettings.customExpansions.overrideValue[count];
                            }
                            else if (setIntersectionRules.advancedSettings.customExpansions.overrideValue.length != 0) {
                                min = setIntersectionRules.advancedSettings.customExpansions.overrideValue[setIntersectionRules.advancedSettings.customExpansions.overrideValue.length - 1];
                            }
                        }
                    }

                    // Stores the next score to compare value used in the current execution flow.
                    let nextScoreToCompare = nextMatchmakingTicket.getMembers()[0].attributeForQueue[rules.name] as string[];
                    if (nextScoreToCompare == null) nextScoreToCompare = setIntersectionRules.defaultValue;

                    // Stores the count match value used in the current execution flow.
                    let countMatch = 0;

                    for (let i = 0; i < valueToCompair.length; i++) {
                        if (nextScoreToCompare.includes(valueToCompair[i])) countMatch += 1;
                    }

                    if (countMatch < min) return false;
                }
            }
        }

        return true;
    }

    /**
     * Checks whether team ticket size similarity valid.
     * @param matchmakingTicket Provides the matchmaking ticket value used by this operation.
     * @param ticketSize Provides the ticket size value used by this operation.
     * @param nextMatchmakingTicket Provides the next matchmaking ticket value used by this operation.
     * @param matchmakingQueueSetting Provides the matchmaking queue setting value used by this operation.
     * @returns Returns the operation result.
     */
    private isTeamTicketSizeSimilarityValid(matchmakingTicket: MatchmakingTicket, ticketSize: number, nextMatchmakingTicket: MatchmakingTicket, matchmakingQueueSetting: xMatchmakingQueueSettings): boolean {
        if (matchmakingQueueSetting.rules != null) {
            // Stores the team ticket size similarity rules value used in the current execution flow.
            let teamTicketSizeSimilarityRules = matchmakingQueueSetting.rules.find(x => x.type == RuleType.TeamTicketSizeSimilarity) as TeamTicketSizeSimilarityRule;

            if (teamTicketSizeSimilarityRules != null) {
                if (teamTicketSizeSimilarityRules.advancedSettings != null) {
                    // Stores the current milliseconds value used in the current execution flow.
                    let currentMilliseconds = xDatetime.getCurrentMilliseconds();
                    if (teamTicketSizeSimilarityRules.advancedSettings.secondsUntilOptional * 1000 + matchmakingTicket.getTsCreate() < currentMilliseconds) return true;
                }

                if (ticketSize != nextMatchmakingTicket.getMembers().length) return false;
            }
        }

        return true;
    }

    /**
     * Removes the matchmaking ticket not correct.
     * @param matchmakingTicketCanMatchs Provides the matchmaking ticket can matchs value used by this operation.
     */
    /**
     * Removes overlapping match candidates so the same ticket is not consumed by multiple matches.
     */
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

    /**
     * Persists successful matches and updates the participating tickets to their new status.
     * @param gameId Provides the game ID value used by this operation.
     * @param matchmakingTicketCanMatchs Provides the matchmaking ticket can matchs value used by this operation.
     * @param matchmakingTickets Provides the matchmaking tickets value used by this operation.
     */
    private async createMatch(gameId: string, matchmakingTicketCanMatchs: MatchmakingTicketCanMatch[], matchmakingTickets: MatchmakingTicket[]): Promise<void> {
        let matchCollection = this.gnServer.getDatabase().systemGameCollection("Match", gameId);

        let matchmakingQueueSettings = this.gnServer.getGNSettings().getMatchmakingQueueSettings(gameId);
        if (matchmakingQueueSettings == null) return;

        for (let i = 0; i < matchmakingTicketCanMatchs.length; i++) {
            let matchmakingTicketCanMatch = matchmakingTicketCanMatchs[i];

            // `serverDetail` starts empty and may be filled later by server-allocation callbacks.
            let matchResult: {
                matchId: string,
                queueName: string,
                members: {
                    teamId: string,
                    userId: string,
                    attribute: {
                        [k: string]: DataValueType;
                    },
                }[],
                serverDetail: {
                    ipV4Address: "127.0.0.1",
                    ports: {
                        name: string,
                        publicPort: number,
                        privatePort: number,
                        protocol: 1 | 2, // 1 for UDP, 2 for TCP
                    }[]
                },
                tsCreate: number,
                timeToMatchInSeconds: number,
                ticketIds: string[],
                status: MatchStatus,
            } = {
                matchId: matchmakingTicketCanMatch.matchId,
                queueName: matchmakingTicketCanMatch.queueName,
                members: [],
                serverDetail: null,
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
                tsCreate: xDatetime.getCurrentMilliseconds(),
                timeToMatchInSeconds: -1,
                ticketIds: [],
                status: MatchStatus.Matched,
            };

            let matchmakingQueueSetting = matchmakingQueueSettings.find(x => x.queueName == matchmakingTicketCanMatch.queueName);
            if (matchmakingQueueSetting == null) continue;

            if (matchmakingQueueSetting.serverAllocation.enable) {
                matchResult.status = MatchStatus.WaitingForServer;
                matchmakingTicketCanMatch.status = MatchmakingTicketStatus.WaitingForServer;
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

                    await matchmakingTicket.saveAsync();

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
                    totalMatchSuccessTimeInSeconds += (currentMilliseconds - matchmakingTicket.getTsCreate()) / 1000;
                }
            }

            if (totalMatchSuccess != 0)
                matchResult.timeToMatchInSeconds = totalMatchSuccessTimeInSeconds / totalMatchSuccess;

            matchResult.ticketIds = matchmakingTicketCanMatch.ticketIds;

            await matchCollection.insertOne(matchResult);
        }
    }

    /**
     * Cancels tickets that have waited longer than their configured give-up timeout.
     * @param matchmakingTickets Provides the matchmaking tickets value used by this operation.
     */
    private async removeGiveUpTickets(matchmakingTickets: MatchmakingTicket[]): Promise<void> {
        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        for (let i = 0; i < matchmakingTickets.length; i++) {
            let matchmakingTicket = matchmakingTickets[i];

            if (matchmakingTicket.getStatus() == MatchmakingTicketStatus.WaitingForMatch || matchmakingTicket.getStatus() == MatchmakingTicketStatus.WaitingForMembers) {
                if (matchmakingTicket.getTsCreate() + matchmakingTicket.getGiveUpAfterSeconds() * 1000 < currentMilliseconds) {
                    matchmakingTicket.setStatus(MatchmakingTicketStatus.Canceled);

                    await matchmakingTicket.saveAsync();
                }
            }
        }
    }
}
