import { wrap } from "async-middleware";
import { Router } from "express";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import express from "express";
import { OperationResponse } from "./../../GN-common/entity/operationResponse/OperationResponse";
import { ApiMiddleware } from "./../middleware/ApiMiddleware";
import { GameApplication } from "./../../GameApplication";
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

	private gameApplication: GameApplication;
	private enableSendAndReceiveDebug: boolean;
	private enablePostViaMsgPack: boolean;
	private enablePostViaJson: boolean;

	private router: Router;
	private apiJsonRouter: Router;
	private apiMsgPackRouter: Router;

	public setRouter(router: Router): void {
		this.router = router;
	}

	public setApiMiddleware(apiMiddleware: ApiMiddleware): void {
		this.apiMiddleware = apiMiddleware;
	}

	public setAntiDdosMiddleware(antiDdosMiddleware: AntiDdosMiddleware): void {
		this.antiDdosMiddleware = antiDdosMiddleware;
	}

	public setGameApplication(gameApplication: GameApplication): void {
		this.gameApplication = gameApplication;
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
		this.router.get("/getConfig/:configName", (req: express.Request, res: express.Response) => {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);

			let configName = req.params.configName;
			if (configName != null) {
				let configItem = this.gameApplication.getConfigGame().getConfig(configName);

				if (configItem != null) return res.json([ReturnCode.Ok, { "1": configItem.toJson() }]);
			}

			return res.json([ReturnCode.OperationInvalid]);
		});

		this.router.get("/ts", (req: express.Request, res: express.Response) => {
			res.setHeader(Commands.CONTENT_TYPE, Commands.APPLICATION_JSON);

			return res.json([ReturnCode.Ok, { "1": xDatetime.getCurrentMilliseconds() }]);
		});

		const apiRouter = express.Router();
		this.router.use("/api", apiRouter);

		if (this.enablePostViaJson) {
			this.apiJsonRouter = express.Router();

			this.apiJsonRouter.use(wrap((req, res, next) => {
				return this.antiDdosMiddleware.checkRequestSizeBodyViaJson(req, res, next);
			}));

			this.apiJsonRouter.use(express.json());

			apiRouter.use(
				"/0",
				wrap((req, res, next) => {
					return this.apiMiddleware.getIP(req, res, next);
				}),
				wrap((req, res, next) => {
					return this.antiDdosMiddleware.checkMaxRequestPerSecondPerIpViaJson(req, res, next);
				}),
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

			this.apiJsonRouter.post("/:code", async (req: express.Request, res: express.Response) => {
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

			this.apiJsonRouter.use(wrap((req, res, next) => {
				return this.antiDdosMiddleware.checkRequestSizeBodyViaMsgPack(req, res, next);
			}));

			this.apiMsgPackRouter.use(msgpack());
			apiRouter.use(
				"/1",
				wrap((req, res, next) => {
					return this.apiMiddleware.getIP(req, res, next);
				}),
				wrap((req, res, next) => {
					return this.antiDdosMiddleware.checkMaxRequestPerSecondPerIpViaMsgPack(req, res, next);
				}),
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

			this.apiMsgPackRouter.post("/:code", async (req: express.Request, res: express.Response) => {
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
		if (isNaN(codeStr as any)) return null;

		let code = Number.parseInt(codeStr);
		let operationResponse: OperationResponse;
		let reqAny = req as any;
		let parameters = req.body;
		let ip = reqAny.xip;
		let request = new Request(code);
		request.setRequestId(0);
		request.setIP(ip);
		request.setParameters(!parameters ? {} : parameters);
		request.setAuthenticate(reqAny.authInfo);
		request.setEncrypted(encrypted);

		if (this.enableSendAndReceiveDebug) {
			Debug.log("[HTTP RECV] %O", request);
			Debug.log("[Parameters] " + JSON.stringify(parameters));
		}

		try {
			operationResponse = await this._onRequestCb(request);
		}
		catch {
			operationResponse = new OperationResponse(code, 0, request.isEncrypted());
			operationResponse.setReturnCode(ReturnCode.InternalServerError);
		}

		return operationResponse;
	}

}
