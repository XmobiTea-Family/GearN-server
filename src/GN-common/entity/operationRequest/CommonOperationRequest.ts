import { Request } from "./base/Request";
import { InvalidMember } from "./../InvalidMember";
import { OperationRequest } from "./OperationRequest";

export class CommonOperationRequest extends OperationRequest {
    // Stores the invalid members list used by this instance.
    private invalidMembers: InvalidMember[];

    // Stores the origin request value used by this instance.
    private originRequest: Request;

    /**
     * Initializes a new common operation request instance.
     * @param operationCode Provides the operation code value used by this operation.
     */
    constructor(operationCode: string) {
        super(operationCode);

        this.invalidMembers = [];
    }

    /**
     * Sets the origin request.
     * @param originRequest Provides the origin request value used by this operation.
     */
    public setOriginRequest(originRequest: Request) {
        this.originRequest = originRequest;
    }

    /**
     * Returns the origin request.
     * @returns Returns the origin request.
     */
    public getOriginRequest(): Request {
        return this.originRequest;
    }

    /**
     * Adds the invalid member.
     * @param invalidMember Provides the invalid member value used by this operation.
     */
    public addInvalidMember(invalidMember: InvalidMember) {
        this.invalidMembers.push(invalidMember);
    }

    /**
     * Returns the invalid members.
     * @returns Returns the invalid members.
     */
    public getInvalidMembers(): InvalidMember[] {
        return this.invalidMembers;
    }

}
