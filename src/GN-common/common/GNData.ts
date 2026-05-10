type GNDataType = string | number | boolean | null | GNArray | GNHashtable;

interface IGNData {
    /**
     * Executes the to data workflow.
     * @returns Returns the operation result.
     */
    toData(): any;
}

export abstract class GNData implements IGNData {
    /**
     * Executes the get workflow.
     * @param k Provides the k value used by this operation.
     * @param def Provides the def value used by this operation.
     * @returns Returns the operation result.
     */
    protected get<T>(k: string | number, def?: T): T {
        return def;
    }

    /**
     * Executes the clear workflow.
     */
    public abstract clear(): void;
    /**
     * Executes the remove workflow.
     * @param k Provides the k value used by this operation.
     * @returns Returns the operation result.
     */
    public abstract remove(k: string | number): boolean;
    /**
     * Executes the count workflow.
     * @returns Returns the operation result.
     */
    public abstract count(): number;

    /**
     * Returns the boolean.
     * @param k Provides the k value used by this operation.
     * @param def Provides the def value used by this operation.
     * @returns Returns the boolean.
     */
    public getBoolean(k: string | number, def?: boolean): boolean {
        return this.get(k, def);
    }

    /**
     * Returns the object.
     * @param k Provides the k value used by this operation.
     * @param def Provides the def value used by this operation.
     * @returns Returns the object.
     */
    public getObject(k: string | number, def?: object): object {
        return this.get(k, def);
    }

    /**
     * Returns the string.
     * @param k Provides the k value used by this operation.
     * @param def Provides the def value used by this operation.
     * @returns Returns the string.
     */
    public getString(k: string | number, def?: string): string {
        return this.get(k, def);
    }

    /**
     * Returns the number.
     * @param k Provides the k value used by this operation.
     * @param def Provides the def value used by this operation.
     * @returns Returns the number.
     */
    public getNumber(k: string | number, def?: number): number {
        return this.get(k, def);
    }

    /**
     * Returns the GearN hashtable.
     * @param k Provides the k value used by this operation.
     * @param def Provides the def value used by this operation.
     * @returns Returns the GearN hashtable.
     */
    public getGNHashtable(k: string | number, def?: GNHashtable): GNHashtable {
        return this.get(k, def);
    }

    /**
     * Returns the GearN array.
     * @param k Provides the k value used by this operation.
     * @param def Provides the def value used by this operation.
     * @returns Returns the GearN array.
     */
    public getGNArray(k: string | number, def?: GNArray): GNArray {
        return this.get(k, def);
    }

    /**
     * Creates the GearN hashtable from object.
     * @param value Provides the value value used by this operation.
     * @returns Returns the operation result.
     */
    private static createGNHashtableFromObject(value: any): GNHashtable {
        // Stores the answer value used in the current execution flow.
        let answer = new GNHashtable();

        // Stores the value keys value used in the current execution flow.
        let valueKeys = Object.keys(value);
        for (let i = 0; i < valueKeys.length; i++) {
            // Stores the key value used in the current execution flow.
            let key = valueKeys[i];
            answer.add(key, value[key]);
        }

        return answer;
    }

    /**
     * Creates the GearN array from array.
     * @param value Provides the value value used by this operation.
     * @returns Returns the operation result.
     */
    private static createGNArrayFromArray(value: any): GNArray {
        // Stores the answer value used in the current execution flow.
        let answer = new GNArray();

        // Stores the value arr value used in the current execution flow.
        let valueArr = <Array<any>>value;
        for (let i = 0; i < valueArr.length; i++) {
            answer.add(valueArr[i]);
        }

        return answer;
    }

    /**
     * Creates the use data from origin data.
     * @param value Provides the value value used by this operation.
     * @returns Returns the operation result.
     */
    protected static createUseDataFromOriginData(value: any): GNDataType {
        if (value == null) return null;

        // Stores the type of value value used in the current execution flow.
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

    /**
     * Creates the data from use data.
     * @param value Provides the value value used by this operation.
     * @returns Returns the operation result.
     */
    protected static createDataFromUseData(value: GNDataType): any {
        if (value == null) return null;

        if (value instanceof GNData) {
            return value.toData();
        }

        return value;
    }

    /**
     * Executes the to data workflow.
     * @returns Returns the operation result.
     */
    public abstract toData(): any;
}

export class GNHashtableBuilder {
    // Stores the dict collection used by this instance.
    private dict: { [k: string]: any } = {};

    /**
     * Executes the add workflow.
     * @param k Provides the k value used by this operation.
     * @param value Provides the value value used by this operation.
     * @returns Returns the operation result.
     */
    public add(k: string, value: any): GNHashtableBuilder {
        this.dict[k] = value;

        return this;
    }

    /**
     * Adds the all.
     * @param dict Provides the dict value used by this operation.
     */
    public addAll(dict: { [k: string]: any }) {
        // Stores the keys value used in the current execution flow.
        let keys = Object.keys(dict);
        keys.forEach((keyStr) => {
            this.add(keyStr, dict[keyStr]);
        });

        return this;
    }

    /**
     * Initializes a new GearN hashtable builder instance.
     */
    constructor() {
        this.dict = {};
    }

    /**
     * Builds the configured instance.
     * @returns Returns the built GearN hashtable.
     */
    public build(): GNHashtable {
        // Stores the answer value used in the current execution flow.
        let answer = new GNHashtable();

        // Stores the keys value used in the current execution flow.
        let keys = Object.keys(this.dict);
        keys.forEach((keyStr) => {
            answer.add(keyStr, this.dict[keyStr]);
        });

        return answer;
    }
}

export class GNHashtable extends GNData {
    // Stores the dict collection used by this instance.
    private dict: { [k: string]: GNDataType } = {};

    /**
     * Executes the clear workflow.
     */
    public override clear(): void {
        this.dict = {};
    }

    /**
     * Executes the remove workflow.
     * @param k Provides the k value used by this operation.
     * @returns Returns the operation result.
     */
    public override remove(k: string): boolean {
        if (this.containsKey(k)) {
            delete this.dict[k];
            return true;
        }

        return false;
    }

    /**
     * Executes the count workflow.
     * @returns Returns the operation result.
     */
    public override count(): number {
        return Object.keys(this.dict).length;
    }

    /**
     * Executes the contains key workflow.
     * @param k Provides the k value used by this operation.
     * @returns Returns the operation result.
     */
    public containsKey(k: string): boolean {
        // Stores the keys value used in the current execution flow.
        let keys = Object.keys(this.dict);
        // Stores the k str value used in the current execution flow.
        let kStr = k.toString();

        return keys.indexOf(kStr) != -1;
    }

    /**
     * Executes the get workflow.
     * @param k Provides the k value used by this operation.
     * @param def Provides the def value used by this operation.
     * @returns Returns the operation result.
     */
    protected override get<T>(k: string, def?: T): T {
        // Stores the value value used in the current execution flow.
        let value = this.dict[k];

        if (value == null) return def;
        return <T>(value as any);
    }

    /**
     * Executes the add workflow.
     * @param k Provides the k value used by this operation.
     * @param value Provides the value value used by this operation.
     */
    public add(k: string, value: any) {
        this.dict[k] = GNData.createUseDataFromOriginData(value);
    }

    /**
     * Executes the to data workflow.
     * @returns Returns the operation result.
     */
    public override toData(): {} {
        // Stores the anwser value used in the current execution flow.
        let anwser: { [k: string]: any } = {};

        // Stores the keys value used in the current execution flow.
        let keys = Object.keys(this.dict);
        for (let i = 0; i < keys.length; i++) {
            // Stores the key value used in the current execution flow.
            let key = keys[i];
            anwser[key] = GNData.createDataFromUseData(this.dict[key]);
        }

        return anwser;
    }

    /**
     * Creates a new builder instance.
     * @returns Returns a new builder instance.
     */
    public static builder(): GNHashtableBuilder {
        return new GNHashtableBuilder();
    }

    /**
     * Executes the to string workflow.
     * @returns Returns the operation result.
     */
    public override toString(): string {
        return JSON.stringify(this.dict);
    }
}

export class GNArrayBuilder {
    // Stores the array value used by this instance.
    private array: Array<any>;

    /**
     * Executes the add workflow.
     * @param value Provides the value value used by this operation.
     * @returns Returns the operation result.
     */
    public add(value: any): GNArrayBuilder {
        this.array.push(value);

        return this;
    }

    /**
     * Adds the all.
     * @param array Provides the array value used by this operation.
     * @returns Returns the operation result.
     */
    public addAll(array: any[]): GNArrayBuilder {
        array.forEach((o) => {
            this.add(o);
        });

        return this;
    }

    /**
     * Builds the configured instance.
     * @returns Returns the built GearN array.
     */
    public build(): GNArray {
        // Stores the awnser value used in the current execution flow.
        let awnser = new GNArray();

        this.array.forEach((o) => {
            awnser.add(o);
        });

        return awnser;
    }

    /**
     * Initializes a new GearN array builder instance.
     */
    constructor() {
        this.array = [];
    }
}

export class GNArray extends GNData {
    // Stores the array value used by this instance.
    private array: Array<GNDataType> = [];

    /**
     * Executes the clear workflow.
     */
    public override clear(): void {
        this.array = [];
    }

    /**
     * Executes the index of workflow.
     * @param item Provides the item value used by this operation.
     * @returns Returns the operation result.
     */
    public indexOf(item: GNDataType): number {
        return this.array.indexOf(item);
    }

    /**
     * Executes the remove workflow.
     * @param k Provides the k value used by this operation.
     * @returns Returns the operation result.
     */
    public override remove(k: number): boolean {
        if (k < 0 || k >= this.array.length) return false;

        this.array.splice(k, 1);
        return true;
    }

    /**
     * Executes the count workflow.
     * @returns Returns the operation result.
     */
    public override count(): number {
        return this.array.length;
    }

    /**
     * Executes the get workflow.
     * @param k Provides the k value used by this operation.
     * @param def Provides the def value used by this operation.
     * @returns Returns the operation result.
     */
    protected override get<T>(k: number, def?: T): T {
        if (k < 0 || k >= this.array.length) return null;

        // Stores the value value used in the current execution flow.
        let value = this.array[k];

        if (value == null) return def;
        return <T>(value as any);
    }

    /**
     * Executes the add workflow.
     * @param value Provides the value value used by this operation.
     */
    public add(value: any) {
        this.array.push(GNData.createUseDataFromOriginData(value));
    }

    /**
     * Executes the to data workflow.
     */
    public override toData() {
        // Stores the anwser value used in the current execution flow.
        let anwser = [];

        for (let i = 0; i < this.array.length; i++) {
            anwser.push(GNData.createDataFromUseData(this.array[i]));
        }

        return anwser;
    }

    /**
     * Creates a new builder instance.
     * @returns Returns a new builder instance.
     */
    public static builder(): GNArrayBuilder {
        return new GNArrayBuilder();
    }

    /**
     * Executes the to string workflow.
     * @returns Returns the operation result.
     */
    public toString(): string {
        return JSON.stringify(this.array);
    }
}
