export class Request {
	private code: number;
	private requestId: number = -1;
	private authInfo: any = null;
	private ip: string;
	private parameters: { [k: string]: any } = {};
	private encrypted: boolean;

	constructor(code: number) {
		this.code = code;
	}

	public setRequestId(requestId: number) {
		this.requestId = requestId;
	}

	public setAuthenticate(authInfo: any) {
		this.authInfo = authInfo;
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

	public getCode(): number {
		return this.code;
	}

	public getRequestId(): number {
		return this.requestId;
	}

	public isAuthenticated(): boolean {
		return this.authInfo != null;
	}

	public getAuthInfo(): any {
		return this.authInfo;
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
