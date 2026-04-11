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
import { RequestType } from "./../../GN-common/constant/enumType/RequestType";
import { EnumUtility } from "./../../GN-common/helper/EnumUtility";
import { RequestRole } from "./../../GN-common/constant/enumType/RequestRole";
import { AuthInfo } from "../../GN-common/entity/AuthInfo";

interface OnSocketAuthenticate {
	(socket: Socket, authInfo: AuthInfo): void;
}

interface OnSocketDisconnect {
	(socket: Socket, data: string): void;
}

interface OnSocketRequest {
	(request: Request): Promise<OperationResponse>;
}

/**
 * Owns the Socket.IO request pipeline, authentication handshake, and event fan-out helpers.
 */
export class SocketAppHandler {
	// Socket.IO lifecycle event names used by this handler.
	private static readonly CONNECT_CMD = "connection";
	private static readonly DISCONNECT_CMD = "disconnect";

	// Runtime callbacks injected by `GNServer`.
	private _onSocketAuthenticateCb: OnSocketAuthenticate;
	private _onDisconnectCb: OnSocketDisconnect;
	private _onRequestCb: OnSocketRequest;
	// Shared middleware dependencies used for auth and throttling.
	private apiMiddleware: ApiMiddleware;
	private antiDdosMiddleware: AntiDdosMiddleware;

	// Transport feature flags.
	private enableSendAndReceiveDebug: boolean;
	private enablePostViaMsgPack: boolean;
	private enablePostViaJson: boolean;

	// Local Socket.IO server plus optional Mongo emitter for clustered fan-out.
	private server: Server;
	private emitter: Emitter;

	// Database access is only needed by a few legacy flows.
	private xDatabase: xDatabase;

	/**
	 * Sets whether send and receive debug is enabled.
	 * @param enableSendAndReceiveDebug Indicates whether send and receive debug is enabled.
	 */
	public setEnableSendAndReceiveDebug(enableSendAndReceiveDebug: boolean): void {
		this.enableSendAndReceiveDebug = enableSendAndReceiveDebug;
	}

	/**
	 * Sets whether post via msg pack is enabled.
	 * @param enablePostViaMsgPack Indicates whether post via msg pack is enabled.
	 */
	public setEnablePostViaMsgPack(enablePostViaMsgPack: boolean): void {
		this.enablePostViaMsgPack = enablePostViaMsgPack;
	}

	/**
	 * Sets whether post via JSON is enabled.
	 * @param enablePostViaJson Indicates whether post via JSON is enabled.
	 */
	public setEnablePostViaJson(enablePostViaJson: boolean): void {
		this.enablePostViaJson = enablePostViaJson;
	}

	/**
	 * Sets the server.
	 * @param server Provides the server value used by this operation.
	 */
	public setServer(server: Server): void {
		this.server = server;
	}

	/**
	 * Sets the API middleware.
	 * @param apiMiddleware Provides the API middleware value used by this operation.
	 */
	public setApiMiddleware(apiMiddleware: ApiMiddleware): void {
		this.apiMiddleware = apiMiddleware;
	}

	/**
	 * Sets the anti DDoS middleware.
	 * @param antiDdosMiddleware Provides the anti DDoS middleware value used by this operation.
	 */
	public setAntiDdosMiddleware(antiDdosMiddleware: AntiDdosMiddleware): void {
		this.antiDdosMiddleware = antiDdosMiddleware;
	}

	/**
	 * Sets the emitter.
	 * @param emitter Provides the emitter value used by this operation.
	 */
	public setEmitter(emitter: Emitter) {
		this.emitter = emitter;
	}

	/**
	 * Sets the database.
	 * @param database Provides the database value used by this operation.
	 */
	public setDatabase(database: xDatabase) {
		this.xDatabase = database;
	}

	/**
	 * Sets the on socket request.
	 * @param _onRequestCb Provides the on request cb value used by this operation.
	 */
	public setOnSocketRequest(_onRequestCb: OnSocketRequest) {
		this._onRequestCb = _onRequestCb;
	}

	/**
	 * Sets the on socket disconnect.
	 * @param _onDisconnectCb Provides the on disconnect cb value used by this operation.
	 */
	public setOnSocketDisconnect(_onDisconnectCb: OnSocketDisconnect) {
		this._onDisconnectCb = _onDisconnectCb;
	}

	/**
	 * Sets the on socket authenticate.
	 * @param _onAuthenticateCb Provides the on authenticate cb value used by this operation.
	 */
	public setOnSocketAuthenticate(_onAuthenticateCb: OnSocketAuthenticate) {
		this._onSocketAuthenticateCb = _onAuthenticateCb;
	}

	/**
	 * Attaches the root socket connection listener.
	 */
	public run(): void {
		this.server.on(SocketAppHandler.CONNECT_CMD, (socket) => {
			// let masterClient = <any>socket;
			this.socketConnect(socket);
		});
	}

	/**
	 * Wires all request/auth/disconnect listeners for a newly connected socket.
	 * @param socket Provides the socket value used by this operation.
	 */
	private socketConnect(socket: Socket) {
		if (this.enableSendAndReceiveDebug) Debug.log("[SOCKET] on socket connect with " + socket.id);

		this.initSocket(socket);

		// Keep a stable self-reference inside deeply nested middleware callbacks.
		let thiz = this;

		socket.on(Commands.RequestAuthTokenCmd, (...data) => {
			this.antiDdosMiddleware.checkMaxRequestPerSecondPerIpViaSocket(socket, data, async () => {
				await thiz.onSocketRequestAuthToken(socket, data);
			});
		});

		if (this.enablePostViaMsgPack) {
			socket.on(Commands.RequestCmd_MsgPack, (...data) => {
				thiz.antiDdosMiddleware.checkRequestSizeBodyViaSocketMsgPack(socket, data, () => {
					thiz.antiDdosMiddleware.checkMaxRequestPerSecondPerIpViaSocket(socket, data, () => {
						thiz.antiDdosMiddleware.checkMaxRequestPerSecondPerPeerViaSocket(socket, data, () => {
							thiz.antiDdosMiddleware.addPendingRequestViaSocket(socket, data, () => {
								thiz.apiMiddleware.socketAuthenticateToken(socket, async (returnCode: number) => {
									// Build the response only after auth and throttling have both completed.
									let operationResponse = await thiz.onSocketRequestMsgPack(socket, data, returnCode);

									if (operationResponse != null) {
										thiz.sendResponseForSocket(socket, operationResponse, true);
									}

									thiz.antiDdosMiddleware.removePendingRequestViaSocket(socket, data);
								});
							});
						});
					});
				});
			});
		}

		if (this.enablePostViaJson) {
			socket.on(Commands.RequestCmd_Json, (...data) => {
				thiz.antiDdosMiddleware.checkRequestSizeBodyViaSocketJson(socket, data, () => {
					thiz.antiDdosMiddleware.checkMaxRequestPerSecondPerIpViaSocket(socket, data, () => {
						thiz.antiDdosMiddleware.checkMaxRequestPerSecondPerPeerViaSocket(socket, data, () => {
							thiz.antiDdosMiddleware.addPendingRequestViaSocket(socket, data, () => {
								thiz.apiMiddleware.socketAuthenticateToken(socket, async (returnCode: number) => {
									// Build the response only after auth and throttling have both completed.
									let operationResponse = await thiz.onSocketRequestJson(socket, data, returnCode);

									if (operationResponse != null) {
										thiz.sendResponseForSocket(socket, operationResponse, false);
									}

									thiz.antiDdosMiddleware.removePendingRequestViaSocket(socket, data);
								});
							});
						});
					});
				});
			});
		}

		socket.on(SocketAppHandler.DISCONNECT_CMD, (data) => {
			thiz.onSocketDisconnect(socket, data);
		});
	}

	/**
	 * Resolves and normalizes the caller IP once per socket connection.
	 * @param socket Provides the socket value used by this operation.
	 */
	private initSocket(socket: Socket) {
		let ip: string = null;

		// Respect the configured proxy header first, then fall back to common Socket.IO sources.
		let headerIP = this.apiMiddleware.getHeaderIP();
		if (headerIP != null) {
			ip = socket.handshake.headers[headerIP.toLowerCase()] as string;
		}

		if (ip == null) {
			ip = (socket.handshake.headers["x-forwarded-for"] as string)?.split(',')[0].trim();
		}

		if (ip == null) {
			// ip = socket.conn.remoteAddress;
			ip = socket.handshake.address;
		}

		ip = this.apiMiddleware.createIP(ip);

		socket.data.IPAddress = ip;
	}

	/**
	 * Processes the lightweight socket auth handshake that stores auth/secret state on `socket.data`.
	 * @param socket Provides the socket value used by this operation.
	 * @param data Provides the data value used by this operation.
	 */
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

					this.onSocketAuthenticate(socket, authInfo);
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

				// if (socket.data.isAuthenticated === true) {
				// 	let gamePlayer = await this.xDatabase.loadGamePlayerAsync(socket.data.authInfo.getUserId(), secretInfo.getGameId(), { playerGroups: true });

				// 	if (gamePlayer != null && socket != null) {
				// 		let playerGroups = gamePlayer.getAllPlayerGroups();

				// 		for (let i = 0; i < playerGroups.length; i++) {
				// 			let playerGroup = playerGroups[i];

				// 			if (playerGroup.status == 0) {	// 0 is member
				// 				socket.join(playerGroup.groupId);
				// 			}
				// 		}
				// 	}
				// }
			}
			else {
				socket.data.isSecreted = false;
				socket.data.secretInfo = null;
			}
		}
	}

	/**
	 * Decodes a MsgPack socket request and forwards it to the common request pipeline.
	 * @param socket Provides the socket value used by this operation.
	 * @param data Provides the data value used by this operation.
	 * @param returnCode Provides the return code value used by this operation.
	 * @returns Resolves with the operation result.
	 */
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

		return await this.onSocketResponse(socket, requestData, returnCode);
	}

	/**
	 * Normalizes a JSON socket request and forwards it to the common request pipeline.
	 * @param socket Provides the socket value used by this operation.
	 * @param data Provides the data value used by this operation.
	 * @param returnCode Provides the return code value used by this operation.
	 * @returns Resolves with the operation result.
	 */
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

		return await this.onSocketResponse(socket, requestData, returnCode);
	}

	/**
	 * Converts raw socket payload data into a `Request`, runs the injected request handler, and returns a response.
	 * @param socket Provides the socket value used by this operation.
	 * @param requestData Provides the request data value used by this operation.
	 * @param returnCode Provides the return code value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async onSocketResponse(socket: Socket, requestData: any, returnCode: number): Promise<OperationResponse> {
		let requestTypeStr = requestData[0] as string;
		let roleStr = requestData[1] as string;
		let operationCodeStr = requestData[2] as string;

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
				operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
				operationResponse.setReturnCode(ReturnCode.InternalServerError);
				operationResponse.setDebugMessage(err.message);

				Debug.logException(err);
			}
		}
		else {
			operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
			operationResponse.setReturnCode(returnCode);
		}

		return operationResponse;
	}

	/**
	 * Emits the injected disconnect callback after local debug logging.
	 * @param socket Provides the socket value used by this operation.
	 * @param data Provides the data value used by this operation.
	 */
	private onSocketDisconnect(socket: Socket, data: string) {
		if (this.enableSendAndReceiveDebug) Debug.log("[SOCKET] on socket disconnected " + socket.id);

		if (this._onDisconnectCb != null) this._onDisconnectCb(socket, data);
	}

	/**
	 * Emits the injected post-auth callback after the handshake succeeds.
	 * @param socket Provides the socket value used by this operation.
	 * @param authInfo Provides the auth info value used by this operation.
	 */
	private onSocketAuthenticate(socket: Socket, authInfo: AuthInfo) {

		if (this._onSocketAuthenticateCb != null) this._onSocketAuthenticateCb(socket, authInfo);
	}

	/**
	 * Serializes an `OperationResponse` back to the client in JSON or MsgPack form.
	 * @param socket Provides the socket value used by this operation.
	 * @param operationResponse Provides the operation response value used by this operation.
	 * @param useMsgPack Indicates whether msg pack should be used.
	 */
	private sendResponseForSocket(socket: Socket, operationResponse: OperationResponse, useMsgPack: boolean) {
		let socketData = OperationHelper.toResponseSocketData(operationResponse);

		let finalData = {
			returnCode: socketData.returnCode,
			responseId: socketData.responseId,
		} as any;

		if (socketData.parameters) {
			finalData.parameters = socketData.parameters;
		}

		if (socketData.invalidRequestParameters) {
			finalData.invalidRequestParameters = socketData.invalidRequestParameters;
		}

		if (socketData.debugMessage) {
			finalData.debugMessage = socketData.debugMessage;
		}

		if (this.enableSendAndReceiveDebug) Debug.log("[SOCKET SEND] %O", JSON.stringify(finalData));

		if (useMsgPack) {
			let socketDataMsgPack = encode(finalData);

			socket.emit(Commands.ResponseCmd_MsgPack, socketDataMsgPack);
		}
		else {
			socket.emit(Commands.ResponseCmd_Json, finalData);
		}
	}

	// private sendEventForSocket(socket: Socket, operationEvent: OperationEvent, useMsgPack: boolean = true) {
	// 	let socketData = OperationHelper.toEventSocketData(operationEvent);
	// 	if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND] %O", JSON.stringify(socketData));

	// 	if (useMsgPack)
	// 	{
	// 		let socketDataMsgPack = encode(socketData);

	// 		socket.emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
	// 	}
	// 	else
	// 	{
	// 		socket.emit(Commands.EventCmd_Json, socketData);
	// 	}
	// }

	/**
	 * Emits an event to every socket currently joined to the user-id room.
	 */
	public sendEventTo(userId: string, operationEvent: OperationEvent, useMsgPack: boolean = true): void {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO] " + userId + " %O", JSON.stringify(socketData));

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

	/**
	 * Emits an event to every socket joined to a room.
	 * @param roomId Provides the room ID value used by this operation.
	 * @param operationEvent Provides the operation event value used by this operation.
	 * @param useMsgPack Indicates whether msg pack should be used.
	 */
	public sendEventToRoom(roomId: string, operationEvent: OperationEvent, useMsgPack: boolean = true): void {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO ROOM] " + roomId + " %O", JSON.stringify(socketData));

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

	/**
	 * Emits an event to multiple user-id rooms at once.
	 * @param userIds Indicates whether r IDs should be used.
	 * @param operationEvent Provides the operation event value used by this operation.
	 * @param useMsgPack Indicates whether msg pack should be used.
	 */
	public sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent, useMsgPack: boolean = true): void {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO MORE USER] %O", JSON.stringify(socketData));

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

	/**
	 * Broadcasts an event to every connected socket.
	 * @param operationEvent Provides the operation event value used by this operation.
	 * @param useMsgPack Indicates whether msg pack should be used.
	 */
	public sendEventToAllPlayer(operationEvent: OperationEvent, useMsgPack: boolean = true): void {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO ALL PLAYER] %O", JSON.stringify(socketData));

		if (useMsgPack) {
			let socketDataMsgPack = encode(socketData);

			if (this.emitter != null) this.emitter.emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
			else this.server.emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
		}
		else {
			if (this.emitter != null) this.emitter.emit(Commands.EventCmd_Json, socketData);
			else this.server.emit(Commands.EventCmd_Json, socketData);
		}
	}

	/**
	 * Broadcasts an event to every socket inside a Socket.IO namespace.
	 * @param namespace Provides the namespace value used by this operation.
	 * @param operationEvent Provides the operation event value used by this operation.
	 * @param useMsgPack Indicates whether msg pack should be used.
	 */
	public sendEventToNamespace(namespace: string, operationEvent: OperationEvent, useMsgPack: boolean = true): void {
		let socketData = OperationHelper.toEventSocketData(operationEvent);
		if (this.enableSendAndReceiveDebug) Debug.log("[EVENT SEND EVENT TO NAME SPACE] %O", JSON.stringify(socketData));

		if (useMsgPack) {
			let socketDataMsgPack = encode(socketData);

			if (this.emitter != null) this.emitter.of("/" + namespace).emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
			else this.server.of("/" + namespace).emit(Commands.EventCmd_MsgPack, socketDataMsgPack);
		}
		else {
			if (this.emitter != null) this.emitter.of("/" + namespace).emit(Commands.EventCmd_Json, socketData);
			else this.server.of("/" + namespace).emit(Commands.EventCmd_Json, socketData);
		}
	}

	/**
	 * Returns one live socket by id from the root namespace.
	 * @param socketId Provides the socket ID value used by this operation.
	 * @returns Returns the socket via socket ID.
	 */
	public getSocketViaSocketId(socketId: string): Socket {
		return socketId ? this.server.of("/").sockets.get(socketId) : null;
	}

	/**
	 * Returns the room operator for a user-id room.
	 * @param userId Indicates whether r ID should be used.
	 */
	public getSockets(userId: string) {
		return this.server.in(userId);
	}

	/**
	 * Joins every active socket of a user to the given room.
	 * @param userId Indicates whether r ID should be used.
	 * @param roomId Provides the room ID value used by this operation.
	 */
	public joinRoom(userId: string, roomId: string): void {
		this.getSockets(userId).socketsJoin(roomId);
	}

	/**
	 * Removes every active socket of a user from the given room.
	 * @param userId Indicates whether r ID should be used.
	 * @param roomId Provides the room ID value used by this operation.
	 */
	public leaveRoom(userId: string, roomId: string): void {
		this.getSockets(userId).socketsLeave(roomId);
	}

	/**
	 * Aggregates every room joined by every active socket of the given user.
	 * @param userId Indicates whether r ID should be used.
	 * @returns Returns the rooms.
	 */
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
