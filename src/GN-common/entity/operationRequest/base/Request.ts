import { AuthInfo } from "./../../AuthInfo";
import { SecretInfo } from "./../../SecretInfo";

export class Request {
    // Stores the operation code value used by this instance.
    private operationCode: string;
    // Stores the request type value used by this instance.
    private requestType: number;
    // Stores the role value used by this instance.
    private role: number;
    // Stores the request ID value used by this instance.
    private requestId: number = -1;
    // Stores the auth info value used by this instance.
    private authInfo: AuthInfo = null;
    // Stores the secret info value used by this instance.
    private secretInfo: SecretInfo = null;
    // Stores the IP value used by this instance.
    private ip: string;
    // Stores the parameters collection used by this instance.
    private parameters: { [k: string]: any } = {};

    /**
     * Initializes a new request instance.
     * @param operationCode Provides the operation code value used by this operation.
     * @param requestType Provides the request type value used by this operation.
     * @param role Provides the role value used by this operation.
     */
    constructor(operationCode: string, requestType: number, role: number) {
        this.operationCode = operationCode;
        this.requestType = requestType;
        this.role = role;
    }

    /**
     * Sets the request ID.
     * @param requestId Provides the request ID value used by this operation.
     */
    public setRequestId(requestId: number) {
        this.requestId = requestId;
    }

    /**
     * Sets the authenticate.
     * @param authInfo Provides the auth info value used by this operation.
     */
    public setAuthenticate(authInfo: AuthInfo) {
        this.authInfo = authInfo;
    }

    /**
     * Sets the secret info.
     * @param secretInfo Provides the secret info value used by this operation.
     */
    public setSecretInfo(secretInfo: SecretInfo) {
        this.secretInfo = secretInfo;
    }

    /**
     * Sets the IP.
     * @param ip Provides the IP value used by this operation.
     */
    public setIP(ip: string) {
        this.ip = ip;
    }

    /**
     * Sets the parameters.
     * @param parameters Provides the parameters value used by this operation.
     */
    public setParameters(parameters: {}) {
        this.parameters = parameters;
    }

    /**
     * Returns the operation code.
     * @returns Returns the operation code.
     */
    public getOperationCode(): string {
        return this.operationCode;
    }

    /**
     * Returns the request type.
     * @returns Returns the request type.
     */
    public getRequestType(): number {
        return this.requestType;
    }

    /**
     * Returns the role.
     * @returns Returns the role.
     */
    public getRole(): number {
        return this.role;
    }

    /**
     * Returns the request ID.
     * @returns Returns the request ID.
     */
    public getRequestId(): number {
        return this.requestId;
    }

    /**
     * Checks whether authenticated.
     * @returns Returns the operation result.
     */
    public isAuthenticated(): boolean {
        return this.authInfo != null;
    }

    /**
     * Checks whether secreted.
     * @returns Returns the operation result.
     */
    public isSecreted(): boolean {
        return this.secretInfo != null;
    }

    /**
     * Returns the auth info.
     * @returns Returns the auth info.
     */
    public getAuthInfo(): AuthInfo {
        return this.authInfo;
    }

    /**
     * Returns the secret info.
     * @returns Returns the secret info.
     */
    public getSecretInfo(): SecretInfo {
        return this.secretInfo;
    }

    /**
     * Returns the IP.
     * @returns Returns the IP.
     */
    public getIP(): string {
        return this.ip;
    }

    /**
     * Returns the parameters.
     * @returns Returns the parameters.
     */
    public getParameters(): { [k: string]: any } {
        return this.parameters;
    }
}
