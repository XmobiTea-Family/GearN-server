import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	// Stores the socket max request per second per IP value used by this instance.
	protected socketMaxRequestPerSecondPerIp: number;
	// Stores the socket max request per second per peer value used by this instance.
	protected socketMaxRequestPerSecondPerPeer: number;
	// Stores the socket max pending request value used by this instance.
	protected socketMaxPendingRequest: number;
	// Stores the socket max request size value used by this instance.
	protected socketMaxRequestSize: number;

	// Stores the HTTP max request per second per IP value used by this instance.
	protected httpMaxRequestPerSecondPerIp: number;
	// Stores the HTTP max request per second per peer value used by this instance.
	protected httpMaxRequestPerSecondPerPeer: number;
	// Stores the HTTP max pending request value used by this instance.
	protected httpMaxPendingRequest: number;
	// Stores the HTTP max request size value used by this instance.
	protected httpMaxRequestSize: number;

	// Stores the max upload pending request value used by this instance.
	protected maxUploadPendingRequest: number;
	// Stores the max download pending request value used by this instance.
	protected maxDownloadPendingRequest: number;

	// Stores the IP white list list used by this instance.
	protected ipWhiteList: string[];

	/**
	 * Returns the socket max request per second per IP.
	 * @returns Returns the socket max request per second per IP.
	 */
	public getSocketMaxRequestPerSecondPerIp(): number {
		return this.socketMaxRequestPerSecondPerIp;
	}

	/**
	 * Returns the socket max request per second per peer.
	 * @returns Returns the socket max request per second per peer.
	 */
	public getSocketMaxRequestPerSecondPerPeer(): number {
		return this.socketMaxRequestPerSecondPerPeer;
	}

	/**
	 * Returns the socket max pending request.
	 * @returns Returns the socket max pending request.
	 */
	public getSocketMaxPendingRequest(): number {
		return this.socketMaxPendingRequest;
	}

	/**
	 * Returns the socket max request size.
	 * @returns Returns the socket max request size.
	 */
	public getSocketMaxRequestSize(): number {
		return this.socketMaxRequestSize;
	}

	/**
	 * Returns the HTTP max request per second per IP.
	 * @returns Returns the HTTP max request per second per IP.
	 */
	public getHttpMaxRequestPerSecondPerIp(): number {
		return this.httpMaxRequestPerSecondPerIp;
	}

	/**
	 * Returns the HTTP max request per second per peer.
	 * @returns Returns the HTTP max request per second per peer.
	 */
	public getHttpMaxRequestPerSecondPerPeer(): number {
		return this.httpMaxRequestPerSecondPerPeer;
	}

	/**
	 * Returns the HTTP max pending request.
	 * @returns Returns the HTTP max pending request.
	 */
	public getHttpMaxPendingRequest(): number {
		return this.httpMaxPendingRequest;
	}

	/**
	 * Returns the HTTP max request size.
	 * @returns Returns the HTTP max request size.
	 */
	public getHttpMaxRequestSize(): number {
		return this.httpMaxRequestSize;
	}

	/**
	 * Returns the max upload pending request.
	 * @returns Returns the max upload pending request.
	 */
	public getMaxUploadPendingRequest(): number {
		return this.maxUploadPendingRequest;
	}

	/**
	 * Returns the max download pending request.
	 * @returns Returns the max download pending request.
	 */
	public getMaxDownloadPendingRequest(): number {
		return this.maxDownloadPendingRequest;
	}

	/**
	 * Returns the IP white list.
	 * @returns Returns the IP white list.
	 */
	public getIPWhiteList(): string[] {
		return this.ipWhiteList;
	}

	/**
	 * Initializes a new builder base instance.
	 */
	constructor() { }

}

class Builder extends BuilderBase implements IBuilder<DdosSettings> {
	/**
	 * Sets the socket max request per second per IP.
	 * @param socketMaxRequestPerSecondPerIp Provides the socket max request per second per IP value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setSocketMaxRequestPerSecondPerIp(socketMaxRequestPerSecondPerIp: number): Builder {
		this.socketMaxRequestPerSecondPerIp = socketMaxRequestPerSecondPerIp;
		return this;
	}

	/**
	 * Sets the socket max request per second per peer.
	 * @param socketMaxRequestPerSecondPerPeer Provides the socket max request per second per peer value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setSocketMaxRequestPerSecondPerPeer(socketMaxRequestPerSecondPerPeer: number): Builder {
		this.socketMaxRequestPerSecondPerPeer = socketMaxRequestPerSecondPerPeer;
		return this;
	}

	/**
	 * Sets the socket max pending request.
	 * @param socketMaxPendingRequest Provides the socket max pending request value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setSocketMaxPendingRequest(socketMaxPendingRequest: number): Builder {
		this.socketMaxPendingRequest = socketMaxPendingRequest;
		return this;
	}

	/**
	 * Sets the socket max request size.
	 * @param socketMaxRequestSize Provides the socket max request size value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setSocketMaxRequestSize(socketMaxRequestSize: number): Builder {
		this.socketMaxRequestSize = socketMaxRequestSize;
		return this;
	}

	/**
	 * Sets the HTTP max request per second per IP.
	 * @param httpMaxRequestPerSecondPerIp Provides the HTTP max request per second per IP value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setHttpMaxRequestPerSecondPerIp(httpMaxRequestPerSecondPerIp: number): Builder {
		this.httpMaxRequestPerSecondPerIp = httpMaxRequestPerSecondPerIp;
		return this;
	}

	/**
	 * Sets the HTTP max request per second per peer.
	 * @param httpMaxRequestPerSecondPerPeer Provides the HTTP max request per second per peer value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setHttpMaxRequestPerSecondPerPeer(httpMaxRequestPerSecondPerPeer: number): Builder {
		this.httpMaxRequestPerSecondPerPeer = httpMaxRequestPerSecondPerPeer;
		return this;
	}

	/**
	 * Sets the HTTP max pending request.
	 * @param httpMaxPendingRequest Provides the HTTP max pending request value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setHttpMaxPendingRequest(httpMaxPendingRequest: number): Builder {
		this.httpMaxPendingRequest = httpMaxPendingRequest;
		return this;
	}

	/**
	 * Sets the HTTP max request size.
	 * @param httpMaxRequestSize Provides the HTTP max request size value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setHttpMaxRequestSize(httpMaxRequestSize: number): Builder {
		this.httpMaxRequestSize = httpMaxRequestSize;
		return this;
	}

	/**
	 * Sets the max upload pending request.
	 * @param maxUploadPendingRequest Provides the max upload pending request value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setMaxUploadPendingRequest(maxUploadPendingRequest: number): Builder {
		this.maxUploadPendingRequest = maxUploadPendingRequest;
		return this;
	}

	/**
	 * Sets the max download pending request.
	 * @param maxDownloadPendingRequest Provides the max download pending request value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setMaxDownloadPendingRequest(maxDownloadPendingRequest: number): Builder {
		this.maxDownloadPendingRequest = maxDownloadPendingRequest;
		return this;
	}

	/**
	 * Sets the IP white list.
	 * @param ipWhiteList Provides the IP white list value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setIPWhiteList(ipWhiteList: string[]): Builder {
		this.ipWhiteList = ipWhiteList;
		return this;
	}

	/**
	 * Initializes a new builder instance.
	 */
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

	/**
	 * Builds the configured instance.
	 */
	public build() {
		return new DdosSettings(this);
	}

}

export class DdosSettings extends BuilderBase {
	/**
	 * Initializes a new DDoS settings instance.
	 * @param builder Provides the builder state copied into this instance.
	 */
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

	/**
	 * Creates a new builder instance.
	 * @returns Returns a new builder instance.
	 */
	public static Builder(): Builder {
		return new Builder();
	}

}
