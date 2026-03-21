import { InvalidMember } from "./../InvalidMember";

export class OperationObject<T> {
	// Stores the invalid members list used by this instance.
	private invalidMembers: InvalidMember[];

	// Indicates whether valid.
	private isValid: boolean;

	/**
	 * Checks whether valid object.
	 * @returns Returns the operation result.
	 */
	public isValidObject(): boolean {
		return this.isValid;
	}

	// Stores the object value used by this instance.
	private tObject: T;

	/**
	 * Initializes a new operation object instance.
	 */
	constructor() {
		this.invalidMembers = [];
	}

	/**
	 * Adds the invalid member.
	 * @param invalidMember Provides the invalid member value used by this operation.
	 */
	public addInvalidMember(invalidMember: InvalidMember) {
		this.invalidMembers.push(invalidMember);
	}

	/**
	 * Returns the invalid members.
	 * @returns Returns the invalid members.
	 */
	public getInvalidMembers(): InvalidMember[] {
		return this.invalidMembers;
	}

	/**
	 * Sets the object.
	 * @param tObject Provides the object value used by this operation.
	 */
	public setObject(tObject: T) {
		this.tObject = tObject;
	}

	/**
	 * Returns the object.
	 */
	public getObject() {
		return this.tObject;
	}
}
