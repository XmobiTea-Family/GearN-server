import { MatchmakingTicketCanMatch, ServerDetail } from "./../../index";
import { CloudScriptEventType, CloudScriptProcessBase } from "./CloudScriptEvent";

export class CloudScriptMatchmaking extends CloudScriptProcessBase {
	/**
	 * Executes the confirm server detail workflow asynchronously.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param matchmakingTicketCanMatch Provides the matchmaking ticket can match value used by this operation.
	 * @param serverDetail Provides the server detail value used by this operation.
	 */
	public async confirmServerDetail(gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch, serverDetail: ServerDetail) {
		return await this.sendEvent({
			eventType: CloudScriptEventType.ConfirmServerDetail,
			gameId: gameId,
			matchmakingTicketCanMatch: matchmakingTicketCanMatch,
			serverDetail: serverDetail,
		});
	}

}
