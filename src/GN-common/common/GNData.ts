type GNDataType = string | number | boolean | null | GNArray | GNHashtable;

interface IGNData {
	clear(): void;
	remove(k: number): boolean;
	count(): number;

	getBoolean(k: number): boolean;
	getString(k: number): string;
	getNumber(k: number): number;
	getGNHashtable(k: number): GNHashtable;
	getGNArray(k: number): GNArray;
}

export abstract class GNData implements IGNData {
	protected get<T>(k: number): T {
		return null;
	}

	public abstract clear(): void;
	public abstract remove(k: number): boolean;
	public abstract count(): number;

	public getBoolean(k: number): boolean {
		return this.get(k);
	}

	public getString(k: number): string {
		return this.get(k);
	}

	public getNumber(k: number): number {
		return this.get(k);
	}

	public getGNHashtable(k: number): GNHashtable {
		return this.get(k);
	}

	public getGNArray(k: number): GNArray {
		return this.get(k);
	}

	private static createGNHashtableFromObject(value: any): GNHashtable {
		let answer = new GNHashtable();

		let valueKeys = Object.keys(value);
		for (let i = 0; i < valueKeys.length; i++) {
			let key = valueKeys[i];
			if (!isNaN(key as any)) continue;

			let value1 = value[key];
			let keyInt = Number.parseInt(key);

			answer.add(keyInt, value1);
		}

		return answer;
	}

	private static createGNArrayFromArray(value: any): GNArray {
		let answer = new GNArray();

		let valueArr = <Array<any>>value;
		for (let i = 0; i < valueArr.length; i++) {
			answer.add(valueArr[i]);
		}

		return answer;
	}

	protected static createUseDataFromOriginData(value: any): GNDataType {
		if (value == null) return null;

		let typeOfValue = typeof value;

		if (typeOfValue === "string") return value as string;

		if (typeOfValue === "number") return value as number;

		if (typeOfValue === "boolean") return value as boolean;

		if (value instanceof GNArray) return value;

		if (value instanceof GNHashtable) return value;

		if (typeOfValue === "object") {
			return this.createGNHashtableFromObject(value);
		}

		if (value.length != null) {
			return this.createGNArrayFromArray(value);
		}

		return null;
	}

	protected static createDataFromUseData(value: GNDataType): any {
		if (value == null) return null;

		if (value instanceof GNArray) {
			return (<GNArray>value).toData();
		}

		if (value instanceof GNHashtable) {
			return (<GNHashtable>value).toData();
		}

		return value;
	}

	public toData(): any {
		return null;
	}
}

export class GNHashtable extends GNData {
	private dict: { [k: number]: any } = {};

	public clear(): void {
		this.dict = {};
	}

	public remove(k: number): boolean {
		if (this.dict[k] != null) {
			delete this.dict[k];
			return true;
		}

		delete this.dict[k];
		return false;
	}

	public count(): number {
		return Object.keys(this.dict).length;
	}

	protected get<T>(k: number): T {
		let value = this.dict[k];

		if (value == null) return null;
		return <T>value;
	}

	public add(k: number, value: any) {
		this.dict[k] = GNData.createUseDataFromOriginData(value);
	}

	public toData(): {} {
		let anwser: { [k: number]: any } = {};

		let keys = Object.keys(this.dict);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			let keyInt = Number.parseInt(key);
			anwser[keyInt] = GNData.createDataFromUseData(this.dict[keyInt]);
		}

		return anwser;
	}
}

export class GNArray extends GNData {
	private array: Array<any>;

	public clear(): void {
		this.array = [];
	}

	public remove(k: number): boolean {
		if (k < 0 || k >= this.array.length) return false;

		this.array = this.array.splice(k, 1);
		return false;
	}

	public count(): number {
		return 0;
	}

	protected get<T>(k: number): T {
		if (k < 0 || k >= this.array.length) return null;

		let value = this.array[k];

		if (value == null) return null;
		return <T>value;
	}

	public add(value: any) {
		this.array.push(GNData.createUseDataFromOriginData(value));
	}

	public toData() {
		let anwser = [];

		for (let i = 0; i < this.array.length; i++) {
			anwser.push(GNData.createDataFromUseData(this.array[i]));
		}

		return anwser;
	}
}
