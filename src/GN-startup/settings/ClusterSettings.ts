import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

interface NodeInfo {
    // Stores the instance ID value used by this contract.
    instanceId: string;
    // Stores the full URL value used by this contract.
    fullUrl: string;
}

abstract class BuilderBase {
    // Stores the instance ID value used by this instance.
    protected instanceId: string;
    // Indicates whether primary.
    protected isPrimary: boolean;
    // Stores the private key token value used by this instance.
    protected privateKeyToken: string;
    // Stores the all nodes list used by this instance.
    protected allNodes: NodeInfo[];

    /**
     * Returns the instance ID.
     * @returns Returns the instance ID.
     */
    public getInstanceId(): string {
        return this.instanceId;
    }

    /**
     * Returns whether primary.
     * @returns Returns whether primary.
     */
    public getIsPrimary(): boolean {
        return this.isPrimary;
    }

    /**
     * Returns the private key token.
     * @returns Returns the private key token.
     */
    public getPrivateKeyToken(): string {
        return this.privateKeyToken;
    }

    /**
     * Returns all nodes.
     * @returns Returns all nodes.
     */
    public getAllNodes(): NodeInfo[] {
        return this.allNodes;
    }

    /**
     * Initializes a new builder base instance.
     */
    constructor() {}
}

class Builder extends BuilderBase implements IBuilder<ClusterSettings> {
    /**
     * Sets the instance ID.
     * @param instanceId Provides the instance ID value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setInstanceId(instanceId: string): Builder {
        this.instanceId = instanceId;
        return this;
    }

    /**
     * Sets whether primary.
     * @param isPrimary Indicates whether primary.
     * @returns Returns the current builder instance.
     */
    public setIsPrimary(isPrimary: boolean): Builder {
        this.isPrimary = isPrimary;
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
     * Sets the all nodes.
     * @param allNodes Provides the all nodes value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setAllNodes(allNodes: NodeInfo[]): Builder {
        this.allNodes = allNodes;
        return this;
    }

    /**
     * Initializes a new builder instance.
     */
    constructor() {
        super();

        this.instanceId = "";
        this.isPrimary = false;
        this.privateKeyToken = "";

        this.allNodes = [];
    }

    /**
     * Builds the configured instance.
     */
    public build() {
        return new ClusterSettings(this);
    }
}

export class ClusterSettings extends BuilderBase {
    /**
     * Initializes a new cluster settings instance.
     * @param builder Provides the builder state copied into this instance.
     */
    constructor(builder: Builder) {
        super();

        this.instanceId = builder.getInstanceId();
        this.isPrimary = builder.getIsPrimary();
        this.privateKeyToken = builder.getPrivateKeyToken();

        this.allNodes = builder.getAllNodes();
    }

    /**
     * Creates a new builder instance.
     * @returns Returns a new builder instance.
     */
    public static Builder(): Builder {
        return new Builder();
    }
}
