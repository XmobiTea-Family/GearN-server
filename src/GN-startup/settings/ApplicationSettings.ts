import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
    // Stores the port value used by this instance.
    protected port: number;
    // Stores the socket port value used by this instance.
    protected socketPort: number;
    // Indicates whether SSL should be used.
    protected useSSL: boolean;

    // Stores the key file path value used by this instance.
    protected keyFilePath: string;
    // Stores the cert file path value used by this instance.
    protected certFilePath: string;

    // Stores the expired token value used by this instance.
    protected expiredToken: number;
    // Stores the private key token value used by this instance.
    protected privateKeyToken: string;

    // Stores the init root username value used by this instance.
    protected initRootUsername: string;
    // Stores the init root password value used by this instance.
    protected initRootPassword: string;
    // Stores the restore root password value used by this instance.
    protected restoreRootPassword: string;

    /**
     * Returns the port.
     * @returns Returns the port.
     */
    public getPort(): number {
        return this.port;
    }

    /**
     * Returns the socket port.
     * @returns Returns the socket port.
     */
    public getSocketPort(): number {
        return this.socketPort;
    }

    /**
     * Returns whether SSL should be used.
     * @returns Returns whether SSL should be used.
     */
    public getUseSSL(): boolean {
        return this.useSSL;
    }

    /**
     * Returns the key file path.
     * @returns Returns the key file path.
     */
    public getKeyFilePath(): string {
        return this.keyFilePath;
    }

    /**
     * Returns the cert file path.
     * @returns Returns the cert file path.
     */
    public getCertFilePath(): string {
        return this.certFilePath;
    }

    /**
     * Returns the expired token.
     * @returns Returns the expired token.
     */
    public getExpiredToken(): number {
        return this.expiredToken;
    }

    /**
     * Returns the private key token.
     * @returns Returns the private key token.
     */
    public getPrivateKeyToken(): string {
        return this.privateKeyToken;
    }

    /**
     * Returns the init root username.
     * @returns Returns the init root username.
     */
    public getInitRootUsername(): string {
        return this.initRootUsername;
    }

    /**
     * Returns the init root password.
     * @returns Returns the init root password.
     */
    public getInitRootPassword(): string {
        return this.initRootPassword;
    }

    /**
     * Returns the restore root password.
     * @returns Returns the restore root password.
     */
    public getRestoreRootPassword(): string {
        return this.restoreRootPassword;
    }

    /**
     * Initializes a new builder base instance.
     */
    constructor() {}
}

class Builder extends BuilderBase implements IBuilder<ApplicationSettings> {
    /**
     * Sets the port.
     * @param port Provides the port value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setPort(port: number): Builder {
        this.port = port;
        return this;
    }

    /**
     * Sets the socket port.
     * @param socketPort Provides the socket port value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setSocketPort(socketPort: number): Builder {
        this.socketPort = socketPort;
        return this;
    }

    /**
     * Sets whether SSL should be used.
     * @param useSSL Indicates whether SSL should be used.
     * @returns Returns the current builder instance.
     */
    public setUseSSL(useSSL: boolean): Builder {
        this.useSSL = useSSL;
        return this;
    }

    /**
     * Sets the key file path.
     * @param keyFilePath Provides the key file path value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setKeyFilePath(keyFilePath: string): Builder {
        this.keyFilePath = keyFilePath;
        return this;
    }

    /**
     * Sets the cert file path.
     * @param certFilePath Provides the cert file path value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setCertFilePath(certFilePath: string): Builder {
        this.certFilePath = certFilePath;
        return this;
    }

    /**
     * Sets the expired token.
     * @param expiredToken Provides the expired token value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setExpiredToken(expiredToken: number): Builder {
        this.expiredToken = expiredToken;
        return this;
    }

    /**
     * Sets the private key token.
     * @param privateKeyToken Provides the private key token value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setPrivateKeyToken(privateKeyToken: string): Builder {
        this.privateKeyToken = privateKeyToken;
        return this;
    }

    /**
     * Sets the init root username.
     * @param initRootUsername Provides the init root username value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setInitRootUsername(initRootUsername: string): Builder {
        this.initRootUsername = initRootUsername;
        return this;
    }

    /**
     * Sets the init root password.
     * @param initRootPassword Provides the init root password value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setInitRootPassword(initRootPassword: string): Builder {
        this.initRootPassword = initRootPassword;
        return this;
    }

    /**
     * Sets the restore root username.
     * @param restoreRootPassword Provides the restore root password value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setRestoreRootPassword(restoreRootPassword: string): Builder {
        this.restoreRootPassword = restoreRootPassword;
        return this;
    }

    /**
     * Initializes a new builder instance.
     */
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

    /**
     * Builds the configured instance.
     */
    public build() {
        return new ApplicationSettings(this);
    }
}

export class ApplicationSettings extends BuilderBase {
    /**
     * Initializes a new application settings instance.
     * @param builder Provides the builder state copied into this instance.
     */
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

    /**
     * Creates a new builder instance.
     * @returns Returns a new builder instance.
     */
    public static Builder(): Builder {
        return new Builder();
    }
}
