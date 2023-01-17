import "reflect-metadata";
import { GNArray, GNHashtable } from "./../common/GNData";
import { AbstractConstructor, Constructor, FieldDataType, GNObjectFieldMetadata, GNObjectMetadata } from "./GNMetadata";
// Thanks special for athongintel @clairejs/core

//@internal
export const GN_METADATA = "__GN_METADATA__";

const getGNReflectedDataType = (prototype: any, propertyKey: string): FieldDataType => {
    let t = Reflect.getMetadata("design:type", prototype, propertyKey);
    if (!t) {
        throw Error(
            `Cannot get gn reflected data type for ${prototype.constructor.name}:${propertyKey}`
        );
    }

    switch (t.name) {
        case "Boolean":
            return FieldDataType.Boolean;
        case "Number":
            return FieldDataType.Number;
        case "String":
            return FieldDataType.String;
        case "Array":
            return FieldDataType.Array;

        default:
            return FieldDataType.Object;
    }
};

export const initGNObjectMetadata = <T extends GNObjectMetadata>(prototype: any): T => {
    if (prototype === Object.prototype) {
        return {} as T;
    }
    if (!prototype.hasOwnProperty(GN_METADATA)) {
        const superPrototype = initGNObjectMetadata<T>(Object.getPrototypeOf(prototype));
        prototype[GN_METADATA] = {
            ...superPrototype,
            id: getTableName(prototype.constructor),
            fields: superPrototype.fields ? superPrototype.fields.map((f) => ({ ...f })) : [],
        };
    }
    return prototype[GN_METADATA];
};

export const initGNObjectFieldMetadata = <T extends GNObjectFieldMetadata>(prototype: any, propertyKey: string): T => {
    let meta = initGNObjectMetadata<GNObjectMetadata>(prototype);

    let fieldIndex = meta.fields.findIndex((f) => f.name === propertyKey);
    if (fieldIndex < 0) {
        const field: GNObjectFieldMetadata = {
            name: propertyKey,
            fieldType: getGNReflectedDataType(prototype, propertyKey),
        };
        meta.fields.push(field);
        return field as T;
    } else {
        //-- shadow clone the field
        const field = { ...meta.fields[fieldIndex] };
        meta.fields[fieldIndex] = field;
        return field as T;
    }
};

export const getGNObjectMetadata = <T extends GNObjectMetadata>(obj: AbstractConstructor<any>): T | undefined => {
    return obj.prototype[GN_METADATA];
};

export const setGNObjectMetadata = <T extends GNObjectMetadata>(obj: AbstractConstructor<any>, metadata: T): void => {
    obj.prototype[GN_METADATA] = metadata;
};

export const getTableName = (model: Constructor<any>) => model?.name.toLowerCase();

export interface GNEnhancedObjectFieldMetadata extends GNObjectFieldMetadata {
    code: string;
    isOptional: boolean;
    gnFieldType: GNFieldDataType;
    defaultValue: any;

    activeConditionValid: boolean;

    mustNonNull?: boolean;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    mustInt?: boolean;

};

export enum GNFieldDataType {
    Other = 0,
    Number = 1,
    String = 2,
    Boolean = 3,
    GNHashtable = 4,
    GNArray = 5,

};

export interface GNEnhancedObjectMetadata extends GNObjectMetadata {
    fields: GNEnhancedObjectFieldMetadata[];

};

interface DataMemberBaseArgs {
    code: string;
    isOptional?: boolean;
    defaultValue?: any;

};

interface DataMemberArgs extends DataMemberBaseArgs {
    gnFieldType?: GNFieldDataType;

};

interface OtherDataMemberArgs extends DataMemberBaseArgs {

};

interface StringDataMemberArgs extends OtherDataMemberArgs {
    defaultValue?: string;
    mustNonNull?: boolean;
    minLength?: number;
    maxLength?: number;

};

interface BooleanDataMemberArgs extends OtherDataMemberArgs {
    defaultValue?: boolean;

};

interface NumberDataMemberArgs extends OtherDataMemberArgs {
    defaultValue?: number;
    minValue?: number;
    maxValue?: number;
    mustInt?: boolean;

};

interface GNHashtableDataMemberArgs extends OtherDataMemberArgs {
    defaultValue?: GNHashtable;
    mustNonNull?: boolean;
    minLength?: number;
    maxLength?: number;

};

interface GNArrayDataMemberArgs extends OtherDataMemberArgs {
    defaultValue?: GNArray;
    mustNonNull?: boolean;
    minLength?: number;
    maxLength?: number;

};

export const DataMember = (args: DataMemberArgs) => (prototype: any, propertyKey: string) => {
    let field = initGNObjectFieldMetadata<GNEnhancedObjectFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional == null ? false : args.isOptional;
    field.defaultValue = args.defaultValue;
    field.gnFieldType = args.gnFieldType == null ? GNFieldDataType.Other : args.gnFieldType;

    field.activeConditionValid = false;

};

export const StringDataMember = (args: StringDataMemberArgs) => (prototype: any, propertyKey: string) => {
    let field = initGNObjectFieldMetadata<GNEnhancedObjectFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional == null ? false : args.isOptional;
    field.defaultValue = args.defaultValue;
    field.gnFieldType = GNFieldDataType.String;

    if (args.mustNonNull != null || args.minLength != null || args.maxLength != null) {
        field.activeConditionValid = true;

        if (args.mustNonNull == null) {
            args.mustNonNull = false;
        }

        if (args.minLength == null) {
            args.minLength = 0;
        }

        if (args.maxLength == null) {
            args.maxLength = 256;
        }
    }

    field.mustNonNull = args.mustNonNull;
    field.minLength = args.minLength;
    field.maxLength = args.maxLength;

};

export const BooleanDataMember = (args: BooleanDataMemberArgs) => (prototype: any, propertyKey: string) => {
    let field = initGNObjectFieldMetadata<GNEnhancedObjectFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional == null ? false : args.isOptional;
    field.defaultValue = args.defaultValue;
    field.gnFieldType = GNFieldDataType.Boolean;

    field.activeConditionValid = false;

};

export const GNHashtableDataMember = (args: GNHashtableDataMemberArgs) => (prototype: any, propertyKey: string) => {
    let field = initGNObjectFieldMetadata<GNEnhancedObjectFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional == null ? false : args.isOptional;
    field.defaultValue = args.defaultValue;
    field.gnFieldType = GNFieldDataType.GNHashtable;

    if (args.mustNonNull != null || args.minLength != null || args.maxLength != null) {
        field.activeConditionValid = true;

        if (args.mustNonNull == null) {
            args.mustNonNull = false;
        }

        if (args.minLength == null) {
            args.minLength = 0;
        }

        if (args.maxLength == null) {
            args.maxLength = 256;
        }
    }

    field.mustNonNull = args.mustNonNull;
    field.minLength = args.minLength;
    field.maxLength = args.maxLength;

};

export const GNArrayDataMember = (args: GNArrayDataMemberArgs) => (prototype: any, propertyKey: string) => {
    let field = initGNObjectFieldMetadata<GNEnhancedObjectFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional == null ? false : args.isOptional;
    field.defaultValue = args.defaultValue;
    field.gnFieldType = GNFieldDataType.GNArray;

    if (args.mustNonNull != null || args.minLength != null || args.maxLength != null) {
        field.activeConditionValid = true;

        if (args.mustNonNull == null) {
            args.mustNonNull = false;
        }

        if (args.minLength == null) {
            args.minLength = 0;
        }

        if (args.maxLength == null) {
            args.maxLength = 256;
        }
    }

    field.mustNonNull = args.mustNonNull;
    field.minLength = args.minLength;
    field.maxLength = args.maxLength;

};

export const NumberDataMember = (args: NumberDataMemberArgs) => (prototype: any, propertyKey: string) => {
    let field = initGNObjectFieldMetadata<GNEnhancedObjectFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional == null ? false : args.isOptional;
    field.defaultValue = args.defaultValue;
    field.gnFieldType = GNFieldDataType.Number;

    if (args.mustInt != null || args.minValue != null || args.maxValue != null) {
        field.activeConditionValid = true;

        if (args.mustInt == null) {
            args.mustInt = false;
        }

        if (args.minValue == null) {
            args.minValue = Number.MIN_VALUE;
        }

        if (args.maxValue == null) {
            args.maxValue = Number.MAX_VALUE;
        }
    }

    field.minValue = args.minValue;
    field.maxValue = args.maxValue;
    field.mustInt = args.mustInt;

};
