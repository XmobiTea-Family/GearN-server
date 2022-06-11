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

	protected reportDdosCollectionName: string;
	protected banDdosCollectionName: string;
	
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

	public getReportDdosCollectionName(): string {
		return this.reportDdosCollectionName;
	}

	public getBanDdosCollectionName(): string {
		return this.banDdosCollectionName;
	}

	constructor() {}
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

	public setReportDdosCollectionName(reportDdosCollectionName: string): Builder {
        this.reportDdosCollectionName = reportDdosCollectionName;
        return this;
	}

	public setBanDdosCollectionName(banDdosCollectionName: string): Builder {
        this.banDdosCollectionName = banDdosCollectionName;
        return this;
	}

	constructor() {
		super();
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

		this.reportDdosCollectionName = builder.getReportDdosCollectionName();
		this.banDdosCollectionName = builder.getBanDdosCollectionName();
	}

	public static Builder(): Builder {
		return new Builder();
	}
}
