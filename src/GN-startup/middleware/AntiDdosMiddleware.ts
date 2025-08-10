import express from "express";
import { Socket } from "socket.io";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { encode } from "@msgpack/msgpack";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { AuthInfo } from "./../../GN-common/entity/AuthInfo";
import * as mongoDB from "mongodb";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { Commands } from "./../../GN-common/constant/Commands";
import { RequestRole } from "./../../GN-common/constant/enumType/RequestRole";

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
	private static readonly FIVE_MINUTE_TS: number = 5 * 60 * 1000;
	private static readonly K_MULTIPLE_ADMIN: number = 500;
	private static readonly K_MULTIPLE_WHITE_LIST: number = 100;
	private static readonly K_MULTIPLE_BLACK_LIST: number = 5;

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

	private defaultIPWhiteLst: string[];
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

	public setIPWhiteList(ipWhiteList: string[]): void {
		this.defaultIPWhiteLst = ipWhiteList;
		if (this.defaultIPWhiteLst) {
			for (let j = 0; j < this.defaultIPWhiteLst.length; j++) {
				let defaultIP = this.defaultIPWhiteLst[j];
				if (!this.ipWhiteLst.includes(defaultIP)) this.ipWhiteLst.push(defaultIP);
			}
		}
	}

	public async checkRequestSizeBodyViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = this.getReturnCodeForRequestSizeHttp(req);
		if (returnCode != ReturnCode.Ok) {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
			return res.send({
				returnCode: returnCode,
			});
		}

		return next();
	}

	public async checkRequestSizeBodyViaMsgPack(req: express.Request, res: express.Response, next: Function) {
		let returnCode = this.getReturnCodeForRequestSizeHttp(req);
		if (returnCode != ReturnCode.Ok) {
			let content = Buffer.from(encode({ returnCode: returnCode }));
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
			res.setHeader(Commands.CONTENT_LENGTH, content.length);
			return res.send(content);
		}

		return next();
	}

	private getReturnCodeForRequestSizeHttp(req: express.Request): number {
		let url = req.url;
		if (url == "/dashboard/client/setSecretInfoInformation"
			|| url == "/dashboard/client/setMasterGameSettings"
			|| url == "/dashboard/client/createSecretInfo"
			|| url == "/dashboard/client/setGameInformation"
			|| url == "/dashboard/client/setEventCallbackCloudScript"
			|| url == "/content/admin/setContentData/admin"
			|| url == "/cloudscript/admin/addFunction/admin"
		) {
			return ReturnCode.Ok;
		}

		let contentLengthStr: string = req.header(Commands.CONTENT_LENGTH);
		if (contentLengthStr) {
			let ip = req.xip;

			let httpMaxRequestSize = this.httpMaxRequestSize;
			if (this.ipWhiteLst.includes(ip)) httpMaxRequestSize = httpMaxRequestSize * AntiDdosMiddleware.K_MULTIPLE_WHITE_LIST;
			else {
				let role = Number.parseInt(req.params.role);
				if (!Number.isNaN(role)) {
					if (role == RequestRole.Admin || role == RequestRole.Server) httpMaxRequestSize = httpMaxRequestSize * AntiDdosMiddleware.K_MULTIPLE_ADMIN;
				}
			}

			let contentLength = parseInt(contentLengthStr);
			if (contentLength > httpMaxRequestSize) {
				this.reportDdosCollection.insertOne({
					returnCode: ReturnCode.MaxSizeRequestReject,
					contentLength: contentLength,
					type: RequestType.HTTP,
					tsCreate: xDatetime.getCurrentMilliseconds()
				});

				return ReturnCode.MaxSizeRequestReject;
			}
		}

		return ReturnCode.Ok;
	}

	public async checkRequestSizeBodyViaSocketMsgPack(socket: Socket, data: any, next: Function) {
		if (data.length != 1) return;
		let ip = socket.data.IPAddress;

		try {
			let buffer = data[0] as Buffer;

			let socketMaxRequestSize = this.socketMaxRequestSize;
			if (this.ipWhiteLst.includes(ip)) socketMaxRequestSize = socketMaxRequestSize * AntiDdosMiddleware.K_MULTIPLE_WHITE_LIST;

			if (buffer.length > socketMaxRequestSize) return;
		}
		catch (err) {
			Debug.logException(err);
			return;
		}

		return next();
	}

	public async checkRequestSizeBodyViaSocketJson(socket: Socket, data: any, next: Function) {
		if (data.length != 1) return;
		let ip = socket.data.IPAddress;

		try {
			let buffer = data[0];

			let socketMaxRequestSize = this.socketMaxRequestSize;
			if (this.ipWhiteLst.includes(ip)) socketMaxRequestSize = socketMaxRequestSize * AntiDdosMiddleware.K_MULTIPLE_WHITE_LIST;

			if (JSON.stringify(buffer).length > socketMaxRequestSize) return;
		}
		catch (err) {
			Debug.logException(err);
			return;
		}

		return next();
	}

	public async checkMaxRequestPerSecondPerIpViaSocket(socket: Socket, data: any, next: Function) {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let ip = socket.data.IPAddress;

		let socketRequestPerIPItem = this.socketRequestPerIPDic[ip];
		if (socketRequestPerIPItem == null) {
			socketRequestPerIPItem = {
				id: ip,
				count: 0,
				tsLastUpdate: currentMilliseconds
			}

			this.socketRequestPerIPDic[ip] = socketRequestPerIPItem;
		}

		if (socketRequestPerIPItem.tsLastUpdate + xDatetime.ONE_SECOND_MILLISECOND < currentMilliseconds) {
			socketRequestPerIPItem.tsLastUpdate = currentMilliseconds;
			socketRequestPerIPItem.count = 0;
		}

		socketRequestPerIPItem.count++;

		let socketMaxRequestPerSecondPerIp = this.socketMaxRequestPerSecondPerIp;
		if (this.ipBlackLst.indexOf(ip) != -1) socketMaxRequestPerSecondPerIp = socketMaxRequestPerSecondPerIp / AntiDdosMiddleware.K_MULTIPLE_BLACK_LIST;
		else if (this.ipWhiteLst.indexOf(ip) != -1) socketMaxRequestPerSecondPerIp = socketMaxRequestPerSecondPerIp * AntiDdosMiddleware.K_MULTIPLE_WHITE_LIST;

		if (socketRequestPerIPItem.count > socketMaxRequestPerSecondPerIp) {
			this.reportDdosCollection.insertOne({
				returnCode: ReturnCode.MaxRequestReject,
				ip: ip,
				count: socketRequestPerIPItem.count,
				type: RequestType.SOCKET,
				tsCreate: currentMilliseconds
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
			if (this.ipBlackLst.includes(ip)) socketMaxRequestPerSecondPerPeer = socketMaxRequestPerSecondPerPeer / AntiDdosMiddleware.K_MULTIPLE_BLACK_LIST;
			else if (this.ipWhiteLst.includes(ip)) socketMaxRequestPerSecondPerPeer = socketMaxRequestPerSecondPerPeer * AntiDdosMiddleware.K_MULTIPLE_WHITE_LIST;

			if (socketRequestPerPeerItem.count > socketMaxRequestPerSecondPerPeer) {
				this.reportDdosCollection.insertOne({
					returnCode: ReturnCode.MaxRequestReject,
					peer: id,
					count: socketRequestPerPeerItem.count,
					type: RequestType.SOCKET,
					tsCreate: currentMilliseconds
				});

				return;
			}
		}

		return next();
	}

	public async checkMaxRequestPerSecondPerIpViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = this.getReturnCodeForMaxRequestPerSecondPerIp(req);
		if (returnCode != ReturnCode.Ok) {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
			return res.send({ returnCode: returnCode });
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
			let content = Buffer.from(encode({ returnCode: returnCode }));
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
			res.setHeader(Commands.CONTENT_LENGTH, content.length);
			return res.send(content);
		}

		return next();
	}

	private getReturnCodeForMaxRequestPerSecondPerIp(req: express.Request): number {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let ip = req.xip;
		let httpRequestPerIPItem = this.httpRequestPerIPDic[ip];
		if (httpRequestPerIPItem == null) {
			httpRequestPerIPItem = {
				id: ip,
				count: 0,
				tsLastUpdate: currentMilliseconds
			}

			this.httpRequestPerIPDic[ip] = httpRequestPerIPItem;
		}

		if (httpRequestPerIPItem.tsLastUpdate + xDatetime.ONE_SECOND_MILLISECOND < currentMilliseconds) {
			httpRequestPerIPItem.tsLastUpdate = currentMilliseconds;
			httpRequestPerIPItem.count = 0;
		}

		httpRequestPerIPItem.count++;

		let httpMaxRequestPerSecondPerIp = this.httpMaxRequestPerSecondPerIp;
		if (this.ipBlackLst.includes(ip)) httpMaxRequestPerSecondPerIp = httpMaxRequestPerSecondPerIp / AntiDdosMiddleware.K_MULTIPLE_BLACK_LIST;
		else if (this.ipWhiteLst.includes(ip)) httpMaxRequestPerSecondPerIp = httpMaxRequestPerSecondPerIp * AntiDdosMiddleware.K_MULTIPLE_WHITE_LIST;
		else {
			let role = Number.parseInt(req.params.role);
			if (!Number.isNaN(role)) {
				if (role == RequestRole.Admin || role == RequestRole.Server) httpMaxRequestPerSecondPerIp = httpMaxRequestPerSecondPerIp * AntiDdosMiddleware.K_MULTIPLE_ADMIN;
			}
		}

		if (httpRequestPerIPItem.count > httpMaxRequestPerSecondPerIp) {
			this.reportDdosCollection.insertOne({
				returnCode: ReturnCode.MaxRequestReject,
				ip: ip,
				count: httpRequestPerIPItem.count,
				type: RequestType.HTTP,
				tsCreate: currentMilliseconds
			});

			return ReturnCode.MaxRequestReject;
		}

		return ReturnCode.Ok;
	}

	public async checkMaxRequestPerSecondPerPeerViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = this.getReturnCodeForMaxRequestPerSecondPerPeer(req);
		if (returnCode != ReturnCode.Ok) {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
			return res.send({ returnCode: returnCode });
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
			let content = Buffer.from(encode({ returnCode: returnCode }));
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
			res.setHeader(Commands.CONTENT_LENGTH, content.length);
			return res.send(content);
		}

		return next();
	}

	private getReturnCodeForMaxRequestPerSecondPerPeer(req: express.Request): number {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		let isAuthenticated = req.isAuthenticated;
		let authInfo = req.authInfo;

		if (isAuthenticated && authInfo != null) {
			let id = authInfo.getUserId();
			let ip = req.xip;

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
			if (this.ipBlackLst.includes(ip)) httpMaxRequestPerSecondPerPeer = httpMaxRequestPerSecondPerPeer / AntiDdosMiddleware.K_MULTIPLE_BLACK_LIST;
			else if (this.ipWhiteLst.includes(ip)) httpMaxRequestPerSecondPerPeer = httpMaxRequestPerSecondPerPeer * AntiDdosMiddleware.K_MULTIPLE_WHITE_LIST;
			else {
				let role = Number.parseInt(req.params.role);
				if (!Number.isNaN(role)) {
					if (role == RequestRole.Admin || role == RequestRole.Server) httpMaxRequestPerSecondPerPeer = httpMaxRequestPerSecondPerPeer * AntiDdosMiddleware.K_MULTIPLE_ADMIN;
				}
			}

			httpRequestPerPeerItem.count++;
			if (httpRequestPerPeerItem.count > httpMaxRequestPerSecondPerPeer) {
				this.reportDdosCollection.insertOne({
					returnCode: ReturnCode.MaxRequestReject,
					peer: id,
					count: httpRequestPerPeerItem.count,
					type: RequestType.HTTP,
					tsCreate: currentMilliseconds
				});

				return ReturnCode.MaxRequestReject;
			}
		}

		return ReturnCode.Ok;
	}

	public async addPendingRequestViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = this.getReturnCodeForPendingRequest(req);
		if (returnCode != ReturnCode.Ok) {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
			return res.send({ returnCode: returnCode });
		}

		return next();
	}

	public async addPendingRequestViaMsgPack(req: express.Request, res: express.Response, next: Function) {
		let returnCode = this.getReturnCodeForPendingRequest(req);
		if (returnCode != ReturnCode.Ok) {
			let content = Buffer.from(encode({ returnCode: returnCode }));
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
			res.setHeader(Commands.CONTENT_LENGTH, content.length);
			return res.send(content);
		}

		return next();
	}

	private getReturnCodeForPendingRequest(req: express.Request): number {
		let ip = req.xip;

		let httpMaxPendingRequest = this.httpMaxPendingRequest;
		if (this.ipBlackLst.includes(ip)) httpMaxPendingRequest = httpMaxPendingRequest / AntiDdosMiddleware.K_MULTIPLE_BLACK_LIST;
		else if (this.ipWhiteLst.includes(ip)) httpMaxPendingRequest = httpMaxPendingRequest * AntiDdosMiddleware.K_MULTIPLE_WHITE_LIST;
		else {
			let role = Number.parseInt(req.params.role);
			if (!Number.isNaN(role)) {
				if (role == RequestRole.Admin || role == RequestRole.Server) httpMaxPendingRequest = httpMaxPendingRequest * AntiDdosMiddleware.K_MULTIPLE_ADMIN;
			}
		}

		if (this.currentHttpRequestCount > httpMaxPendingRequest) {
			this.reportDdosCollection.insertOne({
				returnCode: ReturnCode.MaxRequestReject,
				currentHttpRequestCount: this.currentHttpRequestCount,
				type: RequestType.HTTP,
				tsCreate: xDatetime.getCurrentMilliseconds()
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
		let ip = req.xip;

		let maxUploadPendingRequest = this.maxUploadPendingRequest;
		if (this.ipBlackLst.includes(ip)) maxUploadPendingRequest = maxUploadPendingRequest / AntiDdosMiddleware.K_MULTIPLE_BLACK_LIST;
		else if (this.ipWhiteLst.includes(ip)) maxUploadPendingRequest = maxUploadPendingRequest * AntiDdosMiddleware.K_MULTIPLE_WHITE_LIST;

		if (this.currentHttpUploadRequestCount > maxUploadPendingRequest) {
			this.reportDdosCollection.insertOne({
				returnCode: ReturnCode.MaxRequestReject,
				currentHttpUploadRequestCount: this.currentHttpUploadRequestCount,
				type: RequestType.HTTP,
				tsCreate: xDatetime.getCurrentMilliseconds()
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
				returnCode: ReturnCode.MaxRequestReject,
				currentHttpUploadRequestCount: this.currentHttpUploadRequestCount,
				type: RequestType.HTTP,
				tsCreate: xDatetime.getCurrentMilliseconds()
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
		let ip = req.xip;

		let maxDownloadPendingRequest = this.maxDownloadPendingRequest;
		if (this.ipBlackLst.includes(ip)) maxDownloadPendingRequest = maxDownloadPendingRequest / AntiDdosMiddleware.K_MULTIPLE_BLACK_LIST;
		else if (this.ipWhiteLst.includes(ip)) maxDownloadPendingRequest = maxDownloadPendingRequest * AntiDdosMiddleware.K_MULTIPLE_WHITE_LIST;

		if (this.currentHttpDownloadRequestCount > maxDownloadPendingRequest) {
			this.reportDdosCollection.insertOne({
				returnCode: ReturnCode.MaxRequestReject,
				currentHttpDownloadRequestCount: this.currentHttpDownloadRequestCount,
				type: RequestType.HTTP,
				tsCreate: xDatetime.getCurrentMilliseconds()
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
		setTimeout(() => {
			this.getBanDdos();
		}, 5000);

		setInterval(() => {
			this.getBanDdos();
			this.clearHttpRequestPerIPDic();
			this.clearHttpRequestPerPeerDic();
			this.clearSocketRequestPerIPDic();
			this.clearSocketRequestPerPeerDic();
		}, AntiDdosMiddleware.FIVE_MINUTE_TS);
	}

	private async getBanDdos() {
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		this.ipBlackLst.length = 0;
		this.ipWhiteLst.length = 0;

		try {
			let banDdosResults = await this.banDdosCollection.find({}, {
				projection: {
					ip: true,
					type: true
				}
			}).limit(500).toArray();

			for (let i = 0; i < banDdosResults.length; i++) {
				let banDdosResult = banDdosResults[i];
				let ip = banDdosResult.ip;

				if (banDdosResult.tsExpire == -1 || banDdosResult.tsExpire > currentMilliseconds) {
					if (banDdosResult.type == BanType.BLACK_LIST) {
						this.ipBlackLst.push(ip);
					}
					else if (banDdosResult.type == BanType.WHITE_LIST) {
						this.ipWhiteLst.push(ip);

						if (this.defaultIPWhiteLst) {
							for (let j = 0; j < this.defaultIPWhiteLst.length; j++) {
								let defaultIP = this.defaultIPWhiteLst[j];
								if (!this.ipWhiteLst.includes(defaultIP)) this.ipWhiteLst.push(defaultIP);
							}
						}
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

		this.defaultIPWhiteLst = [];
		this.ipWhiteLst = [];
		this.ipBlackLst = [];
	}

}
