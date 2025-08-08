import { InvalidMember } from "./../InvalidMember";

export class OperationArray<T> {
	private invalidMembers: InvalidMember[];

	private isValid: boolean;

	public isValidObject(): boolean {
		return this.isValid;
	}

	private tArray: T[];

	constructor() {
		this.invalidMembers = [];
	}

	public addInvalidMember(invalidMember: InvalidMember) {
		this.invalidMembers.push(invalidMember);
	}

	public getInvalidMembers(): InvalidMember[] {
		return this.invalidMembers;
	}

	public setArray(tArray: T[]) {
		this.tArray = tArray;
	}

	public getArray() {
		return this.tArray;
	}
}
