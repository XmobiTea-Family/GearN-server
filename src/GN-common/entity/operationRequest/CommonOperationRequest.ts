import { Request } from "./base/Request";
import { InvalidMember } from "./../InvalidMember";
import { OperationRequest } from "./OperationRequest";

export class CommonOperationRequest extends OperationRequest {
    private invalidMembers: InvalidMember[];

    private originRequest: Request;

    constructor(operationCode: number, encrypted: boolean, timeout: number = OperationRequest.DefaultTimeOut) {
        super(operationCode, encrypted, timeout);

        this.invalidMembers = [];
    }

    public setOriginRequest(originRequest: Request) {
        this.originRequest = originRequest;
    }

    public getOriginRequest(): Request {
        return this.originRequest;
    }

    public addInvalidMember(invalidMember: InvalidMember) {
        this.invalidMembers.push(invalidMember);
    }

    public getInvalidMembers(): InvalidMember[] {
        return this.invalidMembers;
    }

}
