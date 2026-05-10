import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
    // Indicates whether the feature is enabled.
    protected enable: boolean;
    // Stores the upload path value used by this instance.
    protected uploadPath: string;
    // Stores the max size upload value used by this instance.
    protected maxSizeUpload: number;
    // Stores the MIME type accepts list used by this instance.
    protected mimeTypeAccepts: string[];

    /**
     * Returns the enable.
     * @returns Returns the enable.
     */
    public getEnable(): boolean {
        return this.enable;
    }

    /**
     * Returns the upload path.
     * @returns Returns the upload path.
     */
    public getUploadPath(): string {
        return this.uploadPath;
    }

    /**
     * Returns the max size upload.
     * @returns Returns the max size upload.
     */
    public getMaxSizeUpload(): number {
        return this.maxSizeUpload;
    }

    /**
     * Returns the MIME type accepts.
     * @returns Returns the MIME type accepts.
     */
    public getMimeTypeAccepts(): string[] {
        return this.mimeTypeAccepts;
    }

    /**
     * Initializes a new builder base instance.
     */
    constructor() {}
}

class Builder extends BuilderBase implements IBuilder<UploadFileSettings> {
    /**
     * Sets the enable.
     * @param enable Provides the enable value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setEnable(enable: boolean): Builder {
        this.enable = enable;
        return this;
    }

    /**
     * Sets the upload path.
     * @param uploadPath Provides the upload path value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setUploadPath(uploadPath: string): Builder {
        this.uploadPath = uploadPath;
        return this;
    }

    /**
     * Sets the max size upload.
     * @param maxSizeUpload Provides the max size upload value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setMaxSizeUpload(maxSizeUpload: number): Builder {
        this.maxSizeUpload = maxSizeUpload;
        return this;
    }

    /**
     * Sets the MIME type accepts.
     * @param mimeTypeAccepts Provides the MIME type accepts value used by this operation.
     * @returns Returns the current builder instance.
     */
    public setMimeTypeAccepts(mimeTypeAccepts: string[]): Builder {
        this.mimeTypeAccepts = mimeTypeAccepts;
        return this;
    }

    /**
     * Initializes a new builder instance.
     */
    constructor() {
        super();

        this.enable = false;
        this.uploadPath = "";
        this.maxSizeUpload = 0;
        this.mimeTypeAccepts = [];
    }

    /**
     * Builds the configured instance.
     */
    public build() {
        return new UploadFileSettings(this);
    }
}

export class UploadFileSettings extends BuilderBase {
    /**
     * Initializes a new upload file settings instance.
     * @param builder Provides the builder state copied into this instance.
     */
    constructor(builder: Builder) {
        super();

        this.enable = builder.getEnable();
        this.uploadPath = builder.getUploadPath();
        this.maxSizeUpload = builder.getMaxSizeUpload();
        this.mimeTypeAccepts = builder.getMimeTypeAccepts();
    }

    /**
     * Creates a new builder instance.
     * @returns Returns a new builder instance.
     */
    public static Builder(): Builder {
        return new Builder();
    }
}
