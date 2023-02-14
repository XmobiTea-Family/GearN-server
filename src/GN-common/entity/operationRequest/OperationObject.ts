import { InvalidMember } from "./../InvalidMember";

export class OperationObject<T> {
    private invalidMembers: InvalidMember[];

    private isValid: boolean;

    public isValidObject(): boolean {
        return this.isValid;
    }

    private tObject: T;

    constructor() {
        this.invalidMembers = [];
    }

    public addInvalidMember(invalidMember: InvalidMember) {
        this.invalidMembers.push(invalidMember);
    }

    public getInvalidMembers(): InvalidMember[] {
        return this.invalidMembers;
    }

    public setObject(tObject: T) {
        this.tObject = tObject;
    }

    public getObject() {
        return this.tObject;
    }
}
