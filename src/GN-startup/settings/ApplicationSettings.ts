import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected port: number;
	protected socketPort: number;
	protected useSSL: boolean;

	protected keyFilePath: string;
	protected certFilePath: string;

	protected expiredToken: number;
	protected privateKeyToken: string;

	protected initRootUsername: string;
	protected initRootPassword: string;
	protected restoreRootPassword: string;

	public getPort(): number {
		return this.port;
	}

	public getSocketPort(): number {
		return this.socketPort;
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

	public getInitRootUsername(): string {
		return this.initRootUsername;
	}

	public getInitRootPassword(): string {
		return this.initRootPassword;
	}

	public getRestoreRootPassword(): string {
		return this.restoreRootPassword;
	}

	constructor() { }

}

class Builder extends BuilderBase implements IBuilder<ApplicationSettings> {
	public setPort(port: number): Builder {
		this.port = port;
		return this;
	}

	public setSocketPort(socketPort: number): Builder {
		this.socketPort = socketPort;
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

	public setInitRootUsername(initRootUsername: string): Builder {
		this.initRootUsername = initRootUsername;
		return this;
	}

	public setInitRootPassword(initRootPassword: string): Builder {
		this.initRootPassword = initRootPassword;
		return this;
	}

	public setRestoreRootUsername(restoreRootPassword: string): Builder {
		this.restoreRootPassword = restoreRootPassword;
		return this;
	}

	constructor() {
		super();

		this.port = 0;
		this.socketPort = 0;
		this.useSSL = false;
		this.keyFilePath = "";
		this.certFilePath = "";
		this.expiredToken = 0;
		this.privateKeyToken = "";
		this.initRootUsername = "";
		this.initRootPassword = "";
		this.restoreRootPassword = "";
	}

	public build() {
		return new ApplicationSettings(this);
	}

}

export class ApplicationSettings extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.port = builder.getPort();
		this.socketPort = builder.getSocketPort();
		this.useSSL = builder.getUseSSL();
		this.keyFilePath = builder.getKeyFilePath();
		this.certFilePath = builder.getCertFilePath();
		this.expiredToken = builder.getExpiredToken();
		this.privateKeyToken = builder.getPrivateKeyToken();
		this.initRootUsername = builder.getInitRootUsername();
		this.initRootPassword = builder.getInitRootPassword();
		this.restoreRootPassword = builder.getRestoreRootPassword();
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
