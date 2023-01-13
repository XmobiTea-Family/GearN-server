import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected enable: boolean;
	protected sendGridApiKey: string;
	protected fromEmail: string;

	public getEnable(): boolean {
		return this.enable;
	}

	public getSendGridApiKey(): string {
		return this.sendGridApiKey;
	}

	public getFromEmail(): string {
		return this.fromEmail;
	}

	constructor() { }

}

class Builder extends BuilderBase implements IBuilder<MailSettings> {
	public setEnable(enable: boolean): Builder {
		this.enable = enable;
		return this;
	}

	public setSendGridApiKey(sendGridApiKey: string): Builder {
		this.sendGridApiKey = sendGridApiKey;
		return this;
	}

	public setFromEmail(fromEmail: string): Builder {
		this.fromEmail = fromEmail;
		return this;
	}

	constructor() {
		super();

		this.enable = false;
		this.sendGridApiKey = "";
		this.fromEmail = "";
	}

	public build() {
		return new MailSettings(this);
	}

}

export class MailSettings extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.enable = builder.getEnable();
		this.sendGridApiKey = builder.getSendGridApiKey();
		this.fromEmail = builder.getFromEmail();
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
