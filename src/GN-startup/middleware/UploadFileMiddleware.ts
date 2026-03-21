import multer from "multer";
import * as mongoDB from "mongodb";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import express from "express";
import fs from "fs";

export class UploadFileMiddleware {
	// Stores the upload file info collection value used by this instance.
	private uploadFileInfoCollection: mongoDB.Collection<mongoDB.Document>;
	// Stores the upload path value used by this instance.
	private uploadPath: string;
	// Stores the max size upload value used by this instance.
	private maxSizeUpload: number;
	// Stores the MIME type accepts list used by this instance.
	private mimeTypeAccepts: string[];

	/**
	 * Sets the upload path.
	 * @param uploadPath Provides the upload path value used by this operation.
	 */
	public setUploadPath(uploadPath: string): void {
		this.uploadPath = uploadPath;
	}

	/**
	 * Sets the max size upload.
	 * @param maxSizeUpload Provides the max size upload value used by this operation.
	 */
	public setMaxSizeUpload(maxSizeUpload: number): void {
		this.maxSizeUpload = maxSizeUpload;
	}

	/**
	 * Sets the MIME type accepts.
	 * @param mimeTypeAccepts Provides the MIME type accepts value used by this operation.
	 */
	public setMimeTypeAccepts(mimeTypeAccepts: string[]): void {
		this.mimeTypeAccepts = mimeTypeAccepts;
	}

	/**
	 * Sets the upload file info collection.
	 * @param uploadFileInfoCollection Provides the upload file info collection used by this operation.
	 */
	public setUploadFileInfoCollection(uploadFileInfoCollection: mongoDB.Collection<mongoDB.Document>) {
		this.uploadFileInfoCollection = uploadFileInfoCollection;
	}

	/**
	 * Runs the current workflow.
	 */
	public run() { }

	/**
	 * Executes the storage workflow.
	 * @returns Returns the operation result.
	 */
	private storage(): multer.StorageEngine {
		// Stores the configuration upload path value used in the current execution flow.
		let configUploadPath = this.uploadPath;
		// Stores the upload path value used in the current execution flow.
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
				// Stores the file ID value used in the current execution flow.
				let fileId = req.params.fileId;
				return cb(null, xDatetime.getCurrentMilliseconds() + "_" + fileId + "_" + file.originalname);
			},
		});
	}

	/**
	 * Handles the upload.
	 */
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

	/**
	 * Executes the check file upload invalid workflow asynchronously.
	 * @param req Provides the req value used by this operation.
	 * @param res Provides the res value used by this operation.
	 * @param next Provides the next value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async checkFileUploadInvalid(req: express.Request, res: express.Response, next: Function): Promise<express.Response> {
		// Stores the file ID value used in the current execution flow.
		let fileId = req.params.fileId;
		if (!fileId) return res.sendStatus(400);

		// Stores the req any value used in the current execution flow.
		let reqAny = req as any;
		if (req.isAuthenticated === true) {
			// Stores the doc value used in the current execution flow.
			let doc = await this.uploadFileInfoCollection.findOne({ fileId: fileId });
			if (doc == null) return res.sendStatus(404);

			if (doc["fileUpload"] != null) return res.sendStatus(400);
			if (doc["tsUploadExpire"] < xDatetime.getCurrentMilliseconds()) return res.sendStatus(408);

			// Stores the file name value used in the current execution flow.
			let fileName = doc["fileName"];
			reqAny.fileName = fileName;

			return next();
		}

		return res.sendStatus(401);
	}

}
