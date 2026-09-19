import { GNHashtable } from "./../../common/GNData";

export class OperationRequest {
    // Indicates whether valid.
    private isValid: boolean;

    /**
     * Checks whether valid request.
     * @returns Returns the operation result.
     */
    public isValidRequest(): boolean {
        return this.isValid;
    }

    // Stores the operation code value used by this instance.
    private operationCode: string;
    // Stores the request ID value used by this instance.
    private requestId: string;
    // Stores the parameters value used by this instance.
    private parameters: GNHashtable;

    /**
     * Initializes a new operation request instance.
     * @param operationCode Provides the operation code value used by this operation.
     */
    constructor(operationCode: string) {
        this.operationCode = operationCode;
    }

    /**
     * Returns the operation code.
     * @returns Returns the operation code.
     */
    public getOperationCode(): string {
        return this.operationCode;
    }

    /**
     * Returns the request ID.
     * @returns Returns the request ID.
     */
    public getRequestId(): string {
        return this.requestId;
    }

    /**
     * Returns the parameters.
     * @returns Returns the parameters.
     */
    public getParameters(): GNHashtable {
        return this.parameters;
    }

    /**
     * Sets the request ID.
     * @param requestId Provides the request ID value used by this operation.
     * @returns Returns the current operation request instance.
     */
    public setRequestId(requestId: string): OperationRequest {
        this.requestId = requestId;
        return this;
    }

    /**
     * Sets the parameter.
     * @param key Provides the key value used by this operation.
     * @param value Provides the value value used by this operation.
     * @returns Returns the current operation request instance.
     */
    public setParameter(key: string, value: any): OperationRequest {
        if (this.parameters == null) this.parameters = new GNHashtable();

        this.parameters.add(key, value);

        return this;
    }

    /**
     * Sets the parameters.
     * @param parameters Provides the parameters value used by this operation.
     * @returns Returns the current operation request instance.
     */
    public setParameters(parameters: GNHashtable): OperationRequest {
        this.parameters = parameters;
        return this;
    }

    /**
     * Executes the to string workflow.
     * @returns Returns the operation result.
     */
    public toString(): string {
        return "OperationCode: " + this.operationCode + ", requestId: " + this.requestId + ", parameters " + JSON.stringify(this.parameters?.toData());
    }
}
