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
import { OperationHelper } from "./../../GN-common/entity/operationHelper/OperationHelper";
import { Commands } from "./../../GN-common/constant/Commands";
import { xDatabase } from "./../../GN-library/xdatabase/lib/xDatabase";
import { RequestType } from "../../GN-common/constant/enumType/RequestType";
import { EnumUtility } from "../../GN-common/helper/EnumUtility";
import { RequestRole } from "../../GN-common/constant/enumType/RequestRole";

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

	private xDatabase: xDatabase;

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

	public setDatabase(database: xDatabase) {
		this.xDatabase = database;
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
										this.sendResponseForSocket(socket, operationResponse, true);
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
										this.sendResponseForSocket(socket, operationResponse, false);
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

			if (socket.data.isSecreted) {
				socket.data.isSecreted = false;
				socket.data.secretInfo = null;
			}

			return;
		}

		let secretKey = data[1] as string;
		socket.data.secretKey = secretKey;

		let authToken = data[0] as string;
		if (!authToken) {
			if (socket.data.isAuthenticated === true) {
				socket.rooms.forEach(room => socket.leave(room));

				socket.data.isAuthenticated = false;
				socket.data.authInfo = null;
			}
		}
		else {
			let tokenPayload = this.apiMiddleware.verifyAuthToken(authToken);
			if (tokenPayload == null) {
				if (socket.data.isAuthenticated === true) {
					socket.rooms.forEach(room => socket.leave(room));

					socket.data.isAuthenticated = false;
					socket.data.authInfo = null;
				}
			}
			else {
				let gnToken: string = tokenPayload.gnToken;

				let authInfo = await this.apiMiddleware.getAuthInfoByGNTokenInDatabase(gnToken);

				if (authInfo != null) {
					if (!secretKey) {
						secretKey = authInfo.getSecretKey();
					}

					socket.data.isAuthenticated = true;
					socket.data.authInfo = authInfo;

					socket.join(authInfo.getUserId());
					socket.join(await this.getRooms(authInfo.getUserId()));
				}
			}
		}

		if (!secretKey) {
			socket.data.isSecreted = false;
			socket.data.secretInfo = null;
		}
		else {
			let secretInfo = await this.apiMiddleware.getSecretInfoBySecretKeyInDatabase(secretKey);

			if (secretInfo != null && secretInfo.getIsOnlyMasterAdmin()) {
				if (!socket.data.isAuthenticated || socket.data.authInfo.getSecretKey() != secretKey) {
					secretInfo = null;
				}
			}

			if (secretInfo != null) {
				socket.data.isSecreted = true;
				socket.data.secretInfo = secretInfo;

				if (socket.data.isAuthenticated === true) {
					let gamePlayer = await this.xDatabase.loadGamePlayerAsync(socket.data.authInfo.getUserId(), secretInfo.getGameId(), { playerGroups: true });

					if (gamePlayer != null && socket != null) {
						let playerGroups = gamePlayer.getAllPlayerGroups();

						for (let i = 0; i < playerGroups.length; i++) {
							let playerGroup = playerGroups[i];

							if (playerGroup.status == 0) {	// 0 is member
								socket.join(playerGroup.groupId);
							}
						}
					}
				}
			}
			else {
				socket.data.isSecreted = false;
				socket.data.secretInfo = null;
			}
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
		let requestTypeStr = requestData[0] as string;
		let operationCodeStr = requestData[1] as string;
		let roleStr = requestData[2] as string;
		
		if (!operationCodeStr || !requestTypeStr || !roleStr) return null;

		let requestType = EnumUtility.parse(RequestType, requestTypeStr, true);
		let role = EnumUtility.parse(RequestRole, roleStr, true);
		
		if (requestType == null || role == null) return null;

		let params = requestData.length > 3 ? (requestData[3] as {}) : {};
		let requestId = requestData.length > 4 ? (requestData[4] as number) : -1;

		let request = new Request(operationCodeStr, requestType, role);
		request.setIP(socket.data.IPAddress);
		request.setParameters(params);
		request.setRequestId(requestId);
		request.setEncrypted(encrypted);

		let isAuthenticated = socket.data.isAuthenticated;
		if (isAuthenticated === true) request.setAuthenticate(socket.data.authInfo);

		let isSecreted = socket.data.isSecreted;
		if (isSecreted === true) request.setSecretInfo(socket.data.secretInfo);

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
				operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
				operationResponse.setReturnCode(ReturnCode.InternalServerError);
				operationResponse.setDebugMessage(err.message);

				Debug.logException(err);
			}
		}
		else {
			operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
			operationResponse.setReturnCode(returnCode);
		}

		return operationResponse;
	}

	private onSocketDisconnect(socket: Socket, data: string) {
		if (this.enableSendAndReceiveDebug) Debug.log("[SOCKET] on socket disconnected " + socket.id);

		if (this._onDisconnectCb != null) this._onDisconnectCb(socket, data);
	}

	private sendResponseForSocket(socket: Socket, operationResponse: OperationResponse, useMsgPack: boolean) {
		let socketData = OperationHelper.toResponseSocketData(operationResponse);
		if (this.enableSendAndReceiveDebug) Debug.log("[SOCKET SEND] %O", JSON.stringify(socketData));

		if (operationResponse.isEncrypted()) {
            // TODO Encrypt data
		}

        if (useMsgPack) {
            let socketDataMsgPack = encode(socketData);

            socket.emit(Commands.ResponseCmd_MsgPack, socketDataMsgPack);
        }
        else {
            socket.emit(Commands.ResponseCmd_Json, socketData);
        }
	}

	// private sendEventForSocket(socket: Socket, operationEvent: OperationEvent) {
	// 	let socketData = OperationHelper.toEventSocketData(operationEvent);
	// 	if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND] %O", JSON.stringify(socketData));

	// 	if (operationEvent.isEncrypted())
	// 	{
	// 		let socketDataMsgPack = encode(socketData);

	// 		socket.emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
	// 	}
	// 	else
	// 	{
	// 		socket.emit(Commands.EventCmd_Json, socketData);
	// 	}
	// }

	public sendEventTo(userId: string, operationEvent: OperationEvent, useMsgPack: boolean = true): void {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO] " + userId + " %O", JSON.stringify(socketData));

		if (operationEvent.isEncrypted()) {
			// TODO Encrypt data
		}

        if (useMsgPack) {
            let socketDataMsgPack = encode(socketData);

			if (this.emitter != null) this.emitter.to(userId).emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
			else this.server.to(userId).emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
        }
        else {
            if (this.emitter != null) this.emitter.to(userId).emit(Commands.EventCmd_Json, socketData);
			else this.server.to(userId).emit(Commands.EventCmd_Json, socketData);
        }
	}

	public sendEventToRoom(roomId: string, operationEvent: OperationEvent, useMsgPack: boolean = true): void {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO ROOM] " + roomId + " %O", JSON.stringify(socketData));

		if (operationEvent.isEncrypted()) {
			// TODO Encrypt data
		}

        if (useMsgPack) {
            let socketDataMsgPack = encode(socketData);

			if (this.emitter != null) this.emitter.to(roomId).emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
			else this.server.to(roomId).emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
        }
        else {
            if (this.emitter != null) this.emitter.to(roomId).emit(Commands.EventCmd_Json, socketData);
			else this.server.to(roomId).emit(Commands.EventCmd_Json, socketData);
        }
	}

	public sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent, useMsgPack: boolean = true): void {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO MORE USER] %O", JSON.stringify(socketData));

        if (operationEvent.isEncrypted()) {
			// TODO Encrypt data
		}

		if (useMsgPack) {
			let socketDataMsgPack = encode(socketData);

			if (this.emitter != null) this.emitter.to(userIds).emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
			else this.server.to(userIds).emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
		}
		else {
			if (this.emitter != null) this.emitter.to(userIds).emit(Commands.EventCmd_Json, socketData);
			else this.server.to(userIds).emit(Commands.EventCmd_Json, socketData);
		}
	}

	public sendEventToAllPlayer(operationEvent: OperationEvent, useMsgPack: boolean = true): void {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO ALL PLAYER] %O", JSON.stringify(socketData));

        if (operationEvent.isEncrypted()) {
			// TODO Encrypt data
		}

		if (useMsgPack)
		{
			let socketDataMsgPack = encode(socketData);

			if (this.emitter != null) this.emitter.emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
			else this.server.emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
		}
		else
		{
			if (this.emitter != null) this.emitter.emit(Commands.EventCmd_Json, socketData);
			else this.server.emit(Commands.EventCmd_Json, socketData);
		}
	}

	public sendEventToNamespace(namespace: string, operationEvent: OperationEvent): void {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO NAME SPACE] %O", JSON.stringify(socketData));

		if (operationEvent.isEncrypted())
		{
			let socketDataMsgPack = encode(socketData);

			if (this.emitter != null) this.emitter.of("/" + namespace).emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
			else this.server.of("/" + namespace).emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
		}
		else
		{
			if (this.emitter != null) this.emitter.of("/" + namespace).emit(Commands.EventCmd_Json, socketData);
			else this.server.of("/" + namespace).emit(Commands.EventCmd_Json, socketData);
		}
	}

	public getSocketViaSocketId(socketId: string): Socket {
		return socketId ? this.server.of("/").sockets.get(socketId) : null;
	}

	public getSockets(userId: string) {
		return this.server.in(userId);
	}

	public joinRoom(userId: string, roomId: string): void {
		this.getSockets(userId).socketsJoin(roomId);
	}

	public leaveRoom(userId: string, roomId: string): void {
		this.getSockets(userId).socketsLeave(roomId);
	}

	public async getRooms(userId: string): Promise<string[]> {
		let answer: string[] = [];

		let sockets = await this.getSockets(userId).fetchSockets();

		for (let i = 0; i < sockets.length; i++) {
			let socket = sockets[i];

			socket.rooms.forEach(room => {
				if (!answer.includes(room)) answer.push(room);
			});
		}

		return answer;
	}

}
