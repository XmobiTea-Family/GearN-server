export type AbstractConstructor<T> = Function & {
	// Stores the prototype value used by this contract.
	prototype: T;
};

export enum FieldDataType {
	Boolean = 0,
	Number = 1,
	String = 2,
	Array = 3,
	Object = 4,

};

export interface GNObjectFieldMetadata {
	// Stores the name value used by this contract.
	name: string;
	// Stores the field type value used by this contract.
	fieldType: FieldDataType;
	// Stores the cls value used by this contract.
	cls: new (...args: any[]) => any;
};

export interface GNObjectMetadata {
	// Stores the ID value used by this contract.
	id: string;
	// Stores the fields list used by this contract.
	fields: GNObjectFieldMetadata[];

};
