export type Constructor<T> = {
    new (...args: any[]): T;
};

export type AbstractConstructor<T> = Function & {
    prototype: T;
};

export enum FieldDataType {
    Boolean = 0,
    Number = 1,
    String = 2,
    Array = 3,
    Object = 4
};

export interface GNObjectFieldMetadata {
    /**
     * Field logic name.
     */
    name: string;
    /**
     * Description of field.
     */
    description: string;
    /**
     * The data type of the field.
     */
    fieldType: FieldDataType;
};

export interface GNObjectMetadata {
    id: string;
    fields: GNObjectFieldMetadata[];
};
