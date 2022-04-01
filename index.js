const { ApplicationStartup } = require('./dist/index');

const applicationStartup = new ApplicationStartup();
applicationStartup.run();

process.on("uncaughtException", (uncaughtException) => {
	console.log("Uncaught Exception at: %s - message: %s", uncaughtException.stack, uncaughtException.message);
});

process.on("uncaughtError", (uncaughtException) => {
	console.log("Uncaught Error at: %s - message: %s", uncaughtException.stack, uncaughtException.message);
});

process.on("unhandledRejection", (reason) => {
	console.log("Unhandled Rejection at: %s - message: %s", reason.stack, reason.message);
});
