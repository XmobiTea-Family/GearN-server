const FIVE_MINUTE_TS = 5 * 60 * 1000;
const K_MULTIPLE = 5;

import express from "express";
import { Socket } from "socket.io";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { encode } from "@msgpack/msgpack";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { AuthInfo } from "./../../GN-common/entity/AuthInfo";
import * as mongoDB from "mongodb";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";

interface MaxRequestItem {
	id: string;
	count: number;
	tsLastUpdate: number;
}

enum RequestType {
	HTTP = 0,
	SOCKET = 1,
}

enum BanType {
	WHITE_LIST = 0,
	BLACK_LIST = 1,
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
	private banDdosCollection: mongoDB.Collection<mongoDB.Document>;
	
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

	private ipWhiteLst: string[];
	private ipBlackLst: string[];

	public setReportDdosCollection(reportDdosCollection: mongoDB.Collection<mongoDB.Document>) {
		this.reportDdosCollection = reportDdosCollection;
	}

	public setBanDdosCollection(banDdosCollection: mongoDB.Collection<mongoDB.Document>) {
		this.banDdosCollection = banDdosCollection;
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
		let returnCode = this.getReturnCodeForRequestSizeHttp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send([returnCode]);
		}

		return next();
	}

	public async checkRequestSizeBodyViaMsgPack(req: express.Request, res: express.Response, next: Function) {
        let returnCode = this.getReturnCodeForRequestSizeHttp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send(Buffer.from(encode([returnCode])));
		}

		return next();
	}

    private getReturnCodeForRequestSizeHttp(req: express.Request): number {
		let reqAny = req as any;
		let ip = reqAny.xip;

		let contentLengthStr: string = req.headers['content-length'];
		if (contentLengthStr) {
			let httpMaxRequestSize = this.httpMaxRequestSize;
			if (this.ipBlackLst.indexOf(ip) != -1) httpMaxRequestSize = httpMaxRequestSize / K_MULTIPLE;
			else if (this.ipWhiteLst.indexOf(ip) != -1) httpMaxRequestSize = httpMaxRequestSize * K_MULTIPLE;

			let contentLength = parseInt(contentLengthStr);
			if (contentLength > httpMaxRequestSize) {
				this.reportDdosCollection.insertOne({
					"ReturnCode": ReturnCode.MaxSizeRequestReject,
					//"Req": JSON.stringify(req),
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
		let ip = socket.data.IPAddress;

		try {
			let buffer = data[0] as Buffer;

			let socketMaxRequestSize = this.socketMaxRequestSize;
			if (this.ipBlackLst.indexOf(ip) != -1) socketMaxRequestSize = socketMaxRequestSize / K_MULTIPLE;
			else if (this.ipWhiteLst.indexOf(ip) != -1) socketMaxRequestSize = socketMaxRequestSize * K_MULTIPLE;

			if (buffer.length > socketMaxRequestSize) return;
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

		let socketMaxRequestPerSecondPerIp = this.socketMaxRequestPerSecondPerIp;
		if (this.ipBlackLst.indexOf(id) != -1) socketMaxRequestPerSecondPerIp = socketMaxRequestPerSecondPerIp / K_MULTIPLE;
		else if (this.ipWhiteLst.indexOf(id) != -1) socketMaxRequestPerSecondPerIp = socketMaxRequestPerSecondPerIp * K_MULTIPLE;

		if (socketRequestPerIPItem.count > socketMaxRequestPerSecondPerIp) {
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
			let ip = socket.data.IPAddress;

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

			let socketMaxRequestPerSecondPerPeer = this.socketMaxRequestPerSecondPerPeer;
			if (this.ipBlackLst.indexOf(ip) != -1) socketMaxRequestPerSecondPerPeer = socketMaxRequestPerSecondPerPeer / K_MULTIPLE;
			else if (this.ipWhiteLst.indexOf(ip) != -1) socketMaxRequestPerSecondPerPeer = socketMaxRequestPerSecondPerPeer * K_MULTIPLE;

			if (socketRequestPerPeerItem.count > socketMaxRequestPerSecondPerPeer) {
				this.reportDdosCollection.insertOne({
					"ReturnCode": ReturnCode.MaxRequestReject,
					"Peer": id,
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
		let returnCode = this.getReturnCodeForMaxRequestPerSecondPerIp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send([returnCode]);
		}

		return next();
	}

	public async checkMaxUploadRequestPerSecondPerIp(req: express.Request, res: express.Response, next: Function) {
		let returnCode = this.getReturnCodeForMaxRequestPerSecondPerIp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.sendStatus(429);
		}

		return next();
	}

    public async checkMaxRequestPerSecondPerIpViaMsgPack(req: express.Request, res: express.Response, next: Function) {
        let returnCode = this.getReturnCodeForMaxRequestPerSecondPerIp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send(Buffer.from(encode([returnCode])));
		}

		return next();
    }

	private getReturnCodeForMaxRequestPerSecondPerIp(req: express.Request): number {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let reqAny = req as any;
		let id = reqAny.xip;
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

		let httpMaxRequestPerSecondPerIp = this.httpMaxRequestPerSecondPerIp;
		if (this.ipBlackLst.indexOf(id) != -1) httpMaxRequestPerSecondPerIp = httpMaxRequestPerSecondPerIp / K_MULTIPLE;
		else if (this.ipWhiteLst.indexOf(id) != -1) httpMaxRequestPerSecondPerIp = httpMaxRequestPerSecondPerIp * K_MULTIPLE;

		if (httpRequestPerIPItem.count > httpMaxRequestPerSecondPerIp) {
			this.reportDdosCollection.insertOne({
				"ReturnCode": ReturnCode.MaxRequestReject,
				"IP": id,
				//"Req": JSON.stringify(req),
				"Count": httpRequestPerIPItem.count,
				"Type": RequestType.HTTP,
				"Ts": currentMilliseconds
			});

			return ReturnCode.MaxRequestReject;
		}

		return ReturnCode.Ok;
	}

    public async checkMaxRequestPerSecondPerPeerViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = this.getReturnCodeForMaxRequestPerSecondPerPeer(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send([returnCode]);
		}

		return next();
	}

    public async checkMaxUploadRequestPerSecondPerPeer(req: express.Request, res: express.Response, next: Function) {
		let returnCode = this.getReturnCodeForMaxRequestPerSecondPerPeer(req);
		if (returnCode != ReturnCode.Ok) {
			return res.sendStatus(429);
		}

		return next();
	}

    public async checkMaxRequestPerSecondPerPeerViaMsgPack(req: express.Request, res: express.Response, next: Function) {
        let returnCode = this.getReturnCodeForMaxRequestPerSecondPerPeer(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send(Buffer.from(encode([returnCode])));
		}

		return next();
    }

    private getReturnCodeForMaxRequestPerSecondPerPeer(req: express.Request): number {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let reqAny = req as any;
		let isAuthenticated = reqAny.isAuthenticated;
		let authInfo: AuthInfo = reqAny.authInfo;

		if (isAuthenticated && authInfo != null) {
			let id = authInfo.getUserId();
			let ip = reqAny.xip;

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
	
			let httpMaxRequestPerSecondPerPeer = this.httpMaxRequestPerSecondPerPeer;
			if (this.ipBlackLst.indexOf(ip) != -1) httpMaxRequestPerSecondPerPeer = httpMaxRequestPerSecondPerPeer / K_MULTIPLE;
			else if (this.ipWhiteLst.indexOf(ip) != -1) httpMaxRequestPerSecondPerPeer = httpMaxRequestPerSecondPerPeer * K_MULTIPLE;

			httpRequestPerPeerItem.count++;
			if (httpRequestPerPeerItem.count > httpMaxRequestPerSecondPerPeer) {
				this.reportDdosCollection.insertOne({
					"ReturnCode": ReturnCode.MaxRequestReject,
					"Peer": id,
					//"Req": JSON.stringify(req),
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
		let returnCode = this.getReturnCodeForPendingRequest(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send([returnCode]);
		}

		return next();
	}

	public async addPendingRequestViaMsgPack(req: express.Request, res: express.Response, next: Function) {
		let returnCode = this.getReturnCodeForPendingRequest(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send(Buffer.from(encode([returnCode])));
		}

		return next();
	}

	private getReturnCodeForPendingRequest(req: express.Request): number {
		if (this.currentHttpRequestCount > this.httpMaxPendingRequest) {
			this.reportDdosCollection.insertOne({
				"ReturnCode": ReturnCode.MaxRequestReject,
				//"Req": JSON.stringify(req),
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
		let reqAny = req as any;
		let ip = reqAny.xip;

		let maxUploadPendingRequest = this.maxUploadPendingRequest;
		if (this.ipBlackLst.indexOf(ip) != -1) maxUploadPendingRequest = maxUploadPendingRequest / K_MULTIPLE;
		else if (this.ipWhiteLst.indexOf(ip) != -1) maxUploadPendingRequest = maxUploadPendingRequest * K_MULTIPLE;

		if (this.currentHttpUploadRequestCount > maxUploadPendingRequest) {
			this.reportDdosCollection.insertOne({
				"ReturnCode": ReturnCode.MaxRequestReject,
				//"Req": JSON.stringify(req),
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
		let reqAny= req as any;
		let ip = reqAny.xip;

		let maxDownloadPendingRequest = this.maxDownloadPendingRequest;
		if (this.ipBlackLst.indexOf(ip) != -1) maxDownloadPendingRequest = maxDownloadPendingRequest / K_MULTIPLE;
		else if (this.ipWhiteLst.indexOf(ip) != -1) maxDownloadPendingRequest = maxDownloadPendingRequest * K_MULTIPLE;

		if (this.currentHttpDownloadRequestCount > maxDownloadPendingRequest) {
			this.reportDdosCollection.insertOne({
				"ReturnCode": ReturnCode.MaxRequestReject,
				//"Req": JSON.stringify(req),
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
			this.getBanDdos(); 
			this.clearHttpRequestPerIPDic();
			this.clearHttpRequestPerPeerDic();
			this.clearSocketRequestPerIPDic();
			this.clearSocketRequestPerPeerDic();
		}, FIVE_MINUTE_TS);
	}

	private async getBanDdos() {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		this.ipBlackLst.length = 0;
		this.ipWhiteLst.length = 0;

		try {
			let banDdosResults = await this.banDdosCollection.find({}).limit(500).toArray();
	
			for (let i = 0; i < banDdosResults.length; i++) {
				let banDdosResult = banDdosResults[i];
				let ip = banDdosResult.IP;

				if (banDdosResult.TsExpire == -1 || banDdosResult.TsExpire > currentMilliseconds) {
					if (banDdosResult.Type == BanType.BLACK_LIST) {
						this.ipBlackLst.push(ip);
					}
					else if (banDdosResult.Type == BanType.WHITE_LIST) {
						this.ipWhiteLst.push(ip);
					}
				}
			}
		}
		catch (err) {
			Debug.logException(err);
		}
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

		this.ipWhiteLst = [];
		this.ipBlackLst = [];
	}
}
