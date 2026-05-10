import * as mongodb from "mongodb";

import { MongoObject } from "./MongoObject";
import { RemoveStatusItem } from "./RemoveStatusItem";

/**
 * Information about a file that has actually been uploaded to storage (only present once the upload succeeds).
 * Different from UploadFileInfo (which tracks the upload lifecycle) — FileUpload describes the real, final stored content.
 */
interface FileUpload {
    /** MIME type of the file (e.g. image/png, image/jpeg) — tells the client how to render it. */
    mimeType: string;
    /** File size in bytes; enforced against quota limits. */
    size: number;
    /** Storage path including the folder name (per the storage backend layout). */
    folderFileName: string;
    /** Full path or URL to the file; suitable for direct download. */
    fullPath: string;
    /** Short (relative) path to the file; used to build URLs for different CDN/host configurations. */
    shortPath: string;
    /** Epoch ms when the file finished uploading; distinct from tsCreate (when the upload record was created). */
    tsUploadFile: number;
}

/**
 * Record tracking the lifecycle of a client-driven upload (pre-signed URL → awaiting upload → file uploaded).
 * Holds the file identity, upload deadline and — once uploaded — the reference to the FileUpload payload.
 */
export class UploadFileInfo extends MongoObject {
    /** MongoDB field name for fileId — the upload record's unique business key. */
    private static readonly _fileId: string = "fileId";
    /** MongoDB field name for userId — the player who initiated the upload. */
    private static readonly _userId: string = "userId";
    /** MongoDB field name for the file name supplied by the user at upload time. */
    private static readonly _fileName: string = "fileName";
    /** MongoDB field name for the upload-record creation timestamp. */
    private static readonly _tsCreate: string = "tsCreate";
    /** MongoDB field name for the upload deadline; after this the pre-signed URL is invalid. */
    private static readonly _tsUploadExpire: string = "tsUploadExpire";
    /** MongoDB field name for the soft-delete state. */
    private static readonly _removeStatus: string = "removeStatus";
    /** MongoDB field name for the actual uploaded-file information (filled in once the upload succeeds). */
    private static readonly _fileUpload: string = "fileUpload";
    /** MongoDB field name for gameId — which game the file belongs to (multi-tenant). */
    private static readonly _gameId: string = "gameId";

    /** File id; unique business key of the upload record; immutable after creation. */
    private readonly fileId: string;

    /** Id of the player performing the upload; commonly used for file-access authorization. */
    private userId: string;
    /** User-supplied display name (display only; the storage-side name is `folderFileName`). */
    private fileName: string;
    /** Epoch ms at which the upload record was created. */
    private tsCreate: number;
    /** Epoch ms at which the upload deadline expires; after this the pre-signed URL stops working. */
    private tsUploadExpire: number;

    /** Soft-delete state of the upload record. */
    private removeStatus: RemoveStatusItem;
    /** Information about the actual uploaded file; null while the upload is still pending. */
    private fileUpload: FileUpload;

    /** Game id this file belongs to — used to keep tenant data separated (multi-tenant). */
    private gameId: string;

    /**
     * Initializes a new upload file info instance.
     * @param result Provides the result value used by this operation.
     * @param collection Provides the collection value used by this operation.
     */
    constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
        super(result, collection);

        this.fileId = result[UploadFileInfo._fileId];

        this.setDocumentUploadFileInfo(result);
    }

    /**
     * Sets the document upload file info.
     * @param result Provides the result value used by this operation.
     */
    private setDocumentUploadFileInfo(result: mongodb.WithId<mongodb.Document>): void {
        this.tsUploadExpire = result[UploadFileInfo._tsUploadExpire];
        this.userId = result[UploadFileInfo._userId];
        this.fileName = result[UploadFileInfo._fileName];
        this.tsCreate = result[UploadFileInfo._tsCreate];
        this.removeStatus = result[UploadFileInfo._removeStatus];
        this.fileUpload = result[UploadFileInfo._fileUpload];
        this.gameId = result[UploadFileInfo._gameId];
    }

    /**
     * Returns the file ID.
     * @returns Returns the file ID.
     */
    public getFileId(): string {
        return this.fileId;
    }

    /**
     * Returns the game ID.
     * @returns Returns the game ID.
     */
    public getGameId(): string {
        return this.gameId;
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
