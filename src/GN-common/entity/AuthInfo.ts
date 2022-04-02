import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected authToken: string;
	protected userId: string;
	protected role: number;
	protected remove: boolean;
	protected tsExpire: number;
	protected otherUserLogin: boolean;
	protected otherDatas: { [k: string]: any };

	public getAuthToken(): string {
		return this.authToken;
	}

	public getUserId(): string {
		return this.userId;
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

	public getOtherUserLogin(): boolean {
		return this.otherUserLogin;
	}

	public getOtherDatas(): {} {
		return this.otherDatas;
	}

	public setAuthToken(authToken: string): Builder {
		return this as Builder;
	}

	public setUserId(userId: string): Builder {
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

	public setOtherUserLogin(otherUserLogin: boolean): Builder {
		this.otherUserLogin = otherUserLogin;
		return this as Builder;
	}

	public setOtherData(key: string, value: any): Builder {
		this.otherDatas[key] = value;
		return this as Builder;
	}

	public removeOtherData(key: string): Builder {
		delete this.otherDatas[key];
		return this as Builder;
	}

	public getOtherData(key: string): any {
		return this.otherDatas[key];
	}

	public build(): AuthInfo {
		return null;
	}

	constructor() {
		this.otherDatas = {};
	}
}

class Builder extends BuilderBase implements IBuilder<AuthInfo> {
	public setAuthToken(authToken: string): Builder {
		this.authToken = authToken;
		return this;
	}

	public setUserId(userId: string): Builder {
		this.userId = userId;
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

	public build(): AuthInfo {
		return new AuthInfo(this);
	}

	constructor() {
		super();

		// this.methods = [];
		// this.allowedHeaders = [];
	}
}

export class AuthInfo extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.authToken = builder.getAuthToken();
		this.userId = builder.getUserId();
		this.role = builder.getRole();
		this.remove = builder.isRemove();
		this.tsExpire = builder.getTsExpire();
		this.otherUserLogin = builder.getOtherUserLogin();
		this.otherDatas = builder.getOtherDatas();
	}

	public static Builder(): Builder {
		return new Builder();
	}
}
