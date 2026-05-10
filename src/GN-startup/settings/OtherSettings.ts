import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
    // Stores the header IP value used by this instance.
    protected headerIP: string;
    // Stores the ID type case value used by this instance.
    protected idTypeCase: number;
    // Stores the IP API URL value used by this instance.
    protected ipApiUrl: string;
    // Stores the cloud script execute timeout in milliseconds value used by this instance.
    protected cloudScriptExecuteTimeoutInMs: number;

    /**
     * Returns the header IP.
     * @returns Returns the header IP.
     */
    public getHeaderIP(): string {
        return this.headerIP;
    }

    /**
     * Returns the ID type case.
     * @returns Returns the ID type case.
     */
    public getIdTypeCase(): number {
        return this.idTypeCase;
    }

    /**
     * Returns the IP API URL.
     * @returns Returns the IP API URL.
     */
    public getIPApiUrl(): string {
        return this.ipApiUrl;
    }

    /**
     * Returns the cloud script execute timeout in milliseconds.
     * @returns Returns the cloud script execute timeout in milliseconds.
     */
    public getCloudScriptExecuteTimeoutInMs(): number {
        return this.cloudScriptExecuteTimeoutInMs;
    }

    /**
     * Initializes a new builder base instance.
     */
    constructor() {}
}

class Builder extends BuilderBase implements IBuilder<OtherSettings> {
    /**
     * Sets the header IP.
     * @param headerIP Provides the header IP value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setHeaderIP(headerIP: string): Builder {
        this.headerIP = headerIP;
        return this;
    }

    /**
     * Sets the ID type case.
     * @param idTypeCase Provides the ID type case value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setIdTypeCase(idTypeCase: number): Builder {
        this.idTypeCase = idTypeCase;
        return this;
    }

    /**
     * Sets the IP API URL.
     * @param ipApiUrl Provides the IP API URL value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setIPApiUrl(ipApiUrl: string): Builder {
        this.ipApiUrl = ipApiUrl;
        return this;
    }

    /**
     * Sets the cloud script execute timeout in milliseconds.
     * @param cloudScriptExecuteTimeoutInMs Provides the cloud script execute timeout in milliseconds value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setCloudScriptExecuteTimeoutInMs(cloudScriptExecuteTimeoutInMs: number): Builder {
        this.cloudScriptExecuteTimeoutInMs = cloudScriptExecuteTimeoutInMs;
        return this;
    }

    /**
     * Initializes a new builder instance.
     */
    constructor() {
        super();

        this.headerIP = "";
        this.idTypeCase = 0;
        this.ipApiUrl = "";
        this.cloudScriptExecuteTimeoutInMs = 15000;
    }

    /**
     * Builds the configured instance.
     */
    public build() {
        return new OtherSettings(this);
    }
}

export class OtherSettings extends BuilderBase {
    /**
     * Initializes a new other settings instance.
     * @param builder Provides the builder state copied into this instance.
     */
    constructor(builder: Builder) {
        super();

        this.headerIP = builder.getHeaderIP();
        this.idTypeCase = builder.getIdTypeCase();
        this.ipApiUrl = builder.getIPApiUrl();
        this.cloudScriptExecuteTimeoutInMs = builder.getCloudScriptExecuteTimeoutInMs();
    }

    /**
     * Creates a new builder instance.
     * @returns Returns a new builder instance.
     */
    public static Builder(): Builder {
        return new Builder();
    }
}
