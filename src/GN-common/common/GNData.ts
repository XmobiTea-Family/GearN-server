type GNDataType = string | number | boolean | null | GNArray | GNHashtable;

interface IGNData {
	clear(): void;
	remove(k: string | number): boolean;
	count(): string | number;

	getObject(k: string | number, def?: object): object;
	getBoolean(k: string | number, def?: boolean): boolean;
	getString(k: string | number, def?: string): string;
	getNumber(k: string | number, def?: number): number;
	getGNHashtable(k: string | number, def?: GNHashtable): GNHashtable;
	getGNArray(k: string | number, def?: GNArray): GNArray;
}

export abstract class GNData implements IGNData {
	protected get<T>(k: string | number, def?: T): T {
		return def;
	}

	public abstract clear(): void;
	public abstract remove(k: string | number): boolean;
	public abstract count(): string | number;

	public getBoolean(k: string | number, def?: boolean): boolean {
		return this.get(k, def);
	}

	public getObject(k: string | number, def?: object): object {
		return this.get(k, def);
	}

	public getString(k: string | number, def?: string): string {
		return this.get(k, def);
	}

	public getNumber(k: string | number, def?: number): number {
		return this.get(k, def);
	}

	public getGNHashtable(k: string | number, def?: GNHashtable): GNHashtable {
		return this.get(k, def);
	}

	public getGNArray(k: string | number, def?: GNArray): GNArray {
		return this.get(k, def);
	}

	private static createGNHashtableFromObject(value: any): GNHashtable {
		let answer = new GNHashtable();

		let valueKeys = Object.keys(value);
		for (let i = 0; i < valueKeys.length; i++) {
			let key = valueKeys[i];
			answer.add(key, value[key]);
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
			if (Array.isArray(value)) return this.createGNArrayFromArray(value);
			else return this.createGNHashtableFromObject(value);
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
	private dict: { [k: string]: any } = {};

	public clear(): void {
		this.dict = {};
	}

	public remove(k: string): boolean {
		if (this.containsKey(k)) {
			delete this.dict[k];
			return true;
		}

		return false;
	}

	public containsKey(k: string): boolean {
		let keys = Object.keys(this.dict);
		let kStr = k.toString();
		
		return keys.indexOf(kStr) != -1;
	}

	public count(): number {
		return Object.keys(this.dict).length;
	}

	protected get<T>(k: string, def?: T): T {
		let value = this.dict[k];

		if (value == null) return def;
		return <T>value;
	}

	public add(k: string, value: any) {
		this.dict[k] = GNData.createUseDataFromOriginData(value);
	}

	public toData(): {} {
		let anwser: { [k: string]: any } = {};

		let keys = Object.keys(this.dict);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			anwser[key] = GNData.createDataFromUseData(this.dict[key]);
		}

		return anwser;
	}
}

export class GNArray extends GNData {
	private array: Array<GNDataType> = [];

	public clear(): void {
		this.array = [];
	}

	public remove(k: number): boolean {
		if (k < 0 || k >= this.array.length) return false;

		this.array = this.array.splice(k, 1);
		return false;
	}

	public count(): number {
		return this.array.length;
	}

	protected get<T>(k: number, def?: T): T {
		if (k < 0 || k >= this.array.length) return null;

		let value = this.array[k];

		if (value == null) return def;
		return <T>(value as any);
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
