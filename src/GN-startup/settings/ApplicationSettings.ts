import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected port: number;
	protected useSSL: boolean;

	protected keyFilePath: string;
	protected certFilePath: string;

	protected expiredToken: number;
	protected privateKeyToken: string;

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

	public getExpiredToken(): number {
		return this.expiredToken;
	}

	public getPrivateKeyToken(): string {
		return this.privateKeyToken;
	}

	constructor() { }

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

	public setExpiredToken(expiredToken: number): Builder {
		this.expiredToken = expiredToken;
		return this;
	}

	public setPrivateKeyToken(privateKeyToken: string): Builder {
		this.privateKeyToken = privateKeyToken;
		return this;
	}

	constructor() {
		super();

		this.port = 0;
		this.useSSL = false;
		this.keyFilePath = "";
		this.certFilePath = "";
		this.expiredToken = 0;
		this.privateKeyToken = "";
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
		this.expiredToken = builder.getExpiredToken();
		this.privateKeyToken = builder.getPrivateKeyToken();
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
