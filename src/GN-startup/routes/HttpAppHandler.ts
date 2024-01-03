import { wrap } from "async-middleware";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import express from "express";
import { OperationResponse } from "./../../GN-common/entity/operationResponse/OperationResponse";
import { ApiMiddleware } from "./../middleware/ApiMiddleware";
import { GNServer } from "./../../GNServer";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import msgpack from "express-msgpack";
import { encode } from "@msgpack/msgpack";
import { AntiDdosMiddleware } from "./../middleware/AntiDdosMiddleware";
import { OperationHelper } from "./../../GN-common/entity/operationHelper/OperationHelper";
import { Commands } from "./../../GN-common/constant/Commands";

interface OnHttpRequest {
	(request: Request): Promise<OperationResponse>;
}

export class HttpAppHandler {
	private _onRequestCb: OnHttpRequest;
	private apiMiddleware: ApiMiddleware;
	private antiDdosMiddleware: AntiDdosMiddleware;

	private gnServer: GNServer;
	private enableSendAndReceiveDebug: boolean;
	private enablePostViaMsgPack: boolean;
	private enablePostViaJson: boolean;

	private router: express.Express;
	private apiJsonRouter: express.Router;
	private apiMsgPackRouter: express.Router;

	public setRouter(router: express.Express): void {
		this.router = router;
	}

	public setApiMiddleware(apiMiddleware: ApiMiddleware): void {
		this.apiMiddleware = apiMiddleware;
	}

	public setAntiDdosMiddleware(antiDdosMiddleware: AntiDdosMiddleware): void {
		this.antiDdosMiddleware = antiDdosMiddleware;
	}

	public setGNServer(gnServer: GNServer): void {
		this.gnServer = gnServer;
	}

	public setOnHttpRequest(_onRequestCb: OnHttpRequest) {
		this._onRequestCb = _onRequestCb;
	}

	public setEnableSendAndReceiveDebug(enableSendAndReceiveDebug: boolean): void {
		this.enableSendAndReceiveDebug = enableSendAndReceiveDebug;
	}

	public setEnablePostViaMsgPack(enablePostViaMsgPack: boolean): void {
		this.enablePostViaMsgPack = enablePostViaMsgPack;
	}

	public setEnablePostViaJson(enablePostViaJson: boolean): void {
		this.enablePostViaJson = enablePostViaJson;
	}

	public run(): void {
		// this.router.get("/getConfig/:configName", (req: express.Request, res: express.Response) => {
		// 	res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);

		// 	let configName = req.params.configName;
		// 	if (configName != null) {
		// 		let configItem = this.gnServer.getConfigGame().getConfig(configName);

		// 		if (configItem != null) return res.json([ReturnCode.Ok, { "1": configItem.toJson() }]);
		// 	}

		// 	return res.json([ReturnCode.OperationInvalid]);
		// });

		this.router.post("/ts", (req: express.Request, res: express.Response): any => {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);

			return res.status(200).json([ReturnCode.Ok, { "1": xDatetime.getCurrentMilliseconds() }]);
		});

		this.router.get("/ts", (req: express.Request, res: express.Response): any => {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);

			return res.status(200).json([ReturnCode.Ok, { "1": xDatetime.getCurrentMilliseconds() }]);
		});

		this.router.post("/getAuthInfo", async (req: express.Request, res: express.Response): Promise<any> => {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);

			let authToken = req.body.authToken;

			if (!authToken) {
				return res.status(200).json({
					error: "missing authToken in body"
				});
			}

			let tokenPayload = this.apiMiddleware.verifyAuthToken(authToken);
			if (tokenPayload == null) {
				return res.status(200).json({
					error: "authToken expired or invalid"
				});
			}

			let authInfo = await this.apiMiddleware.getAuthInfoByGNTokenInDatabase(tokenPayload.gnToken);
			if (authInfo == null) {
				return res.status(200).json({
					error: "authInfo not found"
				});
			}

			return res.status(200).json({
				data: {
					gnToken: authInfo.getGNToken(),
					userId: authInfo.getUserId(),
					isRemove: authInfo.isRemove(),
					tsExpire: authInfo.getTsExpire(),
					otherDatas: authInfo.getOtherDatas(),
					tsCreate: authInfo.getTsCreate(),
					secretKey: authInfo.getSecretKey(),
				}
			});
		});

		this.router.get("/getAuthInfo", async (req: express.Request, res: express.Response): Promise<any> => {
			let authToken = req.query.authToken as string;

			if (!authToken) {
				return res.status(200).json({
					error: "missing authToken in body"
				});
			}

			let tokenPayload = this.apiMiddleware.verifyAuthToken(authToken);
			if (tokenPayload == null) {
				return res.status(200).json({
					error: "authToken expired or invalid"
				});
			}

			let authInfo = await this.apiMiddleware.getAuthInfoByGNTokenInDatabase(tokenPayload.gnToken);
			if (authInfo == null) {
				return res.status(200).json({
					error: "authInfo not found"
				});
			}

			return res.status(200).json({
				data: {
					gnToken: authInfo.getGNToken(),
					userId: authInfo.getUserId(),
					isRemove: authInfo.isRemove(),
					tsExpire: authInfo.getTsExpire(),
					otherDatas: authInfo.getOtherDatas(),
					tsCreate: authInfo.getTsCreate(),
					secretKey: authInfo.getSecretKey(),
				}
			});
		});

		const apiRouter = express.Router();
		this.router.use("/api", apiRouter);

		if (this.enablePostViaJson) {
			this.apiJsonRouter = express.Router();

			apiRouter.use(
				"/" + Commands.RequestCmd_Json,
				wrap((req, res, next) => {
					return this.apiMiddleware.getIP(req, res, next);
				}),
				wrap((req, res, next) => {
					return this.antiDdosMiddleware.checkMaxRequestPerSecondPerIpViaJson(req, res, next);
				}),
				wrap((req, res, next) => {
					return this.antiDdosMiddleware.checkRequestSizeBodyViaJson(req, res, next);
				}),
				express.json(),
				wrap((req, res, next) => {
					return this.apiMiddleware.authenticateTokenViaJson(req, res, next);
				}),
				wrap((req, res, next) => {
					return this.antiDdosMiddleware.checkMaxRequestPerSecondPerPeerViaJson(req, res, next);
				}),
				wrap((req, res, next) => {
					return this.antiDdosMiddleware.addPendingRequestViaJson(req, res, next);
				}),
				this.apiJsonRouter
			);

			this.apiJsonRouter.post("/:code/:type/:role", async (req: express.Request, res: express.Response): Promise<any> => {
				let operationResponse = await this.onHttpRequest(req, false);

				this.antiDdosMiddleware.removePendingRequest(req, res);

				if (operationResponse != null) {
					let httpData = OperationHelper.toResponseHttpData(operationResponse);
					if (this.enableSendAndReceiveDebug) {
						Debug.log("[HTTP SEND] %O", JSON.stringify(httpData));
					}

					if (operationResponse.isEncrypted()) {
						let content = Buffer.from(encode(httpData));
						res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
						res.setHeader(Commands.CONTENT_LENGTH, content.length);
						return res.send(content);
					}
					else {
						res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
						return res.send(httpData);
					}
				}
				
				res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
				return res.send([ReturnCode.OperationInvalid]);
			});
		}

		if (this.enablePostViaMsgPack) {
			this.apiMsgPackRouter = express.Router();
			
			apiRouter.use(
				"/" + Commands.RequestCmd_MsgPack,
				wrap((req, res, next) => {
					return this.apiMiddleware.getIP(req, res, next);
				}),
				wrap((req, res, next) => {
					return this.antiDdosMiddleware.checkMaxRequestPerSecondPerIpViaMsgPack(req, res, next);
				}),
				wrap((req, res, next) => {
					return this.antiDdosMiddleware.checkRequestSizeBodyViaMsgPack(req, res, next);
				}),
				msgpack(),
				wrap((req, res, next) => {
					return this.apiMiddleware.authenticateTokenViaMsgPack(req, res, next);
				}),
				wrap((req, res, next) => {
					return this.antiDdosMiddleware.checkMaxRequestPerSecondPerPeerViaMsgPack(req, res, next);
				}),
				wrap((req, res, next) => {
					return this.antiDdosMiddleware.addPendingRequestViaMsgPack(req, res, next);
				}),
				this.apiMsgPackRouter
			);

			this.apiMsgPackRouter.post("/:code/:type/:role", async (req: express.Request, res: express.Response): Promise<any> => {
				let operationResponse = await this.onHttpRequest(req, true);

				this.antiDdosMiddleware.removePendingRequest(req, res);

				if (operationResponse != null) {
					let httpData = OperationHelper.toResponseHttpData(operationResponse);
					if (this.enableSendAndReceiveDebug) {
						Debug.log("[HTTP SEND] %O", JSON.stringify(httpData));
					}

					if (operationResponse.isEncrypted()) {
						let content = Buffer.from(encode(httpData));
						res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
						res.setHeader(Commands.CONTENT_LENGTH, content.length);
						return res.send(content);
					}
					else {
						let content = httpData;
						res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
						return res.send(content);
					}
				}

				let content = Buffer.from(encode([ReturnCode.OperationInvalid]));
				res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
				res.setHeader(Commands.CONTENT_LENGTH, content.length);
				return res.send(content);
			});
		}
	}

	private async onHttpRequest(req: express.Request, encrypted: boolean): Promise<OperationResponse> {
		let codeStr = req.params.code;
		let typeStr = req.params.type;
		let roleStr = req.params.role;
		if (isNaN(codeStr as any) || isNaN(typeStr as any) || isNaN(roleStr as any)) return null;

		let code = Number.parseInt(codeStr);
		let type = Number.parseInt(typeStr);
		let role = Number.parseInt(roleStr);
		let operationResponse: OperationResponse;

		let parameters = req.body;
		let ip = req.xip;
		let request = new Request(code, type, role);
		request.setRequestId(0);
		request.setIP(ip);
		request.setParameters(!parameters ? {} : parameters);
		request.setAuthenticate(req.authInfo);
		request.setSecretInfo(req.secretInfo);
		request.setEncrypted(encrypted);

		if (this.enableSendAndReceiveDebug) {
			Debug.log("[HTTP RECV] %O", request);
			Debug.log("[Parameters] " + JSON.stringify(parameters));
		}

		try {
			operationResponse = await this._onRequestCb(request);
		}
		catch (err) {
			operationResponse = new OperationResponse(code, 0, request.isEncrypted());
			operationResponse.setReturnCode(ReturnCode.InternalServerError);

			Debug.logException(err);
		}

		return operationResponse;
	}

}
