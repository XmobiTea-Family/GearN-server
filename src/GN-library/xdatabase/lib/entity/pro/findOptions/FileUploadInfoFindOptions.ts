/**
 * Projection options for querying UploadFileInfo from MongoDB.
 * Set a flag to `true` to include the corresponding field; useful to avoid loading the whole document when only a few fields are required.
 */
export interface FileUploadInfoFindOptions {
    /** Whether to include the fileId. */
    fileId?: boolean;
    /** Whether to include the fileName (user-supplied). */
    fileName?: boolean;
    /** Whether to include the upload-record creation timestamp. */
    tsCreate?: boolean;
    /** Whether to include the upload deadline (`tsUploadExpire`). */
    tsUploadExpire?: boolean;
    /** Whether to include the soft-delete state (`removeStatus`). */
    removeStatus?: boolean;
    /** Whether to include the `gameId` (which game the file belongs to). */
    gameId?: boolean;
    /** Whether to include the actual uploaded-file information (`fileUpload`). */
    fileUpload?: boolean;
}
