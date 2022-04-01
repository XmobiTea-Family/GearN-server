import { IBuilder } from "./../GN-library/xbuilder/lib/IBuilder";
import { ApplicationSettings } from "./settings/ApplicationSettings";
import { HttpAppSettings } from "./settings/HttpAppSettings";
import { SocketAppSettings } from "./settings/SocketAppSettings";

import { HttpApp } from "./HttpApp";
import { SocketApp } from "./SocketApp";

import express from "express";
import { Express } from "express";
import http from "http";
import https from "https";
import fs from "fs";
import { GameApplication } from "../GameApplication";

abstract class BuilderBase {
	protected applicationSettings: ApplicationSettings;
	protected httpAppSettings: HttpAppSettings;
	protected socketAppSettings: SocketAppSettings;

	public getApplicationSettings(): ApplicationSettings {
		return this.applicationSettings;
	}

	public getHttpAppSettings(): HttpAppSettings {
		return this.httpAppSettings;
	}

	public getSocketAppSettings(): SocketAppSettings {
		return this.socketAppSettings;
	}

	constructor() {}
}

class Builder extends BuilderBase implements IBuilder<ServerApplication> {
	public setApplicationSettings(applicationSettings: ApplicationSettings): Builder {
		this.applicationSettings = applicationSettings;

		return this;
	}

	public setHttpAppSettings(httpAppSettings: HttpAppSettings): Builder {
		this.httpAppSettings = httpAppSettings;

		return this;
	}

	public setSocketAppSettings(socketAppSettings: SocketAppSettings): Builder {
		this.socketAppSettings = socketAppSettings;

		return this;
	}

	public build() {
		return new ServerApplication(this);
	}

	constructor() {
		super();
	}
}

interface OnServerRunSuccess {
	(port: number): void;
}

export class ServerApplication extends BuilderBase {
	private httpApp: HttpApp;
	private socketApp: SocketApp;
	private gameApplication: GameApplication;

	public run(onServerRunSuccess: OnServerRunSuccess): void {
		const port = this.applicationSettings.getPort();

		const app = express();
		const server = this.getServer(app, this.getApplicationSettings());

		this.httpApp = this.newHttpApp();
		this.httpApp.setAppSettings(this.getHttpAppSettings());
		this.httpApp.setApp(app);
		this.httpApp.run();

		this.socketApp = this.newSocketApp();
		this.socketApp.setAppSettings(this.getSocketAppSettings());
		this.socketApp.setServer(server);
		this.socketApp.run();

		this.gameApplication = new GameApplication();
		this.gameApplication.setHttpApp(this.httpApp);
		this.gameApplication.setSocketApp(this.socketApp);

		server.listen(port, () => {
			if (onServerRunSuccess != null) onServerRunSuccess(port);
		});
	}

	public getGameApplication(): GameApplication {
		return this.gameApplication;
	}

	private newHttpApp(): HttpApp {
		return new HttpApp();
	}

	private newSocketApp(): SocketApp {
		return new SocketApp();
	}

	private getServer(app: Express, settings: ApplicationSettings): http.Server {
		if (settings.getUseSSL()) {
			const options = {
				key: fs.readFileSync(__dirname + "/../" + settings.getKeyFilePath()),
				cert: fs.readFileSync(__dirname + "/../" + settings.getCertFilePath()),
			};

			return https.createServer(options, app);
		} else {
			return http.createServer(app);
		}
	}

	constructor(builder: BuilderBase) {
		super();

		this.applicationSettings = builder.getApplicationSettings();
		this.httpAppSettings = builder.getHttpAppSettings();
		this.socketAppSettings = builder.getSocketAppSettings();
	}

	public static Builder(): Builder {
		return new Builder();
	}
}
