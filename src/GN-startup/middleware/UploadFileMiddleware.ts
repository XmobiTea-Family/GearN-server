import multer from "multer";
import * as mongoDB from "mongodb";
import { xDatetime } from "./../../GN-library/xdatetime/lib/xDatetime";
import express from "express";
import fs from "fs";
import path from "path";

export class UploadFileMiddleware {
	// Windows reserved device names cannot be used as file names on disk.
	private static readonly ReservedFileNames = new Set(["CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"]);

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
	 * Collapses a client-supplied file name into a safe leaf name before it is written to disk.
	 * @param originalFileName Provides the client-supplied file name value used by this operation.
	 * @returns Returns the safe file name.
	 */
	private sanitizeUploadFileName(originalFileName: string): string {
		let answer = (originalFileName ?? "").replace(/\\/g, "/");
		answer = path.posix.basename(answer).normalize("NFKC");
		answer = answer.replace(/[\u0000-\u001f\u007f]+/g, "");
		answer = answer.replace(/[^A-Za-z0-9._-]+/g, "_");
		answer = answer.replace(/_+/g, "_");
		answer = answer.replace(/^[._-]+|[._-]+$/g, "");

		if (!answer) {
			return "file";
		}

		const extension = path.extname(answer);
		const baseName = path.basename(answer, extension);
		const normalizedBaseName = baseName.toUpperCase();
		if (UploadFileMiddleware.ReservedFileNames.has(normalizedBaseName)) {
			answer = "file_" + answer;
		}

		const maxSafeFileNameLength = 100;
		if (answer.length > maxSafeFileNameLength) {
			const currentExtension = path.extname(answer);
			const currentBaseName = path.basename(answer, currentExtension);
			const maxBaseNameLength = Math.max(1, maxSafeFileNameLength - currentExtension.length);
			answer = currentBaseName.slice(0, maxBaseNameLength) + currentExtension;
		}

		return answer;
	}

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
				// Never trust multipart filenames because separators and device names can escape the upload directory.
				let safeFileName = this.sanitizeUploadFileName(file.originalname);
				return cb(null, xDatetime.getCurrentMilliseconds() + "_" + fileId + "_" + safeFileName);
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
