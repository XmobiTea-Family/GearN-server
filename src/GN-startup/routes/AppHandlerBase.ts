import { GameApplication } from "./../../GN-app-api/handler/GameApplication";

export class AppHandlerBase {
	protected gameApplication: GameApplication;

	public setGameApplication(gameApplication: GameApplication) {
		this.gameApplication = gameApplication;
	}
}
