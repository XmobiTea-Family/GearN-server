import { wrap } from "async-middleware";
import { Router } from "express";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import express from "express";
import { OperationResponse } from "./../../GN-common/entity/operationResponse/OperationResponse";
import { ApiMiddleware } from "./../middleware/ApiMiddleware";

interface OnHttpRequest {
	(request: Request): Promise<OperationResponse>;
}

export class HttpAppHandler {
	private _onRequestCb: OnHttpRequest;
	private apiMiddleware: ApiMiddleware;
	
	private router: Router;

	public setRouter(router: Router): void {
		this.router = router;
	}

	public setApiMiddleware(apiMiddleware: ApiMiddleware): void {
		this.apiMiddleware = apiMiddleware;
	}

	public setOnHttpRequest(_onRequestCb: OnHttpRequest) {
		this._onRequestCb = _onRequestCb;
	}

	public run(): void {
		this.router.get('/getConfig', (req: express.Request, res: express.Response) => {
		    return res.json([ReturnCode.Ok, new Date().getTime()]);
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
		// let id = body.i;
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
