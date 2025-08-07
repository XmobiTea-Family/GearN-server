// import { wrap } from "./utils/wrap";
// import express from "express";
// import { ApiMiddleware } from "./../middleware/ApiMiddleware";
// import { GNServer } from "./../../GNServer";
// import { CodeHelper } from "./../../GN-common/helper/CodeHelper";
// import fs from "fs";
// import { ApplicationSettings } from "./../settings/ApplicationSettings";
// import { SocketAppSettings } from "./../settings/SocketAppSettings";
// import { HttpAppSettings } from "./../settings/HttpAppSettings";
// import { LogSettings } from "./../settings/LogSettings";
// import session from "express-session";
// import cookieParser from "cookie-parser";

// import { StringUtility } from "./../../GN-common/helper/StringUtility";
// import { ReturnCode } from "./../../GN-common/constant/ReturnCode";
// import { InvalidMemberType } from "./../../GN-common/constant/enumType/InvalidMemberType";
// import { RequestType } from "./../../GN-common/constant/enumType/RequestType";
// import { DashboardModels, GNNetwork, GNServerSettings, GNServerSettingsOptions, LogType } from "@xmobitea/gn-typescript-client";
// import { ErrorCode } from "./../../GN-common/constant/errorCode/ErrorCode";

// export class AdminAppHandler {
// 	private applicationSettings: ApplicationSettings;
// 	private apiMiddleware: ApiMiddleware;

// 	private gnServer: GNServer;

// 	private router: express.Express;
// 	private adminRouter: express.Router;
// 	private adminApiRouter: express.Router;
// 	private socketAppSettings: SocketAppSettings;
// 	private httpAppSettings: HttpAppSettings;
// 	private logSettings: LogSettings;

// 	public setRouter(router: express.Express): void {
// 		this.router = router;
// 	}

// 	public setApiMiddleware(apiMiddleware: ApiMiddleware): void {
// 		this.apiMiddleware = apiMiddleware;
// 	}

// 	public setGNServer(gnServer: GNServer): void {
// 		this.gnServer = gnServer;
// 	}

// 	public setApplicationSettings(applicationSettings: ApplicationSettings): void {
// 		this.applicationSettings = applicationSettings;
// 	}

// 	public setSocketAppSettings(socketAppSettings: SocketAppSettings): void {
// 		this.socketAppSettings = socketAppSettings;
// 	}

// 	public setHttpAppSettings(httpAppSettings: HttpAppSettings): void {
// 		this.httpAppSettings = httpAppSettings;
// 	}

// 	public setLogSettings(logSettings: LogSettings): void {
// 		this.logSettings = logSettings;
// 	}

// 	private async mustSignin(req: express.Request, res: express.Response, next: Function) {
// 		let authToken = req.cookies.authToken as string;

// 		if (!authToken) {
// 			return res.redirect("/admin/signin");
// 		}

// 		req.headers["a"] = authToken;

// 		let returnCode = await this.apiMiddleware.getReturnCodeAuthenticate(req);

// 		if (returnCode != ReturnCode.Ok || !req.isAuthenticated) {
// 			res.clearCookie("authToken");

// 			return res.redirect("/admin/signin");
// 		}

// 		return next();
// 	}

// 	private async mustNotSignin(req: express.Request, res: express.Response, next: Function) {
// 		let authToken = req.cookies.authToken as string;

// 		if (authToken) {
// 			return res.redirect("/admin");
// 		}

// 		return next();
// 	}

// 	public run(): void {
// 		this.adminRouter = express.Router();
// 		this.router.use("/admin", this.adminRouter);

// 		this.adminRouter.use(
// 			session({
// 				secret: StringUtility.generateRandomString(10),
// 				resave: false,
// 				saveUninitialized: true,
// 				cookie: {
// 					maxAge: 3600
// 				},
// 			}),
// 			cookieParser("secret")
// 		);

// 		this.adminRouter.use((req, res, next) => {
// 			if ((req.session as any).messages) {
// 				res.locals.messages = (req.session as any).messages;
// 				(req.session as any).messages = {};
// 			}

// 			return next();
// 		});

// 		this.setupAdminRouter();
// 	}

// 	public runGNNetworkSdk(gnServerSettingsOptions: GNServerSettingsOptions) {
// 		let gnServerSettings = new GNServerSettings();
// 		gnServerSettings.config(gnServerSettingsOptions);

// 		GNNetwork.init(gnServerSettings);
// 	}

// 	private setupAdminRouter(): void {
// 		this.adminRouter.get("/get-stats", (req: express.Request, res: express.Response): any => {
// 			let cpuUsage = process.cpuUsage();
// 			let memoryUsage = process.memoryUsage();
// 			let resourceUsage = process.resourceUsage();

// 			return res.status(200).json({
// 				"CpuUsage": cpuUsage,
// 				"MemoryUsage": memoryUsage,
// 				"ResourceUsage": resourceUsage
// 			});
// 		});

// 		this.adminRouter.get("/get-analytics", async (req: express.Request, res: express.Response): Promise<any> => {
// 			let query = req.query;

// 			let tsDateStr = query.tsDate as string;

// 			let analyticsService = this.gnServer.getAnalyticsService();
// 			let analyticsItem = await analyticsService.getAnalyticsItem(!tsDateStr ? null : Number.parseInt(tsDateStr));

// 			if (analyticsItem == null) {
// 				return res.sendStatus(403);
// 			}

// 			return res.status(200).json({
// 				"CCU": analyticsItem.CCU,

// 				"DAU": analyticsItem.DAU,
// 				"DAUSince0h": analyticsItem.DAUSince0h,
// 				"DNU": analyticsItem.DNU,
// 				"DNUSince0h": analyticsItem.DNUSince0h,
// 				"DRT": analyticsItem.DRT,
// 				"DRTSince0h": analyticsItem.DRTSince0h,

// 				"MAU": analyticsItem.MAU,
// 				"MAUSince0h1": analyticsItem.MAUSince0h1,
// 				"MNU": analyticsItem.MNU,
// 				"MNUSince0h1": analyticsItem.MNUSince0h1,
// 				"MRT": analyticsItem.MRT,
// 				"MRTSince0h1": analyticsItem.MRTSince0h1,
// 			});
// 		});

// 		this.adminRouter.get("/", wrap((req, res, next) => {
// 			return this.mustSignin(req, res, next);
// 		}), (req: express.Request, res: express.Response) => {
// 			let packageJsonPath = __dirname + "/../../../../package.json";

// 			if (fs.existsSync(packageJsonPath)) {
// 				let packageJsonStr = fs.readFileSync(packageJsonPath).toString();
// 				let packageJson = JSON.parse(packageJsonStr);
// 				let description: string = packageJson.description ?? "";
// 				let name: string = packageJson.name ?? "";
// 				let version: string = packageJson.version ?? "";

// 				res.locals.data = {
// 					description: description,
// 					name: name,
// 					version: version,
// 				}
// 			}
// 			else {
// 				res.locals.data = {
// 					description: "gn description",
// 					name: "GN Server",
// 					version: "2.0",
// 				}
// 			}

// 			let username: string = req.authInfo.getOtherData("username");
// 			let userId: string = req.authInfo.getUserId();
// 			let gnVersion: string = GNServer.getServerVersion();

// 			res.locals.data.username = username;
// 			res.locals.data.userId = userId;
// 			res.locals.data.gnVersion = gnVersion;
// 			res.locals.data.maxCCU = -1;

// 			res.render("admin/index");
// 		});

// 		{
// 			this.adminRouter.get("/change-password", wrap((req, res, next) => {
// 				return this.mustSignin(req, res, next);
// 			}), (req: express.Request, res: express.Response) => {
// 				res.render("admin/change-password");
// 			});

// 			this.adminRouter.post("/change-password", wrap((req, res, next) => {
// 				return this.mustSignin(req, res, next);
// 			}), async (req: express.Request, res: express.Response) => {
// 				let body = req.body;
// 				let repassword = body.repassword;
// 				let newpassword = body.newpassword;
// 				let password = body.password;

// 				if (newpassword != repassword) {
// 					(req.session as any).messages = {
// 						"errors": {
// 							"msg": "repassword wroong"
// 						}
// 					}

// 					return res.redirect("/admin/change-password");
// 				}

// 				if (newpassword.length < 5) {
// 					(req.session as any).messages = {
// 						"errors": {
// 							"msg": "password length need at least 6 chars."
// 						}
// 					}

// 					return res.redirect("/admin/change-password");
// 				}

// 				if (newpassword == password) {
// 					(req.session as any).messages = {
// 						"errors": {
// 							"msg": "current password is look like new password"
// 						}
// 					}

// 					return res.redirect("/admin/change-password");
// 				}

// 				let requestData = new DashboardModels.ChangePasswordAdminAccountRequestData();
// 				requestData.currentPassword = password;
// 				requestData.password = newpassword;

// 				GNNetwork.dashboard.changePasswordAdminAccount(requestData, response => {
// 					if (response.hasReturnCodeError()) {
// 						let errorCodeStr = CodeHelper.getReturnCodeName(response.returnCode);

// 						(req.session as any).messages = {
// 							"errors": {
// 								"ErrorCode": errorCodeStr
// 							}
// 						}

// 						return res.redirect("/admin/change-password");
// 					}
// 					else {
// 						let errorCode = <ErrorCode>response.errorCode;
// 						if (errorCode != ErrorCode.Ok) {
// 							let errorCodeStr = "ErrorCode " + errorCode;

// 							(req.session as any).messages = {
// 								"errors": {
// 									"ErrorCode": errorCodeStr
// 								}
// 							}

// 							return res.redirect("/admin/change-password");
// 						}
// 						else {
// 							return res.redirect("/admin");
// 						}
// 					}
// 				});
// 			});
// 		}

// 		{
// 			this.adminRouter.get("/signin", wrap((req, res, next) => {
// 				return this.mustNotSignin(req, res, next);
// 			}), (req: express.Request, res: express.Response) => {
// 				res.render("admin/signin");
// 			});

// 			this.adminRouter.post("/signin", async (req: express.Request, res: express.Response) => {
// 				let body = req.body;

// 				let username = body.username;
// 				let password = body.password;

// 				if (!username || !password) {
// 					let errorCodeStr = "UserDoesNotExists";

// 					(req.session as any).messages = {
// 						"errors": {
// 							"ErrorCode": errorCodeStr
// 						}
// 					}

// 					return res.redirect("/admin/signin");
// 				}

// 				let requestData = new DashboardModels.LoginByAdminAccountRequestData();
// 				requestData.username = username;
// 				requestData.password = password;

// 				GNNetwork.dashboard.loginByAdminAccount(requestData, response => {
// 					if (response.hasReturnCodeError()) {
// 						let errorCodeStr = CodeHelper.getReturnCodeName(response.returnCode);

// 						(req.session as any).messages = {
// 							"errors": {
// 								"ErrorCode": errorCodeStr
// 							}
// 						}

// 						return res.redirect("/admin/signin");
// 					}
// 					else {
// 						let errorCode = <ErrorCode>response.errorCode;
// 						if (errorCode != ErrorCode.Ok) {
// 							let errorCodeStr = "ErrorCode " + errorCode;

// 							(req.session as any).messages = {
// 								"errors": {
// 									"ErrorCode": errorCodeStr
// 								}
// 							}

// 							return res.redirect("/admin/signin");
// 						}
// 						else {
// 							res.cookie("authToken", response.responseData.authToken, {
// 								maxAge: 3600000
// 							});

// 							if (password == "gnadmin") {
// 								return res.redirect("/admin/change-password");
// 							}

// 							return res.redirect("/admin");
// 						}
// 					}
// 				});
// 			});

// 			this.adminRouter.post("/signout", (req: express.Request, res: express.Response) => {
// 				res.clearCookie("authToken");

// 				return res.redirect("/admin");
// 			});
// 		}

// 		{
// 			this.adminRouter.get("/debug", wrap((req, res, next) => {
// 				return this.mustSignin(req, res, next);
// 			}), (req: express.Request, res: express.Response) => {
// 				let userId: string = req.authInfo.getUserId();

// 				res.locals.data = {
// 					userId: userId,
// 				}

// 				res.render("admin/debug");
// 			});

// 			this.adminRouter.get("/debug-support.js", wrap((req, res, next) => {
// 				return this.mustSignin(req, res, next);
// 			}), (req: express.Request, res: express.Response): any => {
// 				let requestController = this.gnServer.getRequestController();
// 				let requestConverterService = this.gnServer.getRequestConverterService();

// 				let allHandlers = requestController.getAllHandlers(<number>RequestType.Authenticate);
// 				allHandlers = allHandlers.sort((a, b) => a.getCode() - b.getCode());

// 				let serverAddress: string = "127.0.0.1";
// 				let serverPort: number = this.applicationSettings.getPort();
// 				let useSsl: boolean = this.applicationSettings.getUseSSL();
// 				let useSocket: boolean = this.socketAppSettings.getEnable();
// 				let useHttp: boolean = this.httpAppSettings.getEnable();
// 				let sendRate: number = 20;
// 				let reconnectDelay: number = 5000;
// 				let pingInterval: number = this.socketAppSettings.getPingInterval() - 50;
// 				let pingTimeout: number = this.socketAppSettings.getPingTimeout() - 50;

// 				let stringBuilder = '';
// 				stringBuilder += 'function initDebugSupport() {';
// 				stringBuilder += '	gnServerSettings.serverAddress = "' + serverAddress + '";';
// 				stringBuilder += '	gnServerSettings.serverPort = ' + serverPort + ';';
// 				stringBuilder += '	gnServerSettings.useSsl = ' + useSsl + ';';
// 				stringBuilder += '	gnServerSettings.useSocket = ' + useSocket + ';';
// 				stringBuilder += '	gnServerSettings.useHttp = ' + useHttp + ';';
// 				stringBuilder += '	gnServerSettings.sendRate = ' + sendRate + ';';
// 				stringBuilder += '	gnServerSettings.reconnectDelay = ' + reconnectDelay + ';';
// 				stringBuilder += '	gnServerSettings.pingInterval = ' + pingInterval + ';';
// 				stringBuilder += '	gnServerSettings.pingTimeout = ' + pingTimeout + ';';
// 				stringBuilder += '	gnServerSettings.logType = GN.LogType.All;';

// 				for (let i = 0; i < allHandlers.length; i++) {
// 					let handler = allHandlers[i];
// 					let codeNumber = handler.getCode();
// 					let codeName = CodeHelper.getOperationCodeName(codeNumber);

// 					let commonOperationRequest = handler.getCommonOperationRequest();

// 					let gnParameters = [];

// 					let declaredFields = requestConverterService.getGNEnhancedObjectFieldMetadata(commonOperationRequest);
// 					for (let i = 0; i < declaredFields.length; i++) {
// 						let field = declaredFields[i];

// 						gnParameters.push({
// 							"parameterCode": field.code,
// 							"parameterName": field.name,
// 							"parameterType": <number>field.gnFieldType,
// 							"parameterIsOptional": field.isOptional,
// 							"parameterDefaultValue": field.defaultValue,
// 						});
// 					}

// 					let gnParametersStringBuilder = JSON.stringify(gnParameters);

// 					stringBuilder += '	gnRequests.push({"operationCode": "' + codeNumber + '", "operationName": "' + codeName + '", "gnParameters": ' + gnParametersStringBuilder + '});';
// 				}

// 				let eventCodeDic = CodeHelper.getEventCodeDic();
// 				let eventCodeKeys = Object.keys(eventCodeDic);

// 				for (let i = 0; i < eventCodeKeys.length; i++) {
// 					let eventCodeKey = eventCodeKeys[i];
// 					let eventCodeName = eventCodeDic[Number.parseInt(eventCodeKey)];

// 					stringBuilder += '	gnEventNameDict["' + eventCodeKey + '"] = "' + eventCodeName + '";';
// 				}

// 				let getReturnCodeDic = CodeHelper.getReturnCodeDic();
// 				let getReturnCodeKeys = Object.keys(getReturnCodeDic);

// 				for (let i = 0; i < getReturnCodeKeys.length; i++) {
// 					let returnCodeKey = getReturnCodeKeys[i];
// 					let returnCodeName = getReturnCodeDic[Number.parseInt(returnCodeKey)];

// 					stringBuilder += '	gnReturnCodeDict["' + returnCodeKey + '"] = "' + returnCodeName + '";';
// 				}

// 				let gnInvalidMemberTypeKeys = Object.keys(InvalidMemberType);
// 				let gnInvalidMemberTypeValues = Object.values(InvalidMemberType);
// 				for (let i = 0; i < gnInvalidMemberTypeKeys.length; i++) {
// 					stringBuilder += '	gnInvalidMemberTypeDict["' + gnInvalidMemberTypeKeys[i] + '"] = "' + gnInvalidMemberTypeValues[i] + '";';
// 				}

// 				stringBuilder += '}';

// 				return res.send(stringBuilder);
// 			});
// 		}

// 		{
// 			this.adminRouter.get("/log", wrap((req, res, next) => {
// 				return this.mustSignin(req, res, next);
// 			}), (req: express.Request, res: express.Response) => {
// 				let userId: string = req.authInfo.getUserId();

// 				res.locals.data = {
// 					userId: userId,
// 				}

// 				res.render("admin/log");
// 			});

// 			this.adminRouter.get("/get-log", async (req: express.Request, res: express.Response) => {
// 				let query = req.query;
// 				let skipStr = query.skip as string;
// 				let limitStr = query.limit as string;

// 				if (!skipStr) skipStr = "0";
// 				if (!limitStr) limitStr = "100";

// 				let skip = Number.parseInt(skipStr);
// 				let limit = Number.parseInt(limitStr);

// 				let fullLogPath = __dirname + "/../../../" + this.logSettings.getLogPath();

// 				fs.readFile(fullLogPath, "utf-8", (err, data) => {
// 					if (err) {
// 						return res.sendStatus(500);
// 					}

// 					let arr = data.replace(/\r\n/g, "\n").split("\n");

// 					let returnData = [];

// 					let startI = arr.length - 1 - skip;
// 					if (startI > arr.length - 1) startI = arr.length - 1;
// 					let endI = startI - limit;
// 					if (endI < 0) endI = 0;
// 					else if (endI > startI) endI = startI;

// 					for (let i = startI - 1; i >= endI; i--) returnData.push(arr[i]);

// 					return res.status(200).json(returnData);
// 				});
// 			});
// 		}
// 	}
// }
