import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
    // Stores the GearN token value used by this instance.
    protected gnToken: string;
    // Stores the auth token value used by this instance.
    protected authToken: string;
    // Indicates whether r ID should be used.
    protected userId: string;
    // Indicates whether remove.
    protected remove: boolean;
    // Stores the timestamp expire value used by this instance.
    protected tsExpire: number;
    // Stores the other datas collection used by this instance.
    protected otherDatas: { [k: string]: any };
    // Stores the timestamp last update value used by this instance.
    protected tsLastUpdate: number;
    // Stores the timestamp create value used by this instance.
    protected tsCreate: number;
    // Stores the secret key value used by this instance.
    protected secretKey: string;

    /**
     * Returns the GearN token.
     * @returns Returns the GearN token.
     */
    public getGNToken(): string {
        return this.gnToken;
    }

    /**
     * Returns the auth token.
     * @returns Returns the auth token.
     */
    public getAuthToken(): string {
        return this.authToken;
    }

    /**
     * Returns whether r ID should be used.
     * @returns Returns whether r ID should be used.
     */
    public getUserId(): string {
        return this.userId;
    }

    /**
     * Checks whether remove.
     * @returns Returns the operation result.
     */
    public isRemove(): boolean {
        return this.remove;
    }

    /**
     * Returns the timestamp expire.
     * @returns Returns the timestamp expire.
     */
    public getTsExpire(): number {
        return this.tsExpire;
    }

    /**
     * Returns the other datas.
     * @returns Returns the other datas.
     */
    public getOtherDatas(): {} {
        return this.otherDatas;
    }

    /**
     * Returns the timestamp last update.
     * @returns Returns the timestamp last update.
     */
    public getTsLastUpdate(): number {
        return this.tsLastUpdate;
    }

    /**
     * Returns the timestamp create.
     */
    public getTsCreate() {
        return this.tsCreate;
    }

    /**
     * Returns the secret key.
     * @returns Returns the secret key.
     */
    public getSecretKey(): string {
        return this.secretKey;
    }

    /**
     * Sets the timestamp create.
     * @param tsCreate Provides the timestamp create value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setTsCreate(tsCreate: number): Builder {
        //this.tsCreate = tsCreate;
        return this as Builder;
    }

    /**
     * Sets the GearN token.
     * @param gnToken Provides the GearN token value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setGNToken(gnToken: string): Builder {
        return this as Builder;
    }

    /**
     * Sets the auth token.
     * @param authToken Provides the auth token value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setAuthToken(authToken: string): Builder {
        return this as Builder;
    }

    /**
     * Sets whether r ID should be used.
     * @param userId Indicates whether r ID should be used.
     * @returns Returns the current builder instance.
     */
    public setUserId(userId: string): Builder {
        return this as Builder;
    }

    /**
     * Sets whether remove.
     * @param remove Provides the remove value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setRemove(remove: boolean): Builder {
        this.remove = remove;
        return this as Builder;
    }

    /**
     * Sets the timestamp expire.
     * @param tsExpire Provides the timestamp expire value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setTsExpire(tsExpire: number): Builder {
        //this.tsExpire = tsExpire;
        return this as Builder;
    }

    /**
     * Sets the timestamp last update.
     * @param tsLastUpdate Provides the timestamp last update value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setTsLastUpdate(tsLastUpdate: number): Builder {
        this.tsLastUpdate = tsLastUpdate;
        return this as Builder;
    }

    /**
     * Sets the other data.
     * @param key Provides the key value used by this operation.
     * @param value Provides the value value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setOtherData(key: string, value: any): Builder {
        this.otherDatas[key] = value;
        return this as Builder;
    }

    /**
     * Sets the other datas.
     * @param otherDatas Provides the other datas value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setOtherDatas(otherDatas: {}): Builder {
        this.otherDatas = otherDatas;
        return this as Builder;
    }

    /**
     * Removes the other data.
     * @param key Provides the key value used by this operation.
     * @returns Returns the operation result.
     */
    public removeOtherData(key: string): Builder {
        delete this.otherDatas[key];
        return this as Builder;
    }

    /**
     * Returns the other data.
     * @param key Provides the key value used by this operation.
     * @returns Returns the other data.
     */
    public getOtherData(key: string): any {
        return this.otherDatas[key];
    }

    /**
     * Sets the secret key.
     * @param secretKey Provides the secret key value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setSecretKey(secretKey: string): Builder {
        this.secretKey = secretKey;
        return this as Builder;
    }

    /**
     * Builds the configured instance.
     * @returns Returns the built auth info.
     */
    public build(): AuthInfo {
        return null;
    }

    /**
     * Initializes a new builder base instance.
     */
    constructor() {
        this.otherDatas = {};
    }
}

class Builder extends BuilderBase implements IBuilder<AuthInfo> {
    /**
     * Sets the GearN token.
     * @param gnToken Provides the GearN token value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setGNToken(gnToken: string): Builder {
        this.gnToken = gnToken;
        return this;
    }

    /**
     * Sets the auth token.
     * @param authToken Provides the auth token value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setAuthToken(authToken: string): Builder {
        this.authToken = authToken;
        return this as Builder;
    }

    /**
     * Sets whether r ID should be used.
     * @param userId Indicates whether r ID should be used.
     * @returns Returns the current builder instance.
     */
    public setUserId(userId: string): Builder {
        this.userId = userId;
        return this;
    }

    /**
     * Sets the timestamp expire.
     * @param tsExpire Provides the timestamp expire value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setTsExpire(tsExpire: number): Builder {
        this.tsExpire = tsExpire;
        return this;
    }

    /**
     * Sets the timestamp create.
     * @param tsCreate Provides the timestamp create value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setTsCreate(tsCreate: number): Builder {
        this.tsCreate = tsCreate;
        return this;
    }

    /**
     * Sets the secret key.
     * @param secretKey Provides the secret key value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setSecretKey(secretKey: string): Builder {
        this.secretKey = secretKey;
        return this;
    }

    /**
     * Builds the configured instance.
     * @returns Returns the built auth info.
     */
    public build(): AuthInfo {
        return new AuthInfo(this);
    }

    /**
     * Initializes a new builder instance.
     */
    constructor() {
        super();

        // this.methods = [];
        // this.allowedHeaders = [];
    }
}

export class AuthInfo extends BuilderBase {
    /**
     * Initializes a new auth info instance.
     * @param builder Provides the builder state copied into this instance.
     */
    constructor(builder: Builder) {
        super();

        this.gnToken = builder.getGNToken();
        this.authToken = builder.getAuthToken();
        this.userId = builder.getUserId();
        this.remove = builder.isRemove();
        this.tsExpire = builder.getTsExpire();
        this.otherDatas = builder.getOtherDatas();
        this.tsLastUpdate = builder.getTsLastUpdate();
        this.tsCreate = builder.getTsCreate();
        this.secretKey = builder.getSecretKey();
    }

    /**
     * Executes the to document data workflow.
     */
    public toDocumentData() {
        return {
            gnToken: this.gnToken,
            authToken: this.authToken,
            userId: this.userId,
            isRemove: this.remove,
            tsExpire: this.tsExpire,
            otherDatas: this.otherDatas,
            tsLastUpdate: this.tsLastUpdate,
            tsCreate: this.tsCreate,
            secretKey: this.secretKey,
        };
    }

    /**
     * Creates a new builder instance.
     * @returns Returns a new builder instance.
     */
    public static Builder(): Builder {
        return new Builder();
    }
}
