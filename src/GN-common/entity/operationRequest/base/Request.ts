import { AuthInfo } from "./../../AuthInfo";
import { SecretInfo } from "./../../SecretInfo";

export class Request {
	private operationCode: string;
	private requestType: number;
	private role: number;
	private requestId: number = -1;
	private authInfo: AuthInfo = null;
	private secretInfo: SecretInfo = null;
	private ip: string;
	private parameters: { [k: string]: any } = {};
	private encrypted: boolean;

	constructor(operationCode: string, requestType: number, role: number) {
		this.operationCode = operationCode;
		this.requestType = requestType;
		this.role = role;
	}

	public setRequestId(requestId: number) {
		this.requestId = requestId;
	}

	public setAuthenticate(authInfo: AuthInfo) {
		this.authInfo = authInfo;
	}

	public setSecretInfo(secretInfo: SecretInfo) {
		this.secretInfo = secretInfo;
	}

	public setIP(ip: string) {
		this.ip = ip;
	}

	public setParameters(parameters: {}) {
		this.parameters = parameters;
	}

	public setEncrypted(encrypted: boolean) {
		this.encrypted = encrypted;
	}

	public getOperationCode(): string {
		return this.operationCode;
	}

	public getRequestType(): number {
		return this.requestType;
	}

	public getRole(): number {
		return this.role;
	}

	public getRequestId(): number {
		return this.requestId;
	}

	public isAuthenticated(): boolean {
		return this.authInfo != null;
	}

	public isSecreted(): boolean {
		return this.secretInfo != null;
	}

	public getAuthInfo(): AuthInfo {
		return this.authInfo;
	}

	public getSecretInfo(): SecretInfo {
		return this.secretInfo;
	}

	public getIP(): string {
		return this.ip;
	}

	public getParameters(): { [k: string]: any } {
		return this.parameters;
	}

	public isEncrypted(): boolean {
		return this.encrypted;
	}

}
