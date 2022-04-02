import { wrap } from "async-middleware";
import { Router } from "express";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import express from "express";
import { OperationResponse } from "./../../GN-common/entity/operationResponse/OperationResponse";
import { ApiMiddleware } from "./../middleware/ApiMiddleware";
import { GameApplication } from "./../../GameApplication";
import { xDatetime } from "../../GN-library/xdatetime/lib/xDatetime";

interface OnHttpRequest {
	(request: Request): Promise<OperationResponse>;
}

export class HttpAppHandler {
	private _onRequestCb: OnHttpRequest;
	private apiMiddleware: ApiMiddleware;
	private gameApplication: GameApplication;

	private router: Router;

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

	public run(): void {
		this.router.get('/getConfig/:configName', (req: express.Request, res: express.Response) => {
			let configName = req.params.configName;
			if (configName != null) {
				let configItem = this.gameApplication.getConfigGame().getConfig(configName);
		
				if (configItem != null) return res.json([ReturnCode.Ok, {0: configItem.toJson()}]);
			}
		
		    return res.json([ReturnCode.OperationInvalid]);
		});

		this.router.get("/ts", (req: express.Request, res: express.Response) => {
			return res.json([ReturnCode.Ok, {0: xDatetime.getCurrentMilliseconds()}]);
		});

		let router2 = express.Router();
		this.router.use("/api", wrap(this.apiMiddleware.authenticateToken), router2);

		router2.post("/:code", async (req: express.Request, res: express.Response) => {
			let operationResponse = await this.onHttpRequest(req);

			if (operationResponse != null) {
				console.log("[SEND] %O", operationResponse);

				return res.send(operationResponse.toHttpData());
			}

			return res.send([ReturnCode.OperationInvalid]);
		});
	}

	private async onHttpRequest(req: express.Request): Promise<OperationResponse> {
		let code = Number.parseInt(req.params.code);
		let operationResponse = new OperationResponse(code, 0);

		let body = req.body;
		let params = body.d;

		console.log(params);

		let parameters = null;
		if (!params) parameters = {};
		else {
			try {
				parameters = JSON.parse(params);
			} catch (err) {
				operationResponse.setReturnCode(ReturnCode.InternalServerError);
				return operationResponse;
			}
		}

		let ip = req.socket.remoteAddress;
		if (ip.substring(0, 7) == "::ffff:") {
			ip = ip.substring(7);
		}

		let request = new Request(code);
		request.setRequestId(0);
		request.setIP(ip);
		request.setParameters(parameters);
		request.setAuthenticate((req as any).authInfo);

		console.log("[RECV] %O", request);

		if (this._onRequestCb != null) {
			operationResponse = await this._onRequestCb(request);
		}
		else {
			operationResponse.setReturnCode(ReturnCode.InternalServerError);
		}
		
		return operationResponse;
	}
}
