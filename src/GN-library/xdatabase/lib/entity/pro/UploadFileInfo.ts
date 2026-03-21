import * as mongoDB from "mongodb";

import { MongoObject } from "./MongoObject";
import { RemoveStatusItem } from "./RemoveStatusItem";

interface FileUpload {
	// Stores the MIME type value used by this contract.
	mimeType: string;
	// Stores the size value used by this contract.
	size: number;
	// Stores the folder file name value used by this contract.
	folderFileName: string;
	// Stores the full path value used by this contract.
	fullPath: string;
	// Stores the short path value used by this contract.
	shortPath: string;
	// Stores the timestamp upload file value used by this contract.
	tsUploadFile: number;
}

export class UploadFileInfo extends MongoObject {
	// Defines the internal field key for file ID.
	private static readonly _fileId: string = "fileId";
	// Indicates whether r ID should be used.
	private static readonly _userId: string = "userId";
	// Defines the internal field key for file name.
	private static readonly _fileName: string = "fileName";
	// Defines the internal field key for timestamp create.
	private static readonly _tsCreate: string = "tsCreate";
	// Defines the internal field key for timestamp upload expire.
	private static readonly _tsUploadExpire: string = "tsUploadExpire";
	// Defines the internal field key for remove status.
	private static readonly _removeStatus: string = "removeStatus";
	// Defines the internal field key for file upload.
	private static readonly _fileUpload: string = "fileUpload";

	// Stores the file ID value used by this instance.
	private readonly fileId: string;

	// Indicates whether r ID should be used.
	private userId: string;
	// Stores the file name value used by this instance.
	private fileName: string;
	// Stores the timestamp create value used by this instance.
	private tsCreate: number;
	// Stores the timestamp upload expire value used by this instance.
	private tsUploadExpire: number;

	// Stores the remove status value used by this instance.
	private removeStatus: RemoveStatusItem;
	// Stores the file upload value used by this instance.
	private fileUpload: FileUpload;

	/**
	 * Initializes a new upload file info instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.fileId = result[UploadFileInfo._fileId];

		this.setDocumentUploadFileInfo(result);
	}

	/**
	 * Sets the document upload file info.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentUploadFileInfo(result: mongoDB.WithId<mongoDB.Document>): void {
		this.tsUploadExpire = result[UploadFileInfo._tsUploadExpire];
		this.userId = result[UploadFileInfo._userId];
		this.fileName = result[UploadFileInfo._fileName];
		this.tsCreate = result[UploadFileInfo._tsCreate];
		this.removeStatus = result[UploadFileInfo._removeStatus];
		this.fileUpload = result[UploadFileInfo._fileUpload];
	}

	/**
	 * Returns the file ID.
	 * @returns Returns the file ID.
	 */
	public getFileId(): string {
		return this.fileId;
	}

	/**
	 * Returns whether r ID should be used.
	 * @returns Returns whether r ID should be used.
	 */
	public getUserId(): string {
		return this.userId;
	}

	/**
	 * Sets whether r ID should be used.
	 * @param userId Indicates whether r ID should be used.
	 */
	public setUserId(userId: string): void {
		this.userId = userId;

		this.set(UploadFileInfo._userId, userId);
	}

	/**
	 * Returns the file name.
	 * @returns Returns the file name.
	 */
	public getFileName(): string {
		return this.fileName;
	}

	/**
	 * Sets the file name.
	 * @param fileName Provides the file name value used by this operation.
	 */
	public setFileName(fileName: string): void {
		this.fileName = fileName;

		this.set(UploadFileInfo._fileName, fileName);
	}

	/**
	 * Returns the timestamp upload expire.
	 * @returns Returns the timestamp upload expire.
	 */
	public getTsUploadExpire(): number {
		return this.tsUploadExpire;
	}

	/**
	 * Sets the timestamp upload expire.
	 * @param tsUploadExpire Provides the timestamp upload expire value used by this operation.
	 */
	public setTsUploadExpire(tsUploadExpire: number): void {
		this.tsUploadExpire = tsUploadExpire;

		this.set(UploadFileInfo._tsUploadExpire, tsUploadExpire);
	}

	/**
	 * Returns the timestamp create.
	 * @returns Returns the timestamp create.
	 */
	public getTsCreate(): number {
		return this.tsCreate;
	}

	/**
	 * Sets the timestamp create.
	 * @param tsCreate Provides the timestamp create value used by this operation.
	 */
	public setTsCreate(tsCreate: number): void {
		this.tsCreate = tsCreate;

		this.set(UploadFileInfo._tsCreate, tsCreate);
	}

	/**
	 * Returns the remove status.
	 * @returns Returns the remove status.
	 */
	public getRemoveStatus(): RemoveStatusItem {
		return this.removeStatus;
	}

	/**
	 * Sets the remove status.
	 * @param tsRemove Provides the timestamp remove value used by this operation.
	 * @param reason Provides the reason value used by this operation.
	 */
	public setRemoveStatus(tsRemove: number, reason?: string): void {
		this.removeStatus = {
			tsRemove: tsRemove,
			reason: reason,
		};

		this.set(UploadFileInfo._removeStatus, this.removeStatus);
	}

	/**
	 * Returns the file upload.
	 * @returns Returns the file upload.
	 */
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
