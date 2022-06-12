import { Request } from "./base/Request";
import { GNHashtable } from "./../../common/GNData";
import { InvalidMember } from "./../InvalidMember";

export class OperationRequest {
	protected originRequest: Request;

	protected operationCode: number;
	protected requestId: number;
	protected parameters: GNHashtable;

    protected isValid: boolean;

	private invalidMembers: InvalidMember[];

	public isValidRequest(): boolean {
		return this.isValid;
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

	constructor() {
		this.invalidMembers = [];
	 }

	public toString(): string {
		return this.operationCode + " " + this.requestId + " " + this.parameters.toData.toString();
	}

    public addInvalidMember(invalidMember: InvalidMember) {
        this.invalidMembers.push(invalidMember);
    }

    public getInvalidMembers(): InvalidMember[] {
        return this.invalidMembers;
    }
}
