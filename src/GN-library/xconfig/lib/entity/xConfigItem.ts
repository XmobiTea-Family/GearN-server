import { xConfigBase } from "./xConfigBase";
import * as mongoDB from "mongodb";

export class xConfigItem extends xConfigBase {
    private items: any[];

    constructor(result: mongoDB.WithId<mongoDB.Document>) {
        super(result);
        this.setDocument(result);
    }

    public getById(id: number): {} {
        if (id < 0 || id >= this.items.length) return null;
        return this.items[id];
    }

    public getItems(): any[] {
        return this.items;
    }

    private setDocument(result: mongoDB.WithId<mongoDB.Document>) {
        this.items = this.get("Items");
    }

    public get<T>(key: string): T {
        return this.getOriginDoc()[key];
    }

    public getNumber(key: string, def?: number): number {
        let value = this.get<number>(key);
        return value != null ? value : def;
    }

    public getBoolean(key: string, def?: boolean): boolean {
        let value = this.get<boolean>(key);
        return value != null ? value : def;
    }

    public getString(key: string, def?: string): string {
        let value = this.get<string>(key);
        return value != null ? value : def;
    }

    public getArray(key: string, def?: any[]): any[] {
        let value = this.get<any[]>(key);
        return value != null ? value : def;
    }

    public getObject(key: string, def?: {[k: number]: any}): {[k: number]: any} {
        let value = this.get<{[k: number]: any}>(key);
        return value != null ? value : def;
    }
}