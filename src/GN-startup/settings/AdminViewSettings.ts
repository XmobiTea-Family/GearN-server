import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected enable: boolean;
	protected debugViewEnable: boolean;
	protected logViewEnable: boolean;
	protected debugHashs: string[];
    
	public getEnable(): boolean {
		return this.enable;
	}

	public getDebugViewEnable(): boolean {
		return this.debugViewEnable;
	}

	public getLogViewEnable(): boolean {
		return this.logViewEnable;
	}

	public getDebugHashs(): string[] {
		return this.debugHashs;
	}

	constructor() { }

}

class Builder extends BuilderBase implements IBuilder<AdminViewSettings> {
	public setEnable(enable: boolean): Builder {
		this.enable = enable;
		return this;
	}

	public setDebugViewEnable(debugViewEnable: boolean): Builder {
		this.debugViewEnable = debugViewEnable;
		return this;
	}

	public setLogViewEnable(logViewEnable: boolean): Builder {
		this.logViewEnable = logViewEnable;
		return this;
	}

	public setDebugHashs(debugHashs: string[]): Builder {
		this.debugHashs = debugHashs;
		return this;
	}

	constructor() {
		super();

		this.debugViewEnable = false;
		this.logViewEnable = false;
		this.debugHashs = [];
	}

	public build() {
		return new AdminViewSettings(this);
	}

}

export class AdminViewSettings extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.enable = builder.getEnable();
		this.debugViewEnable = builder.getDebugViewEnable();
		this.logViewEnable = builder.getLogViewEnable();
		this.debugHashs = builder.getDebugHashs();
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
