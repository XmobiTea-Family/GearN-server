import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected headerIP: string;
	protected idTypeCase: number;
	protected ipApiUrl: string;
    protected cloudScriptExecuteTimeoutInMs: number;

	public getHeaderIP(): string {
		return this.headerIP;
	}

	public getIdTypeCase(): number {
		return this.idTypeCase;
	}

	public getIPApiUrl(): string {
		return this.ipApiUrl;
	}

	public getCloudScriptExecuteTimeoutInMs(): number {
		return this.cloudScriptExecuteTimeoutInMs;
	}

	constructor() { }

}

class Builder extends BuilderBase implements IBuilder<OtherSettings> {

	public setHeaderIP(headerIP: string): Builder {
		this.headerIP = headerIP;
		return this;
	}

	public setIdTypeCase(idTypeCase: number): Builder {
		this.idTypeCase = idTypeCase;
		return this;
	}

	public setIPApiUrl(ipApiUrl: string): Builder {
		this.ipApiUrl = ipApiUrl;
		return this;
	}

    public setCloudScriptExecuteTimeoutInMs(cloudScriptExecuteTimeoutInMs: number): Builder {
		this.cloudScriptExecuteTimeoutInMs = cloudScriptExecuteTimeoutInMs;
		return this;
	}

	constructor() {
		super();

		this.headerIP = "";
		this.idTypeCase = 0;
		this.ipApiUrl = "";
		this.cloudScriptExecuteTimeoutInMs = 15000;
	}

	public build() {
		return new OtherSettings(this);
	}

}

export class OtherSettings extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.headerIP = builder.getHeaderIP();
		this.idTypeCase = builder.getIdTypeCase();
		this.ipApiUrl = builder.getIPApiUrl();
		this.cloudScriptExecuteTimeoutInMs = builder.getCloudScriptExecuteTimeoutInMs();
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
