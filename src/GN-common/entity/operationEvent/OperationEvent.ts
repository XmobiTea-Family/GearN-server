import { GNHashtable } from "./../../common/GNData";

export class OperationEvent {
	private eventCode: number;
	private parameters: GNHashtable;

	constructor(eventCode: number) {
		this.eventCode = eventCode;
		this.parameters = new GNHashtable();
	}

	public setParameter(k: number, value: any): OperationEvent {
		this.parameters.add(k, value);
		return this;
	}

	public setParameters(parameters: GNHashtable): OperationEvent {
		this.parameters = parameters;
		return this;
	}

	public toString(): string {
		return this.eventCode + " " + this.parameters.toString();
	}

	public toSocketData(): [number, {}] {
		return [this.eventCode, this.parameters.toData()];
	}
}
