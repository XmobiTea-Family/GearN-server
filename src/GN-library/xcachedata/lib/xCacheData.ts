export class xCacheData {
	private dataDic: { [k: string]: any } = {};

	public getData<T>(k: string): T {
		let value = this.dataDic[k];

		if (value == null) return null;
		return <T>value;
	}

	public setData(key: string, value: any) {
		this.dataDic[key] = value;
	}

	public removeData(key: string) {
		delete this.dataDic[key];
	}

    constructor(dataDic?: { [k: string]: any }) {
        this.dataDic = dataDic != null ? dataDic : {};
    }
}
