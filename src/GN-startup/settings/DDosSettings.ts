import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected socketMaxRequestPerSecondPerIp: number;
	protected socketMaxRequestPerSecondPerPeer: number;
	protected socketMaxPendingRequest: number;
	protected socketMaxRequestSize: number;

	protected httpMaxRequestPerSecondPerIp: number;
	protected httpMaxRequestPerSecondPerPeer: number;
	protected httpMaxPendingRequest: number;
	protected httpMaxRequestSize: number;

	protected maxUploadPendingRequest: number;
	protected maxDownloadPendingRequest: number;

	protected ipWhiteList: string[];

	public getSocketMaxRequestPerSecondPerIp(): number {
		return this.socketMaxRequestPerSecondPerIp;
	}

	public getSocketMaxRequestPerSecondPerPeer(): number {
		return this.socketMaxRequestPerSecondPerPeer;
	}

	public getSocketMaxPendingRequest(): number {
		return this.socketMaxPendingRequest;
	}

	public getSocketMaxRequestSize(): number {
		return this.socketMaxRequestSize;
	}

	public getHttpMaxRequestPerSecondPerIp(): number {
		return this.httpMaxRequestPerSecondPerIp;
	}

	public getHttpMaxRequestPerSecondPerPeer(): number {
		return this.httpMaxRequestPerSecondPerPeer;
	}

	public getHttpMaxPendingRequest(): number {
		return this.httpMaxPendingRequest;
	}

	public getHttpMaxRequestSize(): number {
		return this.httpMaxRequestSize;
	}

	public getMaxUploadPendingRequest(): number {
		return this.maxUploadPendingRequest;
	}

	public getMaxDownloadPendingRequest(): number {
		return this.maxDownloadPendingRequest;
	}

	public getIPWhiteList(): string[] {
		return this.ipWhiteList;
	}

	constructor() { }

}

class Builder extends BuilderBase implements IBuilder<DdosSettings> {
	public setSocketMaxRequestPerSecondPerIp(socketMaxRequestPerSecondPerIp: number): Builder {
		this.socketMaxRequestPerSecondPerIp = socketMaxRequestPerSecondPerIp;
		return this;
	}

	public setSocketMaxRequestPerSecondPerPeer(socketMaxRequestPerSecondPerPeer: number): Builder {
		this.socketMaxRequestPerSecondPerPeer = socketMaxRequestPerSecondPerPeer;
		return this;
	}

	public setSocketMaxPendingRequest(socketMaxPendingRequest: number): Builder {
		this.socketMaxPendingRequest = socketMaxPendingRequest;
		return this;
	}

	public setSocketMaxRequestSize(socketMaxRequestSize: number): Builder {
		this.socketMaxRequestSize = socketMaxRequestSize;
		return this;
	}

	public setHttpMaxRequestPerSecondPerIp(httpMaxRequestPerSecondPerIp: number): Builder {
		this.httpMaxRequestPerSecondPerIp = httpMaxRequestPerSecondPerIp;
		return this;
	}

	public setHttpMaxRequestPerSecondPerPeer(httpMaxRequestPerSecondPerPeer: number): Builder {
		this.httpMaxRequestPerSecondPerPeer = httpMaxRequestPerSecondPerPeer;
		return this;
	}

	public setHttpMaxPendingRequest(httpMaxPendingRequest: number): Builder {
		this.httpMaxPendingRequest = httpMaxPendingRequest;
		return this;
	}

	public setHttpMaxRequestSize(httpMaxRequestSize: number): Builder {
		this.httpMaxRequestSize = httpMaxRequestSize;
		return this;
	}

	public setMaxUploadPendingRequest(maxUploadPendingRequest: number): Builder {
		this.maxUploadPendingRequest = maxUploadPendingRequest;
		return this;
	}

	public setMaxDownloadPendingRequest(maxDownloadPendingRequest: number): Builder {
		this.maxDownloadPendingRequest = maxDownloadPendingRequest;
		return this;
	}

	public setIPWhiteList(ipWhiteList: string[]): Builder {
		this.ipWhiteList = ipWhiteList;
		return this;
	}

	constructor() {
		super();

		this.socketMaxRequestPerSecondPerIp = 0;
		this.socketMaxRequestPerSecondPerPeer = 0;
		this.socketMaxPendingRequest = 0;
		this.socketMaxRequestSize = 0;

		this.httpMaxRequestPerSecondPerIp = 0;
		this.httpMaxRequestPerSecondPerPeer = 0;
		this.httpMaxPendingRequest = 0;
		this.httpMaxRequestSize = 0;

		this.maxUploadPendingRequest = 0;
		this.maxDownloadPendingRequest = 0;

		this.ipWhiteList = [];
	}

	public build() {
		return new DdosSettings(this);
	}

}

export class DdosSettings extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.socketMaxRequestPerSecondPerIp = builder.getSocketMaxRequestPerSecondPerIp();
		this.socketMaxRequestPerSecondPerPeer = builder.getSocketMaxRequestPerSecondPerPeer();
		this.socketMaxPendingRequest = builder.getSocketMaxPendingRequest();
		this.socketMaxRequestSize = builder.getSocketMaxRequestSize();

		this.httpMaxRequestPerSecondPerIp = builder.getHttpMaxRequestPerSecondPerIp();
		this.httpMaxRequestPerSecondPerPeer = builder.getHttpMaxRequestPerSecondPerPeer();
		this.httpMaxPendingRequest = builder.getHttpMaxPendingRequest();
		this.httpMaxRequestSize = builder.getHttpMaxRequestSize();

		this.maxUploadPendingRequest = builder.getMaxUploadPendingRequest();
		this.maxDownloadPendingRequest = builder.getMaxDownloadPendingRequest();

		this.ipWhiteList = builder.getIPWhiteList();
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
