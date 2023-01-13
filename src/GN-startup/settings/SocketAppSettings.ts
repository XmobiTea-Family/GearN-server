import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

type MethodType = "GET" | "HEAD" | "PUT" | "PATCH" | "POST" | "DELETE" | "UPDATE";

abstract class BuilderBase {

	protected enable: boolean;
	protected origin: string;
	protected methods: MethodType[];
	protected allowedHeaders: string[];
	protected credentials: boolean;
	protected enableSendAndReceiveDebug: boolean;
	protected enablePostViaMsgPack: boolean;
	protected enablePostViaJson: boolean;
	protected pingInterval: number;
	protected pingTimeout: number;

	public getEnable(): boolean {
		return this.enable;
	}

	public getOrigin(): string {
		return this.origin;
	}

	public getMethods(): MethodType[] {
		return this.methods;
	}

	public getAllowedHeaders(): string[] {
		return this.allowedHeaders;
	}

	public getCredentials(): boolean {
		return this.credentials;
	}

	public getEnableSendAndReceiveDebug(): boolean {
		return this.enableSendAndReceiveDebug;
	}

	public getEnablePostViaMsgPack(): boolean {
		return this.enablePostViaMsgPack;
	}

	public getEnablePostViaJson(): boolean {
		return this.enablePostViaJson;
	}

	public getPingInterval(): number {
		return this.pingInterval;
	}

	public getPingTimeout(): number {
		return this.pingTimeout;
	}

	constructor() { }

}

class Builder extends BuilderBase implements IBuilder<SocketAppSettings> {
	public setOrigins(origin: string): Builder {
		this.origin = origin;
		return this;
	}

	public addMethod(methodType: MethodType): Builder {
		if (!this.methods.includes(methodType)) this.methods.push(methodType);
		return this;
	}

	public addMethods(methodTypes: MethodType[]): Builder {
		methodTypes.forEach((methodType) => this.addMethod(methodType));
		return this;
	}

	public removeMethod(methodType: MethodType): Builder {
		let indexOf = this.methods.indexOf(methodType);
		if (indexOf != -1) {
			this.methods.splice(indexOf, 1);
		}

		return this;
	}

	public addAllowedHeader(allowedHeader: string): Builder {
		if (!this.allowedHeaders.includes(allowedHeader)) this.allowedHeaders.push(allowedHeader);
		return this;
	}

	public addAllowedHeaders(allowedHeaders: string[]): Builder {
		allowedHeaders.forEach((allowedHeader) => this.addAllowedHeader(allowedHeader));
		return this;
	}

	public setCredentials(credentials: boolean): Builder {
		this.credentials = credentials;
		return this;
	}

	public setPingInterval(pingInterval: number): Builder {
		this.pingInterval = pingInterval;
		return this;
	}

	public setPingTimeout(pingTimeout: number): Builder {
		this.pingTimeout = pingTimeout;
		return this;
	}

	public setEnable(enable: boolean): Builder {
		this.enable = enable;
		return this;
	}

	public setEnableSendAndReceiveDebug(enableSendAndReceiveDebug: boolean): Builder {
		this.enableSendAndReceiveDebug = enableSendAndReceiveDebug;
		return this;
	}

	public setEnablePostViaMsgPack(enablePostViaMsgPack: boolean): Builder {
		this.enablePostViaMsgPack = enablePostViaMsgPack;
		return this;
	}

	public setEnablePostViaJson(enablePostViaJson: boolean): Builder {
		this.enablePostViaJson = enablePostViaJson;
		return this;
	}

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
		this.pingInterval = 5000;
		this.pingTimeout = 5000;
	}

	public build() {
		return new SocketAppSettings(this);
	}

}

export class SocketAppSettings extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.pingInterval = builder.getPingInterval();
		this.pingTimeout = builder.getPingTimeout();
		this.origin = builder.getOrigin();
		this.methods = builder.getMethods();
		this.enable = builder.getEnable();
		this.allowedHeaders = builder.getAllowedHeaders();
		this.credentials = builder.getCredentials();
		this.enableSendAndReceiveDebug = builder.getEnableSendAndReceiveDebug();
		this.enablePostViaMsgPack = builder.getEnablePostViaMsgPack();
		this.enablePostViaJson = builder.getEnablePostViaJson();
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
