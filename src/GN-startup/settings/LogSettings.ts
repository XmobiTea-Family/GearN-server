import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
    // Indicates whether log to file enable.
    protected logToFileEnable: boolean;
    // Indicates whether log to console enable.
    protected logToConsoleEnable: boolean;
    // Stores the log path value used by this instance.
    protected logPath: string;

    /**
     * Returns the log to file enable.
     * @returns Returns the log to file enable.
     */
    public getLogToFileEnable(): boolean {
        return this.logToFileEnable;
    }

    /**
     * Returns the log to console enable.
     * @returns Returns the log to console enable.
     */
    public getLogToConsoleEnable(): boolean {
        return this.logToConsoleEnable;
    }

    /**
     * Returns the log path.
     * @returns Returns the log path.
     */
    public getLogPath(): string {
        return this.logPath;
    }

    /**
     * Initializes a new builder base instance.
     */
    constructor() {}
}

class Builder extends BuilderBase implements IBuilder<LogSettings> {
    /**
     * Sets the log to file enable.
     * @param logToFileEnable Provides the log to file enable value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setLogToFileEnable(logToFileEnable: boolean): Builder {
        this.logToFileEnable = logToFileEnable;
        return this;
    }

    /**
     * Sets the log to console enable.
     * @param logToConsoleEnable Provides the log to console enable value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setLogToConsoleEnable(logToConsoleEnable: boolean): Builder {
        this.logToConsoleEnable = logToConsoleEnable;
        return this;
    }

    /**
     * Sets the log path.
     * @param logPath Provides the log path value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setLogPath(logPath: string): Builder {
        this.logPath = logPath;
        return this;
    }

    /**
     * Initializes a new builder instance.
     */
    constructor() {
        super();

        this.logToFileEnable = false;
        this.logToConsoleEnable = false;
        this.logPath = "";
    }

    /**
     * Builds the configured instance.
     */
    public build() {
        return new LogSettings(this);
    }
}

export class LogSettings extends BuilderBase {
    /**
     * Initializes a new log settings instance.
     * @param builder Provides the builder state copied into this instance.
     */
    constructor(builder: Builder) {
        super();

        this.logToFileEnable = builder.getLogToFileEnable();
        this.logToConsoleEnable = builder.getLogToConsoleEnable();
        this.logPath = builder.getLogPath();
    }

    /**
     * Creates a new builder instance.
     * @returns Returns a new builder instance.
     */
    public static Builder(): Builder {
        return new Builder();
    }
}
