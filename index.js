const gnConfig = require("./GNconfig.debug.json");

const { ServerApplicationStartup, Debug } = require("./dist/index");

let applicationStartup = new ServerApplicationStartup();
applicationStartup.config(gnConfig.options);
applicationStartup.run();

let gameApplication = applicationStartup.getGameApplication();

process.on("uncaughtException", (uncaughtException) => {
	Debug.log("Uncaught Exception at: %s - message: %s", uncaughtException.stack, uncaughtException.message);
});

process.on("uncaughtError", (uncaughtException) => {
	Debug.log("Uncaught Error at: %s - message: %s", uncaughtException.stack, uncaughtException.message);
});

process.on("unhandledRejection", (reason) => {
	Debug.log("Unhandled Rejection at: %s - message: %s", reason.stack, reason.message);
});
