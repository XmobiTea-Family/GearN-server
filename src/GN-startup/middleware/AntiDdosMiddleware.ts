import express from "express";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { encode } from "@msgpack/msgpack";

export class AntiDdosMiddleware {
	private socketMaxRequestPerSecondPerIp: number;
	private socketMaxRequestPerSecondPerPeer: number;
	private socketMaxPendingRequest: number;
	private socketMaxRequestSize: number;

	private httpMaxRequestPerSecondPerIp: number;
	private httpMaxRequestPerSecondPerPeer: number;
	private httpMaxPendingRequest: number;
	private httpMaxRequestSize: number;

	private maxUploadPendingRequest: number;
	private maxDownloadPendingRequest: number;

	public setSocketMaxRequestPerSecondPerIp(socketMaxRequestPerSecondPerIp: number): void {
		this.socketMaxRequestPerSecondPerIp = socketMaxRequestPerSecondPerIp;
	}

	public setSocketMaxRequestPerSecondPerPeer(socketMaxRequestPerSecondPerPeer: number): void {
        this.socketMaxRequestPerSecondPerPeer = socketMaxRequestPerSecondPerPeer;
	}

    public setSocketMaxPendingRequest(socketMaxPendingRequest: number): void {
        this.socketMaxPendingRequest = socketMaxPendingRequest;
	}

    public setSocketMaxRequestSize(socketMaxRequestSize: number): void {
        this.socketMaxRequestSize = socketMaxRequestSize;
	}

	public setHttpMaxRequestPerSecondPerIp(httpMaxRequestPerSecondPerIp: number): void {
        this.httpMaxRequestPerSecondPerIp = httpMaxRequestPerSecondPerIp;
	}

	public setHttpMaxRequestPerSecondPerPeer(httpMaxRequestPerSecondPerPeer: number): void {
        this.httpMaxRequestPerSecondPerPeer = httpMaxRequestPerSecondPerPeer;
	}

    public setHttpMaxPendingRequest(httpMaxPendingRequest: number): void {
        this.httpMaxPendingRequest = httpMaxPendingRequest;
	}

    public setHttpMaxRequestSize(httpMaxRequestSize: number): void {
        this.httpMaxRequestSize = httpMaxRequestSize;
	}

    public setMaxUploadPendingRequest(maxUploadPendingRequest: number): void {
        this.maxUploadPendingRequest = maxUploadPendingRequest;
	}

    public setMaxDownloadPendingRequest(maxDownloadPendingRequest: number): void {
        this.maxDownloadPendingRequest = maxDownloadPendingRequest;
	}

	public async checkRequestSizeBodyViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodeForRequestSizeHttp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send([returnCode]);
		}

		return next();
	}

	public async checkRequestSizeBodyViaMsgPack(req: express.Request, res: express.Response, next: Function) {
        let returnCode = await this.getReturnCodeForRequestSizeHttp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send(Buffer.from(encode([returnCode])));
		}

		return next();
	}

    private async getReturnCodeForRequestSizeHttp(req: express.Request): Promise<number> {
		let contentLengthStr: string = req.headers['content-length'];
		if (contentLengthStr) {
			let contentLength = parseInt(contentLengthStr);
			if (contentLength > this.httpMaxRequestSize) {
				return ReturnCode.MaxSizeRequestReject;
			}
		}

		return ReturnCode.Ok;
	}

	public async checkMaxRequestPerSecondPerIpViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodeMaxRequestPerSecondPerIp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send([returnCode]);
		}

		return next();
	}

    public async checkMaxRequestPerSecondPerIpViaMsgPack(req: express.Request, res: express.Response, next: Function) {
        let returnCode = await this.getReturnCodeMaxRequestPerSecondPerIp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send(Buffer.from(encode([returnCode])));
		}

		return next();
    }

	private async getReturnCodeMaxRequestPerSecondPerIp(req: express.Request): Promise<number> {
		return ReturnCode.Ok;
	}

    public async checkMaxRequestPerSecondPerPeerViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodeMaxRequestPerSecondPerPeer(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send([returnCode]);
		}

		return next();
	}

    public async checkMaxRequestPerSecondPerPeerViaMsgPack(req: express.Request, res: express.Response, next: Function) {
        let returnCode = await this.getReturnCodeMaxRequestPerSecondPerPeer(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send(Buffer.from(encode([returnCode])));
		}

		return next();
    }

    // check request size for ip
    private async getReturnCodeMaxRequestPerSecondPerPeer(req: express.Request): Promise<number> {
		return ReturnCode.Ok;
	}

	public run() {

	}
}
