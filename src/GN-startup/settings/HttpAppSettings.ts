import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

type MethodType = "GET" | "HEAD" | "PUT" | "PATCH" | "POST" | "DELETE" | "UPDATE";

abstract class BuilderBase {
	protected enable: boolean;
	protected origin: string;
	protected methods: MethodType[];
	protected allowedHeaders: string[];
	protected credentials: boolean;

	public getEnable(): boolean {
		return this.enable;
	}

	public getOrigin(): string {
		return this.origin;
	}

	public getMethods(): MethodType[] {
		return this.methods;
	}

	public getAllowedHeaders(): string[] {
		return this.allowedHeaders;
	}

	public getCredentials(): boolean {
		return this.credentials;
	}

	constructor() {}
}

class Builder extends BuilderBase implements IBuilder<HttpAppSettings> {
	public setOrigin(origin: string): Builder {
		this.origin = origin;
		return this;
	}

	public addMethod(methodType: MethodType): Builder {
		if (!this.methods.includes(methodType)) this.methods.push(methodType);
		return this;
	}

	public addMethods(methodTypes: MethodType[]): Builder {
		methodTypes.forEach((methodType) => this.addMethod(methodType));
		return this;
	}

	public removeMethod(methodType: MethodType): Builder {
		let indexOf = this.methods.indexOf(methodType);
		if (indexOf != -1) {
			this.methods = this.methods.splice(indexOf, 1);
		}

		return this;
	}

	public addAllowedHeader(allowedHeader: string): Builder {
		if (!this.allowedHeaders.includes(allowedHeader)) this.allowedHeaders.push(allowedHeader);
		return this;
	}

	public addAllowedHeaders(allowedHeaders: string[]): Builder {
		allowedHeaders.forEach((allowedHeader) => this.addAllowedHeader(allowedHeader));
		return this;
	}

	public setCredentials(credentials: boolean): Builder {
		this.credentials = credentials;
		return this;
	}

	public setEnable(enable: boolean): Builder {
		this.enable = enable;

		return this;
	}

	public build() {
		return new HttpAppSettings(this);
	}

	constructor() {
		super();

		this.methods = [];
		this.allowedHeaders = [];
	}
}

export class HttpAppSettings extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.origin = builder.getOrigin();
		this.methods = builder.getMethods();
		this.enable = builder.getEnable();
		this.allowedHeaders = builder.getAllowedHeaders();
		this.credentials = builder.getCredentials();
	}

	public static Builder(): Builder {
		return new Builder();
	}
}
