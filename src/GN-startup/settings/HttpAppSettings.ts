import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

type MethodType = "GET" | "HEAD" | "PUT" | "PATCH" | "POST" | "DELETE" | "UPDATE";

abstract class BuilderBase {
    // Indicates whether the feature is enabled.
    protected enable: boolean;
    // Stores the origin value used by this instance.
    protected origin: string;
    // Stores the methods list used by this instance.
    protected methods: MethodType[];
    // Indicates whether ed headers is allowed.
    protected allowedHeaders: string[];
    // Indicates whether credentials.
    protected credentials: boolean;
    // Indicates whether send and receive debug is enabled.
    protected enableSendAndReceiveDebug: boolean;
    // Indicates whether post via msg pack is enabled.
    protected enablePostViaMsgPack: boolean;
    // Indicates whether post via JSON is enabled.
    protected enablePostViaJson: boolean;
    // Indicates whether trust proxy.
    protected trustProxy: boolean;

    /**
     * Returns the enable.
     * @returns Returns the enable.
     */
    public getEnable(): boolean {
        return this.enable;
    }

    /**
     * Returns the origin.
     * @returns Returns the origin.
     */
    public getOrigin(): string {
        return this.origin;
    }

    /**
     * Returns the methods.
     * @returns Returns the methods.
     */
    public getMethods(): MethodType[] {
        return this.methods;
    }

    /**
     * Returns all owed headers.
     * @returns Returns all owed headers.
     */
    public getAllowedHeaders(): string[] {
        return this.allowedHeaders;
    }

    /**
     * Returns the credentials.
     * @returns Returns the credentials.
     */
    public getCredentials(): boolean {
        return this.credentials;
    }

    /**
     * Returns whether send and receive debug is enabled.
     * @returns Returns whether send and receive debug is enabled.
     */
    public getEnableSendAndReceiveDebug(): boolean {
        return this.enableSendAndReceiveDebug;
    }

    /**
     * Returns whether post via msg pack is enabled.
     * @returns Returns whether post via msg pack is enabled.
     */
    public getEnablePostViaMsgPack(): boolean {
        return this.enablePostViaMsgPack;
    }

    /**
     * Returns whether post via JSON is enabled.
     * @returns Returns whether post via JSON is enabled.
     */
    public getEnablePostViaJson(): boolean {
        return this.enablePostViaJson;
    }

    /**
     * Returns the trust proxy.
     * @returns Returns the trust proxy.
     */
    public getTrustProxy(): boolean {
        return this.trustProxy;
    }

    /**
     * Initializes a new builder base instance.
     */
    constructor() {}
}

class Builder extends BuilderBase implements IBuilder<HttpAppSettings> {
    /**
     * Sets the origins.
     * @param origin Provides the origin value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setOrigins(origin: string): Builder {
        this.origin = origin;
        return this;
    }

    /**
     * Adds the method.
     * @param methodType Provides the method type value used by this operation.
     * @returns Returns the operation result.
     */
    public addMethod(methodType: MethodType): Builder {
        if (!this.methods.includes(methodType)) this.methods.push(methodType);
        return this;
    }

    /**
     * Adds the methods.
     * @param methodTypes Provides the method types value used by this operation.
     * @returns Returns the operation result.
     */
    public addMethods(methodTypes: MethodType[]): Builder {
        methodTypes.forEach((methodType) => this.addMethod(methodType));
        return this;
    }

    /**
     * Removes the method.
     * @param methodType Provides the method type value used by this operation.
     * @returns Returns the operation result.
     */
    public removeMethod(methodType: MethodType): Builder {
        // Stores the index of value used in the current execution flow.
        let indexOf = this.methods.indexOf(methodType);
        if (indexOf != -1) {
            this.methods.splice(indexOf, 1);
        }

        return this;
    }

    /**
     * Adds the allowed header.
     * @param allowedHeader Indicates whether ed header is allowed.
     * @returns Returns the operation result.
     */
    public addAllowedHeader(allowedHeader: string): Builder {
        if (!this.allowedHeaders.includes(allowedHeader)) this.allowedHeaders.push(allowedHeader);
        return this;
    }

    /**
     * Adds the allowed headers.
     * @param allowedHeaders Indicates whether ed headers is allowed.
     * @returns Returns the operation result.
     */
    public addAllowedHeaders(allowedHeaders: string[]): Builder {
        allowedHeaders.forEach((allowedHeader) => this.addAllowedHeader(allowedHeader));
        return this;
    }

    /**
     * Sets the credentials.
     * @param credentials Provides the credentials value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setCredentials(credentials: boolean): Builder {
        this.credentials = credentials;
        return this;
    }

    /**
     * Sets the enable.
     * @param enable Provides the enable value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setEnable(enable: boolean): Builder {
        this.enable = enable;
        return this;
    }

    /**
     * Sets whether send and receive debug is enabled.
     * @param enableSendAndReceiveDebug Indicates whether send and receive debug is enabled.
     * @returns Returns the current builder instance.
     */
    public setEnableSendAndReceiveDebug(enableSendAndReceiveDebug: boolean): Builder {
        this.enableSendAndReceiveDebug = enableSendAndReceiveDebug;
        return this;
    }

    /**
     * Sets whether post via msg pack is enabled.
     * @param enablePostViaMsgPack Indicates whether post via msg pack is enabled.
     * @returns Returns the current builder instance.
     */
    public setEnablePostViaMsgPack(enablePostViaMsgPack: boolean): Builder {
        this.enablePostViaMsgPack = enablePostViaMsgPack;
        return this;
    }

    /**
     * Sets whether post via JSON is enabled.
     * @param enablePostViaJson Indicates whether post via JSON is enabled.
     * @returns Returns the current builder instance.
     */
    public setEnablePostViaJson(enablePostViaJson: boolean): Builder {
        this.enablePostViaJson = enablePostViaJson;
        return this;
    }

    /**
     * Sets the trust proxy.
     * @param trustProxy Provides the trust proxy value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setTrustProxy(trustProxy: boolean): Builder {
        this.trustProxy = trustProxy;
        return this;
    }

    /**
     * Builds the configured instance.
     */
    public build() {
        return new HttpAppSettings(this);
    }

    /**
     * Initializes a new builder instance.
     */
    constructor() {
        super();

        this.enable = false;
        this.origin = "";
        this.methods = [];
        this.allowedHeaders = [];
        this.credentials = false;
        this.enableSendAndReceiveDebug = false;
        this.enablePostViaMsgPack = false;
        this.enablePostViaJson = false;
        this.trustProxy = false;
    }
}

export class HttpAppSettings extends BuilderBase {
    /**
     * Initializes a new HTTP app settings instance.
     * @param builder Provides the builder state copied into this instance.
     */
    constructor(builder: Builder) {
        super();

        this.origin = builder.getOrigin();
        this.methods = builder.getMethods();
        this.enable = builder.getEnable();
        this.allowedHeaders = builder.getAllowedHeaders();
        this.credentials = builder.getCredentials();
        this.enableSendAndReceiveDebug = builder.getEnableSendAndReceiveDebug();
        this.enablePostViaMsgPack = builder.getEnablePostViaMsgPack();
        this.enablePostViaJson = builder.getEnablePostViaJson();
        this.trustProxy = builder.getTrustProxy();
    }

    /**
     * Creates a new builder instance.
     * @returns Returns a new builder instance.
     */
    public static Builder(): Builder {
        return new Builder();
    }
}
