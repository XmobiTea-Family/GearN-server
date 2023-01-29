export type AbstractConstructor<T> = Function & {
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
    name: string;
    fieldType: FieldDataType;

};

export interface GNObjectMetadata {
    id: string;
    fields: GNObjectFieldMetadata[];
    
};
