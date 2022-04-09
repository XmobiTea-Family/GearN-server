import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected logToFileEnable: boolean;
	protected logToConsoleEnable: boolean;
	protected logPath: string;

	public getLogToFileEnable(): boolean {
		return this.logToFileEnable;
	}

	public getLogToConsoleEnable(): boolean {
		return this.logToConsoleEnable;
	}

	public getLogPath(): string {
		return this.logPath;
	}

	constructor() {}
}

class Builder extends BuilderBase implements IBuilder<LogSettings> {
	public setLogToFileEnable(logToFileEnable: boolean): Builder {
		this.logToFileEnable = logToFileEnable;
		return this;
	}

	public setLogToConsoleEnable(logToConsoleEnable: boolean): Builder {
		this.logToConsoleEnable = logToConsoleEnable;
		return this;
	}

	public setLogPath(logPath: string): Builder {
		this.logPath = logPath;
		return this;
	}

	constructor() {
		super();
	}

	public build() {
		return new LogSettings(this);
	}
}

export class LogSettings extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.logToFileEnable = builder.getLogToFileEnable();
		this.logToConsoleEnable = builder.getLogToConsoleEnable();
		this.logPath = builder.getLogPath();
	}

	public static Builder(): Builder {
		return new Builder();
	}
}
