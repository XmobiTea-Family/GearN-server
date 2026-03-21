import { GNHashtable } from "./../../common/GNData";

export class OperationEvent {

	// Stores the event code value used by this instance.
	private eventCode: string;
	// Stores the parameters value used by this instance.
	private parameters: GNHashtable;

	/**
	 * Initializes a new operation event instance.
	 * @param eventCode Provides the event code value used by this operation.
	 * @param parameters Provides the parameters value used by this operation.
	 */
	constructor(eventCode: string, parameters: GNHashtable = null) {
		this.eventCode = eventCode;
		this.parameters = parameters;
	}

	/**
	 * Returns the event code.
	 * @returns Returns the event code.
	 */
	public getEventCode(): string {
		return this.eventCode;
	}

	/**
	 * Returns the parameters.
	 * @returns Returns the parameters.
	 */
	public getParameters(): GNHashtable {
		return this.parameters;
	}

	/**
	 * Sets the parameter.
	 * @param k Provides the k value used by this operation.
	 * @param value Provides the value value used by this operation.
	 * @returns Returns the current operation event instance.
	 */
	public setParameter(k: string, value: any): OperationEvent {
		if (this.parameters == null) this.parameters = new GNHashtable();

		this.parameters.add(k, value);
		return this;
	}

	/**
	 * Sets the parameters.
	 * @param parameters Provides the parameters value used by this operation.
	 * @returns Returns the current operation event instance.
	 */
	public setParameters(parameters: GNHashtable): OperationEvent {
		this.parameters = parameters;
		return this;
	}

	/**
	 * Executes the to string workflow.
	 * @returns Returns the operation result.
	 */
	public toString(): string {
		return "EventCode: " + this.eventCode + ", parameters " + JSON.stringify(this.parameters?.toData());
	}

}
