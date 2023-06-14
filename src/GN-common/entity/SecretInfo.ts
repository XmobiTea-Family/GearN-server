import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

export enum SecretRole {
    Admin,
    Server,
    Player,
}

abstract class BuilderBase {
	protected secretKey: string;
    protected role: number;
	protected remove: boolean;
	protected tsExpire: number;

	public getSecretKey(): string {
		return this.secretKey;
	}

	public getRole(): number {
		return this.role;
	}

	public isRemove(): boolean {
		return this.remove;
	}

	public getTsExpire(): number {
		return this.tsExpire;
	}

	public setSecretKey(secretKey: string): Builder {
		return this as Builder;
	}

	public setRole(role: number): Builder {
		return this as Builder;
	}

	public setIsRemove(remove: boolean): Builder {
		this.remove = remove;
		return this as Builder;
	}

	public setTsExpire(tsExpire: number): Builder {
		//this.tsExpire = tsExpire;
		return this as Builder;
	}

	public build(): AuthInfo {
		return null;
	}

	constructor() {

	}

}

class Builder extends BuilderBase implements IBuilder<SecretInfo> {
	public setSecretKey(secretKey: string): Builder {
        this.secretKey = secretKey;
		return this;
	}

	public setRole(role: number): Builder {
		this.role = role;
		return this;
	}

	public setTsExpire(tsExpire: number): Builder {
		this.tsExpire = tsExpire;
		return this;
	}

	public build(): SecretInfo {
		return new SecretInfo(this);
	}

	constructor() {
		super();
	}

}

export class SecretInfo extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.secretKey = builder.getSecretKey();
		this.role = builder.getRole();
		this.remove = builder.isRemove();
		this.tsExpire = builder.getTsExpire();
	}

	public toDocumentData() {
		return {
			"secretKey": this.secretKey,
			"role": this.role,
			"isRemove": this.remove,
			"tsExpire": this.tsExpire,
		}
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
