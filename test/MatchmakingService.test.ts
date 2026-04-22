import assert from "node:assert/strict";
import { test } from "node:test";
import * as mongoDB from "mongodb";
import { MatchmakingMemberStatus } from "./../src/GN-common/constant/enumType/MatchmakingMemberStatus";
import { MatchmakingTicketStatus } from "./../src/GN-common/constant/enumType/MatchmakingTicketStatus";
import { DataValueType } from "./../src/GN-library/xdatabase/lib/entity/pro/type/DataValueType";
import { MatchmakingTicket } from "./../src/GN-library/xdatabase/lib/entity/pro/MatchmakingTicket";
import { DifferenceRule, MatchTotalRule, RegionSelectionRule, RuleAttributeSource, RuleExpansionType, RuleStringCompairType, RuleType, SetIntersectionRule, StringRule, TeamDifferenceRule, TeamSizeBalanceRule, TeamTicketSizeSimilarityRule, xMatchmakingQueueSettings } from "./../src/GN-library/xsettings/lib/entity/xMatchmakingQueueSettings";
import { MatchmakingService } from "./../src/GN-app-api/service/MatchmakingService";
import { MatchmakingTicketCanMatch } from "./../src/GN-app-api/service/IMatchmakingService";

type TicketMemberInput = {
    userId: string;
    attributeForQueue?: { [k: string]: DataValueType };
    attribute?: { [k: string]: DataValueType };
};

const queueName = "rankedQueue";
const collectionStub = {} as mongoDB.Collection<mongoDB.Document>;

function createQueueSettings(overrides: Partial<xMatchmakingQueueSettings> = {}): xMatchmakingQueueSettings {
    return {
        queueName: overrides.queueName ?? queueName,
        matchSize: overrides.matchSize ?? { min: 2, max: 2 },
        ticketSize: overrides.ticketSize ?? { min: 1, max: 4 },
        serverAllocation: overrides.serverAllocation ?? { enable: false },
        teams: overrides.teams,
        rules: overrides.rules
    };
}

function createTicket(ticketId: string, members: TicketMemberInput[], tsCreate = Date.now()): MatchmakingTicket {
    return new MatchmakingTicket({
        _id: new mongoDB.ObjectId(),
        ticketId: ticketId,
        queueName: queueName,
        creatorId: members[0].userId,
        giveUpAfterSeconds: 60,
        userIds: members.map(member => member.userId),
        members: members.map(member => ({
            userId: member.userId,
            status: MatchmakingMemberStatus.Joined,
            attribute: member.attribute ?? {},
            attributeForQueue: member.attributeForQueue ?? {}
        })),
        status: MatchmakingTicketStatus.WaitingForMatch,
        tsCreate: tsCreate
    }, collectionStub);
}

function singleMemberTicket(ticketId: string, userId: string, attributeForQueue: { [k: string]: DataValueType } = {}, tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, [{ userId: userId, attributeForQueue: attributeForQueue }], tsCreate);
}

function multiMemberTicket(ticketId: string, members: TicketMemberInput[], tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, members, tsCreate);
}

function runMatchmaking(matchmakingQueueSetting: xMatchmakingQueueSettings, matchmakingTickets: MatchmakingTicket[]): MatchmakingTicketCanMatch[] {
    let matchmakingService = new MatchmakingService();
    return matchmakingService.getMatchmakingTicketCanMatchs(matchmakingQueueSetting, matchmakingTickets);
}

function findCandidateWithTickets(candidates: MatchmakingTicketCanMatch[], expectedTicketIds: string[]): MatchmakingTicketCanMatch {
    return candidates.find(candidate => expectedTicketIds.every(ticketId => candidate.ticketIds.includes(ticketId)) && candidate.ticketIds.length == expectedTicketIds.length);
}

function assertCandidateWithTickets(candidates: MatchmakingTicketCanMatch[], expectedTicketIds: string[]): MatchmakingTicketCanMatch {
    let candidate = findCandidateWithTickets(candidates, expectedTicketIds);
    assert.ok(candidate, "Expected a candidate containing ticket IDs: " + expectedTicketIds.join(", "));
    return candidate;
}

function assertNoCandidateWithTicket(candidates: MatchmakingTicketCanMatch[], ticketId: string): void {
    assert.equal(candidates.some(candidate => candidate.ticketIds.includes(ticketId)), false, "Expected no candidate containing ticket ID: " + ticketId);
}

function assertNoCandidateContainingAll(candidates: MatchmakingTicketCanMatch[], ticketIds: string[]): void {
    assert.equal(candidates.some(candidate => ticketIds.every(ticketId => candidate.ticketIds.includes(ticketId))), false, "Expected no candidate containing ticket IDs together: " + ticketIds.join(", "));
}

function assertCandidateMembers(candidate: MatchmakingTicketCanMatch, expectedMemberIds: string[]): void {
    assert.deepEqual(candidate.memberIds, expectedMemberIds);
}

function assertCandidateBasics(candidate: MatchmakingTicketCanMatch, expectedTicketIds: string[], expectedMemberIds: string[]): void {
    assert.equal(candidate.queueName, queueName);
    assert.equal(candidate.status, MatchmakingTicketStatus.Matched);
    assert.equal(candidate.matchId.length, 15);
    assert.deepEqual(candidate.ticketIds, expectedTicketIds);
    assertCandidateMembers(candidate, expectedMemberIds);
}

function assertEveryCandidateWithinMatchSize(candidates: MatchmakingTicketCanMatch[], maxMatchSize: number): void {
    for (const candidate of candidates) {
        assert.ok(candidate.memberIds.length <= maxMatchSize, "Candidate exceeded match size: " + candidate.memberIds.length);
    }
}

function sortTeamsById<T extends { teamId: string }>(teams: T[]): T[] {
    return teams.sort((a, b) => a.teamId.localeCompare(b.teamId));
}

function stringRule(name: string, compairType = RuleStringCompairType.Equals): StringRule {
    return {
        name: name,
        type: RuleType.String,
        attributeSource: RuleAttributeSource.UserInput,
        attributePath: name,
        defaultValue: "",
        compairType: compairType
    };
}

function differenceRule(name: string, allowedDifference: number): DifferenceRule {
    return {
        name: name,
        type: RuleType.Difference,
        attributeSource: RuleAttributeSource.UserInput,
        attributePath: name,
        defaultValue: 0,
        allowedDifference: allowedDifference
    };
}

function regionRule(maxLatency: number): RegionSelectionRule {
    return {
        name: "region",
        type: RuleType.RegionSelection,
        attributePath: "region",
        max: maxLatency
    };
}

function setIntersectionRule(name: string, min: number): SetIntersectionRule {
    return {
        name: name,
        type: RuleType.SetIntersection,
        attributeSource: RuleAttributeSource.UserInput,
        attributePath: name,
        min: min,
        defaultValue: []
    };
}

function matchTotalRule(name: string, min: number, max: number): MatchTotalRule {
    return {
        name: name,
        type: RuleType.MatchTotal,
        attributeSource: RuleAttributeSource.UserInput,
        attributePath: name,
        min: min,
        max: max
    };
}

function teamSizeBalanceRule(allowedDifference: number): TeamSizeBalanceRule {
    return {
        name: "teamSizeBalance",
        type: RuleType.TeamSizeBalance,
        allowedDifference: allowedDifference
    };
}

function teamDifferenceRule(name: string, allowedDifference: number): TeamDifferenceRule {
    return {
        name: name,
        type: RuleType.TeamDifference,
        attributeSource: RuleAttributeSource.UserInput,
        attributePath: name,
        allowedDifference: allowedDifference,
        defaultValue: 0
    };
}

function teamTicketSizeSimilarityRule(): TeamTicketSizeSimilarityRule {
    return {
        name: "teamTicketSizeSimilarity",
        type: RuleType.TeamTicketSizeSimilarity
    };
}

test("01 no rules builds a mixed-size four-member candidate", () => {
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 } });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { mode: "ranked" }),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { mode: "ranked" } }, { userId: "userB2", attributeForQueue: { mode: "ranked" } }]),
        singleMemberTicket("ticketC", "userC", { mode: "ranked" }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { mode: "ranked" } }, { userId: "userD2", attributeForQueue: { mode: "ranked" } }])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertCandidateBasics(candidate, ["ticketA", "ticketB", "ticketC"], ["userA", "userB1", "userB2", "userC"]);
    assert.deepEqual(candidate.matchmakingTicketTeams[0].tickets.map(ticket => ticket.ticketId), ["ticketA", "ticketB", "ticketC"]);
    assertEveryCandidateWithinMatchSize(candidates, 4);
});

test("02 no rules assigns mixed tickets across configured teams", () => {
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ]
    });
    let candidates = runMatchmaking(settings, [
        multiMemberTicket("ticketA", [{ userId: "userA1" }, { userId: "userA2" }]),
        singleMemberTicket("ticketB", "userB"),
        singleMemberTicket("ticketC", "userC"),
        multiMemberTicket("ticketD", [{ userId: "userD1" }, { userId: "userD2" }])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assert.deepEqual(sortTeamsById(candidate.matchmakingTicketTeams.map(team => ({ teamId: team.teamId, ticketIds: team.tickets.map(ticket => ticket.ticketId) }))), [
        { teamId: "blue", ticketIds: ["ticketB", "ticketC"] },
        { teamId: "red", ticketIds: ["ticketA"] }
    ]);
});

test("03 StringRule Equals accepts same attribute across mixed tickets", () => {
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 }, rules: [stringRule("mode")] });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { mode: "ranked" }),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { mode: "ranked" } }, { userId: "userB2", attributeForQueue: { mode: "ranked" } }]),
        singleMemberTicket("ticketC", "userC", { mode: "ranked" }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { mode: "casual" } }, { userId: "userD2", attributeForQueue: { mode: "casual" } }])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertCandidateMembers(candidate, ["userA", "userB1", "userB2", "userC"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketD"]);
});

test("04 StringRule Equals skips ticket with different attribute", () => {
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 }, rules: [stringRule("mode")] });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { mode: "ranked" }),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { mode: "casual" } }, { userId: "userB2", attributeForQueue: { mode: "casual" } }]),
        singleMemberTicket("ticketC", "userC", { mode: "ranked" }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { mode: "ranked" } }, { userId: "userD2", attributeForQueue: { mode: "ranked" } }])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketC", "ticketD"]);
    assertCandidateMembers(candidate, ["userA", "userC", "userD1", "userD2"]);
    assertNoCandidateWithTicket(candidates, "ticketB");
});

test("05 StringRule NotEquals accepts tickets with different attribute from seed", () => {
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 }, rules: [stringRule("partyType", RuleStringCompairType.NotEquals)] });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { partyType: "solo" }),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { partyType: "duo" } }, { userId: "userB2", attributeForQueue: { partyType: "duo" } }]),
        singleMemberTicket("ticketC", "userC", { partyType: "squad" }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { partyType: "solo" } }, { userId: "userD2", attributeForQueue: { partyType: "solo" } }])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertCandidateMembers(candidate, ["userA", "userB1", "userB2", "userC"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketD"]);
});

test("06 DifferenceRule accepts mixed tickets inside allowed delta", () => {
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 }, rules: [differenceRule("skill", 50)] });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { skill: 100 }),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { skill: 130 } }, { userId: "userB2", attributeForQueue: { skill: 128 } }]),
        singleMemberTicket("ticketC", "userC", { skill: 145 }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { skill: 190 } }, { userId: "userD2", attributeForQueue: { skill: 190 } }])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertCandidateMembers(candidate, ["userA", "userB1", "userB2", "userC"]);
    assertNoCandidateWithTicket(candidates, "ticketD");
});

test("07 DifferenceRule skips mixed ticket outside allowed delta", () => {
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 }, rules: [differenceRule("skill", 25)] });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { skill: 100 }),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { skill: 160 } }, { userId: "userB2", attributeForQueue: { skill: 158 } }]),
        singleMemberTicket("ticketC", "userC", { skill: 110 }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { skill: 120 } }, { userId: "userD2", attributeForQueue: { skill: 122 } }])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketC", "ticketD"]);
    assertCandidateMembers(candidate, ["userA", "userC", "userD1", "userD2"]);
    assertNoCandidateWithTicket(candidates, "ticketB");
});

test("08 DifferenceRule linear expansion accepts wider skill gap", () => {
    let oldTimestamp = Date.now() - 30_000;
    let rule = differenceRule("skill", 10);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 15,
            limit: 55
        }
    };
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 }, rules: [rule] });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { skill: 100 }, oldTimestamp),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { skill: 145 } }, { userId: "userB2", attributeForQueue: { skill: 145 } }], oldTimestamp),
        singleMemberTicket("ticketC", "userC", { skill: 150 }, oldTimestamp),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { skill: 190 } }, { userId: "userD2", attributeForQueue: { skill: 190 } }], oldTimestamp)
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertCandidateMembers(candidate, ["userA", "userB1", "userB2", "userC"]);
});

test("09 RegionSelectionRule accepts same region under latency cap", () => {
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 }, rules: [regionRule(80)] });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { region: { region: "us-east", ping: 20 } }),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { region: { region: "us-east", ping: 70 } } }, { userId: "userB2", attributeForQueue: { region: { region: "us-east", ping: 60 } } }]),
        singleMemberTicket("ticketC", "userC", { region: { region: "us-east", ping: 80 } }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { region: { region: "eu-west", ping: 40 } } }, { userId: "userD2", attributeForQueue: { region: { region: "eu-west", ping: 40 } } }])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertCandidateMembers(candidate, ["userA", "userB1", "userB2", "userC"]);
    assertNoCandidateWithTicket(candidates, "ticketD");
});

test("10 RegionSelectionRule skips region mismatch in mixed ticket set", () => {
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 }, rules: [regionRule(90)] });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { region: { region: "us-east", ping: 20 } }),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { region: { region: "eu-west", ping: 50 } } }, { userId: "userB2", attributeForQueue: { region: { region: "eu-west", ping: 40 } } }]),
        singleMemberTicket("ticketC", "userC", { region: { region: "us-east", ping: 50 } }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { region: { region: "us-east", ping: 60 } } }, { userId: "userD2", attributeForQueue: { region: { region: "us-east", ping: 70 } } }])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketC", "ticketD"]);
    assertCandidateMembers(candidate, ["userA", "userC", "userD1", "userD2"]);
    assertNoCandidateWithTicket(candidates, "ticketB");
});

test("11 RegionSelectionRule optional timeout accepts different regions", () => {
    let oldTimestamp = Date.now() - 2_000;
    let rule = regionRule(50);
    rule.advancedSettings = {
        secondsUntilOptional: 1,
        expansionType: RuleExpansionType.None
    };
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 }, rules: [rule] });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { region: { region: "us-east", ping: 200 } }, oldTimestamp),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { region: { region: "eu-west", ping: 200 } } }, { userId: "userB2", attributeForQueue: { region: { region: "eu-west", ping: 200 } } }], oldTimestamp),
        singleMemberTicket("ticketC", "userC", { region: { region: "asia", ping: 200 } }, oldTimestamp),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { region: { region: "sa", ping: 200 } } }, { userId: "userD2", attributeForQueue: { region: { region: "sa", ping: 200 } } }], oldTimestamp)
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertCandidateMembers(candidate, ["userA", "userB1", "userB2", "userC"]);
});

test("12 SetIntersectionRule accepts enough shared values", () => {
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 }, rules: [setIntersectionRule("maps", 2)] });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { maps: ["a", "b", "c"] }),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { maps: ["b", "c", "d"] } }, { userId: "userB2", attributeForQueue: { maps: ["b", "c"] } }]),
        singleMemberTicket("ticketC", "userC", { maps: ["a", "c", "e"] }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { maps: ["x", "y"] } }, { userId: "userD2", attributeForQueue: { maps: ["x", "z"] } }])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertCandidateMembers(candidate, ["userA", "userB1", "userB2", "userC"]);
    assertNoCandidateWithTicket(candidates, "ticketD");
});

test("13 SetIntersectionRule skips ticket without enough overlap", () => {
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 }, rules: [setIntersectionRule("maps", 2)] });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { maps: ["a", "b", "c"] }),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { maps: ["x", "y", "z"] } }, { userId: "userB2", attributeForQueue: { maps: ["x", "z"] } }]),
        singleMemberTicket("ticketC", "userC", { maps: ["a", "b", "d"] }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { maps: ["b", "c", "e"] } }, { userId: "userD2", attributeForQueue: { maps: ["b", "c"] } }])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketC", "ticketD"]);
    assertCandidateMembers(candidate, ["userA", "userC", "userD1", "userD2"]);
    assertNoCandidateWithTicket(candidates, "ticketB");
});

test("14 SetIntersectionRule linear expansion relaxes minimum overlap", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = setIntersectionRule("maps", 3);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 1
        }
    };
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 }, rules: [rule] });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { maps: ["a", "b", "c"] }, oldTimestamp),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { maps: ["c", "d"] } }, { userId: "userB2", attributeForQueue: { maps: ["c"] } }], oldTimestamp),
        singleMemberTicket("ticketC", "userC", { maps: ["b", "e"] }, oldTimestamp),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { maps: ["x", "y"] } }, { userId: "userD2", attributeForQueue: { maps: ["x"] } }], oldTimestamp)
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertCandidateMembers(candidate, ["userA", "userB1", "userB2", "userC"]);
});

test("15 MatchTotalRule accepts aggregate score inside bounds", () => {
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 }, rules: [matchTotalRule("score", 90, 100)] });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { score: 20 }),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { score: 30 } }, { userId: "userB2", attributeForQueue: { score: 30 } }]),
        singleMemberTicket("ticketC", "userC", { score: 20 }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { score: 5 } }, { userId: "userD2", attributeForQueue: { score: 5 } }])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertCandidateMembers(candidate, ["userA", "userB1", "userB2", "userC"]);
});

test("16 MatchTotalRule rejects aggregate score outside bounds", () => {
    let settings = createQueueSettings({ matchSize: { min: 4, max: 4 }, rules: [matchTotalRule("score", 90, 100)] });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { score: 20 }),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { score: 40 } }, { userId: "userB2", attributeForQueue: { score: 40 } }]),
        singleMemberTicket("ticketC", "userC", { score: 30 }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { score: 10 } }, { userId: "userD2", attributeForQueue: { score: 10 } }])
    ]);

    assert.equal(candidates.length, 0);
});

test("17 TeamSizeBalanceRule accepts and rejects team spread", () => {
    let acceptedSettings = createQueueSettings({
        matchSize: { min: 5, max: 5 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 3 } },
            { teamId: "blue", teamSize: { min: 2, max: 3 } }
        ],
        rules: [teamSizeBalanceRule(1)]
    });
    let rejectedSettings = createQueueSettings({ ...acceptedSettings, rules: [teamSizeBalanceRule(0)] });
    let tickets = [
        multiMemberTicket("ticketA", [{ userId: "userA1" }, { userId: "userA2" }, { userId: "userA3" }]),
        singleMemberTicket("ticketB", "userB"),
        singleMemberTicket("ticketC", "userC"),
        multiMemberTicket("ticketD", [{ userId: "userD1" }, { userId: "userD2" }])
    ];

    let acceptedCandidates = runMatchmaking(acceptedSettings, tickets);
    let rejectedCandidates = runMatchmaking(rejectedSettings, tickets);
    let candidate = assertCandidateWithTickets(acceptedCandidates, ["ticketA", "ticketB", "ticketC"]);
    assert.deepEqual(sortTeamsById(candidate.matchmakingTicketTeams.map(team => ({ teamId: team.teamId, memberCount: team.members.length }))), [
        { teamId: "blue", memberCount: 2 },
        { teamId: "red", memberCount: 3 }
    ]);
    assertNoCandidateContainingAll(rejectedCandidates, ["ticketA", "ticketB"]);
    assertNoCandidateContainingAll(rejectedCandidates, ["ticketA", "ticketC"]);
});

test("18 TeamDifferenceRule accepts and rejects team score spread", () => {
    let acceptedSettings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ],
        rules: [teamDifferenceRule("skill", 0)]
    });
    let rejectedSettings = createQueueSettings({ ...acceptedSettings, rules: [teamDifferenceRule("skill", 10)] });
    let acceptedTickets = [
        multiMemberTicket("ticketA", [{ userId: "userA1", attributeForQueue: { skill: 50 } }, { userId: "userA2", attributeForQueue: { skill: 50 } }]),
        singleMemberTicket("ticketB", "userB", { skill: 60 }),
        singleMemberTicket("ticketC", "userC", { skill: 40 }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { skill: 90 } }, { userId: "userD2", attributeForQueue: { skill: 90 } }])
    ];
    let rejectedTickets = [
        multiMemberTicket("ticketA", [{ userId: "userA1", attributeForQueue: { skill: 50 } }, { userId: "userA2", attributeForQueue: { skill: 50 } }]),
        singleMemberTicket("ticketB", "userB", { skill: 80 }),
        singleMemberTicket("ticketC", "userC", { skill: 40 }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { skill: 90 } }, { userId: "userD2", attributeForQueue: { skill: 90 } }])
    ];

    let acceptedCandidates = runMatchmaking(acceptedSettings, acceptedTickets);
    let rejectedCandidates = runMatchmaking(rejectedSettings, rejectedTickets);
    let candidate = assertCandidateWithTickets(acceptedCandidates, ["ticketA", "ticketB", "ticketC"]);
    assert.deepEqual(sortTeamsById(candidate.matchmakingTicketTeams.map(team => ({ teamId: team.teamId, score: team.members.reduce((sum, member) => sum + (member.attributeForQueue.skill as number), 0) }))), [
        { teamId: "blue", score: 100 },
        { teamId: "red", score: 100 }
    ]);
    assert.equal(rejectedCandidates.length, 0);
});

test("19 TeamTicketSizeSimilarityRule accepts equal party sizes and rejects unequal sizes", () => {
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let acceptedCandidates = runMatchmaking(settings, [
        multiMemberTicket("ticketA", [{ userId: "userA1" }, { userId: "userA2" }]),
        multiMemberTicket("ticketB", [{ userId: "userB1" }, { userId: "userB2" }]),
        singleMemberTicket("ticketC", "userC"),
        singleMemberTicket("ticketD", "userD")
    ]);
    let rejectedCandidates = runMatchmaking(settings, [
        multiMemberTicket("ticketA", [{ userId: "userA1" }, { userId: "userA2" }]),
        singleMemberTicket("ticketB", "userB"),
        singleMemberTicket("ticketC", "userC"),
        multiMemberTicket("ticketD", [{ userId: "userD1" }, { userId: "userD2" }])
    ]);

    let candidate = assertCandidateWithTickets(acceptedCandidates, ["ticketA", "ticketB"]);
    assert.deepEqual(sortTeamsById(candidate.matchmakingTicketTeams.map(team => ({ teamId: team.teamId, ticketIds: team.tickets.map(ticket => ticket.ticketId) }))), [
        { teamId: "blue", ticketIds: ["ticketB"] },
        { teamId: "red", ticketIds: ["ticketA"] }
    ]);
    assertNoCandidateContainingAll(rejectedCandidates, ["ticketA", "ticketB"]);
    assertNoCandidateContainingAll(rejectedCandidates, ["ticketA", "ticketC"]);
});

test("20 combined String Difference and SetIntersection rules produce expected mixed match", () => {
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        rules: [
            stringRule("mode"),
            differenceRule("skill", 20),
            setIntersectionRule("maps", 1)
        ]
    });
    let candidates = runMatchmaking(settings, [
        singleMemberTicket("ticketA", "userA", { mode: "ranked", skill: 100, maps: ["a", "b"] }),
        multiMemberTicket("ticketB", [{ userId: "userB1", attributeForQueue: { mode: "ranked", skill: 110, maps: ["b", "c"] } }, { userId: "userB2", attributeForQueue: { mode: "ranked", skill: 112, maps: ["b"] } }]),
        singleMemberTicket("ticketC", "userC", { mode: "ranked", skill: 115, maps: ["a", "d"] }),
        multiMemberTicket("ticketD", [{ userId: "userD1", attributeForQueue: { mode: "casual", skill: 108, maps: ["b"] } }, { userId: "userD2", attributeForQueue: { mode: "casual", skill: 108, maps: ["b"] } }])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertCandidateBasics(candidate, ["ticketA", "ticketB", "ticketC"], ["userA", "userB1", "userB2", "userC"]);
    assertNoCandidateWithTicket(candidates, "ticketD");
});

type ComplexStringMemberOptions = {
    omitModeRule?: boolean;
    noiseModeRule?: string;
    rawMode?: string;
    extraAttributeForQueue?: { [k: string]: DataValueType };
};

type ComplexStringPartyMemberInput = {
    userId: string;
    modeRuleValue: string;
    options?: ComplexStringMemberOptions;
};

function complexStringMember(userId: string, modeRuleValue: string, options: ComplexStringMemberOptions = {}): TicketMemberInput {
    let attributeForQueue: { [k: string]: DataValueType } = {
        skillRule: 1540,
        regionRule: {
            region: "sg",
            ping: 42,
            jitter: 5
        },
        mapRule: ["temple", "harbor", "metro", "temple"],
        teamSkillRule: 1540,
        matchScoreRule: 6,
        unrelatedMode: options.noiseModeRule ?? "noise:casual",
        unrelatedSkill: 9999,
        unrelatedMaps: ["wrong-map"]
    };

    if (!options.omitModeRule) {
        attributeForQueue.modeRule = modeRuleValue;
    }

    if (options.extraAttributeForQueue != null) {
        Object.assign(attributeForQueue, options.extraAttributeForQueue);
    }

    return {
        userId: userId,
        attribute: {
            profile: {
                rank: {
                    tier: "gold",
                    division: 2,
                    mmr: 1540
                },
                region: {
                    primary: "sg",
                    fallback: "hk"
                }
            },
            matchmaking: {
                mode: options.rawMode ?? modeRuleValue,
                skill: 1540,
                latency: {
                    region: "sg",
                    ping: 42,
                    jitter: 5,
                    packetLoss: 0.01
                },
                maps: ["temple", "harbor", "metro"],
                roles: ["tank", "support"],
                score: 6
            },
            noise: {
                modeRule: options.noiseModeRule ?? "noise:casual",
                skillRule: 9999,
                mapRule: ["wrong-map"],
                regionRule: {
                    region: "wrong",
                    ping: 999
                },
                matchScoreRule: 9999
            }
        },
        attributeForQueue: attributeForQueue
    };
}

function complexStringSoloTicket(ticketId: string, userId: string, modeRuleValue: string, options: ComplexStringMemberOptions = {}, tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, [complexStringMember(userId, modeRuleValue, options)], tsCreate);
}

function complexStringPartyTicket(ticketId: string, members: ComplexStringPartyMemberInput[], tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, members.map(member => complexStringMember(member.userId, member.modeRuleValue, member.options)), tsCreate);
}

test("21 StringRule Equals full match uses modeRule instead of complex noise fields", () => {
    let settings = createQueueSettings({ rules: [stringRule("modeRule")] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ranked-duo:sg", { noiseModeRule: "casual:na" }),
        complexStringSoloTicket("ticketB", "userB", "ranked-duo:sg", { noiseModeRule: "casual:eu" })
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertCandidateBasics(candidate, ["ticketA", "ticketB"], ["userA", "userB"]);
    assert.equal(candidate.matchmakingTicketTeams[0].members[0].attributeForQueue.unrelatedMode, "casual:na");
});

test("22 StringRule Equals no match ignores same noise mode when rule key differs", () => {
    let settings = createQueueSettings({ rules: [stringRule("modeRule")] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ranked-duo:sg", { noiseModeRule: "same-noise" }),
        complexStringSoloTicket("ticketB", "userB", "ranked-duo:hk", { noiseModeRule: "same-noise" })
    ]);

    assert.equal(candidates.length, 0);
});

test("23 StringRule Equals partial match keeps matching subset and excludes different mode from seed candidate", () => {
    let settings = createQueueSettings({ rules: [stringRule("modeRule")] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ranked-duo:sg"),
        complexStringSoloTicket("ticketB", "userB", "ranked-duo:sg"),
        complexStringSoloTicket("ticketC", "userC", "ranked-solo:sg")
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketC"]);
});

test("24 StringRule NotEquals full match accepts different complex mode values", () => {
    let settings = createQueueSettings({ rules: [stringRule("modeRule", RuleStringCompairType.NotEquals)] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ranked-duo:sg"),
        complexStringSoloTicket("ticketB", "userB", "ranked-solo:sg")
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertCandidateBasics(candidate, ["ticketA", "ticketB"], ["userA", "userB"]);
});

test("25 StringRule NotEquals no match rejects same complex mode even when raw noise differs", () => {
    let settings = createQueueSettings({ rules: [stringRule("modeRule", RuleStringCompairType.NotEquals)] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ranked-duo:sg", { noiseModeRule: "noise-a" }),
        complexStringSoloTicket("ticketB", "userB", "ranked-duo:sg", { noiseModeRule: "noise-b" })
    ]);

    assert.equal(candidates.length, 0);
});

test("26 StringRule NotEquals partial match rejects same-mode seed pair but accepts different-mode pair", () => {
    let settings = createQueueSettings({ rules: [stringRule("modeRule", RuleStringCompairType.NotEquals)] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ranked-duo:sg"),
        complexStringSoloTicket("ticketB", "userB", "ranked-solo:sg"),
        complexStringSoloTicket("ticketC", "userC", "ranked-duo:sg")
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketC"]);
});

test("27 StringRule Equals full match uses defaultValue when both tickets omit modeRule", () => {
    let rule = stringRule("modeRule");
    rule.defaultValue = "default-ranked:sg";
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ignored-a", { omitModeRule: true, noiseModeRule: "wrong-a" }),
        complexStringSoloTicket("ticketB", "userB", "ignored-b", { omitModeRule: true, noiseModeRule: "wrong-b" })
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertCandidateBasics(candidate, ["ticketA", "ticketB"], ["userA", "userB"]);
});

test("28 StringRule Equals full match compares missing modeRule default with explicit default value", () => {
    let rule = stringRule("modeRule");
    rule.defaultValue = "default-ranked:sg";
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ignored-a", { omitModeRule: true, noiseModeRule: "wrong-a" }),
        complexStringSoloTicket("ticketB", "userB", "default-ranked:sg", { noiseModeRule: "wrong-b" })
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("29 StringRule Equals no match compares missing modeRule default against explicit different value", () => {
    let rule = stringRule("modeRule");
    rule.defaultValue = "default-ranked:sg";
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ignored-a", { omitModeRule: true, noiseModeRule: "ranked-duo:sg" }),
        complexStringSoloTicket("ticketB", "userB", "ranked-duo:sg", { noiseModeRule: "default-ranked:sg" })
    ]);

    assert.equal(candidates.length, 0);
});

test("30 StringRule Equals party match uses first member modeRule and ignores second member mismatch", () => {
    let settings = createQueueSettings({ matchSize: { min: 3, max: 3 }, rules: [stringRule("modeRule")] });
    let candidates = runMatchmaking(settings, [
        complexStringPartyTicket("ticketA", [
            { userId: "userA1", modeRuleValue: "ranked-duo:sg" },
            { userId: "userA2", modeRuleValue: "casual-duo:sg" }
        ]),
        complexStringSoloTicket("ticketB", "userB", "ranked-duo:sg")
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertCandidateBasics(candidate, ["ticketA", "ticketB"], ["userA1", "userA2", "userB"]);
});

test("31 StringRule Equals no match rejects party when first member modeRule differs", () => {
    let settings = createQueueSettings({ matchSize: { min: 3, max: 3 }, rules: [stringRule("modeRule")] });
    let candidates = runMatchmaking(settings, [
        complexStringPartyTicket("ticketA", [
            { userId: "userA1", modeRuleValue: "casual-duo:sg" },
            { userId: "userA2", modeRuleValue: "ranked-duo:sg" }
        ]),
        complexStringSoloTicket("ticketB", "userB", "ranked-duo:sg")
    ]);

    assert.equal(candidates.length, 0);
});

test("32 StringRule custom expansion full match overrides seed comparison value", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = stringRule("modeRule");
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: ["phase-zero", "expanded-ranked:sg"]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "strict-ranked:sg", { noiseModeRule: "wrong-noise" }, oldTimestamp),
        complexStringSoloTicket("ticketB", "userB", "expanded-ranked:sg", { noiseModeRule: "wrong-noise" }, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("33 StringRule custom expansion no match before override reaches compatible value", () => {
    let currentTimestamp = Date.now();
    let rule = stringRule("modeRule");
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: ["phase-zero", "expanded-ranked:sg"]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "strict-ranked:sg", {}, currentTimestamp),
        complexStringSoloTicket("ticketB", "userB", "expanded-ranked:sg", {}, currentTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("34 StringRule custom expansion full match uses last override value after index overflow", () => {
    let oldTimestamp = Date.now() - 60_000;
    let rule = stringRule("modeRule");
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: ["phase-zero", "late-ranked:sg"]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "strict-ranked:sg", {}, oldTimestamp),
        complexStringSoloTicket("ticketB", "userB", "late-ranked:sg", {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("35 StringRule optional timeout full match ignores incompatible mode values", () => {
    let oldTimestamp = Date.now() - 2_000;
    let rule = stringRule("modeRule");
    rule.advancedSettings = {
        secondsUntilOptional: 1,
        expansionType: RuleExpansionType.None
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ranked-duo:sg", {}, oldTimestamp),
        complexStringSoloTicket("ticketB", "userB", "casual-solo:eu", {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("36 StringRule optional timeout no match before rule becomes optional", () => {
    let currentTimestamp = Date.now();
    let rule = stringRule("modeRule");
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.None
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ranked-duo:sg", {}, currentTimestamp),
        complexStringSoloTicket("ticketB", "userB", "casual-solo:eu", {}, currentTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("37 StringRule partial match enforces matchSize max with several compatible tickets", () => {
    let settings = createQueueSettings({ matchSize: { min: 2, max: 2 }, rules: [stringRule("modeRule")] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ranked-duo:sg"),
        complexStringSoloTicket("ticketB", "userB", "ranked-duo:sg"),
        complexStringSoloTicket("ticketC", "userC", "ranked-duo:sg"),
        complexStringSoloTicket("ticketD", "userD", "ranked-duo:sg")
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertEveryCandidateWithinMatchSize(candidates, 2);
});

test("38 StringRule partial match enforces teamSize max while preserving valid team split", () => {
    let settings = createQueueSettings({
        matchSize: { min: 2, max: 2 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [stringRule("modeRule")]
    });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ranked-duo:sg"),
        complexStringSoloTicket("ticketB", "userB", "ranked-duo:sg"),
        complexStringSoloTicket("ticketC", "userC", "ranked-duo:sg")
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assert.deepEqual(sortTeamsById(candidate.matchmakingTicketTeams.map(team => ({ teamId: team.teamId, memberIds: team.members.map(member => member.userId) }))), [
        { teamId: "blue", memberIds: ["userB"] },
        { teamId: "red", memberIds: ["userA"] }
    ]);
});

test("39 StringRule full match requires multiple complex string rules to pass", () => {
    let settings = createQueueSettings({ rules: [stringRule("modeRule"), stringRule("platformRule")] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ranked-duo:sg", { extraAttributeForQueue: { platformRule: "pc:steam", unrelatedPlatform: "mobile:ios" } }),
        complexStringSoloTicket("ticketB", "userB", "ranked-duo:sg", { extraAttributeForQueue: { platformRule: "pc:steam", unrelatedPlatform: "mobile:android" } })
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("40 StringRule no match rejects when secondary string rule fails despite matching noise", () => {
    let settings = createQueueSettings({ rules: [stringRule("modeRule"), stringRule("platformRule")] });
    let candidates = runMatchmaking(settings, [
        complexStringSoloTicket("ticketA", "userA", "ranked-duo:sg", { extraAttributeForQueue: { platformRule: "pc:steam", unrelatedPlatform: "same-noise-platform" } }),
        complexStringSoloTicket("ticketB", "userB", "ranked-duo:sg", { extraAttributeForQueue: { platformRule: "console:ps", unrelatedPlatform: "same-noise-platform" } })
    ]);

    assert.equal(candidates.length, 0);
});

type ComplexDifferenceMemberOptions = {
    omitSkillRule?: boolean;
    noiseSkillRule?: number;
    rawSkill?: number;
    extraAttributeForQueue?: { [k: string]: DataValueType };
};

type ComplexDifferencePartyMemberInput = {
    userId: string;
    skillRuleValue: number;
    options?: ComplexDifferenceMemberOptions;
};

function complexDifferenceMember(userId: string, skillRuleValue: number, options: ComplexDifferenceMemberOptions = {}): TicketMemberInput {
    let attributeForQueue: { [k: string]: DataValueType } = {
        modeRule: "ranked-duo:sg",
        regionRule: {
            region: "sg",
            ping: 42,
            jitter: 5
        },
        mapRule: ["temple", "harbor", "metro", "temple"],
        teamSkillRule: skillRuleValue,
        matchScoreRule: 6,
        unrelatedMode: "casual",
        unrelatedSkill: options.noiseSkillRule ?? 9999,
        unrelatedMaps: ["wrong-map"]
    };

    if (!options.omitSkillRule) {
        attributeForQueue.skillRule = skillRuleValue;
    }

    if (options.extraAttributeForQueue != null) {
        Object.assign(attributeForQueue, options.extraAttributeForQueue);
    }

    return {
        userId: userId,
        attribute: {
            profile: {
                rank: {
                    tier: "gold",
                    division: 2,
                    mmr: options.rawSkill ?? skillRuleValue
                },
                region: {
                    primary: "sg",
                    fallback: "hk"
                }
            },
            matchmaking: {
                mode: "ranked-duo",
                skill: options.rawSkill ?? skillRuleValue,
                latency: {
                    region: "sg",
                    ping: 42,
                    jitter: 5,
                    packetLoss: 0.01
                },
                maps: ["temple", "harbor", "metro"],
                roles: ["tank", "support"],
                score: 6
            },
            noise: {
                modeRule: "casual",
                skillRule: options.noiseSkillRule ?? 9999,
                mapRule: ["wrong-map"],
                regionRule: {
                    region: "wrong",
                    ping: 999
                },
                matchScoreRule: 9999
            }
        },
        attributeForQueue: attributeForQueue
    };
}

function complexDifferenceSoloTicket(ticketId: string, userId: string, skillRuleValue: number, options: ComplexDifferenceMemberOptions = {}, tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, [complexDifferenceMember(userId, skillRuleValue, options)], tsCreate);
}

function complexDifferencePartyTicket(ticketId: string, members: ComplexDifferencePartyMemberInput[], tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, members.map(member => complexDifferenceMember(member.userId, member.skillRuleValue, member.options)), tsCreate);
}

test("41 DifferenceRule full match uses skillRule instead of large noise skill", () => {
    let settings = createQueueSettings({ rules: [differenceRule("skillRule", 25)] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1540, { noiseSkillRule: 9999 }),
        complexDifferenceSoloTicket("ticketB", "userB", 1560, { noiseSkillRule: 1 })
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertCandidateBasics(candidate, ["ticketA", "ticketB"], ["userA", "userB"]);
    assert.equal(candidate.matchmakingTicketTeams[0].members[0].attributeForQueue.unrelatedSkill, 9999);
});

test("42 DifferenceRule no match ignores close noise skill when real skillRule differs", () => {
    let settings = createQueueSettings({ rules: [differenceRule("skillRule", 25)] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000, { noiseSkillRule: 1500 }),
        complexDifferenceSoloTicket("ticketB", "userB", 1200, { noiseSkillRule: 1500 })
    ]);

    assert.equal(candidates.length, 0);
});

test("43 DifferenceRule partial match keeps in-delta subset and excludes outside ticket", () => {
    let settings = createQueueSettings({ rules: [differenceRule("skillRule", 20)] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000),
        complexDifferenceSoloTicket("ticketB", "userB", 1010),
        complexDifferenceSoloTicket("ticketC", "userC", 1100)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketC"]);
});

test("44 DifferenceRule full match accepts difference exactly at allowed delta", () => {
    let settings = createQueueSettings({ rules: [differenceRule("skillRule", 20)] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000),
        complexDifferenceSoloTicket("ticketB", "userB", 1020)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("45 DifferenceRule no match rejects difference one point above allowed delta", () => {
    let settings = createQueueSettings({ rules: [differenceRule("skillRule", 20)] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000),
        complexDifferenceSoloTicket("ticketB", "userB", 1021)
    ]);

    assert.equal(candidates.length, 0);
});

test("46 DifferenceRule full match uses defaultValue when both tickets omit skillRule", () => {
    let rule = differenceRule("skillRule", 0);
    rule.defaultValue = 1500;
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1, { omitSkillRule: true, noiseSkillRule: 9999 }),
        complexDifferenceSoloTicket("ticketB", "userB", 2, { omitSkillRule: true, noiseSkillRule: 1 })
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("47 DifferenceRule full match compares missing skillRule default with explicit default value", () => {
    let rule = differenceRule("skillRule", 0);
    rule.defaultValue = 1500;
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1, { omitSkillRule: true }),
        complexDifferenceSoloTicket("ticketB", "userB", 1500)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("48 DifferenceRule no match compares missing skillRule default against outside explicit value", () => {
    let rule = differenceRule("skillRule", 10);
    rule.defaultValue = 1500;
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1, { omitSkillRule: true, noiseSkillRule: 1520 }),
        complexDifferenceSoloTicket("ticketB", "userB", 1520, { noiseSkillRule: 1500 })
    ]);

    assert.equal(candidates.length, 0);
});

test("49 DifferenceRule party match uses first member skillRule and ignores second member outlier", () => {
    let settings = createQueueSettings({ matchSize: { min: 3, max: 3 }, rules: [differenceRule("skillRule", 20)] });
    let candidates = runMatchmaking(settings, [
        complexDifferencePartyTicket("ticketA", [
            { userId: "userA1", skillRuleValue: 1000 },
            { userId: "userA2", skillRuleValue: 9999 }
        ]),
        complexDifferenceSoloTicket("ticketB", "userB", 1010)
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertCandidateBasics(candidate, ["ticketA", "ticketB"], ["userA1", "userA2", "userB"]);
});

test("50 DifferenceRule no match rejects party when first member skillRule is outside delta", () => {
    let settings = createQueueSettings({ matchSize: { min: 3, max: 3 }, rules: [differenceRule("skillRule", 20)] });
    let candidates = runMatchmaking(settings, [
        complexDifferencePartyTicket("ticketA", [
            { userId: "userA1", skillRuleValue: 1200 },
            { userId: "userA2", skillRuleValue: 1000 }
        ]),
        complexDifferenceSoloTicket("ticketB", "userB", 1005)
    ]);

    assert.equal(candidates.length, 0);
});

test("51 DifferenceRule linear expansion full match accepts widened skill gap", () => {
    let oldTimestamp = Date.now() - 30_000;
    let rule = differenceRule("skillRule", 10);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 10,
            limit: 50
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000, {}, oldTimestamp),
        complexDifferenceSoloTicket("ticketB", "userB", 1040, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("52 DifferenceRule linear expansion no match when elapsed time is not enough", () => {
    let currentTimestamp = Date.now();
    let rule = differenceRule("skillRule", 10);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 10,
            limit: 50
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000, {}, currentTimestamp),
        complexDifferenceSoloTicket("ticketB", "userB", 1035, {}, currentTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("53 DifferenceRule linear expansion no match when capped limit remains too small", () => {
    let oldTimestamp = Date.now() - 60_000;
    let rule = differenceRule("skillRule", 10);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 20,
            limit: 30
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000, {}, oldTimestamp),
        complexDifferenceSoloTicket("ticketB", "userB", 1035, {}, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("54 DifferenceRule custom expansion full match accepts override delta", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = differenceRule("skillRule", 5);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: [10, 20, 40]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000, {}, oldTimestamp),
        complexDifferenceSoloTicket("ticketB", "userB", 1040, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("55 DifferenceRule custom expansion no match when override delta remains too small", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = differenceRule("skillRule", 5);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: [10, 20, 30]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000, {}, oldTimestamp),
        complexDifferenceSoloTicket("ticketB", "userB", 1040, {}, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("56 DifferenceRule custom expansion full match uses last override after index overflow", () => {
    let oldTimestamp = Date.now() - 60_000;
    let rule = differenceRule("skillRule", 5);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: [10, 50]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000, {}, oldTimestamp),
        complexDifferenceSoloTicket("ticketB", "userB", 1050, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("57 DifferenceRule optional timeout full match ignores incompatible skillRule values", () => {
    let oldTimestamp = Date.now() - 2_000;
    let rule = differenceRule("skillRule", 0);
    rule.advancedSettings = {
        secondsUntilOptional: 1,
        expansionType: RuleExpansionType.None
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000, {}, oldTimestamp),
        complexDifferenceSoloTicket("ticketB", "userB", 2000, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("58 DifferenceRule optional timeout no match before rule becomes optional", () => {
    let currentTimestamp = Date.now();
    let rule = differenceRule("skillRule", 0);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.None
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000, {}, currentTimestamp),
        complexDifferenceSoloTicket("ticketB", "userB", 2000, {}, currentTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("59 DifferenceRule partial match enforces matchSize max with several compatible tickets", () => {
    let settings = createQueueSettings({ matchSize: { min: 2, max: 2 }, rules: [differenceRule("skillRule", 20)] });
    let candidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000),
        complexDifferenceSoloTicket("ticketB", "userB", 1010),
        complexDifferenceSoloTicket("ticketC", "userC", 1015),
        complexDifferenceSoloTicket("ticketD", "userD", 1018)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertEveryCandidateWithinMatchSize(candidates, 2);
});

test("60 DifferenceRule requires multiple numeric rules and rejects secondary failure despite noise", () => {
    let settings = createQueueSettings({ rules: [differenceRule("skillRule", 20), differenceRule("latencyScoreRule", 5)] });
    let acceptedCandidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000, { extraAttributeForQueue: { latencyScoreRule: 40, unrelatedLatencyScore: 9999 } }),
        complexDifferenceSoloTicket("ticketB", "userB", 1015, { extraAttributeForQueue: { latencyScoreRule: 45, unrelatedLatencyScore: 9999 } })
    ]);
    let rejectedCandidates = runMatchmaking(settings, [
        complexDifferenceSoloTicket("ticketA", "userA", 1000, { extraAttributeForQueue: { latencyScoreRule: 40, unrelatedLatencyScore: 10 } }),
        complexDifferenceSoloTicket("ticketB", "userB", 1015, { extraAttributeForQueue: { latencyScoreRule: 55, unrelatedLatencyScore: 10 } })
    ]);

    assertCandidateWithTickets(acceptedCandidates, ["ticketA", "ticketB"]);
    assert.equal(rejectedCandidates.length, 0);
});

type ComplexRegionMemberOptions = {
    omitRegionRule?: boolean;
    noiseRegion?: string;
    noisePing?: number;
    rawRegion?: string;
    rawPing?: number;
    extraAttributeForQueue?: { [k: string]: DataValueType };
};

type ComplexRegionPartyMemberInput = {
    userId: string;
    regionValue: string;
    pingValue: number;
    options?: ComplexRegionMemberOptions;
};

function complexRegionRule(maxLatency: number): RegionSelectionRule {
    return {
        name: "regionRule",
        type: RuleType.RegionSelection,
        attributePath: "matchmaking.latency",
        max: maxLatency
    };
}

function complexRegionMember(userId: string, regionValue: string, pingValue: number, options: ComplexRegionMemberOptions = {}): TicketMemberInput {
    let attributeForQueue: { [k: string]: DataValueType } = {
        modeRule: "ranked-duo:sg",
        skillRule: 1540,
        mapRule: ["temple", "harbor", "metro", "temple"],
        teamSkillRule: 1540,
        matchScoreRule: 6,
        unrelatedMode: "casual",
        unrelatedSkill: 9999,
        unrelatedMaps: ["wrong-map"],
        unrelatedRegionRule: {
            region: options.noiseRegion ?? "wrong",
            ping: options.noisePing ?? 999
        }
    };

    if (!options.omitRegionRule) {
        attributeForQueue.regionRule = {
            region: regionValue,
            ping: pingValue,
            jitter: 5,
            packetLoss: 0.01
        };
    }

    if (options.extraAttributeForQueue != null) {
        Object.assign(attributeForQueue, options.extraAttributeForQueue);
    }

    return {
        userId: userId,
        attribute: {
            profile: {
                rank: {
                    tier: "gold",
                    division: 2,
                    mmr: 1540
                },
                region: {
                    primary: options.rawRegion ?? regionValue,
                    fallback: "hk"
                }
            },
            matchmaking: {
                mode: "ranked-duo",
                skill: 1540,
                latency: {
                    region: options.rawRegion ?? regionValue,
                    ping: options.rawPing ?? pingValue,
                    jitter: 5,
                    packetLoss: 0.01
                },
                maps: ["temple", "harbor", "metro"],
                roles: ["tank", "support"],
                score: 6
            },
            noise: {
                modeRule: "casual",
                skillRule: 9999,
                mapRule: ["wrong-map"],
                regionRule: {
                    region: options.noiseRegion ?? "wrong",
                    ping: options.noisePing ?? 999
                },
                matchScoreRule: 9999
            }
        },
        attributeForQueue: attributeForQueue
    };
}

function complexRegionSoloTicket(ticketId: string, userId: string, regionValue: string, pingValue: number, options: ComplexRegionMemberOptions = {}, tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, [complexRegionMember(userId, regionValue, pingValue, options)], tsCreate);
}

function complexRegionPartyTicket(ticketId: string, members: ComplexRegionPartyMemberInput[], tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, members.map(member => complexRegionMember(member.userId, member.regionValue, member.pingValue, member.options)), tsCreate);
}

test("61 RegionSelectionRule full match uses regionRule instead of noisy region fields", () => {
    let settings = createQueueSettings({ rules: [complexRegionRule(80)] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 42, { noiseRegion: "same-noise", noisePing: 999 }),
        complexRegionSoloTicket("ticketB", "userB", "sg", 80, { noiseRegion: "same-noise", noisePing: 999 })
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertCandidateBasics(candidate, ["ticketA", "ticketB"], ["userA", "userB"]);
    assert.deepEqual(candidate.matchmakingTicketTeams[0].members[0].attributeForQueue.unrelatedRegionRule, { region: "same-noise", ping: 999 });
});

test("62 RegionSelectionRule no match ignores same noisy region when real regionRule differs", () => {
    let settings = createQueueSettings({ rules: [complexRegionRule(80)] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 40, { noiseRegion: "same-noise", noisePing: 20 }),
        complexRegionSoloTicket("ticketB", "userB", "hk", 40, { noiseRegion: "same-noise", noisePing: 20 })
    ]);

    assert.equal(candidates.length, 0);
});

test("63 RegionSelectionRule no match rejects seed ping above maximum latency", () => {
    let settings = createQueueSettings({ rules: [complexRegionRule(80)] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 81),
        complexRegionSoloTicket("ticketB", "userB", "sg", 40)
    ]);

    assert.equal(candidates.length, 0);
});

test("64 RegionSelectionRule no match rejects next ticket ping above maximum latency", () => {
    let settings = createQueueSettings({ rules: [complexRegionRule(80)] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 40),
        complexRegionSoloTicket("ticketB", "userB", "sg", 81)
    ]);

    assert.equal(candidates.length, 0);
});

test("65 RegionSelectionRule no match rejects missing seed regionRule data", () => {
    let settings = createQueueSettings({ rules: [complexRegionRule(80)] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 40, { omitRegionRule: true, noiseRegion: "sg", noisePing: 40 }),
        complexRegionSoloTicket("ticketB", "userB", "sg", 40)
    ]);

    assert.equal(candidates.length, 0);
});

test("66 RegionSelectionRule no match rejects missing next regionRule data", () => {
    let settings = createQueueSettings({ rules: [complexRegionRule(80)] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 40),
        complexRegionSoloTicket("ticketB", "userB", "sg", 40, { omitRegionRule: true, noiseRegion: "sg", noisePing: 40 })
    ]);

    assert.equal(candidates.length, 0);
});

test("67 RegionSelectionRule partial match keeps same-region subset and excludes different region", () => {
    let settings = createQueueSettings({ rules: [complexRegionRule(80)] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 40),
        complexRegionSoloTicket("ticketB", "userB", "sg", 50),
        complexRegionSoloTicket("ticketC", "userC", "hk", 40)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketC"]);
});

test("68 RegionSelectionRule partial match keeps valid ping subset and excludes high-ping ticket", () => {
    let settings = createQueueSettings({ rules: [complexRegionRule(80)] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 40),
        complexRegionSoloTicket("ticketB", "userB", "sg", 50),
        complexRegionSoloTicket("ticketC", "userC", "sg", 81)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketC"]);
});

test("69 RegionSelectionRule full match accepts ping exactly equal to maximum latency", () => {
    let settings = createQueueSettings({ rules: [complexRegionRule(80)] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 80),
        complexRegionSoloTicket("ticketB", "userB", "sg", 80)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("70 RegionSelectionRule linear expansion full match accepts expanded latency", () => {
    let oldTimestamp = Date.now() - 30_000;
    let rule = complexRegionRule(50);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 15,
            limit: 95
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 90, {}, oldTimestamp),
        complexRegionSoloTicket("ticketB", "userB", "sg", 90, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("71 RegionSelectionRule linear expansion no match when elapsed time is not enough", () => {
    let currentTimestamp = Date.now();
    let rule = complexRegionRule(50);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 15,
            limit: 95
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 60, {}, currentTimestamp),
        complexRegionSoloTicket("ticketB", "userB", "sg", 60, {}, currentTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("72 RegionSelectionRule linear expansion no match when capped limit remains too low", () => {
    let oldTimestamp = Date.now() - 60_000;
    let rule = complexRegionRule(50);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 20,
            limit: 70
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 75, {}, oldTimestamp),
        complexRegionSoloTicket("ticketB", "userB", "sg", 75, {}, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("73 RegionSelectionRule custom expansion full match accepts override latency", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = complexRegionRule(50);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: [60, 80, 100]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 95, {}, oldTimestamp),
        complexRegionSoloTicket("ticketB", "userB", "sg", 95, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("74 RegionSelectionRule custom expansion no match when override latency remains too low", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = complexRegionRule(50);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: [60, 70, 80]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 90, {}, oldTimestamp),
        complexRegionSoloTicket("ticketB", "userB", "sg", 90, {}, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("75 RegionSelectionRule custom expansion full match uses last override after index overflow", () => {
    let oldTimestamp = Date.now() - 60_000;
    let rule = complexRegionRule(50);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: [60, 95]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 95, {}, oldTimestamp),
        complexRegionSoloTicket("ticketB", "userB", "sg", 95, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("76 RegionSelectionRule optional timeout full match ignores different regions", () => {
    let oldTimestamp = Date.now() - 2_000;
    let rule = complexRegionRule(50);
    rule.advancedSettings = {
        secondsUntilOptional: 1,
        expansionType: RuleExpansionType.None
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 40, {}, oldTimestamp),
        complexRegionSoloTicket("ticketB", "userB", "hk", 40, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("77 RegionSelectionRule optional timeout full match ignores very high ping", () => {
    let oldTimestamp = Date.now() - 2_000;
    let rule = complexRegionRule(50);
    rule.advancedSettings = {
        secondsUntilOptional: 1,
        expansionType: RuleExpansionType.None
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 999, {}, oldTimestamp),
        complexRegionSoloTicket("ticketB", "userB", "sg", 999, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("78 RegionSelectionRule optional timeout no match before rule becomes optional", () => {
    let currentTimestamp = Date.now();
    let rule = complexRegionRule(50);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.None
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 40, {}, currentTimestamp),
        complexRegionSoloTicket("ticketB", "userB", "hk", 40, {}, currentTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("79 RegionSelectionRule partial match enforces matchSize max with several compatible tickets", () => {
    let settings = createQueueSettings({ matchSize: { min: 2, max: 2 }, rules: [complexRegionRule(80)] });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 40),
        complexRegionSoloTicket("ticketB", "userB", "sg", 50),
        complexRegionSoloTicket("ticketC", "userC", "sg", 60),
        complexRegionSoloTicket("ticketD", "userD", "sg", 70)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertEveryCandidateWithinMatchSize(candidates, 2);
});

test("80 RegionSelectionRule partial match enforces teamSize max while preserving valid team split", () => {
    let settings = createQueueSettings({
        matchSize: { min: 2, max: 2 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [complexRegionRule(80)]
    });
    let candidates = runMatchmaking(settings, [
        complexRegionSoloTicket("ticketA", "userA", "sg", 40),
        complexRegionSoloTicket("ticketB", "userB", "sg", 50),
        complexRegionSoloTicket("ticketC", "userC", "sg", 60)
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assert.deepEqual(sortTeamsById(candidate.matchmakingTicketTeams.map(team => ({ teamId: team.teamId, memberIds: team.members.map(member => member.userId) }))), [
        { teamId: "blue", memberIds: ["userB"] },
        { teamId: "red", memberIds: ["userA"] }
    ]);
});

type ComplexSetIntersectionMemberOptions = {
    omitMapRule?: boolean;
    noiseMaps?: string[];
    rawMaps?: string[];
    extraAttributeForQueue?: { [k: string]: DataValueType };
};

type ComplexSetIntersectionPartyMemberInput = {
    userId: string;
    mapRuleValues: string[];
    options?: ComplexSetIntersectionMemberOptions;
};

function complexSetIntersectionMember(userId: string, mapRuleValues: string[], options: ComplexSetIntersectionMemberOptions = {}): TicketMemberInput {
    let attributeForQueue: { [k: string]: DataValueType } = {
        modeRule: "ranked-duo:sg",
        skillRule: 1540,
        regionRule: {
            region: "sg",
            ping: 42,
            jitter: 5
        },
        teamSkillRule: 1540,
        matchScoreRule: 6,
        unrelatedMode: "casual",
        unrelatedSkill: 9999,
        unrelatedMaps: options.noiseMaps ?? ["wrong-map", "decoy-map"]
    };

    if (!options.omitMapRule) {
        attributeForQueue.mapRule = mapRuleValues;
    }

    if (options.extraAttributeForQueue != null) {
        Object.assign(attributeForQueue, options.extraAttributeForQueue);
    }

    return {
        userId: userId,
        attribute: {
            profile: {
                rank: {
                    tier: "gold",
                    division: 2,
                    mmr: 1540
                },
                region: {
                    primary: "sg",
                    fallback: "hk"
                }
            },
            matchmaking: {
                mode: "ranked-duo",
                skill: 1540,
                latency: {
                    region: "sg",
                    ping: 42,
                    jitter: 5,
                    packetLoss: 0.01
                },
                maps: options.rawMaps ?? mapRuleValues,
                roles: ["tank", "support"],
                score: 6
            },
            noise: {
                modeRule: "casual",
                skillRule: 9999,
                mapRule: options.noiseMaps ?? ["wrong-map", "decoy-map"],
                regionRule: {
                    region: "wrong",
                    ping: 999
                },
                matchScoreRule: 9999
            }
        },
        attributeForQueue: attributeForQueue
    };
}

function complexSetIntersectionSoloTicket(ticketId: string, userId: string, mapRuleValues: string[], options: ComplexSetIntersectionMemberOptions = {}, tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, [complexSetIntersectionMember(userId, mapRuleValues, options)], tsCreate);
}

function complexSetIntersectionPartyTicket(ticketId: string, members: ComplexSetIntersectionPartyMemberInput[], tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, members.map(member => complexSetIntersectionMember(member.userId, member.mapRuleValues, member.options)), tsCreate);
}

test("81 SetIntersectionRule full match uses mapRule instead of noisy map arrays", () => {
    let settings = createQueueSettings({ rules: [setIntersectionRule("mapRule", 2)] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["temple", "harbor", "metro", "temple"], { noiseMaps: ["wrong-a", "wrong-b"] }),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["harbor", "metro", "forest"], { noiseMaps: ["wrong-a", "wrong-b"] })
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertCandidateBasics(candidate, ["ticketA", "ticketB"], ["userA", "userB"]);
    assert.deepEqual(candidate.matchmakingTicketTeams[0].members[0].attributeForQueue.unrelatedMaps, ["wrong-a", "wrong-b"]);
});

test("82 SetIntersectionRule full match accepts overlap exactly at minimum", () => {
    let settings = createQueueSettings({ rules: [setIntersectionRule("mapRule", 2)] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["temple", "harbor", "metro"]),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["harbor", "metro", "forest"])
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("83 SetIntersectionRule no match ignores overlapping noise arrays when mapRule overlap is too small", () => {
    let settings = createQueueSettings({ rules: [setIntersectionRule("mapRule", 2)] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["temple", "harbor"], { noiseMaps: ["same-noise-a", "same-noise-b"] }),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["harbor", "metro"], { noiseMaps: ["same-noise-a", "same-noise-b"] })
    ]);

    assert.equal(candidates.length, 0);
});

test("84 SetIntersectionRule no match rejects tickets with no shared mapRule values", () => {
    let settings = createQueueSettings({ rules: [setIntersectionRule("mapRule", 1)] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["temple", "harbor"]),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["metro", "forest"])
    ]);

    assert.equal(candidates.length, 0);
});

test("85 SetIntersectionRule partial match keeps enough-overlap subset and excludes weak overlap", () => {
    let settings = createQueueSettings({ rules: [setIntersectionRule("mapRule", 2)] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["temple", "harbor", "metro"]),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["harbor", "metro", "forest"]),
        complexSetIntersectionSoloTicket("ticketC", "userC", ["metro", "desert"])
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketC"]);
});

test("86 SetIntersectionRule full match uses defaultValue when both tickets omit mapRule", () => {
    let rule = setIntersectionRule("mapRule", 2);
    rule.defaultValue = ["temple", "harbor"];
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["wrong-a"], { omitMapRule: true, noiseMaps: ["wrong-a"] }),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["wrong-b"], { omitMapRule: true, noiseMaps: ["wrong-b"] })
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("87 SetIntersectionRule full match compares missing mapRule default with explicit overlapping values", () => {
    let rule = setIntersectionRule("mapRule", 2);
    rule.defaultValue = ["temple", "harbor"];
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["wrong-a"], { omitMapRule: true }),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["temple", "harbor", "metro"])
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("88 SetIntersectionRule no match compares missing mapRule default against non-overlapping explicit values", () => {
    let rule = setIntersectionRule("mapRule", 2);
    rule.defaultValue = ["temple", "harbor"];
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["wrong-a"], { omitMapRule: true, noiseMaps: ["metro", "forest"] }),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["metro", "forest"], { noiseMaps: ["temple", "harbor"] })
    ]);

    assert.equal(candidates.length, 0);
});

test("89 SetIntersectionRule partial match builds separate candidates for separate map clusters", () => {
    let settings = createQueueSettings({ matchSize: { min: 2, max: 2 }, rules: [setIntersectionRule("mapRule", 2)] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["temple", "harbor"]),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["temple", "harbor", "metro"]),
        complexSetIntersectionSoloTicket("ticketC", "userC", ["desert", "forest"]),
        complexSetIntersectionSoloTicket("ticketD", "userD", ["desert", "forest", "ice"])
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertCandidateWithTickets(candidates, ["ticketC", "ticketD"]);
});

test("90 SetIntersectionRule party match uses first member mapRule and ignores second member mismatch", () => {
    let settings = createQueueSettings({ matchSize: { min: 3, max: 3 }, rules: [setIntersectionRule("mapRule", 2)] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionPartyTicket("ticketA", [
            { userId: "userA1", mapRuleValues: ["temple", "harbor"] },
            { userId: "userA2", mapRuleValues: ["wrong-a", "wrong-b"] }
        ]),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["temple", "harbor", "metro"])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertCandidateBasics(candidate, ["ticketA", "ticketB"], ["userA1", "userA2", "userB"]);
});

test("91 SetIntersectionRule no match rejects party when first member mapRule lacks overlap", () => {
    let settings = createQueueSettings({ matchSize: { min: 3, max: 3 }, rules: [setIntersectionRule("mapRule", 2)] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionPartyTicket("ticketA", [
            { userId: "userA1", mapRuleValues: ["wrong-a", "wrong-b"] },
            { userId: "userA2", mapRuleValues: ["temple", "harbor"] }
        ]),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["temple", "harbor", "metro"])
    ]);

    assert.equal(candidates.length, 0);
});

test("92 SetIntersectionRule partial match keeps party-solo overlap and excludes low-overlap solo", () => {
    let settings = createQueueSettings({ matchSize: { min: 3, max: 3 }, rules: [setIntersectionRule("mapRule", 2)] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionPartyTicket("ticketA", [
            { userId: "userA1", mapRuleValues: ["temple", "harbor"] },
            { userId: "userA2", mapRuleValues: ["temple"] }
        ]),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["temple", "harbor", "metro"]),
        complexSetIntersectionSoloTicket("ticketC", "userC", ["temple", "desert"])
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketC"]);
});

test("93 SetIntersectionRule linear expansion full match reduces minimum enough", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = setIntersectionRule("mapRule", 3);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 1
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["temple", "harbor", "metro"], {}, oldTimestamp),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["metro", "forest"], {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("94 SetIntersectionRule linear expansion no match when minimum is still too high", () => {
    let oldTimestamp = Date.now() - 10_000;
    let rule = setIntersectionRule("mapRule", 4);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 1
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["temple", "harbor", "metro"], {}, oldTimestamp),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["metro", "forest"], {}, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("95 SetIntersectionRule linear expansion full match allows zero required overlap", () => {
    let oldTimestamp = Date.now() - 50_000;
    let rule = setIntersectionRule("mapRule", 2);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 1
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["temple"], {}, oldTimestamp),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["desert"], {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("96 SetIntersectionRule custom expansion full match accepts override minimum", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = setIntersectionRule("mapRule", 4);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: [3, 2, 1]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["temple", "harbor"], {}, oldTimestamp),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["harbor", "forest"], {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("97 SetIntersectionRule custom expansion no match when override minimum remains too high", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = setIntersectionRule("mapRule", 4);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: [4, 3, 2]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["temple", "harbor"], {}, oldTimestamp),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["harbor", "forest"], {}, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("98 SetIntersectionRule custom expansion full match uses last override after index overflow", () => {
    let oldTimestamp = Date.now() - 60_000;
    let rule = setIntersectionRule("mapRule", 4);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: [3, 1]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["temple", "harbor"], {}, oldTimestamp),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["harbor", "forest"], {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("99 SetIntersectionRule optional timeout full match ignores missing overlap", () => {
    let oldTimestamp = Date.now() - 2_000;
    let rule = setIntersectionRule("mapRule", 2);
    rule.advancedSettings = {
        secondsUntilOptional: 1,
        expansionType: RuleExpansionType.None
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["temple"], {}, oldTimestamp),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["desert"], {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("100 SetIntersectionRule partial match enforces matchSize max with several compatible tickets", () => {
    let settings = createQueueSettings({ matchSize: { min: 2, max: 2 }, rules: [setIntersectionRule("mapRule", 1)] });
    let candidates = runMatchmaking(settings, [
        complexSetIntersectionSoloTicket("ticketA", "userA", ["temple", "harbor"]),
        complexSetIntersectionSoloTicket("ticketB", "userB", ["temple", "metro"]),
        complexSetIntersectionSoloTicket("ticketC", "userC", ["temple", "forest"]),
        complexSetIntersectionSoloTicket("ticketD", "userD", ["temple", "desert"])
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertEveryCandidateWithinMatchSize(candidates, 2);
});

type ComplexMatchTotalMemberOptions = {
    omitMatchScoreRule?: boolean;
    noiseScore?: number;
    rawScore?: number;
    extraAttributeForQueue?: { [k: string]: DataValueType };
};

type ComplexMatchTotalPartyMemberInput = {
    userId: string;
    matchScoreRule: number;
    options?: ComplexMatchTotalMemberOptions;
};

function complexMatchTotalMember(userId: string, matchScoreRuleValue: number, options: ComplexMatchTotalMemberOptions = {}): TicketMemberInput {
    let attributeForQueue: { [k: string]: DataValueType } = {
        modeRule: "ranked-duo:sg",
        skillRule: 1540,
        regionRule: {
            region: "sg",
            ping: 42,
            jitter: 5
        },
        mapRule: ["temple", "harbor", "metro"],
        teamSkillRule: 1540,
        unrelatedMatchScore: options.noiseScore ?? 9999,
        score: options.noiseScore ?? 8888
    };

    if (!options.omitMatchScoreRule) {
        attributeForQueue.matchScoreRule = matchScoreRuleValue;
    }

    if (options.extraAttributeForQueue != null) {
        Object.assign(attributeForQueue, options.extraAttributeForQueue);
    }

    return {
        userId: userId,
        attribute: {
            profile: {
                rank: {
                    tier: "platinum",
                    division: 1,
                    mmr: 1540
                },
                economy: {
                    spendTier: "mid",
                    winStreak: 3
                }
            },
            matchmaking: {
                mode: "ranked-duo",
                skill: 1540,
                score: options.rawScore ?? matchScoreRuleValue,
                scoreBreakdown: {
                    combat: matchScoreRuleValue,
                    objective: 2,
                    noiseScore: options.noiseScore ?? 9999
                },
                maps: ["temple", "harbor", "metro"]
            },
            noise: {
                matchScoreRule: options.noiseScore ?? 9999,
                score: options.noiseScore ?? 8888,
                nestedScore: {
                    value: options.noiseScore ?? 7777
                }
            }
        },
        attributeForQueue: attributeForQueue
    };
}

function complexMatchTotalSoloTicket(ticketId: string, userId: string, matchScoreRuleValue: number, options: ComplexMatchTotalMemberOptions = {}, tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, [complexMatchTotalMember(userId, matchScoreRuleValue, options)], tsCreate);
}

function complexMatchTotalPartyTicket(ticketId: string, members: ComplexMatchTotalPartyMemberInput[], tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, members.map(member => complexMatchTotalMember(member.userId, member.matchScoreRule, member.options)), tsCreate);
}

test("101 MatchTotalRule full match uses matchScoreRule instead of noisy score fields", () => {
    let settings = createQueueSettings({ rules: [matchTotalRule("matchScoreRule", 10, 12)] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 5, { noiseScore: 1000, rawScore: 500 }),
        complexMatchTotalSoloTicket("ticketB", "userB", 6, { noiseScore: 2000, rawScore: 600 })
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertCandidateBasics(candidate, ["ticketA", "ticketB"], ["userA", "userB"]);
    assert.equal(candidate.matchmakingTicketTeams[0].members[0].attributeForQueue.unrelatedMatchScore, 1000);
});

test("102 MatchTotalRule full match accepts total exactly at min", () => {
    let settings = createQueueSettings({ rules: [matchTotalRule("matchScoreRule", 11, 20)] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 5),
        complexMatchTotalSoloTicket("ticketB", "userB", 6)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("103 MatchTotalRule full match accepts total exactly at max", () => {
    let settings = createQueueSettings({ rules: [matchTotalRule("matchScoreRule", 0, 11)] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 5),
        complexMatchTotalSoloTicket("ticketB", "userB", 6)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("104 MatchTotalRule no match rejects total below min despite matching noisy score fields", () => {
    let settings = createQueueSettings({ rules: [matchTotalRule("matchScoreRule", 10, 12)] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 2, { noiseScore: 5, rawScore: 5 }),
        complexMatchTotalSoloTicket("ticketB", "userB", 3, { noiseScore: 6, rawScore: 6 })
    ]);

    assert.equal(candidates.length, 0);
});

test("105 MatchTotalRule no match rejects total above max", () => {
    let settings = createQueueSettings({ rules: [matchTotalRule("matchScoreRule", 0, 12)] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 8),
        complexMatchTotalSoloTicket("ticketB", "userB", 7)
    ]);

    assert.equal(candidates.length, 0);
});

test("106 MatchTotalRule partial match keeps valid score subset and excludes high-score ticket", () => {
    let settings = createQueueSettings({ matchSize: { min: 2, max: 2 }, rules: [matchTotalRule("matchScoreRule", 10, 12)] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 5),
        complexMatchTotalSoloTicket("ticketB", "userB", 6),
        complexMatchTotalSoloTicket("ticketC", "userC", 8)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketC"]);
    assertNoCandidateContainingAll(candidates, ["ticketB", "ticketC"]);
});

test("107 MatchTotalRule partial match enforces matchSize max with several compatible tickets", () => {
    let settings = createQueueSettings({ matchSize: { min: 2, max: 2 }, rules: [matchTotalRule("matchScoreRule", 10, 10)] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 5),
        complexMatchTotalSoloTicket("ticketB", "userB", 5),
        complexMatchTotalSoloTicket("ticketC", "userC", 5),
        complexMatchTotalSoloTicket("ticketD", "userD", 5)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertEveryCandidateWithinMatchSize(candidates, 2);
});

test("108 MatchTotalRule no match rejects when every possible pair is below min", () => {
    let settings = createQueueSettings({ matchSize: { min: 2, max: 2 }, rules: [matchTotalRule("matchScoreRule", 12, 20)] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 5),
        complexMatchTotalSoloTicket("ticketB", "userB", 5),
        complexMatchTotalSoloTicket("ticketC", "userC", 5)
    ]);

    assert.equal(candidates.length, 0);
});

test("109 MatchTotalRule full match sums every member in a party ticket", () => {
    let settings = createQueueSettings({ matchSize: { min: 3, max: 3 }, rules: [matchTotalRule("matchScoreRule", 17, 17)] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalPartyTicket("ticketA", [
            { userId: "userA1", matchScoreRule: 5 },
            { userId: "userA2", matchScoreRule: 6 }
        ]),
        complexMatchTotalSoloTicket("ticketB", "userB", 6)
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertCandidateBasics(candidate, ["ticketA", "ticketB"], ["userA1", "userA2", "userB"]);
});

test("110 MatchTotalRule no match rejects party aggregate above max", () => {
    let settings = createQueueSettings({ matchSize: { min: 3, max: 3 }, rules: [matchTotalRule("matchScoreRule", 0, 17)] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalPartyTicket("ticketA", [
            { userId: "userA1", matchScoreRule: 5 },
            { userId: "userA2", matchScoreRule: 6 }
        ]),
        complexMatchTotalSoloTicket("ticketB", "userB", 10)
    ]);

    assert.equal(candidates.length, 0);
});

test("111 MatchTotalRule full match treats missing matchScoreRule as zero contribution", () => {
    let settings = createQueueSettings({ rules: [matchTotalRule("matchScoreRule", 5, 5)] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 5),
        complexMatchTotalSoloTicket("ticketB", "userB", 999, { omitMatchScoreRule: true, noiseScore: 9999 })
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("112 MatchTotalRule no match rejects when missing matchScoreRule drops total below min", () => {
    let settings = createQueueSettings({ rules: [matchTotalRule("matchScoreRule", 6, 6)] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 5),
        complexMatchTotalSoloTicket("ticketB", "userB", 999, { omitMatchScoreRule: true, noiseScore: 9999 })
    ]);

    assert.equal(candidates.length, 0);
});

test("113 MatchTotalRule full match sums members across explicit teams", () => {
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [matchTotalRule("matchScoreRule", 11, 11)]
    });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 5),
        complexMatchTotalSoloTicket("ticketB", "userB", 6)
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assert.deepEqual(sortTeamsById(candidate.matchmakingTicketTeams.map(team => ({ teamId: team.teamId, memberIds: team.members.map(member => member.userId) }))), [
        { teamId: "blue", memberIds: ["userB"] },
        { teamId: "red", memberIds: ["userA"] }
    ]);
});

test("114 MatchTotalRule custom overrideMin full match lowers minimum enough", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = matchTotalRule("matchScoreRule", 12, 20);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideMin: [12, 10, 8]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 4, {}, oldTimestamp),
        complexMatchTotalSoloTicket("ticketB", "userB", 5, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("115 MatchTotalRule custom overrideMin no match when minimum remains too high", () => {
    let oldTimestamp = Date.now() - 10_000;
    let rule = matchTotalRule("matchScoreRule", 12, 20);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideMin: [12, 10, 8]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 4, {}, oldTimestamp),
        complexMatchTotalSoloTicket("ticketB", "userB", 5, {}, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("116 MatchTotalRule custom overrideMax full match raises maximum enough", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = matchTotalRule("matchScoreRule", 0, 10);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideMax: [10, 12, 15]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 7, {}, oldTimestamp),
        complexMatchTotalSoloTicket("ticketB", "userB", 7, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("117 MatchTotalRule custom overrideMax no match when maximum remains too low", () => {
    let oldTimestamp = Date.now() - 10_000;
    let rule = matchTotalRule("matchScoreRule", 0, 10);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideMax: [10, 12, 15]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 7, {}, oldTimestamp),
        complexMatchTotalSoloTicket("ticketB", "userB", 7, {}, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("118 MatchTotalRule custom expansion full match uses last min and max overrides after index overflow", () => {
    let oldTimestamp = Date.now() - 60_000;
    let rule = matchTotalRule("matchScoreRule", 30, 40);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideMin: [25, 12],
            overrideMax: [26, 14]
        }
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 6, {}, oldTimestamp),
        complexMatchTotalSoloTicket("ticketB", "userB", 7, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("119 MatchTotalRule optional timeout full match ignores out-of-range total", () => {
    let oldTimestamp = Date.now() - 2_000;
    let rule = matchTotalRule("matchScoreRule", 10, 12);
    rule.advancedSettings = {
        secondsUntilOptional: 1,
        expansionType: RuleExpansionType.None
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 100, {}, oldTimestamp),
        complexMatchTotalSoloTicket("ticketB", "userB", 100, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("120 MatchTotalRule optional timeout no match before rule becomes optional", () => {
    let recentTimestamp = Date.now();
    let rule = matchTotalRule("matchScoreRule", 10, 12);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.None
    };
    let settings = createQueueSettings({ rules: [rule] });
    let candidates = runMatchmaking(settings, [
        complexMatchTotalSoloTicket("ticketA", "userA", 100, {}, recentTimestamp),
        complexMatchTotalSoloTicket("ticketB", "userB", 100, {}, recentTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

type ComplexTeamSizeBalanceMemberOptions = {
    noiseScore?: number;
    role?: string;
    extraAttributeForQueue?: { [k: string]: DataValueType };
};

function complexTeamSizeBalanceMember(userId: string, options: ComplexTeamSizeBalanceMemberOptions = {}): TicketMemberInput {
    let attributeForQueue: { [k: string]: DataValueType } = {
        modeRule: "ranked-team:sg",
        skillRule: 1600,
        regionRule: {
            region: "sg",
            ping: 38,
            jitter: 4
        },
        mapRule: ["temple", "harbor", "metro"],
        teamSkillRule: 1600,
        matchScoreRule: 6,
        unrelatedTeamSize: options.noiseScore ?? 9999,
        preferredRole: options.role ?? "flex"
    };

    if (options.extraAttributeForQueue != null) {
        Object.assign(attributeForQueue, options.extraAttributeForQueue);
    }

    return {
        userId: userId,
        attribute: {
            profile: {
                rank: {
                    tier: "diamond",
                    division: 3,
                    mmr: 1600
                },
                party: {
                    preferredRole: options.role ?? "flex",
                    declaredSizeNoise: options.noiseScore ?? 9999
                }
            },
            matchmaking: {
                mode: "ranked-team",
                region: "sg",
                teamContext: {
                    requestedRole: options.role ?? "flex",
                    unrelatedTeamSize: options.noiseScore ?? 9999
                }
            },
            noise: {
                teamSizeBalance: options.noiseScore ?? 9999,
                members: [options.noiseScore ?? 9999, 1, 2]
            }
        },
        attributeForQueue: attributeForQueue
    };
}

function complexTeamSizeBalanceSoloTicket(ticketId: string, userId: string, options: ComplexTeamSizeBalanceMemberOptions = {}, tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, [complexTeamSizeBalanceMember(userId, options)], tsCreate);
}

function complexTeamSizeBalancePartyTicket(ticketId: string, userIds: string[], tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, userIds.map((userId, index) => complexTeamSizeBalanceMember(userId, { role: index % 2 == 0 ? "anchor" : "support" })), tsCreate);
}

function assertTeamMemberCounts(candidate: MatchmakingTicketCanMatch, expectedCounts: { teamId: string; memberCount: number }[]): void {
    assert.deepEqual(sortTeamsById(candidate.matchmakingTicketTeams.map(team => ({ teamId: team.teamId, memberCount: team.members.length }))), expectedCounts);
}

test("121 TeamSizeBalanceRule full match accepts two teams with equal member counts", () => {
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamSizeBalanceRule(0)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalanceSoloTicket("ticketA", "userA", { noiseScore: 1000 }),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB", { noiseScore: 2000 })
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertTeamMemberCounts(candidate, [
        { teamId: "blue", memberCount: 1 },
        { teamId: "red", memberCount: 1 }
    ]);
});

test("122 TeamSizeBalanceRule full match accepts two-team spread exactly at allowed difference", () => {
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamSizeBalanceRule(1)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2"]),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB")
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertTeamMemberCounts(candidate, [
        { teamId: "blue", memberCount: 1 },
        { teamId: "red", memberCount: 2 }
    ]);
});

test("123 TeamSizeBalanceRule no match rejects two-team spread above allowed difference", () => {
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamSizeBalanceRule(0)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2"]),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB")
    ]);

    assert.equal(candidates.length, 0);
});

test("124 TeamSizeBalanceRule partial match keeps balanced subset when matchSize max blocks extra solo", () => {
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ],
        rules: [teamSizeBalanceRule(0)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2"]),
        complexTeamSizeBalancePartyTicket("ticketB", ["userB1", "userB2"]),
        complexTeamSizeBalanceSoloTicket("ticketC", "userC")
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertTeamMemberCounts(candidate, [
        { teamId: "blue", memberCount: 2 },
        { teamId: "red", memberCount: 2 }
    ]);
});

test("125 TeamSizeBalanceRule full match accepts three teams with equal member counts", () => {
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } },
            { teamId: "green", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamSizeBalanceRule(0)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalanceSoloTicket("ticketA", "userA"),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB"),
        complexTeamSizeBalanceSoloTicket("ticketC", "userC")
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertTeamMemberCounts(candidate, [
        { teamId: "blue", memberCount: 1 },
        { teamId: "green", memberCount: 1 },
        { teamId: "red", memberCount: 1 }
    ]);
});

test("126 TeamSizeBalanceRule full match accepts three-team spread exactly at allowed difference", () => {
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } },
            { teamId: "green", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamSizeBalanceRule(1)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2"]),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB"),
        complexTeamSizeBalanceSoloTicket("ticketC", "userC")
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertTeamMemberCounts(candidate, [
        { teamId: "blue", memberCount: 1 },
        { teamId: "green", memberCount: 1 },
        { teamId: "red", memberCount: 2 }
    ]);
});

test("127 TeamSizeBalanceRule no match rejects three-team spread above allowed difference", () => {
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } },
            { teamId: "green", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamSizeBalanceRule(0)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2"]),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB"),
        complexTeamSizeBalanceSoloTicket("ticketC", "userC")
    ]);

    assert.equal(candidates.length, 0);
});

test("128 TeamSizeBalanceRule partial match fills three balanced teams and excludes extra solo", () => {
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } },
            { teamId: "green", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamSizeBalanceRule(0)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalanceSoloTicket("ticketA", "userA"),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB"),
        complexTeamSizeBalanceSoloTicket("ticketC", "userC"),
        complexTeamSizeBalanceSoloTicket("ticketD", "userD")
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketB", "ticketC", "ticketD"]);
    assertEveryCandidateWithinMatchSize(candidates, 3);
});

test("129 TeamSizeBalanceRule full match accepts equal party sizes across two teams", () => {
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ],
        rules: [teamSizeBalanceRule(0)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2"]),
        complexTeamSizeBalancePartyTicket("ticketB", ["userB1", "userB2"])
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("130 TeamSizeBalanceRule no match rejects party size two against solo when difference is zero", () => {
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamSizeBalanceRule(0)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2"]),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB")
    ]);

    assert.equal(candidates.length, 0);
});

test("131 TeamSizeBalanceRule full match accepts party size two against solo when difference is one", () => {
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamSizeBalanceRule(1)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2"]),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB")
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("132 TeamSizeBalanceRule partial match limits many solos to balanced two-team match", () => {
    let settings = createQueueSettings({
        matchSize: { min: 2, max: 2 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamSizeBalanceRule(0)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalanceSoloTicket("ticketA", "userA"),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB"),
        complexTeamSizeBalanceSoloTicket("ticketC", "userC"),
        complexTeamSizeBalanceSoloTicket("ticketD", "userD")
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertEveryCandidateWithinMatchSize(candidates, 2);
});

test("133 TeamSizeBalanceRule no match rejects when one team is below teamSize min", () => {
    let settings = createQueueSettings({
        matchSize: { min: 2, max: 2 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ],
        rules: [teamSizeBalanceRule(1)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalanceSoloTicket("ticketA", "userA"),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB")
    ]);

    assert.equal(candidates.length, 0);
});

test("134 TeamSizeBalanceRule no match rejects ticket larger than every team max", () => {
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamSizeBalanceRule(0)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2"]),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB")
    ]);

    assert.equal(candidates.length, 0);
});

test("135 TeamSizeBalanceRule linear expansion full match raises allowed difference enough", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = teamSizeBalanceRule(0);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 1,
            limit: 1
        }
    };
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2"], oldTimestamp),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB", {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("136 TeamSizeBalanceRule linear expansion no match when elapsed time is not enough", () => {
    let oldTimestamp = Date.now() - 5_000;
    let rule = teamSizeBalanceRule(0);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 1,
            limit: 1
        }
    };
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2"], oldTimestamp),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB", {}, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("137 TeamSizeBalanceRule linear expansion no match when limit is still too small", () => {
    let oldTimestamp = Date.now() - 40_000;
    let rule = teamSizeBalanceRule(0);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 1,
            limit: 1
        }
    };
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 3 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2", "userA3"], oldTimestamp),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB", {}, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("138 TeamSizeBalanceRule custom expansion full match accepts override difference", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = teamSizeBalanceRule(0);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: [0, 1, 2]
        }
    };
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 3 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2", "userA3"], oldTimestamp),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB", {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("139 TeamSizeBalanceRule custom expansion no match when override difference remains too small", () => {
    let oldTimestamp = Date.now() - 10_000;
    let rule = teamSizeBalanceRule(0);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: [0, 1, 2]
        }
    };
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 3 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2", "userA3"], oldTimestamp),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB", {}, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("140 TeamSizeBalanceRule optional timeout full match ignores unbalanced team sizes", () => {
    let oldTimestamp = Date.now() - 2_000;
    let rule = teamSizeBalanceRule(0);
    rule.advancedSettings = {
        secondsUntilOptional: 1,
        expansionType: RuleExpansionType.None
    };
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 3 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamSizeBalancePartyTicket("ticketA", ["userA1", "userA2", "userA3"], oldTimestamp),
        complexTeamSizeBalanceSoloTicket("ticketB", "userB", {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

type ComplexTeamDifferenceMemberOptions = {
    omitTeamSkillRule?: boolean;
    noiseSkill?: number;
    rawSkill?: number;
    extraAttributeForQueue?: { [k: string]: DataValueType };
};

type ComplexTeamDifferencePartyMemberInput = {
    userId: string;
    teamSkillRule: number;
    options?: ComplexTeamDifferenceMemberOptions;
};

function complexTeamDifferenceMember(userId: string, teamSkillRuleValue: number, options: ComplexTeamDifferenceMemberOptions = {}): TicketMemberInput {
    let attributeForQueue: { [k: string]: DataValueType } = {
        modeRule: "ranked-team:sg",
        skillRule: 1600,
        regionRule: {
            region: "sg",
            ping: 36,
            jitter: 3
        },
        mapRule: ["temple", "harbor", "metro"],
        matchScoreRule: 6,
        unrelatedTeamSkill: options.noiseSkill ?? 9999,
        skill: options.noiseSkill ?? 8888
    };

    if (!options.omitTeamSkillRule) {
        attributeForQueue.teamSkillRule = teamSkillRuleValue;
    }

    if (options.extraAttributeForQueue != null) {
        Object.assign(attributeForQueue, options.extraAttributeForQueue);
    }

    return {
        userId: userId,
        attribute: {
            profile: {
                rank: {
                    tier: "master",
                    division: 2,
                    mmr: options.rawSkill ?? teamSkillRuleValue
                },
                performance: {
                    recentSkill: options.rawSkill ?? teamSkillRuleValue,
                    noisyTeamSkill: options.noiseSkill ?? 9999
                }
            },
            matchmaking: {
                team: {
                    score: options.rawSkill ?? teamSkillRuleValue,
                    contribution: teamSkillRuleValue,
                    noisyTeamSkill: options.noiseSkill ?? 9999
                },
                mode: "ranked-team",
                maps: ["temple", "harbor", "metro"]
            },
            noise: {
                teamSkillRule: options.noiseSkill ?? 9999,
                skill: options.noiseSkill ?? 8888,
                scoreBuckets: [options.noiseSkill ?? 9999, teamSkillRuleValue]
            }
        },
        attributeForQueue: attributeForQueue
    };
}

function complexTeamDifferenceSoloTicket(ticketId: string, userId: string, teamSkillRuleValue: number, options: ComplexTeamDifferenceMemberOptions = {}, tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, [complexTeamDifferenceMember(userId, teamSkillRuleValue, options)], tsCreate);
}

function complexTeamDifferencePartyTicket(ticketId: string, members: ComplexTeamDifferencePartyMemberInput[], tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, members.map(member => complexTeamDifferenceMember(member.userId, member.teamSkillRule, member.options)), tsCreate);
}

function assertTeamScores(candidate: MatchmakingTicketCanMatch, ruleName: string, expectedScores: { teamId: string; score: number }[], defaultValue = 0): void {
    assert.deepEqual(sortTeamsById(candidate.matchmakingTicketTeams.map(team => ({ teamId: team.teamId, score: team.members.reduce((total, member) => total + ((member.attributeForQueue[ruleName] as number) ?? defaultValue), 0) }))), expectedScores);
}

test("141 TeamDifferenceRule full match accepts equal scores across two teams", () => {
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamDifferenceRule("teamSkillRule", 0)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100, { noiseSkill: 1000, rawSkill: 500 }),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 100, { noiseSkill: 2000, rawSkill: 600 })
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertTeamScores(candidate, "teamSkillRule", [
        { teamId: "blue", score: 100 },
        { teamId: "red", score: 100 }
    ]);
});

test("142 TeamDifferenceRule full match accepts score spread exactly at allowed difference", () => {
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamDifferenceRule("teamSkillRule", 5)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 105)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("143 TeamDifferenceRule no match rejects score spread above allowed difference", () => {
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamDifferenceRule("teamSkillRule", 4)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 105)
    ]);

    assert.equal(candidates.length, 0);
});

test("144 TeamDifferenceRule partial match keeps valid pair and excludes high-score ticket", () => {
    let settings = createQueueSettings({
        matchSize: { min: 2, max: 2 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamDifferenceRule("teamSkillRule", 5)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 104),
        complexTeamDifferenceSoloTicket("ticketC", "userC", 120)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateWithTicket(candidates, "ticketC");
});

test("145 TeamDifferenceRule full match accepts equal scores across three teams", () => {
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } },
            { teamId: "green", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamDifferenceRule("teamSkillRule", 0)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 100),
        complexTeamDifferenceSoloTicket("ticketC", "userC", 100)
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertTeamScores(candidate, "teamSkillRule", [
        { teamId: "blue", score: 100 },
        { teamId: "green", score: 100 },
        { teamId: "red", score: 100 }
    ]);
});

test("146 TeamDifferenceRule full match accepts three-team max-min spread exactly at allowed difference", () => {
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } },
            { teamId: "green", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamDifferenceRule("teamSkillRule", 5)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 104),
        complexTeamDifferenceSoloTicket("ticketC", "userC", 105)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
});

test("147 TeamDifferenceRule no match rejects three-team max-min spread above allowed difference", () => {
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } },
            { teamId: "green", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamDifferenceRule("teamSkillRule", 5)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 104),
        complexTeamDifferenceSoloTicket("ticketC", "userC", 106)
    ]);

    assert.equal(candidates.length, 0);
});

test("148 TeamDifferenceRule partial match keeps valid three-team subset and excludes outlier", () => {
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } },
            { teamId: "green", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamDifferenceRule("teamSkillRule", 4)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 102),
        complexTeamDifferenceSoloTicket("ticketC", "userC", 104),
        complexTeamDifferenceSoloTicket("ticketD", "userD", 130)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertNoCandidateWithTicket(candidates, "ticketD");
});

test("149 TeamDifferenceRule full match sums every party member for team score", () => {
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ],
        rules: [teamDifferenceRule("teamSkillRule", 0)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferencePartyTicket("ticketA", [
            { userId: "userA1", teamSkillRule: 50 },
            { userId: "userA2", teamSkillRule: 55 }
        ]),
        complexTeamDifferencePartyTicket("ticketB", [
            { userId: "userB1", teamSkillRule: 52 },
            { userId: "userB2", teamSkillRule: 53 }
        ])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertTeamScores(candidate, "teamSkillRule", [
        { teamId: "blue", score: 105 },
        { teamId: "red", score: 105 }
    ]);
});

test("150 TeamDifferenceRule no match rejects party aggregate above allowed spread", () => {
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ],
        rules: [teamDifferenceRule("teamSkillRule", 10)]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferencePartyTicket("ticketA", [
            { userId: "userA1", teamSkillRule: 50 },
            { userId: "userA2", teamSkillRule: 55 }
        ]),
        complexTeamDifferencePartyTicket("ticketB", [
            { userId: "userB1", teamSkillRule: 60 },
            { userId: "userB2", teamSkillRule: 65 }
        ])
    ]);

    assert.equal(candidates.length, 0);
});

test("151 TeamDifferenceRule full match uses defaultValue for missing teamSkillRule", () => {
    let rule = teamDifferenceRule("teamSkillRule", 0);
    rule.defaultValue = 10;
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 999, { omitTeamSkillRule: true, noiseSkill: 9999 }),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 10)
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertTeamScores(candidate, "teamSkillRule", [
        { teamId: "blue", score: 10 },
        { teamId: "red", score: 10 }
    ], 10);
});

test("152 TeamDifferenceRule no match rejects when missing teamSkillRule default makes spread too large", () => {
    let rule = teamDifferenceRule("teamSkillRule", 5);
    rule.defaultValue = 0;
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 999, { omitTeamSkillRule: true, noiseSkill: 9999 }),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 10)
    ]);

    assert.equal(candidates.length, 0);
});

test("153 TeamDifferenceRule partial match keeps defaulted ticket pair and excludes high-score ticket", () => {
    let rule = teamDifferenceRule("teamSkillRule", 0);
    rule.defaultValue = 10;
    let settings = createQueueSettings({
        matchSize: { min: 2, max: 2 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 999, { omitTeamSkillRule: true }),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 10),
        complexTeamDifferenceSoloTicket("ticketC", "userC", 30)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateWithTicket(candidates, "ticketC");
});

test("154 TeamDifferenceRule linear expansion full match raises allowed spread enough", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = teamDifferenceRule("teamSkillRule", 0);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 3,
            limit: 6
        }
    };
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100, {}, oldTimestamp),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 105, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("155 TeamDifferenceRule linear expansion no match when elapsed time is not enough", () => {
    let oldTimestamp = Date.now() - 10_000;
    let rule = teamDifferenceRule("teamSkillRule", 0);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 3,
            limit: 6
        }
    };
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100, {}, oldTimestamp),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 105, {}, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("156 TeamDifferenceRule linear expansion no match when limit remains too low", () => {
    let oldTimestamp = Date.now() - 40_000;
    let rule = teamDifferenceRule("teamSkillRule", 0);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 3,
            limit: 4
        }
    };
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100, {}, oldTimestamp),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 105, {}, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("157 TeamDifferenceRule custom expansion full match accepts override spread", () => {
    let oldTimestamp = Date.now() - 20_000;
    let rule = teamDifferenceRule("teamSkillRule", 0);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: [0, 3, 5]
        }
    };
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100, {}, oldTimestamp),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 105, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("158 TeamDifferenceRule custom expansion no match when override spread remains too small", () => {
    let oldTimestamp = Date.now() - 10_000;
    let rule = teamDifferenceRule("teamSkillRule", 0);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: [0, 3, 5]
        }
    };
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100, {}, oldTimestamp),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 105, {}, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("159 TeamDifferenceRule custom expansion full match uses last override after index overflow", () => {
    let oldTimestamp = Date.now() - 60_000;
    let rule = teamDifferenceRule("teamSkillRule", 0);
    rule.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: [1, 5]
        }
    };
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100, {}, oldTimestamp),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 105, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("160 TeamDifferenceRule optional timeout full match ignores unbalanced team scores", () => {
    let oldTimestamp = Date.now() - 2_000;
    let rule = teamDifferenceRule("teamSkillRule", 0);
    rule.advancedSettings = {
        secondsUntilOptional: 1,
        expansionType: RuleExpansionType.None
    };
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamDifferenceSoloTicket("ticketA", "userA", 100, {}, oldTimestamp),
        complexTeamDifferenceSoloTicket("ticketB", "userB", 200, {}, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

type ComplexTeamTicketSizeSimilarityMemberOptions = {
    role?: string;
    noiseTicketSize?: number;
    extraAttributeForQueue?: { [k: string]: DataValueType };
};

function complexTeamTicketSizeSimilarityMember(userId: string, memberIndex: number, options: ComplexTeamTicketSizeSimilarityMemberOptions = {}): TicketMemberInput {
    let attributeForQueue: { [k: string]: DataValueType } = {
        modeRule: "ranked-team:sg",
        skillRule: 1600 + memberIndex,
        regionRule: {
            region: "sg",
            ping: 35 + memberIndex,
            jitter: 3
        },
        mapRule: ["temple", "harbor", "metro"],
        teamSkillRule: 1600 + memberIndex,
        matchScoreRule: 6 + memberIndex,
        preferredRole: options.role ?? "flex",
        unrelatedTicketSize: options.noiseTicketSize ?? 9999
    };

    if (options.extraAttributeForQueue != null) {
        Object.assign(attributeForQueue, options.extraAttributeForQueue);
    }

    return {
        userId: userId,
        attribute: {
            profile: {
                rank: {
                    tier: "diamond",
                    division: memberIndex + 1,
                    mmr: 1600 + memberIndex
                },
                party: {
                    role: options.role ?? "flex",
                    declaredTicketSizeNoise: options.noiseTicketSize ?? 9999
                }
            },
            matchmaking: {
                party: {
                    memberIndex: memberIndex,
                    unrelatedTicketSize: options.noiseTicketSize ?? 9999
                },
                preferences: {
                    maps: ["temple", "harbor", "metro"],
                    roles: [options.role ?? "flex", "backup"]
                }
            },
            noise: {
                teamTicketSizeSimilarity: options.noiseTicketSize ?? 9999,
                ticketSize: options.noiseTicketSize ?? 8888
            }
        },
        attributeForQueue: attributeForQueue
    };
}

function complexTeamTicketSizeSimilarityTicket(ticketId: string, userIds: string[], tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, userIds.map((userId, index) => complexTeamTicketSizeSimilarityMember(userId, index, { role: index % 2 == 0 ? "anchor" : "support", noiseTicketSize: 9000 + index })), tsCreate);
}

function assertTeamTicketLayout(candidate: MatchmakingTicketCanMatch, expectedTeams: { teamId: string; ticketIds: string[] }[]): void {
    assert.deepEqual(sortTeamsById(candidate.matchmakingTicketTeams.map(team => ({ teamId: team.teamId, ticketIds: team.tickets.map(ticket => ticket.ticketId) }))), expectedTeams);
}

test("161 TeamTicketSizeSimilarityRule full match accepts solo versus solo", () => {
    let settings = createQueueSettings({
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB"])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertTeamTicketLayout(candidate, [
        { teamId: "blue", ticketIds: ["ticketB"] },
        { teamId: "red", ticketIds: ["ticketA"] }
    ]);
});

test("162 TeamTicketSizeSimilarityRule full match accepts party size two versus party size two", () => {
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA1", "userA2"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB1", "userB2"])
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("163 TeamTicketSizeSimilarityRule full match accepts party size three versus party size three", () => {
    let settings = createQueueSettings({
        matchSize: { min: 6, max: 6 },
        teams: [
            { teamId: "red", teamSize: { min: 3, max: 3 } },
            { teamId: "blue", teamSize: { min: 3, max: 3 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA1", "userA2", "userA3"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB1", "userB2", "userB3"])
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("164 TeamTicketSizeSimilarityRule no match rejects party size two versus solo", () => {
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA1", "userA2"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB"])
    ]);

    assert.equal(candidates.length, 0);
});

test("165 TeamTicketSizeSimilarityRule no match rejects party size three versus party size two", () => {
    let settings = createQueueSettings({
        matchSize: { min: 5, max: 5 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 3 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA1", "userA2", "userA3"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB1", "userB2"])
    ]);

    assert.equal(candidates.length, 0);
});

test("166 TeamTicketSizeSimilarityRule partial match keeps party size two pair and excludes solo", () => {
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA1", "userA2"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB1", "userB2"]),
        complexTeamTicketSizeSimilarityTicket("ticketC", ["userC"])
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateWithTicket(candidates, "ticketC");
});

test("167 TeamTicketSizeSimilarityRule partial match keeps solo pair and excludes party size two", () => {
    let settings = createQueueSettings({
        matchSize: { min: 2, max: 2 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB"]),
        complexTeamTicketSizeSimilarityTicket("ticketC", ["userC1", "userC2"])
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateWithTicket(candidates, "ticketC");
});

test("168 TeamTicketSizeSimilarityRule full match accepts multiple same-size tickets per team", () => {
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB"]),
        complexTeamTicketSizeSimilarityTicket("ticketC", ["userC"]),
        complexTeamTicketSizeSimilarityTicket("ticketD", ["userD"])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC", "ticketD"]);
    assertTeamTicketLayout(candidate, [
        { teamId: "blue", ticketIds: ["ticketB", "ticketC"] },
        { teamId: "red", ticketIds: ["ticketA", "ticketD"] }
    ]);
});

test("169 TeamTicketSizeSimilarityRule no match rejects equal total members with different ticket-size pattern", () => {
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA1", "userA2"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB"]),
        complexTeamTicketSizeSimilarityTicket("ticketC", ["userC"])
    ]);

    assert.equal(candidates.length, 0);
});

test("170 TeamTicketSizeSimilarityRule partial match enforces matchSize max with many same-size tickets", () => {
    let settings = createQueueSettings({
        matchSize: { min: 2, max: 2 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB"]),
        complexTeamTicketSizeSimilarityTicket("ticketC", ["userC"]),
        complexTeamTicketSizeSimilarityTicket("ticketD", ["userD"])
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertEveryCandidateWithinMatchSize(candidates, 2);
});

test("171 TeamTicketSizeSimilarityRule no match rejects valid ticket sizes when one team is below teamSize min", () => {
    let settings = createQueueSettings({
        matchSize: { min: 2, max: 2 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB"])
    ]);

    assert.equal(candidates.length, 0);
});

test("172 TeamTicketSizeSimilarityRule no match rejects valid ticket sizes when party exceeds every team max", () => {
    let settings = createQueueSettings({
        matchSize: { min: 4, max: 4 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 1 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA1", "userA2"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB1", "userB2"])
    ]);

    assert.equal(candidates.length, 0);
});

test("173 TeamTicketSizeSimilarityRule full match accepts three teams with same party size", () => {
    let settings = createQueueSettings({
        matchSize: { min: 6, max: 6 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } },
            { teamId: "green", teamSize: { min: 2, max: 2 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA1", "userA2"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB1", "userB2"]),
        complexTeamTicketSizeSimilarityTicket("ticketC", ["userC1", "userC2"])
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
});

test("174 TeamTicketSizeSimilarityRule no match rejects three teams when one party size differs", () => {
    let settings = createQueueSettings({
        matchSize: { min: 7, max: 7 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 3 } },
            { teamId: "blue", teamSize: { min: 2, max: 3 } },
            { teamId: "green", teamSize: { min: 2, max: 3 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA1", "userA2"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB1", "userB2"]),
        complexTeamTicketSizeSimilarityTicket("ticketC", ["userC1", "userC2", "userC3"])
    ]);

    assert.equal(candidates.length, 0);
});

test("175 TeamTicketSizeSimilarityRule no match rejects when third team cannot be filled by mismatched ticket size", () => {
    let settings = createQueueSettings({
        matchSize: { min: 5, max: 5 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 2 } },
            { teamId: "green", teamSize: { min: 1, max: 1 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA1", "userA2"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB1", "userB2"]),
        complexTeamTicketSizeSimilarityTicket("ticketC", ["userC"])
    ]);

    assert.equal(candidates.length, 0);
});

test("176 TeamTicketSizeSimilarityRule full match compares cross-team ticket against latest seed-team ticket size", () => {
    let settings = createQueueSettings({
        matchSize: { min: 7, max: 7 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 3 } },
            { teamId: "blue", teamSize: { min: 1, max: 4 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB"]),
        complexTeamTicketSizeSimilarityTicket("ticketC", ["userC"]),
        complexTeamTicketSizeSimilarityTicket("ticketD", ["userD1", "userD2"]),
        complexTeamTicketSizeSimilarityTicket("ticketE", ["userE1", "userE2"])
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC", "ticketD", "ticketE"]);
    assertTeamTicketLayout(candidate, [
        { teamId: "blue", ticketIds: ["ticketB", "ticketC", "ticketE"] },
        { teamId: "red", ticketIds: ["ticketA", "ticketD"] }
    ]);
});

test("177 TeamTicketSizeSimilarityRule no match rejects cross-team ticket that differs from latest seed-team ticket size", () => {
    let settings = createQueueSettings({
        matchSize: { min: 6, max: 6 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 3 } },
            { teamId: "blue", teamSize: { min: 1, max: 4 } }
        ],
        rules: [teamTicketSizeSimilarityRule()]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB"]),
        complexTeamTicketSizeSimilarityTicket("ticketC", ["userC"]),
        complexTeamTicketSizeSimilarityTicket("ticketD", ["userD1", "userD2"]),
        complexTeamTicketSizeSimilarityTicket("ticketE", ["userE"])
    ]);

    assert.equal(candidates.length, 0);
});

test("178 TeamTicketSizeSimilarityRule optional timeout full match ignores different party sizes", () => {
    let oldTimestamp = Date.now() - 2_000;
    let rule = teamTicketSizeSimilarityRule();
    rule.advancedSettings = {
        secondsUntilOptional: 1
    };
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA1", "userA2"], oldTimestamp),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB"], oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("179 TeamTicketSizeSimilarityRule optional timeout no match before rule becomes optional", () => {
    let rule = teamTicketSizeSimilarityRule();
    rule.advancedSettings = {
        secondsUntilOptional: 120
    };
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA1", "userA2"]),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB"])
    ]);

    assert.equal(candidates.length, 0);
});

test("180 TeamTicketSizeSimilarityRule optional timeout partial match enforces matchSize max", () => {
    let oldTimestamp = Date.now() - 2_000;
    let rule = teamTicketSizeSimilarityRule();
    rule.advancedSettings = {
        secondsUntilOptional: 1
    };
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: [rule]
    });
    let candidates = runMatchmaking(settings, [
        complexTeamTicketSizeSimilarityTicket("ticketA", ["userA1", "userA2"], oldTimestamp),
        complexTeamTicketSizeSimilarityTicket("ticketB", ["userB"], oldTimestamp),
        complexTeamTicketSizeSimilarityTicket("ticketC", ["userC"], oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertEveryCandidateWithinMatchSize(candidates, 3);
});

type ComplexFullRulesMemberOptions = {
    modeRule?: string;
    skillRule?: number;
    region?: string;
    ping?: number;
    mapRule?: string[];
    teamSkillRule?: number;
    matchScoreRule?: number;
    omitModeRule?: boolean;
    omitSkillRule?: boolean;
    omitMapRule?: boolean;
    omitTeamSkillRule?: boolean;
    noiseValue?: number;
    rawMode?: string;
    rawSkill?: number;
    rawMaps?: string[];
    extraAttributeForQueue?: { [k: string]: DataValueType };
};

type ComplexFullRulesMemberInput = {
    userId: string;
    options?: ComplexFullRulesMemberOptions;
};

type FullRuleSetOverrides = {
    modeRule?: StringRule;
    skillRule?: DifferenceRule;
    regionRule?: RegionSelectionRule;
    mapRule?: SetIntersectionRule;
    matchTotalRule?: MatchTotalRule;
    teamSizeBalanceRule?: TeamSizeBalanceRule;
    teamDifferenceRule?: TeamDifferenceRule;
    teamTicketSizeSimilarityRule?: TeamTicketSizeSimilarityRule;
};

function fullRegionRule(maxLatency: number): RegionSelectionRule {
    return {
        name: "regionRule",
        type: RuleType.RegionSelection,
        attributePath: "regionRule",
        max: maxLatency
    };
}

function fullRuleSet(overrides: FullRuleSetOverrides = {}): NonNullable<xMatchmakingQueueSettings["rules"]> {
    let defaultTeamDifferenceRule = teamDifferenceRule("teamSkillRule", 10);
    defaultTeamDifferenceRule.defaultValue = 50;

    return [
        overrides.modeRule ?? stringRule("modeRule"),
        overrides.skillRule ?? differenceRule("skillRule", 30),
        overrides.regionRule ?? fullRegionRule(80),
        overrides.mapRule ?? setIntersectionRule("mapRule", 2),
        overrides.matchTotalRule ?? matchTotalRule("matchScoreRule", 20, 30),
        overrides.teamSizeBalanceRule ?? teamSizeBalanceRule(0),
        overrides.teamDifferenceRule ?? defaultTeamDifferenceRule,
        overrides.teamTicketSizeSimilarityRule ?? teamTicketSizeSimilarityRule()
    ];
}

function complexFullRulesMember(userId: string, memberIndex: number, options: ComplexFullRulesMemberOptions = {}): TicketMemberInput {
    let modeRuleValue = options.modeRule ?? "ranked-full:sg";
    let skillRuleValue = options.skillRule ?? 1500;
    let regionValue = options.region ?? "sg";
    let pingValue = options.ping ?? 40;
    let mapRuleValue = options.mapRule ?? ["temple", "harbor", "metro"];
    let teamSkillRuleValue = options.teamSkillRule ?? 50;
    let matchScoreRuleValue = options.matchScoreRule ?? 5;
    let noiseValue = options.noiseValue ?? 9999;

    let attributeForQueue: { [k: string]: DataValueType } = {
        regionRule: {
            region: regionValue,
            ping: pingValue,
            jitter: 4 + memberIndex,
            packetLoss: 0.01
        },
        unrelatedMode: "noise-" + modeRuleValue,
        unrelatedSkill: noiseValue,
        unrelatedMaps: ["wrong-map-" + memberIndex, "decoy-map"],
        unrelatedTeamSkill: noiseValue,
        unrelatedMatchScore: noiseValue,
        preferredRole: memberIndex % 2 == 0 ? "anchor" : "support"
    };

    if (!options.omitModeRule) {
        attributeForQueue.modeRule = modeRuleValue;
    }

    if (!options.omitSkillRule) {
        attributeForQueue.skillRule = skillRuleValue;
    }

    if (!options.omitMapRule) {
        attributeForQueue.mapRule = mapRuleValue;
    }

    if (!options.omitTeamSkillRule) {
        attributeForQueue.teamSkillRule = teamSkillRuleValue;
    }

    attributeForQueue.matchScoreRule = matchScoreRuleValue;

    if (options.extraAttributeForQueue != null) {
        Object.assign(attributeForQueue, options.extraAttributeForQueue);
    }

    return {
        userId: userId,
        attribute: {
            profile: {
                rank: {
                    tier: "grandmaster",
                    division: memberIndex + 1,
                    mmr: options.rawSkill ?? skillRuleValue
                },
                region: {
                    primary: regionValue,
                    fallback: "hk",
                    ping: pingValue
                }
            },
            matchmaking: {
                mode: options.rawMode ?? modeRuleValue,
                skill: options.rawSkill ?? skillRuleValue,
                maps: options.rawMaps ?? mapRuleValue,
                scoring: {
                    teamSkillRule: noiseValue,
                    matchScoreRule: noiseValue,
                    actualTeamSkill: teamSkillRuleValue,
                    actualMatchScore: matchScoreRuleValue
                },
                latency: {
                    region: regionValue,
                    ping: pingValue,
                    jitter: 4 + memberIndex,
                    packetLoss: 0.01
                }
            },
            noise: {
                modeRule: "noise-" + modeRuleValue,
                skillRule: noiseValue,
                regionRule: {
                    region: "wrong",
                    ping: noiseValue
                },
                mapRule: ["wrong-map-" + memberIndex],
                teamSkillRule: noiseValue,
                matchScoreRule: noiseValue
            }
        },
        attributeForQueue: attributeForQueue
    };
}

function complexFullRulesTicket(ticketId: string, members: ComplexFullRulesMemberInput[], tsCreate = Date.now()): MatchmakingTicket {
    return createTicket(ticketId, members.map((member, index) => complexFullRulesMember(member.userId, index, member.options)), tsCreate);
}

function complexFullRulesPartyTicket(ticketId: string, userIds: string[], firstMemberOptions: ComplexFullRulesMemberOptions = {}, secondMemberOptions: ComplexFullRulesMemberOptions = {}, tsCreate = Date.now()): MatchmakingTicket {
    return complexFullRulesTicket(ticketId, [
        { userId: userIds[0], options: firstMemberOptions },
        { userId: userIds[1], options: secondMemberOptions }
    ], tsCreate);
}

function complexFullRulesSoloTicket(ticketId: string, userId: string, options: ComplexFullRulesMemberOptions = {}, tsCreate = Date.now()): MatchmakingTicket {
    return complexFullRulesTicket(ticketId, [{ userId: userId, options: options }], tsCreate);
}

function createFullRulesTwoTeamSettings(overrides: Partial<xMatchmakingQueueSettings> = {}, ruleOverrides: FullRuleSetOverrides = {}): xMatchmakingQueueSettings {
    return createQueueSettings({
        matchSize: overrides.matchSize ?? { min: 4, max: 4 },
        teams: overrides.teams ?? [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } }
        ],
        rules: fullRuleSet(ruleOverrides)
    });
}

function createOptionalFullRuleSet(secondsUntilOptional: number): NonNullable<xMatchmakingQueueSettings["rules"]> {
    let mode = stringRule("modeRule");
    mode.advancedSettings = {
        secondsUntilOptional: secondsUntilOptional,
        expansionType: RuleExpansionType.None
    };

    let skill = differenceRule("skillRule", 30);
    skill.advancedSettings = {
        secondsUntilOptional: secondsUntilOptional,
        expansionType: RuleExpansionType.None
    };

    let region = fullRegionRule(80);
    region.advancedSettings = {
        secondsUntilOptional: secondsUntilOptional,
        expansionType: RuleExpansionType.None
    };

    let map = setIntersectionRule("mapRule", 2);
    map.advancedSettings = {
        secondsUntilOptional: secondsUntilOptional,
        expansionType: RuleExpansionType.None
    };

    let matchTotal = matchTotalRule("matchScoreRule", 20, 30);
    matchTotal.advancedSettings = {
        secondsUntilOptional: secondsUntilOptional,
        expansionType: RuleExpansionType.None
    };

    let teamBalance = teamSizeBalanceRule(0);
    teamBalance.advancedSettings = {
        secondsUntilOptional: secondsUntilOptional,
        expansionType: RuleExpansionType.None
    };

    let teamDifference = teamDifferenceRule("teamSkillRule", 10);
    teamDifference.advancedSettings = {
        secondsUntilOptional: secondsUntilOptional,
        expansionType: RuleExpansionType.None
    };

    let ticketSizeSimilarity = teamTicketSizeSimilarityRule();
    ticketSizeSimilarity.advancedSettings = {
        secondsUntilOptional: secondsUntilOptional
    };

    return [mode, skill, region, map, matchTotal, teamBalance, teamDifference, ticketSizeSimilarity];
}

test("181 FullRuleSet full match accepts two complex parties when every rule passes", () => {
    let settings = createFullRulesTwoTeamSettings();
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"], { skillRule: 1500, teamSkillRule: 50, matchScoreRule: 5 }, { teamSkillRule: 50, matchScoreRule: 5 }),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { skillRule: 1510, teamSkillRule: 50, matchScoreRule: 6 }, { teamSkillRule: 50, matchScoreRule: 6 })
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertCandidateBasics(candidate, ["ticketA", "ticketB"], ["userA1", "userA2", "userB1", "userB2"]);
    assertTeamTicketLayout(candidate, [
        { teamId: "blue", ticketIds: ["ticketB"] },
        { teamId: "red", ticketIds: ["ticketA"] }
    ]);
});

test("182 FullRuleSet no match rejects when StringRule fails", () => {
    let settings = createFullRulesTwoTeamSettings();
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"]),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { modeRule: "casual-full:sg", skillRule: 1510, matchScoreRule: 6 }, { matchScoreRule: 6 })
    ]);

    assert.equal(candidates.length, 0);
});

test("183 FullRuleSet no match rejects when DifferenceRule fails", () => {
    let settings = createFullRulesTwoTeamSettings();
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"]),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { skillRule: 1600, matchScoreRule: 6 }, { matchScoreRule: 6 })
    ]);

    assert.equal(candidates.length, 0);
});

test("184 FullRuleSet no match rejects when RegionSelectionRule fails", () => {
    let settings = createFullRulesTwoTeamSettings();
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"]),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { skillRule: 1510, region: "hk", matchScoreRule: 6 }, { matchScoreRule: 6 })
    ]);

    assert.equal(candidates.length, 0);
});

test("185 FullRuleSet no match rejects when SetIntersectionRule fails", () => {
    let settings = createFullRulesTwoTeamSettings();
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"]),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { skillRule: 1510, mapRule: ["forest", "desert"], matchScoreRule: 6 }, { matchScoreRule: 6 })
    ]);

    assert.equal(candidates.length, 0);
});

test("186 FullRuleSet no match rejects when MatchTotalRule total is below min", () => {
    let matchTotal = matchTotalRule("matchScoreRule", 25, 30);
    let settings = createFullRulesTwoTeamSettings({}, { matchTotalRule: matchTotal });
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"], { matchScoreRule: 5 }, { matchScoreRule: 5 }),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { skillRule: 1510, matchScoreRule: 5 }, { matchScoreRule: 5 })
    ]);

    assert.equal(candidates.length, 0);
});

test("187 FullRuleSet no match rejects when MatchTotalRule total is above max", () => {
    let matchTotal = matchTotalRule("matchScoreRule", 0, 18);
    let settings = createFullRulesTwoTeamSettings({}, { matchTotalRule: matchTotal });
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"], { matchScoreRule: 5 }, { matchScoreRule: 5 }),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { skillRule: 1510, matchScoreRule: 6 }, { matchScoreRule: 6 })
    ]);

    assert.equal(candidates.length, 0);
});

test("188 FullRuleSet no match rejects when TeamSizeBalanceRule fails after ticket-size rule becomes optional", () => {
    let oldTimestamp = Date.now() - 2_000;
    let ticketSizeSimilarity = teamTicketSizeSimilarityRule();
    ticketSizeSimilarity.advancedSettings = {
        secondsUntilOptional: 1
    };
    let settings = createFullRulesTwoTeamSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ]
    }, {
        teamSizeBalanceRule: teamSizeBalanceRule(0),
        teamTicketSizeSimilarityRule: ticketSizeSimilarity
    });
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"], { teamSkillRule: 50, matchScoreRule: 5 }, { teamSkillRule: 50, matchScoreRule: 5 }, oldTimestamp),
        complexFullRulesSoloTicket("ticketB", "userB", { skillRule: 1510, teamSkillRule: 100, matchScoreRule: 10 }, oldTimestamp)
    ]);

    assert.equal(candidates.length, 0);
});

test("189 FullRuleSet no match rejects when TeamDifferenceRule fails", () => {
    let settings = createFullRulesTwoTeamSettings();
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"], { teamSkillRule: 50, matchScoreRule: 5 }, { teamSkillRule: 50, matchScoreRule: 5 }),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { skillRule: 1510, teamSkillRule: 80, matchScoreRule: 5 }, { teamSkillRule: 80, matchScoreRule: 5 })
    ]);

    assert.equal(candidates.length, 0);
});

test("190 FullRuleSet no match rejects when TeamTicketSizeSimilarityRule fails", () => {
    let settings = createFullRulesTwoTeamSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ]
    }, {
        teamSizeBalanceRule: teamSizeBalanceRule(1),
        teamDifferenceRule: teamDifferenceRule("teamSkillRule", 0)
    });
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"], { teamSkillRule: 50, matchScoreRule: 5 }, { teamSkillRule: 50, matchScoreRule: 5 }),
        complexFullRulesSoloTicket("ticketB", "userB", { skillRule: 1510, teamSkillRule: 100, matchScoreRule: 10 })
    ]);

    assert.equal(candidates.length, 0);
});

test("191 FullRuleSet partial match keeps valid pair and excludes ticket failing string rule", () => {
    let settings = createFullRulesTwoTeamSettings();
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"]),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { skillRule: 1510, matchScoreRule: 6 }, { matchScoreRule: 6 }),
        complexFullRulesPartyTicket("ticketC", ["userC1", "userC2"], { modeRule: "arcade-full:sg", skillRule: 1510, matchScoreRule: 6 }, { matchScoreRule: 6 })
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateWithTicket(candidates, "ticketC");
});

test("192 FullRuleSet partial match enforces matchSize max across several valid parties", () => {
    let settings = createFullRulesTwoTeamSettings();
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"]),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { skillRule: 1510, matchScoreRule: 6 }, { matchScoreRule: 6 }),
        complexFullRulesPartyTicket("ticketC", ["userC1", "userC2"], { skillRule: 1515, matchScoreRule: 6 }, { matchScoreRule: 6 })
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertEveryCandidateWithinMatchSize(candidates, 4);
});

test("193 FullRuleSet full match accepts three balanced teams with all rules enabled", () => {
    let matchTotal = matchTotalRule("matchScoreRule", 30, 40);
    let settings = createFullRulesTwoTeamSettings({
        matchSize: { min: 6, max: 6 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } },
            { teamId: "green", teamSize: { min: 2, max: 2 } }
        ]
    }, {
        matchTotalRule: matchTotal
    });
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"]),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { skillRule: 1510 }, {}),
        complexFullRulesPartyTicket("ticketC", ["userC1", "userC2"], { skillRule: 1515 }, {})
    ]);

    let candidate = assertCandidateWithTickets(candidates, ["ticketA", "ticketB", "ticketC"]);
    assertTeamMemberCounts(candidate, [
        { teamId: "blue", memberCount: 2 },
        { teamId: "green", memberCount: 2 },
        { teamId: "red", memberCount: 2 }
    ]);
});

test("194 FullRuleSet no match rejects three teams when team score spread fails", () => {
    let matchTotal = matchTotalRule("matchScoreRule", 30, 40);
    let settings = createFullRulesTwoTeamSettings({
        matchSize: { min: 6, max: 6 },
        teams: [
            { teamId: "red", teamSize: { min: 2, max: 2 } },
            { teamId: "blue", teamSize: { min: 2, max: 2 } },
            { teamId: "green", teamSize: { min: 2, max: 2 } }
        ]
    }, {
        matchTotalRule: matchTotal
    });
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"]),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { skillRule: 1510 }, {}),
        complexFullRulesPartyTicket("ticketC", ["userC1", "userC2"], { skillRule: 1515, teamSkillRule: 80 }, { teamSkillRule: 80 })
    ]);

    assert.equal(candidates.length, 0);
});

test("195 FullRuleSet full match accepts multiple rule expansions together", () => {
    let oldTimestamp = Date.now() - 20_000;
    let mode = stringRule("modeRule");
    mode.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: ["strict-full", "strict-full", "expanded-full"]
        }
    };
    let skill = differenceRule("skillRule", 10);
    skill.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 25,
            limit: 60
        }
    };
    let region = fullRegionRule(40);
    region.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 20,
            limit: 80
        }
    };
    let map = setIntersectionRule("mapRule", 3);
    map.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 1
        }
    };
    let matchTotal = matchTotalRule("matchScoreRule", 40, 50);
    matchTotal.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideMin: [40, 30, 20]
        }
    };
    let teamDifference = teamDifferenceRule("teamSkillRule", 5);
    teamDifference.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 10,
            limit: 20
        }
    };
    let settings = createFullRulesTwoTeamSettings({}, {
        modeRule: mode,
        skillRule: skill,
        regionRule: region,
        mapRule: map,
        matchTotalRule: matchTotal,
        teamDifferenceRule: teamDifference
    });
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"], { modeRule: "strict-full", skillRule: 1500, ping: 50, mapRule: ["temple", "harbor", "metro"], teamSkillRule: 50, matchScoreRule: 5 }, { teamSkillRule: 50, matchScoreRule: 5 }, oldTimestamp),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { modeRule: "expanded-full", skillRule: 1560, ping: 60, mapRule: ["metro", "forest"], teamSkillRule: 60, matchScoreRule: 6 }, { teamSkillRule: 60, matchScoreRule: 6 }, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("196 FullRuleSet no match rejects before combined expansions are reached", () => {
    let mode = stringRule("modeRule");
    mode.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Custom,
        customExpansions: {
            secondsBetweenExpansions: 10,
            overrideValue: ["strict-full", "strict-full", "expanded-full"]
        }
    };
    let skill = differenceRule("skillRule", 10);
    skill.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 25,
            limit: 60
        }
    };
    let region = fullRegionRule(40);
    region.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 20,
            limit: 80
        }
    };
    let map = setIntersectionRule("mapRule", 3);
    map.advancedSettings = {
        secondsUntilOptional: 120,
        expansionType: RuleExpansionType.Linear,
        linearExpansions: {
            secondsBetweenExpansions: 10,
            delta: 1
        }
    };
    let settings = createFullRulesTwoTeamSettings({}, {
        modeRule: mode,
        skillRule: skill,
        regionRule: region,
        mapRule: map
    });
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"], { modeRule: "strict-full", skillRule: 1500, ping: 50, mapRule: ["temple", "harbor", "metro"] }),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { modeRule: "expanded-full", skillRule: 1560, ping: 60, mapRule: ["metro", "forest"], matchScoreRule: 6 }, { matchScoreRule: 6 })
    ]);

    assert.equal(candidates.length, 0);
});

test("197 FullRuleSet optional timeout full match ignores several incompatible rules", () => {
    let oldTimestamp = Date.now() - 2_000;
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: createOptionalFullRuleSet(1)
    });
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"], { modeRule: "strict-full", skillRule: 1000, region: "sg", ping: 300, mapRule: ["temple"], teamSkillRule: 50, matchScoreRule: 100 }, { teamSkillRule: 50, matchScoreRule: 100 }, oldTimestamp),
        complexFullRulesSoloTicket("ticketB", "userB", { modeRule: "arcade-full", skillRule: 2000, region: "hk", ping: 350, mapRule: ["forest"], teamSkillRule: 300, matchScoreRule: 100 }, oldTimestamp)
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("198 FullRuleSet optional timeout no match before rules become optional", () => {
    let settings = createQueueSettings({
        matchSize: { min: 3, max: 3 },
        teams: [
            { teamId: "red", teamSize: { min: 1, max: 2 } },
            { teamId: "blue", teamSize: { min: 1, max: 1 } }
        ],
        rules: createOptionalFullRuleSet(120)
    });
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"], { modeRule: "strict-full", skillRule: 1000, region: "sg", ping: 300, mapRule: ["temple"], teamSkillRule: 50, matchScoreRule: 100 }, { teamSkillRule: 50, matchScoreRule: 100 }),
        complexFullRulesSoloTicket("ticketB", "userB", { modeRule: "arcade-full", skillRule: 2000, region: "hk", ping: 350, mapRule: ["forest"], teamSkillRule: 300, matchScoreRule: 100 })
    ]);

    assert.equal(candidates.length, 0);
});

test("199 FullRuleSet full match uses defaults while all other rules remain active", () => {
    let mode = stringRule("modeRule");
    mode.defaultValue = "default-full";
    let skill = differenceRule("skillRule", 5);
    skill.defaultValue = 1500;
    let map = setIntersectionRule("mapRule", 2);
    map.defaultValue = ["temple", "harbor"];
    let teamDifference = teamDifferenceRule("teamSkillRule", 0);
    teamDifference.defaultValue = 50;
    let settings = createFullRulesTwoTeamSettings({}, {
        modeRule: mode,
        skillRule: skill,
        mapRule: map,
        teamDifferenceRule: teamDifference
    });
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"], { omitModeRule: true, omitSkillRule: true, omitMapRule: true, omitTeamSkillRule: true, matchScoreRule: 5 }, { teamSkillRule: 50, matchScoreRule: 5 }),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { modeRule: "default-full", skillRule: 1500, mapRule: ["temple", "harbor", "metro"], teamSkillRule: 50, matchScoreRule: 6 }, { teamSkillRule: 50, matchScoreRule: 6 })
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
});

test("200 FullRuleSet partial match builds separate candidates for two valid rule clusters", () => {
    let settings = createFullRulesTwoTeamSettings();
    let candidates = runMatchmaking(settings, [
        complexFullRulesPartyTicket("ticketA", ["userA1", "userA2"], { modeRule: "ranked-full:sg", skillRule: 1500 }, {}),
        complexFullRulesPartyTicket("ticketB", ["userB1", "userB2"], { modeRule: "ranked-full:sg", skillRule: 1510, matchScoreRule: 6 }, { matchScoreRule: 6 }),
        complexFullRulesPartyTicket("ticketC", ["userC1", "userC2"], { modeRule: "arcade-full:sg", skillRule: 1500 }, {}),
        complexFullRulesPartyTicket("ticketD", ["userD1", "userD2"], { modeRule: "arcade-full:sg", skillRule: 1510, matchScoreRule: 6 }, { matchScoreRule: 6 })
    ]);

    assertCandidateWithTickets(candidates, ["ticketA", "ticketB"]);
    assertCandidateWithTickets(candidates, ["ticketC", "ticketD"]);
    assertNoCandidateContainingAll(candidates, ["ticketA", "ticketC"]);
});
