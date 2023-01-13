import multer from "multer";
import * as mongoDB from "mongodb";
import { AuthInfo } from "./../../GN-common/entity/AuthInfo";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import express from "express";
import fs from "fs";

export class UploadFileMiddleware {
	private uploadFileInfoCollection: mongoDB.Collection<mongoDB.Document>;
	private uploadPath: string;
	private maxSizeUpload: number;
	private mimeTypeAccepts: string[];

	public setUploadPath(uploadPath: string): void {
		this.uploadPath = uploadPath;
	}

	public setMaxSizeUpload(maxSizeUpload: number): void {
		this.maxSizeUpload = maxSizeUpload;
	}

	public setMimeTypeAccepts(mimeTypeAccepts: string[]): void {
		this.mimeTypeAccepts = mimeTypeAccepts;
	}

	public setUploadFileInfoCollection(uploadFileInfoCollection: mongoDB.Collection<mongoDB.Document>) {
		this.uploadFileInfoCollection = uploadFileInfoCollection;
	}

	public run() { }

	private storage(): multer.StorageEngine {
		let configUploadPath = this.uploadPath;
		let uploadPath = configUploadPath;
		if (uploadPath) {
			if (!fs.existsSync(uploadPath)) {
				uploadPath = __dirname + "/../../../../" + this.uploadPath;
			}
		}

		return multer.diskStorage({
			destination: (req, file, cb) => {
				return cb(null, uploadPath);
			},
			filename: (req, file, cb) => {
				let fileId = req.params.fileId;
				let reqAny = req as any;
				let originFileName = reqAny.originFileName;

				return cb(null, xDatetime.getCurrentMilliseconds() + "_" + fileId + "_" + originFileName);
			},
		});
	}

	public handleUpload() {
		return multer({
			storage: this.storage(),
			limits: {
				files: 1,
				fileSize: this.maxSizeUpload, // 1 MB (max file size)
			},
			fileFilter: (req, file, cb) => {
				if (this.mimeTypeAccepts.indexOf(file.mimetype) == -1) {
					return cb(null, false);
				}

				cb(null, true);
			},
		});
	}

	public async checkFileUploadInvalid(req: express.Request, res: express.Response, next: Function): Promise<express.Response> {
		let fileId = req.params.fileId;
		if (!fileId) return res.sendStatus(400);

		let reqAny = req as any;
		if (reqAny.isAuthenticated === true) {
			let doc = await this.uploadFileInfoCollection.findOne({ FileId: fileId });
			if (doc == null) return res.sendStatus(404);

			if (doc["TsUploadFile"] != null) return res.sendStatus(400);
			if (doc["TsUploadExpire"] < xDatetime.getCurrentMilliseconds()) return res.sendStatus(408);

			let authInfo = reqAny.authInfo as AuthInfo;
			if (doc["UserId"] != authInfo.getUserId()) {
				return res.sendStatus(401);
			}

			let originFileName = doc["OriginFileName"];
			reqAny.originFileName = originFileName;

			return next();
		}

		return res.sendStatus(401);
	}

}
