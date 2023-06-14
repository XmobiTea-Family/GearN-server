import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected authToken: string;
	protected userId: string;
	protected role: number;
	protected remove: boolean;
	protected tsExpire: number;
	protected otherUserLogin: boolean;
	protected otherDatas: { [k: string]: any };
	protected tsLastUpdate: number;
	protected socketId: string;
	protected socketRoomIds: string[];
	protected tsCreate: number;

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

	public getTsLastUpdate(): number {
		return this.tsLastUpdate;
	}

	public getSocketId(): string {
		return this.socketId;
	}

	public getSocketRoomIds(): string[] {
		return this.socketRoomIds;
	}

	public getTsCreate() {
		return this.tsCreate;
	}

	public setTsCreate(tsCreate: number): Builder {
		//this.tsCreate = tsCreate;
		return this as Builder;
	}

	public setSocketId(socketId: string): Builder {
		this.socketId = socketId;
		return this as Builder;
	}

	public setSocketRoomIds(roomIds: string[]): Builder {
		this.socketRoomIds = roomIds;
		return this as Builder;
	}

	public addSocketRoomId(roomId: string): Builder {
		if (this.socketRoomIds.indexOf(roomId) == -1)
			this.socketRoomIds.push(roomId);

		return this as Builder;
	}

	public removeSocketRoomId(roomId: string): Builder {
		let indexOf = this.socketRoomIds.indexOf(roomId);
		if (indexOf != -1)
			this.socketRoomIds.splice(indexOf, 1);

		return this as Builder;
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

	public setTsLastUpdate(tsLastUpdate: number): Builder {
		this.tsLastUpdate = tsLastUpdate;
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

	public build(): AuthInfo {
		return null;
	}

	constructor() {
		this.otherDatas = {};
		this.socketRoomIds = [];
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

	public setTsCreate(tsCreate: number): Builder {
		this.tsCreate = tsCreate;
		return this as Builder;
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
		this.tsLastUpdate = builder.getTsLastUpdate();
		this.socketId = builder.getSocketId();
		this.socketRoomIds = builder.getSocketRoomIds();
		this.tsCreate = builder.getTsCreate();
	}

	public toDocumentData() {
		return {
			"authToken": this.authToken,
			"userId": this.userId,
			"role": this.role,
			"isRemove": this.remove,
			"tsExpire": this.tsExpire,
			"otherUserLogin": this.otherUserLogin,
			"otherDatas": this.otherDatas,
			"socketId": this.socketId,
			"socketRoomIds": this.socketRoomIds,
			"tsCreate": this.tsCreate
		}
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
