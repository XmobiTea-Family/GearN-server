import log4js, { Logger } from "log4js";

interface DebugConfiguration {
    // Indicates whether log to file enable.
    isLogToFileEnable: boolean;
    // Indicates whether log to console enable.
    isLogToConsoleEnable: boolean;
    // Stores the log path value used by this contract.
    logPath: string;
}

export class Debug {
    // Indicates whether log to file enable.
    private static isLogToFileEnable: boolean;
    // Indicates whether log to console enable.
    private static isLogToConsoleEnable: boolean;
    // Stores the log path value used by this instance.
    private static logPath: string;
    // Stores the logger value used by this instance.
    private static logger: Logger;

    /**
     * Executes the init workflow.
     * @param config Provides the configuration value used by this operation.
     */
    public static init(config: DebugConfiguration): void {
        this.isLogToFileEnable = config.isLogToFileEnable;
        this.isLogToConsoleEnable = config.isLogToConsoleEnable;
        this.logPath = config.logPath;
    }

    /**
     * Returns the log path.
     * @returns Returns the log path.
     */
    public static getLogPath(): string {
        return this.logPath;
    }

    /**
     * Runs the current workflow.
     */
    public static run(): void {
        if (this.isLogToFileEnable) {
            log4js.configure({
                appenders: { console: { type: "dateFile", filename: this.logPath } },
                categories: { default: { appenders: ["console"], level: "all" } },
            });

            this.logger = log4js.getLogger("console");
        }
    }

    /**
     * Executes the log workflow.
     * @param message Provides the message value used by this operation.
     * @param args Provides the args value used by this operation.
     */
    public static log(message: any, ...args: any[]): void {
        if (this.isLogToConsoleEnable) {
            console.log("[DEBUG]: " + message, args);
        }

        if (this.isLogToFileEnable) {
            this.logger.debug(message, args);
        }
    }

    /**
     * Executes the log info workflow.
     * @param message Provides the message value used by this operation.
     * @param args Provides the args value used by this operation.
     */
    public static logInfo(message: any, ...args: any[]): void {
        if (this.isLogToConsoleEnable) {
            console.log("[INFO]: " + message, args);
        }

        if (this.isLogToFileEnable) {
            this.logger.info(message, args);
        }
    }

    /**
     * Executes the log error workflow.
     * @param message Provides the message value used by this operation.
     * @param args Provides the args value used by this operation.
     */
    public static logError(message: any, ...args: any[]): void {
        if (this.isLogToConsoleEnable) {
            console.log("[ERROR]: " + message, args);
        }

        if (this.isLogToFileEnable) {
            this.logger.error(message, args);
        }
    }

    /**
     * Executes the log warning workflow.
     * @param message Provides the message value used by this operation.
     * @param args Provides the args value used by this operation.
     */
    public static logWarning(message: any, ...args: any[]): void {
        if (this.isLogToConsoleEnable) {
            console.log("[WARN]: " + message, args);
        }

        if (this.isLogToFileEnable) {
            this.logger.warn(message, args);
        }
    }

    /**
     * Executes the log exception workflow.
     * @param exception Provides the exception value used by this operation.
     */
    public static logException(exception: Error): void {
        // Stores the message value used in the current execution flow.
        let message = exception.name + "\n" + exception.message + "\n" + exception.stack;

        if (this.isLogToConsoleEnable) {
            console.log("[FATAL]: " + message);
        }

        if (this.isLogToFileEnable) {
            this.logger.fatal(message);
        }
    }
}
