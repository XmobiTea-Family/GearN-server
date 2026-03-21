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
	// Stores the on request cb value used by this instance.
	private _onRequestCb: OnHttpRequest;
	// Stores the API middleware value used by this instance.
	private apiMiddleware: ApiMiddleware;
	// Stores the anti DDoS middleware value used by this instance.
	private antiDdosMiddleware: AntiDdosMiddleware;

	// Stores the GearN server value used by this instance.
	private gnServer: GNServer;
	// Indicates whether send and receive debug is enabled.
	private enableSendAndReceiveDebug: boolean;
	// Indicates whether post via msg pack is enabled.
	private enablePostViaMsgPack: boolean;
	// Indicates whether post via JSON is enabled.
	private enablePostViaJson: boolean;

	// Stores the router value used by this instance.
	private router: express.Express;
	// Stores the API JSON router value used by this instance.
	private apiJsonRouter: express.Router;
	// Stores the API msg pack router value used by this instance.
	private apiMsgPackRouter: express.Router;

	/**
	 * Sets the router.
	 * @param router Provides the router value used by this operation.
	 */
	public setRouter(router: express.Express): void {
		this.router = router;
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
	 * Sets the GearN server.
	 * @param gnServer Provides the GearN server value used by this operation.
	 */
	public setGNServer(gnServer: GNServer): void {
		this.gnServer = gnServer;
	}

	/**
	 * Sets the on HTTP request.
	 * @param _onRequestCb Provides the on request cb value used by this operation.
	 */
	public setOnHttpRequest(_onRequestCb: OnHttpRequest) {
		this._onRequestCb = _onRequestCb;
	}

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
	 * Runs the current workflow.
	 */
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

			// Stores the auth token value used in the current execution flow.
			let authToken = req.body.authToken;

			if (!authToken) {
				return res.status(200).json({
					error: "missing authToken"
				});
			}

			// Stores the token payload value used in the current execution flow.
			let tokenPayload = this.apiMiddleware.verifyAuthToken(authToken);
			if (tokenPayload == null) {
				return res.status(200).json({
					error: "authToken expired or invalid"
				});
			}

			// Stores the auth info value used in the current execution flow.
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
			// Stores the auth token value used in the current execution flow.
			let authToken = req.query.authToken as string;

			if (!authToken) {
				return res.status(200).json({
					error: "missing authToken"
				});
			}

			// Stores the token payload value used in the current execution flow.
			let tokenPayload = this.apiMiddleware.verifyAuthToken(authToken);
			if (tokenPayload == null) {
				return res.status(200).json({
					error: "authToken expired or invalid"
				});
			}

			// Stores the auth info value used in the current execution flow.
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

		// Stores the API router value used in the current execution flow.
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
				// Stores the operation response value used in the current execution flow.
				let operationResponse = await this.onHttpRequest(req);

				this.antiDdosMiddleware.removePendingRequest(req, res);

				if (operationResponse != null) {
					// Stores the HTTP data value used in the current execution flow.
					let httpData = OperationHelper.toResponseHttpData(operationResponse);

					// Stores the final data value used in the current execution flow.
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
						// Stores the buffer value used in the current execution flow.
						let buffer: Buffer[] = [];

						req.on("data", chunk => buffer.push(chunk));
						req.on("end", () => {
							try {
								// Stores the raw value used in the current execution flow.
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
				// Stores the operation response value used in the current execution flow.
				let operationResponse = await this.onHttpRequest(req);

				this.antiDdosMiddleware.removePendingRequest(req, res);

				if (operationResponse != null) {
					// Stores the HTTP data value used in the current execution flow.
					let httpData = OperationHelper.toResponseHttpData(operationResponse);

					// Stores the final data value used in the current execution flow.
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

					// Stores the content value used in the current execution flow.
					let content = Buffer.from(encode(finalData));
					res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
					res.setHeader(Commands.CONTENT_LENGTH, content.length);
					return res.send(content);
				}

				// Stores the content value used in the current execution flow.
				let content = Buffer.from(encode({ returnCode: ReturnCode.OperationInvalid }));
				res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_MSGPACK);
				res.setHeader(Commands.CONTENT_LENGTH, content.length);
				return res.send(content);
			});
		}
	}

	/**
	 * Executes the on HTTP request workflow asynchronously.
	 * @param req Provides the req value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async onHttpRequest(req: express.Request): Promise<OperationResponse> {
		// Stores the request type str value used in the current execution flow.
		let requestTypeStr = req.params.requestType;
		// Stores the operation code str value used in the current execution flow.
		let operationCodeStr = req.params.operationCode;
		// Stores the role str value used in the current execution flow.
		let roleStr = req.params.role;

		if (!operationCodeStr || !requestTypeStr || !roleStr) return null;

		// Stores the request type value used in the current execution flow.
		let requestType = EnumUtility.parse(RequestType, requestTypeStr, true);
		// Stores the role value used in the current execution flow.
		let role = EnumUtility.parse(RequestRole, roleStr, true);

		if (requestType == null || role == null) return null;

		// Stores the operation response value used in the current execution flow.
		let operationResponse: OperationResponse;

		// Stores the parameters value used in the current execution flow.
		let parameters = req.body;
		// Stores the IP value used in the current execution flow.
		let ip = req.xip;
		// Stores the request value used in the current execution flow.
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
