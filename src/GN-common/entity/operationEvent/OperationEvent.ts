import { GNHashtable } from "./../../common/GNData";

export class OperationEvent {
	private eventCode: number;
	private parameters: GNHashtable;

	constructor(eventCode: number, parameters?: GNHashtable) {
		this.eventCode = eventCode;
		this.parameters = parameters;
	}

	public setParameters(parameters: GNHashtable) {
		this.parameters = parameters;
	}

	public toString(): string {
		return this.eventCode + " " + this.parameters.toString();
	}

	public toSocketData(): [number, {}] {
		return [this.eventCode, this.parameters == null ? null : this.parameters.toData()];
	}
}
