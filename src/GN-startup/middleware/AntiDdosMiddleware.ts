const FIVE_MINUTE_TS = 5 * 60 * 1000;

import express from "express";
import { Socket } from "socket.io";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { encode } from "@msgpack/msgpack";
import { xDatetime } from "../../GN-library/xdatetime/lib/xDatetime";
import { AuthInfo } from "../../GN-common/entity/AuthInfo";
import * as mongoDB from "mongodb";
import { Debug } from "../../GN-library/xdebug/lib/xDebug";

interface MaxRequestItem {
	id: string;
	count: number;
	tsLastUpdate: number;
}

enum RequestType {
	HTTP = 0,
	SOCKET = 0,
}

export class AntiDdosMiddleware {
	private socketRequestPerIPDic: { [k: string]: MaxRequestItem };
	private socketRequestPerPeerDic: { [k: string]: MaxRequestItem };
	private httpRequestPerIPDic: { [k: string]: MaxRequestItem };
	private httpRequestPerPeerDic: { [k: string]: MaxRequestItem };
	private currentHttpRequestCount: number;
	private currentSocketRequestCount: number;
	private currentHttpUploadRequestCount: number;
	private currentHttpDownloadRequestCount: number;

	private reportDdosCollection: mongoDB.Collection<mongoDB.Document>;

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

	public setReportDdosCollection(reportDdosCollection: mongoDB.Collection<mongoDB.Document>) {
		this.reportDdosCollection = reportDdosCollection;
	}

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
				this.reportDdosCollection.insertOne({
					"ReturnCode": ReturnCode.MaxSizeRequestReject,
					"Req": req,
					"ContentLength": contentLength,
					"Type": RequestType.HTTP,
					"Ts": xDatetime.getCurrentMilliseconds()
				});

				return ReturnCode.MaxSizeRequestReject;
			}
		}

		return ReturnCode.Ok;
	}

	public async checkRequestSizeBodyViaSocket(socket: Socket, data: any, next: Function) {
		if (data.length != 1) return;

		try {
			let buffer = data[0] as Buffer;
			if (buffer.length > this.socketMaxRequestSize) return;
		}
		catch (err) {
			Debug.logException(err);
			return;
		}

		return next();
	}

	public async checkMaxRequestPerSecondPerIpViaSocket(socket: Socket, data: any, next: Function) {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let id = socket.data.IPAddress;
		
		let socketRequestPerIPItem = this.socketRequestPerIPDic[id];
		if (socketRequestPerIPItem == null) {
			socketRequestPerIPItem = {
				id: id,
				count: 0,
				tsLastUpdate: currentMilliseconds
			}

			this.socketRequestPerIPDic[id] = socketRequestPerIPItem;
		}

		if (socketRequestPerIPItem.tsLastUpdate + xDatetime.ONE_SECOND_MILLISECOND < currentMilliseconds) {
			socketRequestPerIPItem.tsLastUpdate = currentMilliseconds;
			socketRequestPerIPItem.count = 0;
		}

		socketRequestPerIPItem.count++;
		if (socketRequestPerIPItem.count > this.socketMaxRequestPerSecondPerIp) {
			this.reportDdosCollection.insertOne({
				"ReturnCode": ReturnCode.MaxRequestReject,
				"IP": id,
				"Data": data,
				"Count": socketRequestPerIPItem.count,
				"Type": RequestType.SOCKET,
				"Ts": currentMilliseconds
			});

			return;
		}

		return next();
	}

	public async checkMaxRequestPerSecondPerPeerViaSocket(socket: Socket, data: any, next: Function) {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let isAuthenticated = socket.data.isAuthenticated;
		let authInfo: AuthInfo = socket.data.authInfo;

		if (isAuthenticated && authInfo != null) {
			let id = authInfo.getUserId();
		
			let socketRequestPerPeerItem = this.socketRequestPerPeerDic[id];
			if (socketRequestPerPeerItem == null) {
				socketRequestPerPeerItem = {
					id: id,
					count: 0,
					tsLastUpdate: currentMilliseconds
				}
	
				this.socketRequestPerPeerDic[id] = socketRequestPerPeerItem;
			}
	
			if (socketRequestPerPeerItem.tsLastUpdate + xDatetime.ONE_SECOND_MILLISECOND < currentMilliseconds) {
				socketRequestPerPeerItem.tsLastUpdate = currentMilliseconds;
				socketRequestPerPeerItem.count = 0;
			}
	
			socketRequestPerPeerItem.count++;
			if (socketRequestPerPeerItem.count > this.socketMaxRequestPerSecondPerPeer) {
				this.reportDdosCollection.insertOne({
					"ReturnCode": ReturnCode.MaxRequestReject,
					"IP": id,
					"Data": data,
					"Count": socketRequestPerPeerItem.count,
					"Type": RequestType.SOCKET,
					"Ts": currentMilliseconds
				});
	
				return;
			}
		}

		return next();
	}

	public async checkMaxRequestPerSecondPerIpViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodeMaxRequestPerSecondPerIp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send([returnCode]);
		}

		return next();
	}

	public async checkMaxUploadRequestPerSecondPerIp(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodeMaxRequestPerSecondPerIp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.sendStatus(429);
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
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let reqAny = req as any;
		let id = reqAny.ip;
		let httpRequestPerIPItem = this.httpRequestPerIPDic[id];
		if (httpRequestPerIPItem == null) {
			httpRequestPerIPItem = {
				id: id,
				count: 0,
				tsLastUpdate: currentMilliseconds
			}

			this.httpRequestPerIPDic[id] = httpRequestPerIPItem;
		}

		if (httpRequestPerIPItem.tsLastUpdate + xDatetime.ONE_SECOND_MILLISECOND < currentMilliseconds) {
			httpRequestPerIPItem.tsLastUpdate = currentMilliseconds;
			httpRequestPerIPItem.count = 0;
		}

		httpRequestPerIPItem.count++;
		if (httpRequestPerIPItem.count > this.httpMaxRequestPerSecondPerIp) {
			this.reportDdosCollection.insertOne({
				"ReturnCode": ReturnCode.MaxRequestReject,
				"IP": id,
				"Req": req,
				"Count": httpRequestPerIPItem.count,
				"Type": RequestType.HTTP,
				"Ts": currentMilliseconds
			});

			return ReturnCode.MaxRequestReject;
		}

		return ReturnCode.Ok;
	}

    public async checkMaxRequestPerSecondPerPeerViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodeMaxRequestPerSecondPerPeer(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send([returnCode]);
		}

		return next();
	}

    public async checkMaxUploadRequestPerSecondPerPeer(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodeMaxRequestPerSecondPerPeer(req);
		if (returnCode != ReturnCode.Ok) {
			return res.sendStatus(429);
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

    private async getReturnCodeMaxRequestPerSecondPerPeer(req: express.Request): Promise<number> {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let reqAny = req as any;
		let isAuthenticated = reqAny.isAuthenticated;
		let authInfo: AuthInfo = reqAny.authInfo;

		if (isAuthenticated && authInfo != null) {
			let id = authInfo.getUserId();

			let httpRequestPerPeerItem = this.httpRequestPerPeerDic[id];
			if (httpRequestPerPeerItem == null) {
				httpRequestPerPeerItem = {
					id: id,
					count: 0,
					tsLastUpdate: currentMilliseconds
				}
	
				this.httpRequestPerPeerDic[id] = httpRequestPerPeerItem;
			}
	
			if (httpRequestPerPeerItem.tsLastUpdate + xDatetime.ONE_SECOND_MILLISECOND < currentMilliseconds) {
				httpRequestPerPeerItem.tsLastUpdate = currentMilliseconds;
				httpRequestPerPeerItem.count = 0;
			}
	
			httpRequestPerPeerItem.count++;
			if (httpRequestPerPeerItem.count > this.httpMaxRequestPerSecondPerPeer) {
				this.reportDdosCollection.insertOne({
					"ReturnCode": ReturnCode.MaxRequestReject,
					"Peer": id,
					"Req": req,
					"Count": httpRequestPerPeerItem.count,
					"Type": RequestType.HTTP,
					"Ts": currentMilliseconds
				});

				return ReturnCode.MaxRequestReject;
			}
		}
		
		return ReturnCode.Ok;
	}

	public async addPendingRequestViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodePendingRequest(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send([returnCode]);
		}

		return next();
	}

	public async addPendingRequestViaMsgPack(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodePendingRequest(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send(Buffer.from(encode([returnCode])));
		}

		return next();
	}

	private async getReturnCodePendingRequest(req: express.Request): Promise<number> {
		if (this.currentHttpRequestCount > this.httpMaxPendingRequest) {
			this.reportDdosCollection.insertOne({
				"ReturnCode": ReturnCode.MaxRequestReject,
				"Req": req,
				"CurrentHttpRequestCount": this.currentHttpRequestCount,
				"Type": RequestType.HTTP,
				"Ts": xDatetime.getCurrentMilliseconds()
			});

			return ReturnCode.MaxRequestReject;
		}
		
		this.currentHttpRequestCount += 1;
		return ReturnCode.Ok;
	}

	public removePendingRequest(req: express.Request, res: express.Response) {
		if (this.currentHttpRequestCount > 0) this.currentHttpRequestCount -= 1;
	}

	public async addPendingUploadRequest(req: express.Request, res: express.Response, next: Function) {
		if (this.currentHttpUploadRequestCount > this.maxUploadPendingRequest) {
			this.reportDdosCollection.insertOne({
				"ReturnCode": ReturnCode.MaxRequestReject,
				"Req": req,
				"CurrentHttpUploadRequestCount": this.currentHttpUploadRequestCount,
				"Type": RequestType.HTTP,
				"Ts": xDatetime.getCurrentMilliseconds()
			});

			return res.sendStatus(429);
		}
		
		this.currentHttpUploadRequestCount += 1;
		return next();
	}

	public removePendingUploadRequest(req: express.Request, res: express.Response) {
		if (this.currentHttpUploadRequestCount > 0) this.currentHttpUploadRequestCount -= 1;
	}

	public addPendingRequestViaSocket(socket: Socket, data: any, next: Function) {
		if (this.currentHttpUploadRequestCount > this.socketMaxPendingRequest) {
			this.reportDdosCollection.insertOne({
				"ReturnCode": ReturnCode.MaxRequestReject,
				"Data": data,
				"CurrentHttpUploadRequestCount": this.currentHttpUploadRequestCount,
				"Type": RequestType.HTTP,
				"Ts": xDatetime.getCurrentMilliseconds()
			});

			return;
		}
		
		this.currentSocketRequestCount += 1;
		return next();
	}

	public removePendingRequestViaSocket(socket: Socket, data: any) {
		if (this.currentSocketRequestCount > 0) this.currentSocketRequestCount -= 1;
	}

	public async addPendingDownloadRequest(req: express.Request, res: express.Response, next: Function) {
		if (this.currentHttpDownloadRequestCount > this.maxDownloadPendingRequest) {
			this.reportDdosCollection.insertOne({
				"ReturnCode": ReturnCode.MaxRequestReject,
				"Req": req,
				"CurrentHttpDownloadRequestCount": this.currentHttpDownloadRequestCount,
				"Type": RequestType.HTTP,
				"Ts": xDatetime.getCurrentMilliseconds()
			});

			return res.sendStatus(429);
		}
		
		this.currentHttpDownloadRequestCount += 1;
		return next();
	}

	public removePendingDownloadRequest(req: express.Request, res: express.Response) {
		if (this.currentHttpDownloadRequestCount > 0) this.currentHttpDownloadRequestCount -= 1;
	}

	public run() {
		setInterval(() => {
			this.clearHttpRequestPerIPDic();
			this.clearHttpRequestPerPeerDic();
			this.clearSocketRequestPerIPDic();
			this.clearSocketRequestPerPeerDic();
		}, FIVE_MINUTE_TS);
	}

	private clearHttpRequestPerIPDic(): void {
		try {
			let removeCount = 0;

			let currentMilliseconds = xDatetime.getCurrentMilliseconds();
			let tsRemove = currentMilliseconds - xDatetime.ONE_SECOND_MILLISECOND;

			let httpRequestPerIPLst = Object.values(this.httpRequestPerIPDic);
			
			for (let i = 0; i < httpRequestPerIPLst.length; i++) {
				let httpRequestPerIP = httpRequestPerIPLst[i];

				if (httpRequestPerIP != null) {
					if (httpRequestPerIP.tsLastUpdate < tsRemove) {
						delete this.httpRequestPerIPDic[httpRequestPerIP.id];
						removeCount++;
					}
				}
			}
		}
		catch (err) {
			Debug.logException(err);
		}
	}

	private clearHttpRequestPerPeerDic(): void {
		try {
			let removeCount = 0;

			let currentMilliseconds = xDatetime.getCurrentMilliseconds();
			let tsRemove = currentMilliseconds - xDatetime.ONE_SECOND_MILLISECOND;

			let httpRequestPerPeerLst = Object.values(this.httpRequestPerPeerDic);
			
			for (let i = 0; i < httpRequestPerPeerLst.length; i++) {
				let httpRequestPerPeer = httpRequestPerPeerLst[i];

				if (httpRequestPerPeer != null) {
					if (httpRequestPerPeer.tsLastUpdate < tsRemove) {
						delete this.httpRequestPerPeerDic[httpRequestPerPeer.id];
						removeCount++;
					}
				}
			}
		}
		catch (err) {
			Debug.logException(err);
		}
	}

	private clearSocketRequestPerIPDic(): void {
		try {
			let removeCount = 0;

			let currentMilliseconds = xDatetime.getCurrentMilliseconds();
			let tsRemove = currentMilliseconds - xDatetime.ONE_SECOND_MILLISECOND;

			let socketRequestPerIPLst = Object.values(this.socketRequestPerIPDic);
			
			for (let i = 0; i < socketRequestPerIPLst.length; i++) {
				let socketRequestPerIP = socketRequestPerIPLst[i];

				if (socketRequestPerIP != null) {
					if (socketRequestPerIP.tsLastUpdate < tsRemove) {
						delete this.socketRequestPerIPDic[socketRequestPerIP.id];
						removeCount++;
					}
				}
			}
		}
		catch (err) {
			Debug.logException(err);
		}
	}

	private clearSocketRequestPerPeerDic(): void {
		try {
			let removeCount = 0;

			let currentMilliseconds = xDatetime.getCurrentMilliseconds();
			let tsRemove = currentMilliseconds - xDatetime.ONE_SECOND_MILLISECOND;

			let socketRequestPerPeerLst = Object.values(this.socketRequestPerPeerDic);
			
			for (let i = 0; i < socketRequestPerPeerLst.length; i++) {
				let socketRequestPerPeer = socketRequestPerPeerLst[i];

				if (socketRequestPerPeer != null) {
					if (socketRequestPerPeer.tsLastUpdate < tsRemove) {
						delete this.socketRequestPerPeerDic[socketRequestPerPeer.id];
						removeCount++;
					}
				}
			}
		}
		catch (err) {
			Debug.logException(err);
		}
	}

	constructor() {
		this.socketRequestPerIPDic = {};
		this.socketRequestPerPeerDic = {};
		this.httpRequestPerIPDic = {};
		this.httpRequestPerPeerDic = {};

		this.currentHttpRequestCount = 0;
		this.currentSocketRequestCount = 0;
		this.currentHttpUploadRequestCount = 0;
		this.currentHttpDownloadRequestCount = 0;
	}
}
