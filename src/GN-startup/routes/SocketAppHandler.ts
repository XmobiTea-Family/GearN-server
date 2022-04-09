const CONNECT_CMD = "connection";
const DISCONNECT_CMD = "disconnect";

const REQUEST_AUTHTOKEN_CMD = "a";
const REQUEST_CMD = "r";
const RESPONSE_CMD = "r";
const EVENT_CMD = "e";

import { Server, Socket } from "socket.io";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import { OperationEvent } from "./../../GN-common/entity/operationEvent/OperationEvent";
import { OperationResponse } from "./../../GN-common/entity/operationResponse/OperationResponse";
import { Emitter } from "@socket.io/mongo-emitter";
import { encode, decode } from "@msgpack/msgpack";
import { ApiMiddleware } from "./../middleware/ApiMiddleware";
import { AuthInfo } from "./../../GN-common/entity/AuthInfo";
import { Debug } from "../../GN-library/xdebug/lib/xDebug";

interface OnSocketDisconnect {
	(socket: Socket, data: string): void;
}

interface OnSocketRequest {
	(request: Request): Promise<OperationResponse>;
}

export class SocketAppHandler {
	private _onDisconnectCb: OnSocketDisconnect;
	private _onRequestCb: OnSocketRequest;
	private apiMiddleware: ApiMiddleware;

	private enableSendAndReceive: boolean;
	private server: Server;
	private emitter: Emitter;

	public setEnableSendAndReceive(enableSendAndReceive: boolean): void {
		this.enableSendAndReceive = enableSendAndReceive;
	}

	public setServer(server: Server): void {
		this.server = server;
	}

	public setApiMiddleware(apiMiddleware: ApiMiddleware): void {
		this.apiMiddleware = apiMiddleware;
	}

	public setEmitter(emitter: Emitter) {
		this.emitter = emitter;
	}

	public setOnSocketRequest(_onRequestCb: OnSocketRequest) {
		this._onRequestCb = _onRequestCb;
	}

	public setOnSocketDisconnect(_onDisconnectCb: OnSocketDisconnect) {
		this._onDisconnectCb = _onDisconnectCb;
	}

	public run(): void {
		this.server.on(CONNECT_CMD, (socket) => {
			// let masterClient = <any>socket;
			this.socketConnect(socket);
		});
	}

	private socketConnect(socket: Socket) {
		if (this.enableSendAndReceive) Debug.log("[SOCKET] on socket connect with " + socket.id);

		this.initSocket(socket);

		socket.on(REQUEST_AUTHTOKEN_CMD, (...data) => {
			this.onSocketRequestAuthToken(socket, data);
		});

		socket.on(REQUEST_CMD, (...data) => {
			this.onSocketRequest(socket, data);
		});

		socket.on(DISCONNECT_CMD, (data) => {
			this.onSocketDisconnect(socket, data);
		});
	}

	private initSocket(socket: Socket) {
		let ip = socket.conn.remoteAddress;
		if (ip.substring(0, 7) == "::ffff:") {
			ip = ip.substring(7);
		}

		socket.data.IPAddress = ip;
	}

	private onSocketRequestAuthToken(socket: Socket, data: any) {
		if (data.length == 0) return;

		let authToken = data[0] as string;
		if (!authToken) {
			if (socket.data.isAuthenticated === true) {
				socket.leave((socket.data.authInfo as AuthInfo).getUserId());

				socket.data.isAuthenticated = true;
				socket.data.authInfo = null;
			}

			return;
		}

		let authInfo = this.apiMiddleware.getAuthInfoByAuthToken(authToken);

		if (authInfo != null) {
			socket.data.isAuthenticated = true;
			socket.data.authInfo = authInfo;
			socket.join(authInfo.getUserId());
		}
	}

	private onSocketRequest(socket: Socket, data: any) {
		this.apiMiddleware.socketAuthenticateToken(socket, async () => {
			let requestData: any;

			try {
				let buffer = data[0] as Buffer;
				if (buffer[0] == 4) {
					buffer = buffer.slice(1);
				}

				requestData = decode(buffer);
			} catch (err) {
				Debug.logException(err);
				return;
			}

			let code = requestData[0] as number;
			let params = requestData.length > 1 ? (requestData[1] as {}) : {};
			let requestId = requestData.length > 2 ? (requestData[2] as number) : -1;

			if (this._onRequestCb != null) {
				let request = new Request(code);
				request.setIP(socket.data.IPAddress);
				request.setParameters(params);
				request.setRequestId(requestId);

				let isAuthenticated = socket.data.isAuthenticated;
				if (isAuthenticated === true) request.setAuthenticate(socket.data.authInfo);

				if (this.enableSendAndReceive) {
					Debug.log("[SOCKET RECV] %O", JSON.stringify(request));
					Debug.log("[Parameters] " + JSON.stringify(params));
				}

				let operationResponse = await this._onRequestCb(request);

				if (operationResponse != null) {
					this.sendResponseForSocket(socket, operationResponse);
				}
			}
		});
	}

	private onSocketDisconnect(socket: Socket, data: string) {
		if (this.enableSendAndReceive) Debug.log("[SOCKET] on socket disconencted " + socket.id);

		if (this._onDisconnectCb != null) this._onDisconnectCb(socket, data);
	}

	private sendResponseForSocket(socket: Socket, operationResponse: OperationResponse) {
		let socketData = operationResponse.toSocketData();
		if (this.enableSendAndReceive) Debug.log("[SOCKET SEND] %O", JSON.stringify(socketData));

		socket.emit(RESPONSE_CMD, encode(socketData));
	}

	private sendEventForSocket(socket: Socket, operationEvent: OperationEvent) {
		let socketData = operationEvent.toSocketData();
		if (this.enableSendAndReceive) Debug.log("[EVENT SEND] %O", JSON.stringify(socketData));

		socket.emit(EVENT_CMD, encode(socketData));
	}

	public async sendEventTo(userId: string, operationEvent: OperationEvent): Promise<void> {
		let socketData = operationEvent.toSocketData();
		if (this.enableSendAndReceive) Debug.log("[EVENT SEND EVENT TO] %O", JSON.stringify(socketData));

		this.emitter.to(userId).emit(EVENT_CMD, encode(socketData));
	}

	public async sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent): Promise<void> {
		let socketData = operationEvent.toSocketData();
		if (this.enableSendAndReceive) Debug.log("[EVENT SEND EVENT TO MORE USER] %O", JSON.stringify(socketData));

		let socketDataMsgPack = encode(socketData);

		for (let i = 0; i < userIds.length; i++) {
			let userId = userIds[i];
			this.emitter.to(userId).emit(EVENT_CMD, socketDataMsgPack);
		}
	}

	public async sendEventToAllPlayer(operationEvent: OperationEvent): Promise<void> {
		let socketData = operationEvent.toSocketData();
		if (this.enableSendAndReceive) Debug.log("[EVENT SEND EVENT TO ALL PLAYER] %O", JSON.stringify(socketData));

		this.emitter.of("/").emit(EVENT_CMD, encode(socketData));
	}

	public async sendEventToNamespace(namespace: string, operationEvent: OperationEvent): Promise<void> {
		let socketData = operationEvent.toSocketData();
		if (this.enableSendAndReceive) Debug.log("[EVENT SEND EVENT TO NAME SPACE] %O", JSON.stringify(socketData));

		this.emitter.of("/" + namespace).emit(EVENT_CMD, encode(socketData));
	}
}
