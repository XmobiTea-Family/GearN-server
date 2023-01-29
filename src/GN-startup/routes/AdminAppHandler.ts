import { wrap } from "async-middleware";
import express from "express";
import { ApiMiddleware } from "./../middleware/ApiMiddleware";
import { GNServer } from "./../../GNServer";
import { AdminViewSettings } from "./../settings/AdminViewSettings";
import { CodeHelper } from "./../../GN-common/helper/CodeHelper";
import fs from "fs";
import { ApplicationSettings } from "./../settings/ApplicationSettings";
import { SocketAppSettings } from "./../settings/SocketAppSettings";
import { HttpAppSettings } from "./../settings/HttpAppSettings";
import { LogSettings } from "./../settings/LogSettings";
import session from "express-session";
import { StringUtility } from "./../../GN-common/helper/StringUtility";
import { ReturnCode } from "../../GN-common/constant/ReturnCode";
import { UserRoleType } from "../../GN-common/constant/enumType/UserRoleType";
import { OperationCode } from "../../GN-common/constant/OperationCode";
import { OperationResponse } from "../../GN-common/entity/operationResponse/OperationResponse";
import { OperationRequest } from "../../GN-common/entity/operationRequest/OperationRequest";
import { LoginParameterCode } from "../../GN-common/constant/parameterCode/LoginParameterCode";
import { LoginType } from "../../GN-common/constant/enumType/LoginType";
import { LoginErrorCode } from "../../GN-common/constant/errorCode/LoginErrorCode";
import { ParameterCode } from "../../GN-common/constant/parameterCode/ParameterCode";
import { InvalidMemberType } from "../../GN-common/constant/enumType/InvalidMemberType";

export class AdminAppHandler {
	private applicationSettings: ApplicationSettings;
	private apiMiddleware: ApiMiddleware;
	private adminViewSettings: AdminViewSettings;

	private gnServer: GNServer;

	private router: express.Express;
	private adminRouter: express.Router;
	private adminApiRouter: express.Router;
	private socketAppSettings: SocketAppSettings;
	private httpAppSettings: HttpAppSettings;
	private logSettings: LogSettings;

	public setRouter(router: express.Express): void {
		this.router = router;
	}

	public setApiMiddleware(apiMiddleware: ApiMiddleware): void {
		this.apiMiddleware = apiMiddleware;
	}

	public setGNServer(gnServer: GNServer): void {
		this.gnServer = gnServer;
	}

	public setAdminViewSettings(adminViewSettings: AdminViewSettings) {
		this.adminViewSettings = adminViewSettings;
	}

	public setApplicationSettings(applicationSettings: ApplicationSettings): void {
		this.applicationSettings = applicationSettings;
	}

	public setSocketAppSettings(socketAppSettings: SocketAppSettings): void {
		this.socketAppSettings = socketAppSettings;
	}

	public setHttpAppSettings(httpAppSettings: HttpAppSettings): void {
		this.httpAppSettings = httpAppSettings;
	}

	public setLogSettings(logSettings: LogSettings): void {
		this.logSettings = logSettings;
	}

	private async checkSigninStatus(req: express.Request, res: express.Response, next: Function) {
		let authToken = (req.session as any).authToken as string;

		if (!authToken) {
			return res.sendFile(__dirname + "/GN-startup/routes/www/adminViews/signin.html");
		}

		req.headers["a"] = authToken;

		let returnCode = await this.apiMiddleware.getReturnCodeAuthenticate(req);

		if (returnCode != ReturnCode.Ok || !(req as any).isAuthenticated) {
			return res.sendFile(__dirname + "/GN-startup/routes/www/adminViews/signin.html");
		}

		if ((req as any).authInfo.getRole() > UserRoleType.GameMaster) {
			return res.sendFile(__dirname + "/GN-startup/routes/www/adminViews/permission-deny.html");
		}

		return next();
	}

	public run(): void {
		this.router.set("view engine", "ejs");
		this.router.set("views", "./www/views");

		this.adminRouter = express.Router();
		this.router.use("/admin", this.adminRouter);
		
		this.adminApiRouter = express.Router();
		this.router.use("/admin/api", this.adminApiRouter);

		this.adminApiRouter.use(session({
			resave: true,
			saveUninitialized: true,
			secret: StringUtility.generateRandomString(10),
			cookie: { maxAge: 3600000, secure: true }
		}));

		this.setupAdminApiRouter();
		this.setupAdminRouter();
	}

	private setupAdminApiRouter(): void {
		this.adminApiRouter.get("/get-stats", (req: express.Request, res: express.Response) => {
			let cpuUsage = process.cpuUsage();
			let memoryUsage = process.memoryUsage();
			let resourceUsage = process.resourceUsage();

			return res.json({
				"CpuUsage": cpuUsage,
				"MemoryUsage": memoryUsage,
				"ResourceUsage": resourceUsage
			});
		});

		this.adminApiRouter.get("/get-analytics", async (req: express.Request, res: express.Response) => {
			let query = req.query;
			let tsDateStr = query.tsDate as string;

			let analyticsService = this.gnServer.getAnalyticsService();
			let analyticsItem = await analyticsService.getAnalyticsItem(!tsDateStr ? null : Number.parseInt(tsDateStr));

			if (analyticsItem == null) {
				return res.status(403);
			}

			return res.json({
				"CCU": analyticsItem.CCU,

				"DAU": analyticsItem.DAU,
				"DAUSince0h": analyticsItem.DAUSince0h,
				"DNU": analyticsItem.DNU,
				"DNUSince0h": analyticsItem.DNUSince0h,
				"DRT": analyticsItem.DRT,
				"DRTSince0h": analyticsItem.DRTSince0h,

				"MAU": analyticsItem.MAU,
				"MAUSince0h1": analyticsItem.MAUSince0h1,
				"MNU": analyticsItem.MNU,
				"MNUSince0h1": analyticsItem.MNUSince0h1,
				"MRT": analyticsItem.MRT,
				"MRTSince0h1": analyticsItem.MRTSince0h1,
			});
		});

		this.adminApiRouter.post("/signin", async (req: express.Request, res: express.Response) => {
			let body = req.body;
			let username = body.username;
			let password = body.password;

			let loginRequestHandler = this.gnServer.getRequestController().getHandler(OperationCode.Login);
			let loginOperationRequest = new OperationRequest(OperationCode.Login, false);
			loginOperationRequest.setScriptData(LoginParameterCode.LoginType, LoginType.Account);
			loginOperationRequest.setScriptData(LoginParameterCode.Username, username);
			loginOperationRequest.setScriptData(LoginParameterCode.Password, password);

			let operationResponse: OperationResponse = await loginRequestHandler.handle(null, loginOperationRequest);
			if (operationResponse.getReturnCode() != ReturnCode.Ok) {
				return res.sendFile(__dirname + "/GN-startup/routes/www/adminViews/signin-error.html");
			}

			let parameters = operationResponse.getParameters();
			let errorCode = <LoginErrorCode>parameters.getNumber(ParameterCode.ErrorCode);
			if (errorCode != LoginErrorCode.Ok) {
				return res.sendFile(__dirname + "/GN-startup/routes/www/adminViews/signin-error.html");
			}
			else {
				let authToken = parameters.getString(ParameterCode.AuthToken);
				(req.session as any).authToken = authToken;
			}

			return res.redirect("/");
		});

		this.adminApiRouter.post("/signout", async (req: express.Request, res: express.Response) => {
			(req.session as any).authToken = null;

			return res.redirect("./");
		});
	}

	private setupAdminRouter(): void {
		this.adminRouter.get("/", wrap((req, res, next) => {
			return this.checkSigninStatus(req, res, next);
		}), (req: express.Request, res: express.Response) => {
			return res.sendFile(__dirname + "/GN-startup/routes/www/adminViews/admin.html");
		});

		if (this.adminViewSettings.getDebugViewEnable()) {
			this.adminRouter.get("/debug", (req: express.Request, res: express.Response) => {
				return res.sendFile(__dirname + "/GN-startup/routes/www/adminViews/debug.html");
			});

			this.adminRouter.get("/debug-support.js", (req: express.Request, res: express.Response) => {
				let requestController = this.gnServer.getRequestController();
				let requestConverterService = this.gnServer.getRequestConverterService();

				let allHandlers = requestController.getAllHandlers();
				allHandlers = allHandlers.sort((a, b) => a.getCode() - b.getCode());

				let serverAddress: string = "127.0.0.1";
				let serverPort: number = this.applicationSettings.getPort();
				let useSsl: boolean = this.applicationSettings.getUseSSL();
				let useSocket: boolean = this.socketAppSettings.getEnable();
				let useHttp: boolean = this.httpAppSettings.getEnable();
				let sendRate: number = 20;
				let reconnectDelay: number = 5000;
				let pingInterval: number = this.socketAppSettings.getPingInterval() - 50;
				let pingTimeout: number = this.socketAppSettings.getPingTimeout() - 50;
				let codeCanSendNotAuthorized: number[] = requestController.getRequestUnAuthenticatedCodes();

				let stringBuilder = '';
				stringBuilder += 'function initDebugSupport() {';
				stringBuilder += '	gnServerSettings.serverAddress = "' + serverAddress + '";';
				stringBuilder += '	gnServerSettings.serverPort = ' + serverPort + ';';
				stringBuilder += '	gnServerSettings.useSsl = ' + useSsl + ';';
				stringBuilder += '	gnServerSettings.useSocket = ' + useSocket + ';';
				stringBuilder += '	gnServerSettings.useHttp = ' + useHttp + ';';
				stringBuilder += '	gnServerSettings.sendRate = ' + sendRate + ';';
				stringBuilder += '	gnServerSettings.reconnectDelay = ' + reconnectDelay + ';';
				stringBuilder += '	gnServerSettings.pingInterval = ' + pingInterval + ';';
				stringBuilder += '	gnServerSettings.pingTimeout = ' + pingTimeout + ';';
				stringBuilder += '	gnServerSettings.codeCanSendNotAuthorized = ' + JSON.stringify(codeCanSendNotAuthorized) + ';';
				stringBuilder += '	gnServerSettings.logType = GN.LogType.All;';

				for (let i = 0; i < allHandlers.length; i++) {
					let handler = allHandlers[i];
					let codeNumber = handler.getCode();
					let codeName = CodeHelper.getOperationCodeName(codeNumber);

					let commonOperationRequest = handler.getCommonOperationRequest();

					let gnParameters = [];

					let declaredFields = requestConverterService.getGNEnhancedObjectFieldMetadata(commonOperationRequest);
					for (let i = 0; i < declaredFields.length; i++) {
						let field = declaredFields[i];

						gnParameters.push({
							"parameterCode": field.code,
							"parameterName": field.name,
							"parameterType": <number>field.gnFieldType,
							"parameterIsOptional": field.isOptional,
							"parameterDefaultValue": field.defaultValue,
						});
					}

					let gnParametersStringBuilder = JSON.stringify(gnParameters);

					stringBuilder += '	gnRequests.push({"operationCode": "' + codeNumber + '", "operationName": "' + codeName + '", "gnParameters": ' + gnParametersStringBuilder + '});';
				}

				let eventCodeDic = CodeHelper.getEventCodeDic();
				let eventCodeKeys = Object.keys(eventCodeDic);

				for (let i = 0; i < eventCodeKeys.length; i++) {
					let eventCodeKey = eventCodeKeys[i];
					let eventCodeName = eventCodeDic[Number.parseInt(eventCodeKey)];

					stringBuilder += '	gnEventNameDict["' + eventCodeKey + '"] = "' + eventCodeName + '";';
				}

				let getReturnCodeDic = CodeHelper.getReturnCodeDic();
				let getReturnCodeKeys = Object.keys(getReturnCodeDic);

				for (let i = 0; i < getReturnCodeKeys.length; i++) {
					let returnCodeKey = getReturnCodeKeys[i];
					let returnCodeName = getReturnCodeDic[Number.parseInt(returnCodeKey)];

					stringBuilder += '	gnReturnCodeDict["' + returnCodeKey + '"] = "' + returnCodeName + '";';
				}

				let gnInvalidMemberTypeKeys = Object.keys(InvalidMemberType);
				let gnInvalidMemberTypeValues = Object.values(InvalidMemberType);
				for (let i = 0; i < gnInvalidMemberTypeKeys.length; i++) {
					stringBuilder += '	gnInvalidMemberTypeDict["' + gnInvalidMemberTypeKeys[i] + '"] = "' + gnInvalidMemberTypeValues[i] + '";';
				}
				
				stringBuilder += '}';

				return res.send(stringBuilder);
			});

			this.adminRouter.get("/gn-js-client.min.js", (req: express.Request, res: express.Response) => {
				return res.sendFile(__dirname + "/GN-startup/routes/www/adminViews/gn-js-client.min.js");
			});

			this.adminRouter.get("/debug-common.js", (req: express.Request, res: express.Response) => {
				return res.sendFile(__dirname + "/GN-startup/routes/www/adminViews/debug-common.js");
			});
		}

		if (this.adminViewSettings.getLogViewEnable()) {
			this.adminRouter.get("/log", (req: express.Request, res: express.Response) => {
				return res.sendFile(__dirname + "/GN-startup/routes/www/adminViews/log.html");
			});

			this.adminRouter.get("/log-common.js", (req: express.Request, res: express.Response) => {
				return res.sendFile(__dirname + "/GN-startup/routes/www/adminViews/log-common.js");
			});

			this.adminRouter.get("/get-log", async (req: express.Request, res: express.Response) => {
				let query = req.query;
				let skipStr = query.skip as string;
				let limitStr = query.limit as string;

				if (!skipStr) skipStr = "0";
				if (!limitStr) limitStr = "100";

				let skip = Number.parseInt(skipStr);
				let limit = Number.parseInt(limitStr);

				let fullLogPath = __dirname + "/../../../" + this.logSettings.getLogPath();

				fs.readFile(fullLogPath, "utf-8", (err, data) => {
					if (err) {
						return res.sendStatus(500);
					}

					let arr = data.replace(/\r\n/g, "\n").split("\n");

					let returnData = [];

					let startI = arr.length - 1 - skip;
					if (startI > arr.length - 1) startI = arr.length - 1;
					let endI = startI - limit;
					if (endI < 0) endI = 0;
					else if (endI > startI) endI = startI;

					for (let i = startI - 1; i >= endI; i--) returnData.push(arr[i]);

					return res.json(returnData);
				});
			});
		}
	}
}
