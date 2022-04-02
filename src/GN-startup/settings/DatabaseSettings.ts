import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected connectionString: string;
	protected gameName: string;
	protected databaseName: string;

    protected minPoolSize: number;
	protected maxPoolSize: number;

	public getConnectionString(): string {
		return this.connectionString;
	}

	public getGameName(): string {
		return this.gameName;
	}

    public getDatabaseName(): string {
		return this.databaseName;
	}

    public getMinPoolSize(): number {
		return this.minPoolSize;
	}

	public getMaxPoolSize(): number {
		return this.maxPoolSize;
	}

	constructor() {}
}

class Builder extends BuilderBase implements IBuilder<DatabaseSettings> {
	public setConnectionString(connectionString: string): Builder {
		this.connectionString = connectionString;
        return this;
	}

	public setGameName(gameName: string): Builder {
		this.gameName = gameName;
        return this;
	}

    public setDatabaseName(databaseName: string): Builder {
		this.databaseName = databaseName;
        return this;
	}

	public setMinPoolSize(minPoolSize: number): Builder {
		this.minPoolSize = minPoolSize;
        return this;
	}

	public setMaxPoolSize(maxPoolSize: number): Builder {
		this.maxPoolSize = maxPoolSize;
        return this;
	}

	constructor() {
		super();
	}

	public build() {
		return new DatabaseSettings(this);
	}
}

export class DatabaseSettings extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.connectionString = builder.getConnectionString();
		this.gameName = builder.getGameName();
		this.databaseName = builder.getDatabaseName();

        this.minPoolSize = builder.getMinPoolSize();
		this.maxPoolSize = builder.getMaxPoolSize();
	}

	public static Builder(): Builder {
		return new Builder();
	}
}
