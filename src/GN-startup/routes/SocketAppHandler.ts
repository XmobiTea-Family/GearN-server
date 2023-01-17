import { Server, Socket } from "socket.io";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import { OperationEvent } from "./../../GN-common/entity/operationEvent/OperationEvent";
import { OperationResponse } from "./../../GN-common/entity/operationResponse/OperationResponse";
import { Emitter } from "@socket.io/mongo-emitter";
import { encode, decode } from "@msgpack/msgpack";
import { ApiMiddleware } from "./../middleware/ApiMiddleware";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { AntiDdosMiddleware } from "./../middleware/AntiDdosMiddleware";
import { AuthInfo } from "./../../GN-common/entity/AuthInfo";
import { OperationHelper } from "./../../GN-common/entity/operationHelper/OperationHelper";
import { Commands } from "./../../GN-common/constant/Commands";

interface OnSocketDisconnect {
	(socket: Socket, data: string): void;
}

interface OnSocketRequest {
	(request: Request): Promise<OperationResponse>;
}

export class SocketAppHandler {
	private static readonly CONNECT_CMD = "connection";
	private static readonly DISCONNECT_CMD = "disconnect";

	private _onDisconnectCb: OnSocketDisconnect;
	private _onRequestCb: OnSocketRequest;
	private apiMiddleware: ApiMiddleware;
	private antiDdosMiddleware: AntiDdosMiddleware;

	private enableSendAndReceiveDebug: boolean;
	private enablePostViaMsgPack: boolean;
	private enablePostViaJson: boolean;

	private server: Server;
	private emitter: Emitter;

	public setEnableSendAndReceiveDebug(enableSendAndReceiveDebug: boolean): void {
		this.enableSendAndReceiveDebug = enableSendAndReceiveDebug;
	}

	public setEnablePostViaMsgPack(enablePostViaMsgPack: boolean): void {
		this.enablePostViaMsgPack = enablePostViaMsgPack;
	}

	public setEnablePostViaJson(enablePostViaJson: boolean): void {
		this.enablePostViaJson = enablePostViaJson;
	}

	public setServer(server: Server): void {
		this.server = server;
	}

	public setApiMiddleware(apiMiddleware: ApiMiddleware): void {
		this.apiMiddleware = apiMiddleware;
	}

	public setAntiDdosMiddleware(antiDdosMiddleware: AntiDdosMiddleware): void {
		this.antiDdosMiddleware = antiDdosMiddleware;
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
		this.server.on(SocketAppHandler.CONNECT_CMD, (socket) => {
			// let masterClient = <any>socket;
			this.socketConnect(socket);
		});
	}

	private socketConnect(socket: Socket) {
		if (this.enableSendAndReceiveDebug) Debug.log("[SOCKET] on socket connect with " + socket.id);

		this.initSocket(socket);

		socket.on(Commands.RequestAuthTokenCmd, (...data) => {
			this.antiDdosMiddleware.checkMaxRequestPerSecondPerIpViaSocket(socket, data, async () => {
				await this.onSocketRequestAuthToken(socket, data);
			});
		});

		if (this.enablePostViaMsgPack) {
			socket.on(Commands.RequestCmd_MsgPack, (...data) => {
				this.antiDdosMiddleware.checkRequestSizeBodyViaSocketMsgPack(socket, data, () => {
					this.antiDdosMiddleware.checkMaxRequestPerSecondPerIpViaSocket(socket, data, () => {
						this.antiDdosMiddleware.checkMaxRequestPerSecondPerPeerViaSocket(socket, data, () => {
							this.antiDdosMiddleware.addPendingRequestViaSocket(socket, data, () => {
								this.apiMiddleware.socketAuthenticateToken(socket, async (returnCode: number) => {
									let operationResponse = await this.onSocketRequestMsgPack(socket, data, returnCode);

									if (operationResponse != null) {
										this.sendResponseForSocket(socket, operationResponse);
									}

									this.antiDdosMiddleware.removePendingRequestViaSocket(socket, data);
								});
							});
						});
					});
				});
			});
		}

		if (this.enablePostViaJson) {
			socket.on(Commands.RequestCmd_Json, (...data) => {
				this.antiDdosMiddleware.checkRequestSizeBodyViaSocketJson(socket, data, () => {
					this.antiDdosMiddleware.checkMaxRequestPerSecondPerIpViaSocket(socket, data, () => {
						this.antiDdosMiddleware.checkMaxRequestPerSecondPerPeerViaSocket(socket, data, () => {
							this.antiDdosMiddleware.addPendingRequestViaSocket(socket, data, () => {
								this.apiMiddleware.socketAuthenticateToken(socket, async (returnCode: number) => {
									let operationResponse = await this.onSocketRequestJson(socket, data, returnCode);

									if (operationResponse != null) {
										this.sendResponseForSocket(socket, operationResponse);
									}

									this.antiDdosMiddleware.removePendingRequestViaSocket(socket, data);
								});
							});
						});
					});
				});
			});
		}

		socket.on(SocketAppHandler.DISCONNECT_CMD, (data) => {
			this.onSocketDisconnect(socket, data);
		});
	}

	private initSocket(socket: Socket) {
		let ip: string = null;

		let headerIP = this.apiMiddleware.getHeaderIP();
		if (headerIP != null) {
			ip = socket.handshake.headers[headerIP] as string;
		}

		if (ip == null) {
			// ip = socket.conn.remoteAddress;
			ip = socket.handshake.address;
		}

		ip = this.apiMiddleware.createIP(ip);

		socket.data.IPAddress = ip;
	}

	private async onSocketRequestAuthToken(socket: Socket, data: any) {
		if (data.length == 0) {
			if (socket.data.isAuthenticated === true) {
				socket.rooms.forEach(room => socket.leave(room));

				socket.data.isAuthenticated = false;
				socket.data.authInfo = null;
			}

			return;
		}

		let authToken = data[0] as string;
		if (!authToken) {
			if (socket.data.isAuthenticated === true) {
				socket.rooms.forEach(room => socket.leave(room));

				socket.data.isAuthenticated = false;
				socket.data.authInfo = null;
			}

			return;
		}

		let authInfo = await this.apiMiddleware.getAuthInfoByAuthTokenInDatabase(authToken);

		if (authInfo != null) {
			socket.data.isAuthenticated = true;
			socket.data.authInfo = authInfo;

			socket.join(authInfo.getUserId());
			socket.join(authInfo.getSocketRoomIds());

			authInfo.setSocketId(socket.id);
		}
	}

	private async onSocketRequestMsgPack(socket: Socket, data: any, returnCode: number): Promise<OperationResponse> {
		let requestData: any;

		let buffer = data[0] as Buffer;
		if (buffer[0] == 4) {
			buffer = buffer.slice(1);
		}

		try {
			requestData = decode(buffer);
		} catch (err) {
			Debug.logException(err);
			return null;
		}

		if (requestData.length == 0) {
			return null;
		}

		return await this.onSocketResponse(socket, requestData, returnCode, true);
	}

	private async onSocketRequestJson(socket: Socket, data: any, returnCode: number): Promise<OperationResponse> {
		let requestData: any;

		let buffer = data[0];

		try {
			requestData = buffer;
		} catch (err) {
			Debug.logException(err);
			return null;
		}

		if (requestData.length == 0) {
			return null;
		}

		return await this.onSocketResponse(socket, requestData, returnCode, false);
	}

	private async onSocketResponse(socket: Socket, requestData: any, returnCode: number, encrypted: boolean): Promise<OperationResponse> {
		let code = requestData[0] as number;
		let params = requestData.length > 1 ? (requestData[1] as {}) : {};
		let requestId = requestData.length > 2 ? (requestData[2] as number) : -1;

		let request = new Request(code);
		request.setIP(socket.data.IPAddress);
		request.setParameters(params);
		request.setRequestId(requestId);
		request.setEncrypted(encrypted);

		let isAuthenticated = socket.data.isAuthenticated;
		if (isAuthenticated === true) request.setAuthenticate(socket.data.authInfo);

		if (this.enableSendAndReceiveDebug) {
			Debug.log("[SOCKET RECV] %O", request);
			Debug.log("[Parameters] " + JSON.stringify(params));
		}

		let operationResponse: OperationResponse;

		if (returnCode == ReturnCode.Ok) {
			try {
				operationResponse = await this._onRequestCb(request);
			}
			catch (err) {
				operationResponse = new OperationResponse(request.getCode(), request.getRequestId(), request.isEncrypted());
				operationResponse.setReturnCode(ReturnCode.InternalServerError);

				Debug.logException(err);
			}
		}
		else {
			operationResponse = new OperationResponse(request.getCode(), request.getRequestId(), request.isEncrypted());
			operationResponse.setReturnCode(returnCode);
		}

		return operationResponse;
	}

	private onSocketDisconnect(socket: Socket, data: string) {
		if (this.enableSendAndReceiveDebug) Debug.log("[SOCKET] on socket disconnected " + socket.id);

		if (this._onDisconnectCb != null) this._onDisconnectCb(socket, data);
	}

	private sendResponseForSocket(socket: Socket, operationResponse: OperationResponse) {
		let socketData = OperationHelper.toResponseSocketData(operationResponse);
		if (this.enableSendAndReceiveDebug) Debug.log("[SOCKET SEND] %O", JSON.stringify(socketData));

		if (operationResponse.isEncrypted())
			socket.emit(Commands.ResponseCmd_MsgPack, encode(socketData));
		else
			socket.emit(Commands.ResponseCmd_Json, socketData);
	}

	private sendEventForSocket(socket: Socket, operationEvent: OperationEvent) {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND] %O", JSON.stringify(socketData));

		if (operationEvent.isEncrypted())
			socket.emit(Commands.EventCmd_MsgPack, encode(socketData));
		else
			socket.emit(Commands.EventCmd_Json, socketData);
	}

	public async sendEventTo(userId: string, operationEvent: OperationEvent): Promise<void> {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO] %O", JSON.stringify(socketData));

		if (operationEvent.isEncrypted())
			this.emitter.to(userId).emit(Commands.EventCmd_MsgPack, encode(socketData));
		else
			this.emitter.to(userId).emit(Commands.EventCmd_Json, socketData);
	}

	public async sendEventToRoom(roomId: string, operationEvent: OperationEvent): Promise<void> {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO ROOM] %O", JSON.stringify(socketData));

		if (operationEvent.isEncrypted())
			this.emitter.to(roomId).emit(Commands.EventCmd_MsgPack, encode(socketData));
		else
			this.emitter.to(roomId).emit(Commands.EventCmd_Json, socketData);
	}

	public async sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent): Promise<void> {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO MORE USER] %O", JSON.stringify(socketData));

		if (operationEvent.isEncrypted()) {
			let socketDataMsgPack = encode(socketData);

			for (let i = 0; i < userIds.length; i++) {
				let userId = userIds[i];
				this.emitter.to(userId).emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
			}
		}
		else {
			for (let i = 0; i < userIds.length; i++) {
				let userId = userIds[i];
				this.emitter.to(userId).emit(Commands.EventCmd_Json, socketData);
			}
		}
	}

	public async sendEventToAllPlayer(operationEvent: OperationEvent): Promise<void> {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO ALL PLAYER] %O", JSON.stringify(socketData));

		if (operationEvent.isEncrypted())
			this.emitter.of("/").emit(Commands.EventCmd_MsgPack, encode(socketData));
		else
			this.emitter.of("/").emit(Commands.EventCmd_Json, socketData);
	}

	public async sendEventToNamespace(namespace: string, operationEvent: OperationEvent): Promise<void> {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO NAME SPACE] %O", JSON.stringify(socketData));

		if (operationEvent.isEncrypted())
			this.emitter.of("/" + namespace).emit(Commands.EventCmd_MsgPack, encode(socketData));
		else
			this.emitter.of("/" + namespace).emit(Commands.EventCmd_Json, socketData);
	}

	public getSocketViaUserId(userId: string): Socket {
		let authInfo = this.apiMiddleware.getAuthInfoByUserId(userId);
		return this.getSocketViaAuthInfo(authInfo);
	}

	public getSocketViaAuthToken(authToken: string): Socket {
		let authInfo = this.apiMiddleware.getAuthInfoByAuthToken(authToken);
		return this.getSocketViaAuthInfo(authInfo);
	}

	public getSocketViaSocketId(socketId: string): Socket {
		return socketId ? this.server.of("/").sockets.get(socketId) : null;
	}

	public getSocketViaAuthInfo(authInfo: AuthInfo) {
		return authInfo ? this.getSocketViaSocketId(authInfo.getSocketId()) : null;
	}

	public async joinRoom(userId: string, roomId: string): Promise<void> {
		let authInfo = this.apiMiddleware.getAuthInfoByUserId(userId);
		let socket = this.getSocketViaAuthInfo(authInfo);

		if (socket) {
			authInfo.addSocketRoomId(roomId);
			await socket.join(roomId);
		}
	}

	public async leaveRoom(userId: string, roomId: string): Promise<void> {
		let authInfo = this.apiMiddleware.getAuthInfoByUserId(userId);
		let socket = this.getSocketViaAuthInfo(authInfo);

		if (socket) {
			authInfo.removeSocketRoomId(roomId);
			await socket.leave(roomId);
		}
	}

	public getRooms(userId: string): Set<string> {
		let socket = this.getSocketViaUserId(userId);
		if (socket) {
			return socket.rooms;
		}

		return null;
	}

}
