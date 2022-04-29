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

interface OnHttpRequest {
	(request: Request): Promise<OperationResponse>;
}

export class HttpAppHandler {
	private _onRequestCb: OnHttpRequest;
	private apiMiddleware: ApiMiddleware;

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
			let configName = req.params.configName;
			if (configName != null) {
				let configItem = this.gameApplication.getConfigGame().getConfig(configName);

				if (configItem != null) return res.json([ReturnCode.Ok, { 1: configItem.toJson() }]);
			}

			return res.json([ReturnCode.OperationInvalid]);
		});

		this.router.get("/ts", (req: express.Request, res: express.Response) => {
			return res.json([ReturnCode.Ok, { 1: xDatetime.getCurrentMilliseconds() }]);
		});

		const apiRouter = express.Router();
		this.router.use("/api", apiRouter);

		if (this.enablePostViaJson)
		{
			this.apiJsonRouter = express.Router();
			this.apiJsonRouter.use(express.json());
	
			apiRouter.use(
				"/0",
				wrap((req, res, next) => {
					return this.apiMiddleware.authenticateTokenViaJson(req, res, next);
				}),
				this.apiJsonRouter
			);
	
			this.apiJsonRouter.post("/:code", async (req: express.Request, res: express.Response) => {
				let operationResponse = await this.onHttpRequest(req);
	
				if (operationResponse != null) {
					let httpData = operationResponse.toHttpData();
					if (this.enableSendAndReceiveDebug) {
						Debug.log("[HTTP SEND] %O", JSON.stringify(httpData));
					}
	
					return res.send(httpData);
				}
	
				return res.send([ReturnCode.OperationInvalid]);
			});
		}
		
		if (this.enablePostViaMsgPack)
		{
			this.apiMsgPackRouter = express.Router();
			this.apiMsgPackRouter.use(msgpack());
	
			apiRouter.use(
				"/1",
				wrap((req, res, next) => {
					return this.apiMiddleware.authenticateTokenViaMsgPack(req, res, next);
				}),
				this.apiMsgPackRouter
			);
	
			this.apiMsgPackRouter.post("/:code", async (req: express.Request, res: express.Response) => {
				let operationResponse = await this.onHttpRequest(req);
	
				if (operationResponse != null) {
					let httpData = operationResponse.toHttpData();
					if (this.enableSendAndReceiveDebug) {
						Debug.log("[HTTP SEND] %O", JSON.stringify(httpData));
					}
	
					return res.send(Buffer.from(encode(httpData)));
				}
				
				return res.send(Buffer.from(encode([ReturnCode.OperationInvalid])));
			});
		}
	}

	private async onHttpRequest(req: express.Request): Promise<OperationResponse> {
		let code = Number.parseInt(req.params.code);
		let operationResponse = new OperationResponse(code, 0);

		let parameters = req.body;
		if (!parameters) parameters = {};

		let ip = req.socket.remoteAddress;
		if (ip.substring(0, 7) == "::ffff:") {
			ip = ip.substring(7);
		}

		let request = new Request(code);
		request.setRequestId(0);
		request.setIP(ip);
		request.setParameters(parameters);
		request.setAuthenticate((req as any).authInfo);

		if (this.enableSendAndReceiveDebug) {
			Debug.log("[HTTP RECV] %O", request);
			Debug.log("[Parameters] " + JSON.stringify(parameters));
		}

		if (this._onRequestCb != null) {
			operationResponse = await this._onRequestCb(request);
		} else {
			operationResponse.setReturnCode(ReturnCode.InternalServerError);
		}

		return operationResponse;
	}
}
