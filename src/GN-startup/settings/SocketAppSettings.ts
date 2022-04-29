import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected enable: boolean;
	protected pingInterval: number;
	protected pingTimeout: number;
	protected enableSendAndReceiveDebug: boolean;

	public getEnable(): boolean {
		return this.enable;
	}

	public getPingInterval(): number {
		return this.pingInterval;
	}

	public getPingTimeout(): number {
		return this.pingTimeout;
	}

	public getEnableSendAndReceiveDebug(): boolean {
		return this.enableSendAndReceiveDebug;
	}

	constructor() {}
}

class Builder extends BuilderBase implements IBuilder<SocketAppSettings> {
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

	public build() {
		return new SocketAppSettings(this);
	}

	constructor() {
		super();
	}
}

export class SocketAppSettings extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.pingInterval = builder.getPingInterval();
		this.pingTimeout = builder.getPingTimeout();
		this.enable = builder.getEnable();
		this.enableSendAndReceiveDebug = builder.getEnableSendAndReceiveDebug();
	}

	public static Builder(): Builder {
		return new Builder();
	}
}
