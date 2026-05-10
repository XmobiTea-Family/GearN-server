import { InvalidMemberType } from "./../constant/enumType/InvalidMemberType";

export interface InvalidMember {
    // Stores the code value used by this contract.
    code: string;
    // Stores the invalid member type value used by this contract.
    invalidMemberType: InvalidMemberType;
}
