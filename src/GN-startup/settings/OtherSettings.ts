import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected authTokenCollectionName: string;
	protected adapterEventCollectionName: string;
	protected configGameCollectionName: string;
	protected packageName: string;
	protected appleClientId: string;
	protected googleClientId: string;

	public getAuthTokenCollectionName(): string {
		return this.authTokenCollectionName;
	}

	public getAdapterEventCollectionName(): string {
		return this.adapterEventCollectionName;
	}

	public getConfigGameCollectionName(): string {
		return this.configGameCollectionName;
	}

	public getPackageName(): string {
		return this.packageName;
	}

	public getAppleClientId(): string {
		return this.appleClientId;
	}

	public getGoogleClientId(): string {
		return this.googleClientId;
	}

	constructor() {}
}

class Builder extends BuilderBase implements IBuilder<OtherSettings> {
	public setAuthTokenCollectionName(authTokenCollectionName: string): Builder {
		this.authTokenCollectionName = authTokenCollectionName;
		return this;
	}

	public setAdapterEventCollectionName(adapterEventCollectionName: string): Builder {
		this.adapterEventCollectionName = adapterEventCollectionName;
		return this;
	}

	public setConfigGameCollectionName(configGameCollectionName: string): Builder {
		this.configGameCollectionName = configGameCollectionName;
		return this;
	}

	public setPackageName(packageName: string): Builder {
		this.packageName = packageName;
		return this;
	}

	public setAppleClientId(appleClientId: string): Builder {
		this.appleClientId = appleClientId;
		return this;
	}

	public setGoogleClientId(googleClientId: string): Builder {
		this.googleClientId = googleClientId;
		return this;
	}

	constructor() {
		super();
	}

	public build() {
		return new OtherSettings(this);
	}
}

export class OtherSettings extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.authTokenCollectionName = builder.getAuthTokenCollectionName();
		this.adapterEventCollectionName = builder.getAdapterEventCollectionName();
		this.configGameCollectionName = builder.getConfigGameCollectionName();
		this.packageName = builder.getPackageName();
		this.appleClientId = builder.getAppleClientId();
		this.googleClientId = builder.getGoogleClientId();
	}

	public static Builder(): Builder {
		return new Builder();
	}
}
