import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected enable: boolean;
	protected debugHashs: string[];
    
	public getEnable(): boolean {
		return this.enable;
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

	public setDebugHashs(debugHashs: string[]): Builder {
		this.debugHashs = debugHashs;
		return this;
	}

	constructor() {
		super();

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
		this.debugHashs = builder.getDebugHashs();
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
