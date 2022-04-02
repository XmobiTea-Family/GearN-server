import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected port: number;
	protected useSSL: boolean;

	protected keyFilePath: string;
	protected certFilePath: string;

	public getPort(): number {
		return this.port;
	}

	public getUseSSL(): boolean {
		return this.useSSL;
	}

	public getKeyFilePath(): string {
		return this.keyFilePath;
	}

	public getCertFilePath(): string {
		return this.certFilePath;
	}

	constructor() {}
}

class Builder extends BuilderBase implements IBuilder<ApplicationSettings> {
	public setPort(port: number): Builder {
		this.port = port;
		return this;
	}

	public setUseSSL(useSSL: boolean): Builder {
		this.useSSL = useSSL;
		return this;
	}

	public setKeyFilePath(keyFilePath: string): Builder {
		this.keyFilePath = keyFilePath;
		return this;
	}

	public setCertFilePath(certFilePath: string): Builder {
		this.certFilePath = certFilePath;
		return this;
	}

	constructor() {
		super();
	}

	public build() {
		return new ApplicationSettings(this);
	}
}

export class ApplicationSettings extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.port = builder.getPort();
		this.useSSL = builder.getUseSSL();
		this.keyFilePath = builder.getKeyFilePath();
		this.certFilePath = builder.getCertFilePath();
	}

	public static Builder(): Builder {
		return new Builder();
	}
}
