import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected connectionString: string;
	protected databaseName: string;

	protected options: { [k: string]: any };

	public getConnectionString(): string {
		return this.connectionString;
	}
	public getDatabaseName(): string {
		return this.databaseName;
	}

	public getOptions(): { [k: string]: any } {
		return this.options;
	}

	constructor() { }

}

class Builder extends BuilderBase implements IBuilder<DatabaseSettings> {
	public setConnectionString(connectionString: string): Builder {
		this.connectionString = connectionString;
		return this;
	}

	public setDatabaseName(databaseName: string): Builder {
		this.databaseName = databaseName;
		return this;
	}

	public setOptions(options: { [k: string]: any }): Builder {
		this.options = options;
		return this;
	}

	constructor() {
		super();

		this.connectionString = "";
		this.databaseName = "";
		this.options = {};
	}

	public build() {
		return new DatabaseSettings(this);
	}

}

export class DatabaseSettings extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.connectionString = builder.getConnectionString();
		this.databaseName = builder.getDatabaseName();

		this.options = builder.getOptions();
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
