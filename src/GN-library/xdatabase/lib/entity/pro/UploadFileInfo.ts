import * as mongoDB from "mongodb";

import { MongoObject } from "./MongoObject";
import { RemoveStatusItem } from "./RemoveStatusItem";

interface FileUpload {
	mimeType: string;
	size: number;
	folderFileName: string;
	fullPath: string;
	shortPath: string;
	tsUploadFile: number;
}

export class UploadFileInfo extends MongoObject {
	private static readonly _fileId: string = "fileId";
	private static readonly _userId: string = "userId";
	private static readonly _fileName: string = "fileName";
	private static readonly _tsCreate: string = "tsCreate";
	private static readonly _tsUploadExpire: string = "tsUploadExpire";
	private static readonly _removeStatus: string = "removeStatus";
	private static readonly _fileUpload: string = "fileUpload";

	private readonly fileId: string;

	private userId: string;
	private fileName: string;
	private tsCreate: number;
	private tsUploadExpire: number;

	private removeStatus: RemoveStatusItem;
	private fileUpload: FileUpload;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.fileId = result[UploadFileInfo._fileId];

		this.setDocumentUploadFileInfo(result);
	}

	private setDocumentUploadFileInfo(result: mongoDB.WithId<mongoDB.Document>): void {
		this.tsUploadExpire = result[UploadFileInfo._tsUploadExpire];
		this.userId = result[UploadFileInfo._userId];
		this.fileName = result[UploadFileInfo._fileName];
		this.tsCreate = result[UploadFileInfo._tsCreate];
		this.removeStatus = result[UploadFileInfo._removeStatus];
		this.fileUpload = result[UploadFileInfo._fileUpload];
	}

	public getFileId(): string {
		return this.fileId;
	}

	public getUserId(): string {
		return this.userId;
	}

	public setUserId(userId: string): void {
		this.userId = userId;

		this.set(UploadFileInfo._userId, userId);
	}

	public getFileName(): string {
		return this.fileName;
	}

	public setFileName(fileName: string): void {
		this.fileName = fileName;

		this.set(UploadFileInfo._fileName, fileName);
	}

	public getTsUploadExpire(): number {
		return this.tsUploadExpire;
	}

	public setTsUploadExpire(tsUploadExpire: number): void {
		this.tsUploadExpire = tsUploadExpire;

		this.set(UploadFileInfo._tsUploadExpire, tsUploadExpire);
	}

	public getTsCreate(): number {
		return this.tsCreate;
	}

	public setTsCreate(tsCreate: number): void {
		this.tsCreate = tsCreate;

		this.set(UploadFileInfo._tsCreate, tsCreate);
	}

	public getRemoveStatus(): RemoveStatusItem {
		return this.removeStatus;
	}

	public setRemoveStatus(tsRemove: number, reason?: string): void {
		this.removeStatus = {
			tsRemove: tsRemove,
			reason: reason,
		};

		this.set(UploadFileInfo._removeStatus, this.removeStatus);
	}

	public getFileUpload(): FileUpload {
		return this.fileUpload;
	}

	// public setUploadFile(mimeType: string, size: number, folderFileName: string): void {
	//     this.fileUpload = {
	//         folderFileName: folderFileName,
	//         mimeType: mimeType,
	//         size: size
	//     }

	//     this.set(UploadFileInfo._fileUpload, this.fileUpload);
	// }

}
