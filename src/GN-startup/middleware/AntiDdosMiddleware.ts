import express from "express";
import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
import { encode } from "@msgpack/msgpack";

export class AntiDdosMiddleware {
    // Queue for all request for socket, for http
    // Queue for all request of one user for socket, for http
    // Queue for all request of one IP for socket, for http
    // Queue for all request upload file of one IP for http
    // Queue for all request download file of one IP for http

    // "socketAppMaxIPRequestPerSecond": 50,    //
    // "socketAppMaxRequestPerSecond": 20,      //
    // "socketAppMaxPendingRequest": 100,       //
    // "socketAppMaxRequestSize": 1024,

	public async checkDDosForIPViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodeHttp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send([returnCode]);
		}

		return next();
	}

    public async checkDDosViaJson(req: express.Request, res: express.Response, next: Function) {
		let returnCode = await this.getReturnCodeForIPHttp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send([returnCode]);
		}

		return next();
	}

    public async checkDDosViaMsgPack(req: express.Request, res: express.Response, next: Function) {
        let returnCode = await this.getReturnCodeHttp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send(Buffer.from(encode([returnCode])));
		}

		return next();
    }

    public async checkDDosForIPViaMsgPack(req: express.Request, res: express.Response, next: Function) {
        let returnCode = await this.getReturnCodeForIPHttp(req);
		if (returnCode != ReturnCode.Ok) {
			return res.send(Buffer.from(encode([returnCode])));
		}

		return next();
    }

    // check request size for ip
    private async getReturnCodeForIPHttp(req: express.Request): Promise<number> {
		return ReturnCode.Ok;
	}

    // check request size and request limit for this authInfo
    private async getReturnCodeHttp(req: express.Request): Promise<number> {
		return ReturnCode.Ok;
	}
}
