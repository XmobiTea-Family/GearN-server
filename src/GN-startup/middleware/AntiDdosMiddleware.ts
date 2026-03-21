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
	// Stores the ID value used by this contract.
	id: string;
	// Stores the count value used by this contract.
	count: number;
	// Stores the timestamp last update value used by this contract.
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
	// Stores the FIVE MINUTE timestamp value used by this instance.
	private static readonly FIVE_MINUTE_TS: number = 5 * 60 * 1000;
	// Stores the k MULTIPLE ADMIN value used by this instance.
	private static readonly K_MULTIPLE_ADMIN: number = 500;
	// Stores the k MULTIPLE WHITE LIST value used by this instance.
	private static readonly K_MULTIPLE_WHITE_LIST: number = 100;
	// Stores the k MULTIPLE BLACK LIST value used by this instance.
	private static readonly K_MULTIPLE_BLACK_LIST: number = 5;

	// Stores the socket request per IP dictionary collection used by this instance.
	private socketRequestPerIPDic: { [k: string]: MaxRequestItem };
	// Stores the socket request per peer dictionary collection used by this instance.
	private socketRequestPerPeerDic: { [k: string]: MaxRequestItem };
	// Stores the HTTP request per IP dictionary collection used by this instance.
	private httpRequestPerIPDic: { [k: string]: MaxRequestItem };
	// Stores the HTTP request per peer dictionary collection used by this instance.
	private httpRequestPerPeerDic: { [k: string]: MaxRequestItem };
	// Stores the current HTTP request count value used by this instance.
	private currentHttpRequestCount: number;
	// Stores the current socket request count value used by this instance.
	private currentSocketRequestCount: number;
	// Stores the current HTTP upload request count value used by this instance.
	private currentHttpUploadRequestCount: number;
	// Stores the current HTTP download request count value used by this instance.
	private currentHttpDownloadRequestCount: number;

	// Stores the report DDoS collection value used by this instance.
	private reportDdosCollection: mongoDB.Collection<mongoDB.Document>;
	// Stores the ban DDoS collection value used by this instance.
	private banDdosCollection: mongoDB.Collection<mongoDB.Document>;

	// Stores the socket max request per second per IP value used by this instance.
	private socketMaxRequestPerSecondPerIp: number;
	// Stores the socket max request per second per peer value used by this instance.
	private socketMaxRequestPerSecondPerPeer: number;
	// Stores the socket max pending request value used by this instance.
	private socketMaxPendingRequest: number;
	// Stores the socket max request size value used by this instance.
	private socketMaxRequestSize: number;

	// Stores the HTTP max request per second per IP value used by this instance.
	private httpMaxRequestPerSecondPerIp: number;
	// Stores the HTTP max request per second per peer value used by this instance.
	private httpMaxRequestPerSecondPerPeer: number;
	// Stores the HTTP max pending request value used by this instance.
	private httpMaxPendingRequest: number;
	// Stores the HTTP max request size value used by this instance.
	private httpMaxRequestSize: number;

	// Stores the max upload pending request value used by this instance.
	private maxUploadPendingRequest: number;
	// Stores the max download pending request value used by this instance.
	private maxDownloadPendingRequest: number;

	// Stores the default IP white lst list used by this instance.
	private defaultIPWhiteLst: string[];
	// Stores the IP white lst list used by this instance.
	private ipWhiteLst: string[];
	// Stores the IP black lst list used by this instance.
	private ipBlackLst: string[];

	/**
	 * Sets the report DDoS collection.
	 * @param reportDdosCollection Provides the report DDoS collection used by this operation.
	 */
	public setReportDdosCollection(reportDdosCollection: mongoDB.Collection<mongoDB.Document>) {
		this.reportDdosCollection = reportDdosCollection;
	}

	/**
	 * Sets the ban DDoS collection.
	 * @param banDdosCollection Provides the ban DDoS collection used by this operation.
	 */
	public setBanDdosCollection(banDdosCollection: mongoDB.Collection<mongoDB.Document>) {
		this.banDdosCollection = banDdosCollection;
	}

	/**
	 * Sets the socket max request per second per IP.
	 * @param socketMaxRequestPerSecondPerIp Provides the socket max request per second per IP value used by this operation.
	 */
	public setSocketMaxRequestPerSecondPerIp(socketMaxRequestPerSecondPerIp: number): void {
		this.socketMaxRequestPerSecondPerIp = socketMaxRequestPerSecondPerIp;
	}

	/**
	 * Sets the socket max request per second per peer.
	 * @param socketMaxRequestPerSecondPerPeer Provides the socket max request per second per peer value used by this operation.
	 */
	public setSocketMaxRequestPerSecondPerPeer(socketMaxRequestPerSecondPerPeer: number): void {
		this.socketMaxRequestPerSecondPerPeer = socketMaxRequestPerSecondPerPeer;
	}

	/**
	 * Sets the socket max pending request.
	 * @param socketMaxPendingRequest Provides the socket max pending request value used by this operation.
	 */
	public setSocketMaxPendingRequest(socketMaxPendingRequest: number): void {
		this.socketMaxPendingRequest = socketMaxPendingRequest;
	}

	/**
	 * Sets the socket max request size.
	 * @param socketMaxRequestSize Provides the socket max request size value used by this operation.
	 */
	public setSocketMaxRequestSize(socketMaxRequestSize: number): void {
		this.socketMaxRequestSize = socketMaxRequestSize;
	}

	/**
	 * Sets the HTTP max request per second per IP.
	 * @param httpMaxRequestPerSecondPerIp Provides the HTTP max request per second per IP value used by this operation.
	 */
	public setHttpMaxRequestPerSecondPerIp(httpMaxRequestPerSecondPerIp: number): void {
		this.httpMaxRequestPerSecondPerIp = httpMaxRequestPerSecondPerIp;
	}

	/**
	 * Sets the HTTP max request per second per peer.
	 * @param httpMaxRequestPerSecondPerPeer Provides the HTTP max request per second per peer value used by this operation.
	 */
	public setHttpMaxRequestPerSecondPerPeer(httpMaxRequestPerSecondPerPeer: number): void {
		this.httpMaxRequestPerSecondPerPeer = httpMaxRequestPerSecondPerPeer;
	}

	/**
	 * Sets the HTTP max pending request.
	 * @param httpMaxPendingRequest Provides the HTTP max pending request value used by this operation.
	 */
	public setHttpMaxPendingRequest(httpMaxPendingRequest: number): void {
		this.httpMaxPendingRequest = httpMaxPendingRequest;
	}

	/**
	 * Sets the HTTP max request size.
	 * @param httpMaxRequestSize Provides the HTTP max request size value used by this operation.
	 */
	public setHttpMaxRequestSize(httpMaxRequestSize: number): void {
		this.httpMaxRequestSize = httpMaxRequestSize;
	}

	/**
	 * Sets the max upload pending request.
	 * @param maxUploadPendingRequest Provides the max upload pending request value used by this operation.
	 */
	public setMaxUploadPendingRequest(maxUploadPendingRequest: number): void {
		this.maxUploadPendingRequest = maxUploadPendingRequest;
	}

	/**
	 * Sets the max download pending request.
	 * @param maxDownloadPendingRequest Provides the max download pending request value used by this operation.
	 */
	public setMaxDownloadPendingRequest(maxDownloadPendingRequest: number): void {
		this.maxDownloadPendingRequest = maxDownloadPendingRequest;
	}

	/**
	 * Sets the IP white list.
	 * @param ipWhiteList Provides the IP white list value used by this operation.
	 */
	public setIPWhiteList(ipWhiteList: string[]): void {
		this.defaultIPWhiteLst = ipWhiteList;
		if (this.defaultIPWhiteLst) {
			for (let j = 0; j < this.defaultIPWhiteLst.length; j++) {
				// Stores the default IP value used in the current execution flow.
				let defaultIP = this.defaultIPWhiteLst[j];
				if (!this.ipWhiteLst.includes(defaultIP)) this.ipWhiteLst.push(defaultIP);
			}
		}
	}

	/**
	 * Executes the check request size body via JSON workflow asynchronously.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async checkRequestSizeBodyViaJson(req: express.Request, res: express.Response, next: Function) {
		// Stores the return code value used in the current execution flow.
		let returnCode = this.getReturnCodeForRequestSizeHttp(req);
		if (returnCode != ReturnCode.Ok) {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
			return res.send({
				returnCode: returnCode,
			});
		}

		return next();
	}

	/**
	 * Executes the check request size body via msg pack workflow asynchronously.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async checkRequestSizeBodyViaMsgPack(req: express.Request, res: express.Response, next: Function) {
		// Stores the return code value used in the current execution flow.
		let returnCode = this.getReturnCodeForRequestSizeHttp(req);
		if (returnCode != ReturnCode.Ok) {
			// Stores the content value used in the current execution flow.
			let content = Buffer.from(encode({ returnCode: returnCode }));
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
			res.setHeader(Commands.CONTENT_LENGTH, content.length);
			return res.send(content);
		}

		return next();
	}

	/**
	 * Returns the return code for request size HTTP.
	 * @param req Provides the req value used by this operation.
	 * @returns Returns the return code for request size HTTP.
	 */
	private getReturnCodeForRequestSizeHttp(req: express.Request): number {
		// Stores the URL value used in the current execution flow.
		let url = req.url;
		if (url == "/dashboard/client/setSecretInfoInformation"
			|| url == "/dashboard/client/setMasterGameSettings"
			|| url == "/dashboard/client/createSecretInfo"
			|| url == "/dashboard/client/setGameInformation"
			|| url == "/dashboard/client/setEventCallbackCloudScript"
			|| url == "/content/admin/setContentData"
			|| url == "/cloudscript/admin/addFunction"
		) {
			return ReturnCode.Ok;
		}

		// Stores the content length str value used in the current execution flow.
		let contentLengthStr: string = req.header(Commands.CONTENT_LENGTH);
		if (contentLengthStr) {
			// Stores the IP value used in the current execution flow.
			let ip = req.xip;

			// Stores the HTTP max request size value used in the current execution flow.
			let httpMaxRequestSize = this.httpMaxRequestSize;
			if (this.ipWhiteLst.includes(ip)) httpMaxRequestSize = httpMaxRequestSize * AntiDdosMiddleware.K_MULTIPLE_WHITE_LIST;
			else {
				// Stores the role value used in the current execution flow.
				let role = Number.parseInt(req.params.role);
				if (!Number.isNaN(role)) {
					if (role == RequestRole.Admin || role == RequestRole.Server) httpMaxRequestSize = httpMaxRequestSize * AntiDdosMiddleware.K_MULTIPLE_ADMIN;
				}
			}

			// Stores the content length value used in the current execution flow.
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

	/**
	 * Executes the check request size body via socket msg pack workflow asynchronously.
	 * @param socket Provides the socket value used by this operation.
	 * @param data Provides the data value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async checkRequestSizeBodyViaSocketMsgPack(socket: Socket, data: any, next: Function) {
		if (data.length != 1) return;
		// Stores the IP value used in the current execution flow.
		let ip = socket.data.IPAddress;

		try {
			// Stores the buffer value used in the current execution flow.
			let buffer = data[0] as Buffer;

			// Stores the socket max request size value used in the current execution flow.
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

	/**
	 * Executes the check request size body via socket JSON workflow asynchronously.
	 * @param socket Provides the socket value used by this operation.
	 * @param data Provides the data value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async checkRequestSizeBodyViaSocketJson(socket: Socket, data: any, next: Function) {
		if (data.length != 1) return;
		// Stores the IP value used in the current execution flow.
		let ip = socket.data.IPAddress;

		try {
			// Stores the buffer value used in the current execution flow.
			let buffer = data[0];

			// Stores the socket max request size value used in the current execution flow.
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

	/**
	 * Executes the check max request per second per IP via socket workflow asynchronously.
	 * @param socket Provides the socket value used by this operation.
	 * @param data Provides the data value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async checkMaxRequestPerSecondPerIpViaSocket(socket: Socket, data: any, next: Function) {
		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		// Stores the IP value used in the current execution flow.
		let ip = socket.data.IPAddress;

		// Stores the socket request per IP item value used in the current execution flow.
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

		// Stores the socket max request per second per IP value used in the current execution flow.
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

	/**
	 * Executes the check max request per second per peer via socket workflow asynchronously.
	 * @param socket Provides the socket value used by this operation.
	 * @param data Provides the data value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async checkMaxRequestPerSecondPerPeerViaSocket(socket: Socket, data: any, next: Function) {
		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		// Tracks whether authenticated.
		let isAuthenticated = socket.data.isAuthenticated;
		// Stores the auth info value used in the current execution flow.
		let authInfo: AuthInfo = socket.data.authInfo;

		if (isAuthenticated && authInfo != null) {
			// Stores the ID value used in the current execution flow.
			let id = authInfo.getUserId();
			// Stores the IP value used in the current execution flow.
			let ip = socket.data.IPAddress;

			// Stores the socket request per peer item value used in the current execution flow.
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

			// Stores the socket max request per second per peer value used in the current execution flow.
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

	/**
	 * Executes the check max request per second per IP via JSON workflow asynchronously.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async checkMaxRequestPerSecondPerIpViaJson(req: express.Request, res: express.Response, next: Function) {
		// Stores the return code value used in the current execution flow.
		let returnCode = this.getReturnCodeForMaxRequestPerSecondPerIp(req);
		if (returnCode != ReturnCode.Ok) {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
			return res.send({ returnCode: returnCode });
		}

		return next();
	}

	/**
	 * Executes the check max upload request per second per IP workflow asynchronously.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async checkMaxUploadRequestPerSecondPerIp(req: express.Request, res: express.Response, next: Function) {
		// Stores the return code value used in the current execution flow.
		let returnCode = this.getReturnCodeForMaxRequestPerSecondPerIp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.sendStatus(429);
		}

		return next();
	}

	/**
	 * Executes the check max request per second per IP via msg pack workflow asynchronously.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async checkMaxRequestPerSecondPerIpViaMsgPack(req: express.Request, res: express.Response, next: Function) {
		// Stores the return code value used in the current execution flow.
		let returnCode = this.getReturnCodeForMaxRequestPerSecondPerIp(req);
		if (returnCode != ReturnCode.Ok) {
			// Stores the content value used in the current execution flow.
			let content = Buffer.from(encode({ returnCode: returnCode }));
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
			res.setHeader(Commands.CONTENT_LENGTH, content.length);
			return res.send(content);
		}

		return next();
	}

	/**
	 * Returns the return code for max request per second per IP.
	 * @param req Provides the req value used by this operation.
	 * @returns Returns the return code for max request per second per IP.
	 */
	private getReturnCodeForMaxRequestPerSecondPerIp(req: express.Request): number {
		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		// Stores the IP value used in the current execution flow.
		let ip = req.xip;
		// Stores the HTTP request per IP item value used in the current execution flow.
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

		// Stores the HTTP max request per second per IP value used in the current execution flow.
		let httpMaxRequestPerSecondPerIp = this.httpMaxRequestPerSecondPerIp;
		if (this.ipBlackLst.includes(ip)) httpMaxRequestPerSecondPerIp = httpMaxRequestPerSecondPerIp / AntiDdosMiddleware.K_MULTIPLE_BLACK_LIST;
		else if (this.ipWhiteLst.includes(ip)) httpMaxRequestPerSecondPerIp = httpMaxRequestPerSecondPerIp * AntiDdosMiddleware.K_MULTIPLE_WHITE_LIST;
		else {
			// Stores the role value used in the current execution flow.
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

	/**
	 * Executes the check max request per second per peer via JSON workflow asynchronously.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async checkMaxRequestPerSecondPerPeerViaJson(req: express.Request, res: express.Response, next: Function) {
		// Stores the return code value used in the current execution flow.
		let returnCode = this.getReturnCodeForMaxRequestPerSecondPerPeer(req);
		if (returnCode != ReturnCode.Ok) {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
			return res.send({ returnCode: returnCode });
		}

		return next();
	}

	/**
	 * Executes the check max upload request per second per peer workflow asynchronously.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async checkMaxUploadRequestPerSecondPerPeer(req: express.Request, res: express.Response, next: Function) {
		// Stores the return code value used in the current execution flow.
		let returnCode = this.getReturnCodeForMaxRequestPerSecondPerPeer(req);
		if (returnCode != ReturnCode.Ok) {
			return res.sendStatus(429);
		}

		return next();
	}

	/**
	 * Executes the check max request per second per peer via msg pack workflow asynchronously.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async checkMaxRequestPerSecondPerPeerViaMsgPack(req: express.Request, res: express.Response, next: Function) {
		// Stores the return code value used in the current execution flow.
		let returnCode = this.getReturnCodeForMaxRequestPerSecondPerPeer(req);
		if (returnCode != ReturnCode.Ok) {
			// Stores the content value used in the current execution flow.
			let content = Buffer.from(encode({ returnCode: returnCode }));
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
			res.setHeader(Commands.CONTENT_LENGTH, content.length);
			return res.send(content);
		}

		return next();
	}

	/**
	 * Returns the return code for max request per second per peer.
	 * @param req Provides the req value used by this operation.
	 * @returns Returns the return code for max request per second per peer.
	 */
	private getReturnCodeForMaxRequestPerSecondPerPeer(req: express.Request): number {
		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		// Tracks whether authenticated.
		let isAuthenticated = req.isAuthenticated;
		// Stores the auth info value used in the current execution flow.
		let authInfo = req.authInfo;

		if (isAuthenticated && authInfo != null) {
			// Stores the ID value used in the current execution flow.
			let id = authInfo.getUserId();
			// Stores the IP value used in the current execution flow.
			let ip = req.xip;

			// Stores the HTTP request per peer item value used in the current execution flow.
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

			// Stores the HTTP max request per second per peer value used in the current execution flow.
			let httpMaxRequestPerSecondPerPeer = this.httpMaxRequestPerSecondPerPeer;
			if (this.ipBlackLst.includes(ip)) httpMaxRequestPerSecondPerPeer = httpMaxRequestPerSecondPerPeer / AntiDdosMiddleware.K_MULTIPLE_BLACK_LIST;
			else if (this.ipWhiteLst.includes(ip)) httpMaxRequestPerSecondPerPeer = httpMaxRequestPerSecondPerPeer * AntiDdosMiddleware.K_MULTIPLE_WHITE_LIST;
			else {
				// Stores the role value used in the current execution flow.
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

	/**
	 * Adds the pending request via JSON.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async addPendingRequestViaJson(req: express.Request, res: express.Response, next: Function) {
		// Stores the return code value used in the current execution flow.
		let returnCode = this.getReturnCodeForPendingRequest(req);
		if (returnCode != ReturnCode.Ok) {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
			return res.send({ returnCode: returnCode });
		}

		return next();
	}

	/**
	 * Adds the pending request via msg pack.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async addPendingRequestViaMsgPack(req: express.Request, res: express.Response, next: Function) {
		// Stores the return code value used in the current execution flow.
		let returnCode = this.getReturnCodeForPendingRequest(req);
		if (returnCode != ReturnCode.Ok) {
			// Stores the content value used in the current execution flow.
			let content = Buffer.from(encode({ returnCode: returnCode }));
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
			res.setHeader(Commands.CONTENT_LENGTH, content.length);
			return res.send(content);
		}

		return next();
	}

	/**
	 * Returns the return code for pending request.
	 * @param req Provides the req value used by this operation.
	 * @returns Returns the return code for pending request.
	 */
	private getReturnCodeForPendingRequest(req: express.Request): number {
		// Stores the IP value used in the current execution flow.
		let ip = req.xip;

		// Stores the HTTP max pending request value used in the current execution flow.
		let httpMaxPendingRequest = this.httpMaxPendingRequest;
		if (this.ipBlackLst.includes(ip)) httpMaxPendingRequest = httpMaxPendingRequest / AntiDdosMiddleware.K_MULTIPLE_BLACK_LIST;
		else if (this.ipWhiteLst.includes(ip)) httpMaxPendingRequest = httpMaxPendingRequest * AntiDdosMiddleware.K_MULTIPLE_WHITE_LIST;
		else {
			// Stores the role value used in the current execution flow.
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

	/**
	 * Removes the pending request.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 */
	public removePendingRequest(req: express.Request, res: express.Response) {
		if (this.currentHttpRequestCount > 0) this.currentHttpRequestCount -= 1;
	}

	/**
	 * Adds the pending upload request.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async addPendingUploadRequest(req: express.Request, res: express.Response, next: Function) {
		// Stores the IP value used in the current execution flow.
		let ip = req.xip;

		// Stores the max upload pending request value used in the current execution flow.
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

	/**
	 * Removes the pending upload request.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 */
	public removePendingUploadRequest(req: express.Request, res: express.Response) {
		if (this.currentHttpUploadRequestCount > 0) this.currentHttpUploadRequestCount -= 1;
	}

	/**
	 * Adds the pending request via socket.
	 * @param socket Provides the socket value used by this operation.
	 * @param data Provides the data value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public addPendingRequestViaSocket(socket: Socket, data: any, next: Function) {
		if (this.currentSocketRequestCount > this.socketMaxPendingRequest) {
			this.reportDdosCollection.insertOne({
				returnCode: ReturnCode.MaxRequestReject,
				currentSocketRequestCount: this.currentSocketRequestCount,
				type: RequestType.SOCKET,
				tsCreate: xDatetime.getCurrentMilliseconds()
			});

			return;
		}

		this.currentSocketRequestCount += 1;
		return next();
	}

	/**
	 * Removes the pending request via socket.
	 * @param socket Provides the socket value used by this operation.
	 * @param data Provides the data value used by this operation.
	 */
	public removePendingRequestViaSocket(socket: Socket, data: any) {
		if (this.currentSocketRequestCount > 0) this.currentSocketRequestCount -= 1;
	}

	/**
	 * Adds the pending download request.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 */
	public async addPendingDownloadRequest(req: express.Request, res: express.Response, next: Function) {
		// Stores the IP value used in the current execution flow.
		let ip = req.xip;

		// Stores the max download pending request value used in the current execution flow.
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

	/**
	 * Removes the pending download request.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 */
	public removePendingDownloadRequest(req: express.Request, res: express.Response) {
		if (this.currentHttpDownloadRequestCount > 0) this.currentHttpDownloadRequestCount -= 1;
	}

	/**
	 * Runs the current workflow.
	 */
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

	/**
	 * Returns the ban DDoS.
	 */
	private async getBanDdos() {
		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();

		this.ipBlackLst.length = 0;
		this.ipWhiteLst.length = 0;

		try {
			// Stores the ban DDoS results value used in the current execution flow.
			let banDdosResults = await this.banDdosCollection.find({}, {
				projection: {
					ip: true,
					type: true
				}
			}).limit(500).toArray();

			for (let i = 0; i < banDdosResults.length; i++) {
				// Stores the ban DDoS result value used in the current execution flow.
				let banDdosResult = banDdosResults[i];
				// Stores the IP value used in the current execution flow.
				let ip = banDdosResult.ip;

				if (banDdosResult.tsExpire == -1 || banDdosResult.tsExpire > currentMilliseconds) {
					if (banDdosResult.type == BanType.BLACK_LIST) {
						this.ipBlackLst.push(ip);
					}
					else if (banDdosResult.type == BanType.WHITE_LIST) {
						this.ipWhiteLst.push(ip);

						if (this.defaultIPWhiteLst) {
							for (let j = 0; j < this.defaultIPWhiteLst.length; j++) {
								// Stores the default IP value used in the current execution flow.
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

	/**
	 * Executes the clear HTTP request per IP dictionary workflow.
	 */
	private clearHttpRequestPerIPDic(): void {
		try {
			// Stores the remove count value used in the current execution flow.
			let removeCount = 0;

			// Stores the current milliseconds value used in the current execution flow.
			let currentMilliseconds = xDatetime.getCurrentMilliseconds();
			// Stores the timestamp remove value used in the current execution flow.
			let tsRemove = currentMilliseconds - xDatetime.ONE_SECOND_MILLISECOND;

			// Stores the HTTP request per IP lst value used in the current execution flow.
			let httpRequestPerIPLst = Object.values(this.httpRequestPerIPDic);

			for (let i = 0; i < httpRequestPerIPLst.length; i++) {
				// Stores the HTTP request per IP value used in the current execution flow.
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

	/**
	 * Executes the clear HTTP request per peer dictionary workflow.
	 */
	private clearHttpRequestPerPeerDic(): void {
		try {
			// Stores the remove count value used in the current execution flow.
			let removeCount = 0;

			// Stores the current milliseconds value used in the current execution flow.
			let currentMilliseconds = xDatetime.getCurrentMilliseconds();
			// Stores the timestamp remove value used in the current execution flow.
			let tsRemove = currentMilliseconds - xDatetime.ONE_SECOND_MILLISECOND;

			// Stores the HTTP request per peer lst value used in the current execution flow.
			let httpRequestPerPeerLst = Object.values(this.httpRequestPerPeerDic);

			for (let i = 0; i < httpRequestPerPeerLst.length; i++) {
				// Stores the HTTP request per peer value used in the current execution flow.
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

	/**
	 * Executes the clear socket request per IP dictionary workflow.
	 */
	private clearSocketRequestPerIPDic(): void {
		try {
			// Stores the remove count value used in the current execution flow.
			let removeCount = 0;

			// Stores the current milliseconds value used in the current execution flow.
			let currentMilliseconds = xDatetime.getCurrentMilliseconds();
			// Stores the timestamp remove value used in the current execution flow.
			let tsRemove = currentMilliseconds - xDatetime.ONE_SECOND_MILLISECOND;

			// Stores the socket request per IP lst value used in the current execution flow.
			let socketRequestPerIPLst = Object.values(this.socketRequestPerIPDic);

			for (let i = 0; i < socketRequestPerIPLst.length; i++) {
				// Stores the socket request per IP value used in the current execution flow.
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

	/**
	 * Executes the clear socket request per peer dictionary workflow.
	 */
	private clearSocketRequestPerPeerDic(): void {
		try {
			// Stores the remove count value used in the current execution flow.
			let removeCount = 0;

			// Stores the current milliseconds value used in the current execution flow.
			let currentMilliseconds = xDatetime.getCurrentMilliseconds();
			// Stores the timestamp remove value used in the current execution flow.
			let tsRemove = currentMilliseconds - xDatetime.ONE_SECOND_MILLISECOND;

			// Stores the socket request per peer lst value used in the current execution flow.
			let socketRequestPerPeerLst = Object.values(this.socketRequestPerPeerDic);

			for (let i = 0; i < socketRequestPerPeerLst.length; i++) {
				// Stores the socket request per peer value used in the current execution flow.
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

	/**
	 * Initializes a new anti DDoS middleware instance.
	 */
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
