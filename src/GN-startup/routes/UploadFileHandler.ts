import { UploadFileMiddleware } from "./../middleware/UploadFileMiddleware";
import { ApiMiddleware } from "./../middleware/ApiMiddleware";
import * as mongoDB from "mongodb";
import fs from "fs";
import express, { NextFunction } from "express";
import { wrap } from "./utils/wrap";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import { AntiDdosMiddleware } from "./../middleware/AntiDdosMiddleware";
import { Commands } from "./../../GN-common/constant/Commands";
import { Debug } from "./../../GN-library/xdebug/lib/xDebug";

export class UploadFileHandler {
	// Stores the API middleware value used by this instance.
	private apiMiddleware: ApiMiddleware;
	// Stores the upload file middleware value used by this instance.
	private uploadFileMiddleware: UploadFileMiddleware;
	// Stores the anti DDoS middleware value used by this instance.
	private antiDdosMiddleware: AntiDdosMiddleware;

	// Stores the router value used by this instance.
	private router: express.Express;
	// Stores the upload router value used by this instance.
	private uploadRouter: express.Router;
	// Stores the upload path value used by this instance.
	private uploadPath: string;
	// Stores the upload file info collection value used by this instance.
	private uploadFileInfoCollection: mongoDB.Collection<mongoDB.Document>;
	// Stores the download file session collection value used by this instance.
	private downloadFileSessionCollection: mongoDB.Collection<mongoDB.Document>;

	/**
	 * Sets the router.
	 * @param router Provides the router value used by this operation.
	 */
	public setRouter(router: express.Express): void {
		this.router = router;
	}

	/**
	 * Sets the API middleware.
	 * @param apiMiddleware Provides the API middleware value used by this operation.
	 */
	public setApiMiddleware(apiMiddleware: ApiMiddleware): void {
		this.apiMiddleware = apiMiddleware;
	}

	/**
	 * Sets the anti DDoS middleware.
	 * @param antiDdosMiddleware Provides the anti DDoS middleware value used by this operation.
	 */
	public setAntiDdosMiddleware(antiDdosMiddleware: AntiDdosMiddleware): void {
		this.antiDdosMiddleware = antiDdosMiddleware;
	}

	/**
	 * Sets the upload file middleware.
	 * @param uploadFileMiddleware Provides the upload file middleware value used by this operation.
	 */
	public setUploadFileMiddleware(uploadFileMiddleware: UploadFileMiddleware): void {
		this.uploadFileMiddleware = uploadFileMiddleware;
	}

	/**
	 * Sets the upload path.
	 * @param uploadPath Provides the upload path value used by this operation.
	 */
	public setUploadPath(uploadPath: string): void {
		this.uploadPath = uploadPath;
	}

	/**
	 * Sets the upload file info collection.
	 * @param uploadFileInfoCollection Provides the upload file info collection used by this operation.
	 */
	public setUploadFileInfoCollection(uploadFileInfoCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.uploadFileInfoCollection = uploadFileInfoCollection;
	}

	/**
	 * Sets the download file session collection.
	 * @param downloadFileSessionCollection Provides the download file session collection used by this operation.
	 */
	public setDownloadFileSessionCollection(downloadFileSessionCollection: mongoDB.Collection<mongoDB.Document>): void {
		this.downloadFileSessionCollection = downloadFileSessionCollection;
	}

	/**
	 * Executes the init workflow.
	 */
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

		// Stores the download router value used in the current execution flow.
		let downloadRouter = express.Router();
		this.router.use(
			"/download",
			wrap((req, res, next) => {
				return this.apiMiddleware.getIP(req, res, next);
			}),
			wrap((req, res, next) => {
				return this.antiDdosMiddleware.checkMaxUploadRequestPerSecondPerIp(req, res, next);
			}),
			wrap((req, res, next) => {
				return this.antiDdosMiddleware.checkMaxUploadRequestPerSecondPerPeer(req, res, next);
			}),
			downloadRouter
		);

		downloadRouter.get("/:downloadToken",
			// wrap((req, res, next) => {
			// 	return this.antiDdosMiddleware.addPendingDownloadRequest(req, res, next);
			// }),

			async (req: express.Request, res: express.Response): Promise<any> => {
				// this.antiDdosMiddleware.removePendingDownloadRequest(req, res);

				let downloadToken = req.params.downloadToken;
				if (!downloadToken) return res.sendStatus(400);

				// Stores the download file session result value used in the current execution flow.
				let downloadFileSessionResult = await this.downloadFileSessionCollection.findOne({ downloadToken: downloadToken }, {
					projection: {
						fileId: true,
						fileUpload: true,
					}
				});
				if (!downloadFileSessionResult) return res.sendStatus(404);

				// Stores the file upload value used in the current execution flow.
				let fileUpload = downloadFileSessionResult.fileUpload;
				// Stores the full path value used in the current execution flow.
				let fullPath = fileUpload.fullPath;
				// Stores the folder file name value used in the current execution flow.
				let folderFileName = fileUpload.folderFileName;

				return res.download(fullPath, folderFileName, (err) => {
					if (err) {
						res.status(500).send(err.message);
					}
				});

				// fs.readFile(fullPath, (err, data) => {

				// 	if (err) {
				// 		return res.status(404).send(err.message);
				// 	}

				// 	// res.writeHead(200, { "Content-Type": fileUpload["mimeType"], "Cache-Control": "public, max-age=86400" });

				// 	this.downloadFileSessionCollection.updateOne({ downloadToken: downloadToken }, {
				// 		$set: {
				// 			isValid: false
				// 		}
				// 	});
				// 	return res.end(data);
				// });
			});
	}

	/**
	 * Runs the current workflow.
	 */
	public run(): void {
		this.uploadRouter.use(express.json({ limit: "10mb" }));
		this.uploadRouter.use(express.urlencoded({ extended: false, limit: "10mb" }));
		// this.uploadRouter.use(msgpack());

		let configUploadPath = this.uploadPath;
		// Stores the upload path value used in the current execution flow.
		let uploadPath = configUploadPath;
		if (uploadPath) {
			if (!fs.existsSync(uploadPath)) {
				uploadPath = process.cwd() + "/" + this.uploadPath;
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
			wrap((req, res, next) => {
				return this.uploadFileMiddleware.handleUpload().single(Commands.File)(req, res, next as NextFunction);
			}),
			async (req: express.Request, res: express.Response): Promise<any> => {
				this.antiDdosMiddleware.removePendingUploadRequest(req, res);

				// Stores the file value used in the current execution flow.
				let file = req.file;
				if (!file) {
					return res.sendStatus(415);
				}

				// Stores the file ID value used in the current execution flow.
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

	/**
	 * Removes the file.
	 * @param fullPath Provides the full path value used by this operation.
	 */
	public removeFile(fullPath: string): void {
		fs.rm(fullPath, err => {
			Debug.logError("[GearN] remove file at path " + fullPath + ", error " + err);
		});
	}

}
