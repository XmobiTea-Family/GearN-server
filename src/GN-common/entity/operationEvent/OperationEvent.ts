import { GNHashtable } from "./../../common/GNData";

export class OperationEvent {

	private eventCode: string;
	private parameters: GNHashtable;

	constructor(eventCode: string, parameters: GNHashtable = null) {
		this.eventCode = eventCode;
		this.parameters = parameters;
	}

	public getEventCode(): string {
		return this.eventCode;
	}

	public getParameters(): GNHashtable {
		return this.parameters;
	}

	public setParameter(k: string, value: any): OperationEvent {
		if (this.parameters == null) this.parameters = new GNHashtable();

		this.parameters.add(k, value);
		return this;
	}

	public setParameters(parameters: GNHashtable): OperationEvent {
		this.parameters = parameters;
		return this;
	}

	public toString(): string {
		return "EventCode: " + this.eventCode + ", parameters " + JSON.stringify(this.parameters?.toData());
	}

}
