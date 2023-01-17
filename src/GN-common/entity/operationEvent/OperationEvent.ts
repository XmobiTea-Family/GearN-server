import { CodeHelper } from "./../../helper/CodeHelper";
import { GNHashtable } from "./../../common/GNData";

export class OperationEvent {

	private eventCode: number;
	private parameters: GNHashtable;
	private encrypted: boolean;

	constructor(eventCode: number, parameters: GNHashtable = null, encrypted: boolean = true) {
		this.eventCode = eventCode;
		this.parameters = parameters;
		this.encrypted = encrypted;
	}

	public getEventCode(): number {
		return this.eventCode;
	}

	public getParameters(): GNHashtable {
		return this.parameters;
	}

	public isEncrypted(): boolean {
		return this.encrypted;
	}

	public setScriptData(k: string, value: any): OperationEvent {
		this.parameters.add(k, value);
		return this;
	}

	public setParameters(parameters: GNHashtable): OperationEvent {
		this.parameters = parameters;
		return this;
	}

	public setEncrypted(encrypted: boolean): OperationEvent {
		this.encrypted = encrypted;
		return this;
	}

	public toString(): string {
		return "Code: " + CodeHelper.getEventCodeName(this.eventCode) + " (" + this.eventCode + ")" + + ", parameters " + this.parameters + ", encrypted " + this.encrypted;
	}

}
