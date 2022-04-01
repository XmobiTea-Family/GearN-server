const CONNECT_CMD = "connection";
const DISCONNECT_CMD = "disconnect";

const REQUEST_CMD = "";
const RESPONSE_CMD = "r";
const EVENT_CMD = "e";

import { Server, Socket } from "socket.io/dist";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import { OperationEvent } from "./../../GN-common/entity/operationEvent/OperationEvent";
import { OperationResponse } from "./../../GN-common/entity/operationResponse/OperationResponse";
import { AppHandlerBase } from "./AppHandlerBase";

export class SocketAppHandler extends AppHandlerBase {
	private server: Server;

	public setServer(server: Server): void {
		this.server = server;
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

		socket.on(REQUEST_CMD, async (data) => {
			await this.onSocketRequest(socket, data);
		});

		socket.on(DISCONNECT_CMD, async (data) => {
			await this.onSocketDisconnect(socket, data);
		});
	}

	private async initSocket(socket: Socket) {
		let socketAny = socket as any;

		socketAny.isAuthenticated = false;
		socketAny.authInfo = null;

		let ip = socket.conn.remoteAddress;
		if (ip.substring(0, 7) == "::ffff:") {
			ip = ip.substring(7);
		}

		socketAny.IPAddress = ip;

		socketAny.sendResponse = async function (operationResponse: OperationResponse) {
			console.log("%O", operationResponse);
			socket.emit(RESPONSE_CMD, operationResponse.toSocketData());
		};

		socketAny.sendEvent = async function (operationEvent: OperationEvent) {
			console.log("%O", operationEvent);
			socket.emit(EVENT_CMD, operationEvent.toSocketData());
		};
	}

	private async onSocketRequest(socket: Socket, data: any) {
		let typeOfData = typeof data;

		if (typeOfData === "string") return;

		if (data.length == null) {
			return;
		}

		let socketAny = socket as any;

		let code = data[0] as number;
		let params = data.length > 1 ? (data[1] as {}) : {};
		let requestId = data.length > 2 ? (data[2] as number) : -1;

		try {
			let request = new Request(code);
			request.setIP(socketAny.IPAddress);
			request.setParameters(params);
			request.setRequestId(requestId);

			if (socketAny.isAuthenticated) request.setAuthenticate(socketAny.authInfo);

			let operationResponse = await this.gameApplication.getRequestController().handleRequest(request);
			if (operationResponse != null) {
				socketAny.sendResponse(operationResponse);
			}
		} catch (err) {
			let operationResponse = OperationResponse.newOperationInternalServerError(code, requestId, err.toString());
			socketAny.sendResponse(operationResponse);
		}
	}

	private async onSocketDisconnect(socket: Socket, data: string) {
		this.gameApplication.handleSocketDisconnect(socket, data);
	}
}
