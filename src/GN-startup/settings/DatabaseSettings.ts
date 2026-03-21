import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	// Stores the connection string value used by this instance.
	protected connectionString: string;
	// Stores the database name value used by this instance.
	protected databaseName: string;
	// Stores the log connection string value used by this instance.
	protected logConnectionString: string;
	// Stores the log database name value used by this instance.
	protected logDatabaseName: string;

	// Stores the options collection used by this instance.
	protected options: { [k: string]: any };

	/**
	 * Returns the connection string.
	 * @returns Returns the connection string.
	 */
	public getConnectionString(): string {
		return this.connectionString;
	}

	/**
	 * Returns the database name.
	 * @returns Returns the database name.
	 */
	public getDatabaseName(): string {
		return this.databaseName;
	}

	/**
	 * Returns the log connection string.
	 * @returns Returns the log connection string.
	 */
	public getLogConnectionString(): string {
		return this.logConnectionString;
	}

	/**
	 * Returns the log database name.
	 * @returns Returns the log database name.
	 */
	public getLogDatabaseName(): string {
		return this.logDatabaseName;
	}

	/**
	 * Returns the options.
	 * @returns Returns the options.
	 */
	public getOptions(): { [k: string]: any } {
		return this.options;
	}

	/**
	 * Initializes a new builder base instance.
	 */
	constructor() { }

}

class Builder extends BuilderBase implements IBuilder<DatabaseSettings> {
	/**
	 * Sets the connection string.
	 * @param connectionString Provides the connection string value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setConnectionString(connectionString: string): Builder {
		this.connectionString = connectionString;
		return this;
	}

	/**
	 * Sets the database name.
	 * @param databaseName Provides the database name value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setDatabaseName(databaseName: string): Builder {
		this.databaseName = databaseName;
		return this;
	}

	/**
	 * Sets the log connection string.
	 * @param logConnectionString Provides the log connection string value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setLogConnectionString(logConnectionString: string): Builder {
		this.logConnectionString = logConnectionString;
		return this;
	}

	/**
	 * Sets the log database name.
	 * @param logDatabaseName Provides the log database name value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setLogDatabaseName(logDatabaseName: string): Builder {
		this.logDatabaseName = logDatabaseName;
		return this;
	}

	/**
	 * Sets the options.
	 * @param options Provides the options value used by this operation.
	 * @returns Returns the current builder instance.
	 */
	public setOptions(options: { [k: string]: any }): Builder {
		this.options = options;
		return this;
	}

	/**
	 * Initializes a new builder instance.
	 */
	constructor() {
		super();

		this.connectionString = "";
		this.logConnectionString = "";
		this.databaseName = "";
		this.logDatabaseName = "";
		this.options = {};
	}

	/**
	 * Builds the configured instance.
	 */
	public build() {
		return new DatabaseSettings(this);
	}

}

export class DatabaseSettings extends BuilderBase {
	/**
	 * Initializes a new database settings instance.
	 * @param builder Provides the builder state copied into this instance.
	 */
	constructor(builder: Builder) {
		super();

		this.connectionString = builder.getConnectionString();
		this.logConnectionString = builder.getLogConnectionString();
		this.databaseName = builder.getDatabaseName();
		this.logDatabaseName = builder.getLogDatabaseName();

		this.options = builder.getOptions();
	}

	/**
	 * Creates a new builder instance.
	 * @returns Returns a new builder instance.
	 */
	public static Builder(): Builder {
		return new Builder();
	}

}
