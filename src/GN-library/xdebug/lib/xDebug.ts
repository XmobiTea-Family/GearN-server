import log4js, { Logger } from "log4js";

interface DebugConfiguration {
	isLogToFileEnable: boolean;
	isLogToConsoleEnable: boolean;
	logPath: string;
}

export class Debug {
	private static isLogToFileEnable: boolean;
	private static isLogToConsoleEnable: boolean;
	private static logPath: string;
	private static logger: Logger;

	public static init(config: DebugConfiguration): void {
		this.isLogToFileEnable = config.isLogToFileEnable;
		this.isLogToConsoleEnable = config.isLogToConsoleEnable;
		this.logPath = config.logPath;
	}

	public static run(): void {
		if (this.isLogToFileEnable) {
			log4js.configure({
				appenders: { console: { type: "dateFile", filename: this.logPath } },
				categories: { default: { appenders: ["console"], level: "all" } },
			});

			this.logger = log4js.getLogger("console");
		}
	}

	public static log(message: any, ...args: any[]): void {
		if (this.isLogToConsoleEnable) {
			console.log("[DEBUG]: " + message, args);
		}

		if (this.isLogToFileEnable) {
			this.logger.debug(message, args);
		}
	}

	public static logInfo(message: any, ...args: any[]) {
		if (this.isLogToConsoleEnable) {
			console.log("[INFO]: " + message, args);
		}

		if (this.isLogToFileEnable) {
			this.logger.info(message, args);
		}
	}

	public static logError(message: any, ...args: any[]) {
		if (this.isLogToConsoleEnable) {
			console.log("[ERROR]: " + message, args);
		}

		if (this.isLogToFileEnable) {
			this.logger.error(message, args);
		}
	}

	public static logWarning(message: any, ...args: any[]) {
		if (this.isLogToConsoleEnable) {
			console.log("[WARN]: " + message, args);
		}

		if (this.isLogToFileEnable) {
			this.logger.warn(message, args);
		}
	}

	public static logException(exception: Error) {
		let message = exception.name + "\n" + exception.message + "\n" + exception.stack;

		if (this.isLogToConsoleEnable) {
			console.log("[FATAL]: " + message);
		}

		if (this.isLogToFileEnable) {
			this.logger.fatal(message);
		}
	}
}
