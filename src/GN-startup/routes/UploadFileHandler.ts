import { UploadFileMiddleware } from "./../middleware/UploadFileMiddleware";
import { ApiMiddleware } from "./../middleware/ApiMiddleware";
import * as mongoDB from "mongodb";
import { Router } from "express";
import fs from "fs";
import express from "express";
import { wrap } from "async-middleware";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";

export class UploadFileHandler {
	private apiMiddleware: ApiMiddleware;
	private uploadFileMiddleware: UploadFileMiddleware;

	private router: Router;
	private uploadRouter: Router;
	private uploadPath: string;
	private uploadFileInfoCollection: mongoDB.Collection<mongoDB.Document>;

	public setRouter(router: Router): void {
		this.router = router;
	}

	public setApiMiddleware(apiMiddleware: ApiMiddleware): void {
		this.apiMiddleware = apiMiddleware;
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

	public init(): void {
		this.uploadRouter = express.Router();
		this.router.use(
			"/upload",
			wrap((req, res, next) => {
				return this.apiMiddleware.authenticateTokenViaJson(req, res, next);
			}),
			this.uploadRouter
		);

		this.uploadRouter.get("/:fileId", async (req: express.Request, res: express.Response): Promise<any> => {
			let fileId = req.params.fileId;
			if (!fileId) return res.sendStatus(400);

			let fileDoc = await this.uploadFileInfoCollection.findOne({ FileId: fileId });
			if (!fileDoc) return res.sendStatus(404);

			let fullPath = fileDoc["FullPath"];
			fs.readFile(fullPath, (err, data) => {
				if (err) {
					return res.status(404).send(err.message);
				}

				res.writeHead(200, { "Content-type": fileDoc["MimeType"] });
				return res.end(data);
			});
		});
	}

	public run(): void {
		this.uploadRouter.use(express.json());
		this.uploadRouter.use(express.urlencoded({ extended: false }));
		// this.uploadRouter.use(msgpack());

		let uploadPath = __dirname + "/../../../../" + this.uploadPath;

		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { mode: "0775" });
		}

		this.uploadRouter.post(
			"/:fileId",
			wrap((req, res, next) => {
				return this.uploadFileMiddleware.checkFileUploadInvalid(req, res, next);
			}),
			wrap(this.uploadFileMiddleware.handleUpload().single("f")),
			async (req: express.Request, res: express.Response): Promise<any> => {
				let file = req.file;
				if (!file) {
					return res.sendStatus(415);
				}

				let fileId = req.params.fileId;

				let fileDocUpdate = {
					MimeType: file.mimetype,
					Size: file.size,
					FolderFileName: file.filename,
					FullPath: file.path,
					ShortPath: this.uploadPath + "/" + file.filename,
					TsUploadFile: xDatetime.getCurrentMilliseconds(),
				};

				this.uploadFileInfoCollection.updateOne(
					{ FileId: fileId },
					{
						$set: fileDocUpdate,
					}
				);

				return res.sendStatus(200);
			}
		);
	}
}
