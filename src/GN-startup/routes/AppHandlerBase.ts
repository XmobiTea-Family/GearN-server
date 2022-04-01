import { GameApplication } from "./../../GameApplication";

export class AppHandlerBase {
	protected gameApplication: GameApplication;

	public setGameApplication(gameApplication: GameApplication) {
		this.gameApplication = gameApplication;
	}
}
