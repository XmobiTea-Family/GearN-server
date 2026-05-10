import { InvalidMember } from "./../InvalidMember";

export class OperationArray<T> {
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

    // Stores the array list used by this instance.
    private tArray: T[];

    /**
     * Initializes a new operation array instance.
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
     * Sets the array.
     * @param tArray Provides the array value used by this operation.
     */
    public setArray(tArray: T[]) {
        this.tArray = tArray;
    }

    /**
     * Returns the array.
     */
    public getArray() {
        return this.tArray;
    }
}
