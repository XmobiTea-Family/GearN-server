import { MatchmakingTicketCanMatch, ServerDetail } from "./../../index";
import { CloudScriptEventType, CloudScriptProcessBase } from "./CloudScriptEvent";

export class CloudScriptMatchmaking extends CloudScriptProcessBase {
	public async confirmServerDetail(gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch, serverDetail: ServerDetail) {
		return await this.sendEvent({
			eventType: CloudScriptEventType.ConfirmServerDetail,
			gameId: gameId,
			matchmakingTicketCanMatch: matchmakingTicketCanMatch,
			serverDetail: serverDetail,
		});
	}

}
