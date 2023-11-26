import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected gnToken: string;
	protected authToken: string;
	protected userId: string;
	protected remove: boolean;
	protected tsExpire: number;
	protected otherDatas: { [k: string]: any };
	protected tsLastUpdate: number;
	protected tsCreate: number;
	protected secretKey: string;

	public getGNToken(): string {
		return this.gnToken;
	}

	public getAuthToken(): string {
		return this.authToken;
	}

	public getUserId(): string {
		return this.userId;
	}

	public isRemove(): boolean {
		return this.remove;
	}

	public getTsExpire(): number {
		return this.tsExpire;
	}

	public getOtherDatas(): {} {
		return this.otherDatas;
	}

	public getTsLastUpdate(): number {
		return this.tsLastUpdate;
	}

	public getTsCreate() {
		return this.tsCreate;
	}

	public getSecretKey(): string {
		return this.secretKey;
	}

	public setTsCreate(tsCreate: number): Builder {
		//this.tsCreate = tsCreate;
		return this as Builder;
	}

	public setGNToken(gnToken: string): Builder {
		return this as Builder;
	}

	public setAuthToken(authToken: string): Builder {
		return this as Builder;
	}

	public setUserId(userId: string): Builder {
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

	public setTsLastUpdate(tsLastUpdate: number): Builder {
		this.tsLastUpdate = tsLastUpdate;
		return this as Builder;
	}

	public setOtherData(key: string, value: any): Builder {
		this.otherDatas[key] = value;
		return this as Builder;
	}

	public setOtherDatas(otherDatas: {}): Builder {
		this.otherDatas = otherDatas;
		return this as Builder;
	}

	public removeOtherData(key: string): Builder {
		delete this.otherDatas[key];
		return this as Builder;
	}

	public getOtherData(key: string): any {
		return this.otherDatas[key];
	}

	public setSecretKey(secretKey: string): Builder {
		this.secretKey = secretKey;
		return this as Builder;
	}

	public build(): AuthInfo {
		return null;
	}

	constructor() {
		this.otherDatas = {};
	}

}

class Builder extends BuilderBase implements IBuilder<AuthInfo> {
	public setGNToken(gnToken: string): Builder {
		this.gnToken = gnToken;
		return this;
	}

	public setAuthToken(authToken: string): Builder {
		this.authToken = authToken;
		return this as Builder;
	}

	public setUserId(userId: string): Builder {
		this.userId = userId;
		return this;
	}

	public setTsExpire(tsExpire: number): Builder {
		this.tsExpire = tsExpire;
		return this;
	}

	public setTsCreate(tsCreate: number): Builder {
		this.tsCreate = tsCreate;
		return this;
	}

	public setSecretKey(secretKey: string): Builder {
		this.secretKey = secretKey;
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

	public toDocumentData() {
		return {
			"gnToken": this.gnToken,
			"authToken": this.authToken,
			"userId": this.userId,
			"isRemove": this.remove,
			"tsExpire": this.tsExpire,
			"otherDatas": this.otherDatas,
			"tsCreate": this.tsCreate,
			"secretKey": this.secretKey
		}
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
