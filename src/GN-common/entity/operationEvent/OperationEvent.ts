import { GNHashtable } from "./../../common/GNData";

/**
 * Represents a low-level event pushed by the GearN backend.
 */
export class OperationEvent {

	private eventCode: string;
	private parameters: GNHashtable;

	/**
	 * Creates a new OperationEvent instance.
	 */
	constructor(eventCode: string, parameters: GNHashtable = null) {
		this.eventCode = eventCode;
		this.parameters = parameters;
	}

	/**
	 * Returns the event code pushed by the backend.
	 */
	public getEventCode(): string {
		return this.eventCode;
	}

	/**
	 * Returns the parameter bag attached to the event.
	 */
	public getParameters(): GNHashtable {
		return this.parameters;
	}

	/**
	 * Adds or replaces a single parameter on the existing event parameter bag.
	 */
	public setParameter(k: string, value: any): OperationEvent {
		this.parameters.add(k, value);
		return this;
	}

	/**
	 * Replaces the whole event parameter bag.
	 */
	public setParameters(parameters: GNHashtable): OperationEvent {
		this.parameters = parameters;
		return this;
	}

	/**
	 * Returns a debug-friendly string representation of this instance.
	 */
	public toString(): string {
		return "EventCode: " + this.eventCode + ", parameters " + JSON.stringify(this.parameters?.toData());
	}

}
