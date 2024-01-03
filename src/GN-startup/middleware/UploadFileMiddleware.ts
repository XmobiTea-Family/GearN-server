import multer from "multer";
import * as mongoDB from "mongodb";
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
				uploadPath = process.cwd() + "/" + this.uploadPath;
			}
		}

		return multer.diskStorage({
			destination: (req, file, cb) => {
				return cb(null, uploadPath);
			},
			filename: (req, file, cb) => {
				let fileId = req.params.fileId;
				return cb(null, xDatetime.getCurrentMilliseconds() + "_" + fileId + "_" + file.originalname);
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
		if (req.isAuthenticated === true) {
			let doc = await this.uploadFileInfoCollection.findOne({ fileId: fileId });
			if (doc == null) return res.sendStatus(404);

			if (doc["fileUpload"] != null) return res.sendStatus(400);
			if (doc["tsUploadExpire"] < xDatetime.getCurrentMilliseconds()) return res.sendStatus(408);

			let fileName = doc["fileName"];
			reqAny.fileName = fileName;

			return next();
		}

		return res.sendStatus(401);
	}

}
