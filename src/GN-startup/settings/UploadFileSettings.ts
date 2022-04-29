import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

abstract class BuilderBase {
	protected enable: boolean;
	protected uploadPath: string;
	protected maxSizeUpload: number;
    protected mimeTypeAccepts: string[];

	public getEnable(): boolean {
		return this.enable;
	}

	public getUploadPath(): string {
		return this.uploadPath;
	}

	public getMaxSizeUpload(): number {
		return this.maxSizeUpload;
	}

	public getMimeTypeAccepts(): string[] {
		return this.mimeTypeAccepts;
	}

	constructor() {}
}

class Builder extends BuilderBase implements IBuilder<UploadFileSettings> {
	public setEnable(enable: boolean): Builder {
		this.enable = enable;
		return this;
	}

	public setUploadPath(uploadPath: string): Builder {
		this.uploadPath = uploadPath;
		return this;
	}
	
	public setMaxSizeUpload(maxSizeUpload: number): Builder {
		this.maxSizeUpload = maxSizeUpload;
		return this;
	}

    public setMimeTypeAccepts(mimeTypeAccepts: string[]): Builder {
		this.mimeTypeAccepts = mimeTypeAccepts;
		return this;
	}

	public build() {
		return new UploadFileSettings(this);
	}

	constructor() {
		super();

		this.mimeTypeAccepts = [];
	}
}

export class UploadFileSettings extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.enable = builder.getEnable();
		this.uploadPath = builder.getUploadPath();
		this.maxSizeUpload = builder.getMaxSizeUpload();
		this.mimeTypeAccepts = builder.getMimeTypeAccepts();
	}

	public static Builder(): Builder {
		return new Builder();
	}
}
