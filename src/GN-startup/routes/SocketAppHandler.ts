const CONNECT_CMD = "connection";
const DISCONNECT_CMD = "disconnect";

const REQUEST_CMD = "r";
const RESPONSE_CMD = "r";
const EVENT_CMD = "e";

import { Server, Socket } from "socket.io";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import { OperationEvent } from "./../../GN-common/entity/operationEvent/OperationEvent";
import { OperationResponse } from "./../../GN-common/entity/operationResponse/OperationResponse";
import { Emitter } from "@socket.io/mongo-emitter";
import { encode, decode } from "@msgpack/msgpack";

interface OnSocketDisconnect {
	(socket: Socket, data: string): void;
}

interface OnSocketRequest {
	(request: Request): Promise<OperationResponse>;
}

export class SocketAppHandler {
	private _onDisconnectCb: OnSocketDisconnect;
	private _onRequestCb: OnSocketRequest;

	private server: Server;
	private emitter: Emitter;

	public setServer(server: Server): void {
		this.server = server;
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
		console.log("MasterClient connect with " + socket.id);

		this.initSocket(socket);
		socket.on(REQUEST_CMD, (...data) => {
			this.onSocketRequest(socket, data);
		});

		socket.on(DISCONNECT_CMD, (data) => {
			this.onSocketDisconnect(socket, data);
		});
	}

	private async initSocket(socket: Socket) {
		let ip = socket.conn.remoteAddress;
		if (ip.substring(0, 7) == "::ffff:") {
			ip = ip.substring(7);
		}

		socket.data.IPAddress = ip;
	}

	private async onSocketRequest(socket: Socket, data: any) {
		let requestData: any;

		try {
			let buffer = data[0] as Buffer;
			if (buffer[0] == 4) {
				buffer = buffer.slice(1);
			}

			requestData = decode(buffer);
		}
		catch (err) {
			console.error(err);
			return;
		}

		let code = requestData[0] as number;
		let params = requestData.length > 1 ? (requestData[1] as {}) : {};
		let requestId = requestData.length > 2 ? (requestData[2] as number) : -1;

		if (this._onRequestCb != null) {
			let request = new Request(code);
			request.setIP(socket.handshake.address);
			request.setParameters(params);
			request.setRequestId(requestId);
	
			let isAuthenticated = socket.data.isAuthenticated;
			if (isAuthenticated === true) request.setAuthenticate(socket.data.authInfo);

			console.log("[SOCKET RECV] %O", request);

			let operationResponse = await this._onRequestCb(request);

			if (operationResponse != null) {
				this.sendResponseForSocket(socket, operationResponse);
			}
		}
	}

	private onSocketDisconnect(socket: Socket, data: string) {
		console.log("MasterClient disconnected " + socket.id);

		if (this._onDisconnectCb != null) this._onDisconnectCb(socket, data);
	}

	private sendResponseForSocket(socket: Socket, operationResponse: OperationResponse) {
		let socketData = operationResponse.toSocketData();
		console.log("[SOCKET SEND] %O", socketData);

		socket.emit(RESPONSE_CMD, encode(socketData));
	}

	private sendEventForSocket(socket: Socket, operationEvent: OperationEvent) {
		let socketData = operationEvent.toSocketData();
		console.log("[EVENT SEND] %O", socketData);

		socket.emit(EVENT_CMD, encode(socketData));
	}

	public sendEventTo(userId: string, operationEvent: OperationEvent): void {
		let socketData = operationEvent.toSocketData();

		this.emitter.to(userId).emit(EVENT_CMD, encode(socketData));
	}

	public sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent): void {
		let socketData = operationEvent.toSocketData();
		let socketDataMsgPack = encode(socketData);

		for (let i = 0; i < userIds.length; i++) {
			let userId = userIds[i];
			this.emitter.to(userId).emit(EVENT_CMD, socketDataMsgPack);
		}
	}

	public sendEventToAllPlayer(operationEvent: OperationEvent): void {
		let socketData = operationEvent.toSocketData();

		this.emitter.of("/").emit(EVENT_CMD, encode(socketData));
	}

	public sendEventToNamespace(namespace: string, operationEvent: OperationEvent): void {
		let socketData = operationEvent.toSocketData();

		this.emitter
			.of("/" + namespace)
			.emit(EVENT_CMD, encode(socketData));
	}
}
