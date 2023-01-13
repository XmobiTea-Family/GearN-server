const { GNNetwork } = require("@xmobitea/gn-typescript-client");
const fs = require("fs");

const optionsPath = __dirname + "/./GNconfig.debug.json";
let optionStr = fs.readFileSync(optionsPath).toString();
let fullOptions = JSON.parse(optionStr);
let options = fullOptions.options;

const { ServerApplicationStartup, Debug } = require("./dist/index");

let applicationStartup = new ServerApplicationStartup();
applicationStartup.config(options);
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
