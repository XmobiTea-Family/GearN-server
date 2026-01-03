"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudScriptMatchmaking = void 0;
const CloudScriptEvent_1 = require("./CloudScriptEvent");
class CloudScriptMatchmaking extends CloudScriptEvent_1.CloudScriptProcessBase {
    async confirmServerDetail(gameId, matchmakingTicketCanMatch, serverDetail) {
        return await this.sendEvent({
            eventType: CloudScriptEvent_1.CloudScriptEventType.ConfirmServerDetail,
            gameId: gameId,
            matchmakingTicketCanMatch: matchmakingTicketCanMatch,
            serverDetail: serverDetail,
        });
    }
}
exports.CloudScriptMatchmaking = CloudScriptMatchmaking;
