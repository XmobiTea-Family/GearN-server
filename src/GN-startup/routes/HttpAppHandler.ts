import { wrap } from "./utils/wrap";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import express from "express";
import { OperationResponse } from "./../../GN-common/entity/operationResponse/OperationResponse";
import { ApiMiddleware } from "./../middleware/ApiMiddleware";
import { GNServer } from "./../../GNServer";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";
import { encode, decode } from "@msgpack/msgpack";
import { AntiDdosMiddleware } from "./../middleware/AntiDdosMiddleware";
import { OperationHelper } from "./../../GN-common/entity/operationHelper/OperationHelper";
import { Commands } from "./../../GN-common/constant/Commands";
import { EnumUtility } from "./../../GN-common/helper/EnumUtility";
import { RequestType } from "./../../GN-common/constant/enumType/RequestType";
import { RequestRole } from "./../../GN-common/constant/enumType/RequestRole";

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

			return res.status(200).json({
				"ts": xDatetime.getCurrentMilliseconds(),
			});
		});

		this.router.get("/ts", (req: express.Request, res: express.Response): any => {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);

			return res.status(200).json({
				"ts": xDatetime.getCurrentMilliseconds(),
			});
		});

		this.router.post("/getAuthInfo", async (req: express.Request, res: express.Response): Promise<any> => {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);

			let authToken = req.body.authToken;

			if (!authToken) {
				return res.status(200).json({
					error: "missing authToken"
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
					error: "missing authToken"
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
				wrap((req, res, next) => {
					return this.apiMiddleware.authenticateTokenViaJson(req, res, next);
				}),
				wrap((req, res, next) => {
					return this.antiDdosMiddleware.checkMaxRequestPerSecondPerPeerViaJson(req, res, next);
				}),
				express.json({ limit: "10mb" }),
				wrap((req, res, next) => {
					return this.antiDdosMiddleware.addPendingRequestViaJson(req, res, next);
				}),
				this.apiJsonRouter
			);

			this.apiJsonRouter.post("/:requestType/:role/:operationCode", async (req: express.Request, res: express.Response): Promise<any> => {
				let operationResponse = await this.onHttpRequest(req);

				this.antiDdosMiddleware.removePendingRequest(req, res);

				if (operationResponse != null) {
					let httpData = OperationHelper.toResponseHttpData(operationResponse);

					let finalData = {
						returnCode: httpData.returnCode,
					} as any;

					if (httpData.parameters) {
						finalData.parameters = httpData.parameters;
					}

					if (httpData.invalidRequestParameters) {
						finalData.invalidRequestParameters = httpData.invalidRequestParameters;
					}

					if (httpData.debugMessage) {
						finalData.debugMessage = httpData.debugMessage;
					}

					if (this.enableSendAndReceiveDebug) Debug.log("[HTTP SEND] %O", JSON.stringify(finalData));

					res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
					return res.send(finalData);
				}

				res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);
				return res.send({
					returnCode: ReturnCode.OperationInvalid
				});
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
				wrap((req, res, next) => {
					return this.apiMiddleware.authenticateTokenViaMsgPack(req, res, next);
				}),
				wrap((req, res, next) => {
					return this.antiDdosMiddleware.checkMaxRequestPerSecondPerPeerViaMsgPack(req, res, next);
				}),
				(req, res, next) => {
					if (req.header(Commands.CONTENT_TYPE) === Commands.APPLICATION_MSGPACK) {
						let buffer: Buffer[] = [];

						req.on("data", chunk => buffer.push(chunk));
						req.on("end", () => {
							try {
								const raw = Buffer.concat(buffer);
								req.body = decode(raw);
								return next();
							} catch (err) {
								return next(err);
							}
						});

						return;
					}

					return next();
				},
				wrap((req, res, next) => {
					return this.antiDdosMiddleware.addPendingRequestViaMsgPack(req, res, next);
				}),
				this.apiMsgPackRouter
			);

			this.apiMsgPackRouter.post("/:requestType/:role/:operationCode", async (req: express.Request, res: express.Response): Promise<any> => {
				let operationResponse = await this.onHttpRequest(req);

				this.antiDdosMiddleware.removePendingRequest(req, res);

				if (operationResponse != null) {
					let httpData = OperationHelper.toResponseHttpData(operationResponse);

					let finalData = {
						returnCode: httpData.returnCode,
					} as any;

					if (httpData.parameters) {
						finalData.parameters = httpData.parameters;
					}

					if (httpData.invalidRequestParameters) {
						finalData.invalidRequestParameters = httpData.invalidRequestParameters;
					}

					if (httpData.debugMessage) {
						finalData.debugMessage = httpData.debugMessage;
					}

					if (this.enableSendAndReceiveDebug) Debug.log("[HTTP SEND] %O", JSON.stringify(finalData));

					let content = Buffer.from(encode(finalData));
					res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
					res.setHeader(Commands.CONTENT_LENGTH, content.length);
					return res.send(content);
				}

				let content = Buffer.from(encode({ returnCode: ReturnCode.OperationInvalid }));
				res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
				res.setHeader(Commands.CONTENT_LENGTH, content.length);
				return res.send(content);
			});
		}
	}

	private async onHttpRequest(req: express.Request): Promise<OperationResponse> {
		let requestTypeStr = req.params.requestType;
		let operationCodeStr = req.params.operationCode;
		let roleStr = req.params.role;

		if (!operationCodeStr || !requestTypeStr || !roleStr) return null;

		let requestType = EnumUtility.parse(RequestType, requestTypeStr, true);
		let role = EnumUtility.parse(RequestRole, roleStr, true);

		if (requestType == null || role == null) return null;

		let operationResponse: OperationResponse;

		let parameters = req.body;
		let ip = req.xip;
		let request = new Request(operationCodeStr, requestType, role);
		request.setRequestId(0);
		request.setIP(ip);
		request.setParameters(!parameters ? {} : parameters);
		request.setAuthenticate(req.authInfo);
		request.setSecretInfo(req.secretInfo);

		if (this.enableSendAndReceiveDebug) {
			Debug.log("[HTTP RECV] %O", request);
			Debug.log("[Parameters] " + JSON.stringify(parameters));
		}

		try {
			operationResponse = await this._onRequestCb(request);
		}
		catch (err) {
			operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
			operationResponse.setReturnCode(ReturnCode.InternalServerError);
			operationResponse.setDebugMessage(err.message);

			Debug.logException(err);
		}

		return operationResponse;
	}

}
