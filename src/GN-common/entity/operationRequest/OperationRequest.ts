import { Request } from "./base/Request";
import { GNHashtable } from "./../../common/GNData";

export class OperationRequest {
	protected originRequest: Request;

	protected operationCode: number;
	protected requestId: number;
	protected parameters: GNHashtable;

	public isValidRequest(): boolean {
		return true;
	}

	public getOperationCode(): number {
		return this.operationCode;
	}

	public getRequestId(): number {
		return this.requestId;
	}

	public getParameters(): GNHashtable {
		return this.parameters;
	}

	public getOriginRequest(): Request {
		return this.originRequest;
	}

	constructor(operationRequest?: OperationRequest) {
		if (operationRequest != null) {
			this.operationCode = operationRequest.operationCode;
			this.requestId = operationRequest.requestId;
			this.parameters = operationRequest.parameters;
			this.originRequest = operationRequest.originRequest;
		}
	}

	public static newOperationRequest(request: Request): OperationRequest {
		let answer = new OperationRequest();
		answer.originRequest = request;

		answer.operationCode = request.getCode();
		answer.requestId = request.getRequestId();
		let gnHashtable = new GNHashtable();

		let d = request.getParameters();

		let keys = Object.keys(d);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];

			let keyInt = Number.parseInt(key);
			
			if (!isNaN(keyInt))
				gnHashtable.add(keyInt, d[key]);
		}

		answer.parameters = gnHashtable;

		return answer;
	}

	public toString(): string {
		return this.operationCode + " " + this.requestId + " " + this.parameters.toData.toString();
	}
}
