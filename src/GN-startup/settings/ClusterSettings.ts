import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

interface NodeInfo {
    instanceId: string;
    fullUrl: string;
}

abstract class BuilderBase {
    protected instanceId: string;
    protected isPrimary: boolean;
    protected privateKeyToken: string;
    protected allNodes: NodeInfo[];

    public getInstanceId(): string {
        return this.instanceId;
    }

    public getIsPrimary(): boolean {
        return this.isPrimary;
    }

    public getPrivateKeyToken(): string {
        return this.privateKeyToken;
    }

    public getAllNodes(): NodeInfo[] {
        return this.allNodes;
    }

    constructor() { }

}

class Builder extends BuilderBase implements IBuilder<ClusterSettings> {
    public setInstanceId(instanceId: string): Builder {
        this.instanceId = instanceId;
        return this;
    }

    public setIsPrimary(isPrimary: boolean): Builder {
        this.isPrimary = isPrimary;
        return this;
    }

    public setPrivateKeyToken(privateKeyToken: string): Builder {
        this.privateKeyToken = privateKeyToken;
        return this;
    }

    public setAllNodes(allNodes: NodeInfo[]): Builder {
        this.allNodes = allNodes;
        return this;
    }

    constructor() {
        super();

        this.instanceId = "";
        this.isPrimary = false;
        this.privateKeyToken = "";

        this.allNodes = [];
    }

    public build() {
        return new ClusterSettings(this);
    }

}

export class ClusterSettings extends BuilderBase {
    constructor(builder: Builder) {
        super();

        this.instanceId = builder.getInstanceId();
        this.isPrimary = builder.getIsPrimary();
        this.privateKeyToken = builder.getPrivateKeyToken();

        this.allNodes = builder.getAllNodes();
    }

    public static Builder(): Builder {
        return new Builder();
    }

}
