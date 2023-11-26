import { UploadFileMiddleware } from "./../middleware/UploadFileMiddleware";
import { ApiMiddleware } from "./../middleware/ApiMiddleware";
import * as mongoDB from "mongodb";
import fs from "fs";
import express from "express";
import { wrap } from "async-middleware";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { AntiDdosMiddleware } from "./../middleware/AntiDdosMiddleware";
import { Commands } from "./../../GN-common/constant/Commands";

export class UploadFileHandler {
	private apiMiddleware: ApiMiddleware;
	private uploadFileMiddleware: UploadFileMiddleware;
	private antiDdosMiddleware: AntiDdosMiddleware;

	private router: express.Express;
	private uploadRouter: express.Router;
	private uploadPath: string;
	private uploadFileInfoCollection: mongoDB.Collection<mongoDB.Document>;
	private downloadFileSessionCollection: mongoDB.Collection<mongoDB.Document>;

	public setRouter(router: express.Express): void {
		this.router = router;
	}

	public setApiMiddleware(apiMiddleware: ApiMiddleware): void {
		this.apiMiddleware = apiMiddleware;
	}

	public setAntiDdosMiddleware(antiDdosMiddleware: AntiDdosMiddleware): void {
		this.antiDdosMiddleware = antiDdosMiddleware;
	}

	public setUploadFileMiddleware(uploadFileMiddleware: UploadFileMiddleware): void {
		this.uploadFileMiddleware = uploadFileMiddleware;
	}

	public setUploadPath(uploadPath: string): void {
		this.uploadPath = uploadPath;
	}

	public setUploadFileInfoCollection(uploadFileInfoCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.uploadFileInfoCollection = uploadFileInfoCollection;
	}

	public setDownloadFileSessionCollection(downloadFileSessionCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.downloadFileSessionCollection = downloadFileSessionCollection;
	}

	public init(): void {
		this.uploadRouter = express.Router();
		this.router.use(
			"/upload",
			wrap((req, res, next) => {
				return this.apiMiddleware.getIP(req, res, next);
			}),
			wrap((req, res, next) => {
				return this.antiDdosMiddleware.checkMaxUploadRequestPerSecondPerIp(req, res, next);
			}),
			wrap((req, res, next) => {
				return this.apiMiddleware.authenticateUploadToken(req, res, next);
			}),
			wrap((req, res, next) => {
				return this.antiDdosMiddleware.checkMaxUploadRequestPerSecondPerPeer(req, res, next);
			}),
			this.uploadRouter
		);

		this.uploadRouter.get("/:downloadToken",
			wrap((req, res, next) => {
				return this.antiDdosMiddleware.addPendingDownloadRequest(req, res, next);
			}),

			async (req: express.Request, res: express.Response): Promise<any> => {
				let downloadToken = req.params.downloadToken;
				if (!downloadToken) return res.sendStatus(400);

				let downloadFileSessionResult = await this.downloadFileSessionCollection.findOne({ downloadToken: downloadToken, isValid: true });
				if (!downloadFileSessionResult) return res.sendStatus(404);

				let fileId = downloadFileSessionResult["fileId"];

				let fileDoc = await this.uploadFileInfoCollection.findOne({ fileId: fileId });
				if (!fileDoc) return res.sendStatus(404);

				let fileUpload = fileDoc["fileUpload"];
				if (!fileUpload) return res.sendStatus(404);

				let fullPath = fileUpload["fullPath"];
				fs.readFile(fullPath, (err, data) => {
					this.antiDdosMiddleware.removePendingDownloadRequest(req, res);

					if (err) {
						return res.status(404).send(err.message);
					}

					res.writeHead(200, { "Content-type": fileUpload["mimeType"] });

					this.downloadFileSessionCollection.updateOne({ downloadToken: downloadToken }, {
						$set: {
							isValid: false
						}
					});
					return res.end(data);
				});
			});
	}

	public run(): void {
		this.uploadRouter.use(express.json());
		this.uploadRouter.use(express.urlencoded({ extended: false }));
		// this.uploadRouter.use(msgpack());

		let configUploadPath = this.uploadPath;
		let uploadPath = configUploadPath;
		if (uploadPath) {
			if (!fs.existsSync(uploadPath)) {
				uploadPath = process.cwd() + this.uploadPath;
			}
		}

		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { mode: "0775" });
		}

		this.uploadRouter.post(
			"/:fileId",
			wrap((req, res, next) => {
				return this.antiDdosMiddleware.addPendingUploadRequest(req, res, next);
			}),
			wrap((req, res, next) => {
				return this.uploadFileMiddleware.checkFileUploadInvalid(req, res, next);
			}),
			wrap(this.uploadFileMiddleware.handleUpload().single(Commands.File)),
			async (req: express.Request, res: express.Response): Promise<any> => {
				this.antiDdosMiddleware.removePendingUploadRequest(req, res);

				let file = req.file;
				if (!file) {
					return res.sendStatus(415);
				}

				let fileId = req.params.fileId;

				this.uploadFileInfoCollection.updateOne(
					{ fileId: fileId },
					{
						$set: {
							fileUpload: {
								mimeType: file.mimetype,
								size: file.size,
								folderFileName: file.filename,
								fullPath: file.path,
								shortPath: this.uploadPath + "/" + file.filename,
								tsUploadFile: xDatetime.getCurrentMilliseconds(),
							}
						}
					}
				);

				return res.sendStatus(200);
			}
		);
	}

}
