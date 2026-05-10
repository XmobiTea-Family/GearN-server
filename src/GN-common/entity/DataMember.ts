import "reflect-metadata";
import { Constructor } from "./../../GN-app-api/service/IRequestConverterService";
import { GNArray, GNHashtable } from "./../common/GNData";
import { AbstractConstructor, FieldDataType, GNObjectFieldMetadata, GNObjectMetadata } from "./GNMetadata";
// Thanks special for athongintel @clairejs/core

//@internal
export const GN_METADATA = "__GN_METADATA__";

/**
 * Returns the GearN reflected data type.
 * @param prototype Provides the prototype value used by this operation.
 * @param propertyKey Provides the property key value used by this operation.
 * @returns Returns the GearN reflected data type.
 */
const getGNReflectedDataType = (prototype: any, propertyKey: string): FieldDataType => {
    // Stores the t value used in the current execution flow.
    let t = Reflect.getMetadata("design:type", prototype, propertyKey);
    if (!t) {
        throw Error(`Cannot get gn reflected data type for ${prototype.constructor.name}:${propertyKey}`);
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

/**
 * Returns the GearN reflected metadata.
 * @param prototype Provides the prototype value used by this operation.
 * @param propertyKey Provides the property key value used by this operation.
 * @returns Returns the GearN reflected metadata.
 */
const getGNReflectedMetadata = (
    prototype: any,
    propertyKey: string,
): {
    // Stores the field data type value used by this contract.
    fieldDataType: FieldDataType;
    // Stores the prototype value used by this contract.
    prototype: any;
} => {
    // Stores the t value used in the current execution flow.
    let t = Reflect.getMetadata("design:type", prototype, propertyKey);
    if (!t) {
        throw Error(`Cannot get gn reflected data type for ${prototype.constructor.name}:${propertyKey}`);
    }

    // Stores the answer value used in the current execution flow.
    let answer: {
        // Stores the field data type value used by this contract.
        fieldDataType: FieldDataType;
        // Stores the prototype value used by this contract.
        prototype: any;
    } = {
        fieldDataType: null,
        prototype: t.prototype,
    };

    if (t.name == "Boolean") answer.fieldDataType = FieldDataType.Boolean;
    else if (t.name == "Number") answer.fieldDataType = FieldDataType.Number;
    else if (t.name == "String") answer.fieldDataType = FieldDataType.String;
    else if (t.name == "Array") answer.fieldDataType = FieldDataType.Array;
    else answer.fieldDataType = FieldDataType.Object;

    return answer;
};

/**
 * Executes the init GearN object metadata workflow.
 * @param prototype Provides the prototype value used by this operation.
 * @returns Returns the operation result.
 */
export const initGNObjectMetadata = <T extends GNObjectMetadata>(prototype: any): T => {
    if (prototype === Object.prototype) {
        return {} as T;
    }
    if (!prototype.hasOwnProperty(GN_METADATA)) {
        // Stores the super prototype value used in the current execution flow.
        const superPrototype = initGNObjectMetadata<T>(Object.getPrototypeOf(prototype));
        prototype[GN_METADATA] = {
            ...superPrototype,
            id: getTableName(prototype.constructor),
            fields: superPrototype.fields ? superPrototype.fields.map((f) => ({ ...f })) : [],
        };
    }
    return prototype[GN_METADATA];
};

/**
 * Executes the init GearN object field metadata workflow.
 * @param prototype Provides the prototype value used by this operation.
 * @param propertyKey Provides the property key value used by this operation.
 * @returns Returns the operation result.
 */
export const initGNObjectFieldMetadata = <T extends GNObjectFieldMetadata>(prototype: any, propertyKey: string): T => {
    // Stores the meta value used in the current execution flow.
    let meta = initGNObjectMetadata<GNObjectMetadata>(prototype);

    // Stores the field index value used in the current execution flow.
    let fieldIndex = meta.fields.findIndex((f) => f.name === propertyKey);
    if (fieldIndex < 0) {
        // Stores the GearN reflected metadata value used in the current execution flow.
        let gnReflectedMetadata = getGNReflectedMetadata(prototype, propertyKey);

        // Stores the field value used in the current execution flow.
        const field: GNObjectFieldMetadata = {
            name: propertyKey,
            // fieldType: getGNReflectedDataType(prototype, propertyKey),
            fieldType: gnReflectedMetadata.fieldDataType,
            cls: gnReflectedMetadata.prototype.constructor,
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

/**
 * Returns the GearN object metadata.
 * @param obj Provides the obj value used by this operation.
 * @returns Returns the GearN object metadata.
 */
export const getGNObjectMetadata = <T extends GNObjectMetadata>(obj: AbstractConstructor<any>): T | undefined => {
    return obj.prototype[GN_METADATA];
};

/**
 * Sets the GearN object metadata.
 * @param obj Provides the obj value used by this operation.
 * @param metadata Provides the metadata value used by this operation.
 */
export const setGNObjectMetadata = <T extends GNObjectMetadata>(obj: AbstractConstructor<any>, metadata: T): void => {
    obj.prototype[GN_METADATA] = metadata;
};

/**
 * Returns the table name.
 * @param model Provides the model value used by this operation.
 */
export const getTableName = (model: Constructor<any>) => model?.name.toLowerCase();

export interface GNEnhancedObjectFieldMetadata extends GNObjectFieldMetadata {
    // Stores the code value used by this contract.
    code: string;
    // Indicates whether optional.
    isOptional: boolean;
    // Stores the GearN field type value used by this contract.
    gnFieldType: GNFieldDataType;
    // Stores the default value value used by this contract.
    defaultValue: any;

    // Indicates whether active condition valid.
    activeConditionValid: boolean;

    // Indicates whether must non null.
    mustNonNull?: boolean;
    // Stores the min length value used by this contract.
    minLength?: number;
    // Stores the max length value used by this contract.
    maxLength?: number;
    // Stores the min value value used by this contract.
    minValue?: number;
    // Stores the max value value used by this contract.
    maxValue?: number;
    // Indicates whether must int.
    mustInt?: boolean;
}

export enum GNFieldDataType {
    Other = 0,
    Number = 1,
    String = 2,
    Boolean = 3,
    GNHashtable = 4,
    GNArray = 5,
}

export interface GNEnhancedObjectMetadata extends GNObjectMetadata {
    // Stores the fields list used by this contract.
    fields: GNEnhancedObjectFieldMetadata[];
}

interface DataMemberBaseArgs {
    // Stores the code value used by this contract.
    code: string;
    // Indicates whether optional.
    isOptional?: boolean;
    // Stores the default value value used by this contract.
    defaultValue?: any;
}

interface DataMemberArgs extends DataMemberBaseArgs {
    // Stores the GearN field type value used by this contract.
    gnFieldType?: GNFieldDataType;
}

interface OtherDataMemberArgs extends DataMemberBaseArgs {}

interface StringDataMemberArgs extends OtherDataMemberArgs {
    // Stores the default value value used by this contract.
    defaultValue?: string;
    // Indicates whether must non null.
    mustNonNull?: boolean;
    // Stores the min length value used by this contract.
    minLength?: number;
    // Stores the max length value used by this contract.
    maxLength?: number;
}

interface BooleanDataMemberArgs extends OtherDataMemberArgs {
    // Indicates whether default value.
    defaultValue?: boolean;
}

interface NumberDataMemberArgs extends OtherDataMemberArgs {
    // Stores the default value value used by this contract.
    defaultValue?: number;
    // Stores the min value value used by this contract.
    minValue?: number;
    // Stores the max value value used by this contract.
    maxValue?: number;
    // Indicates whether must int.
    mustInt?: boolean;
}

interface GNHashtableDataMemberArgs extends OtherDataMemberArgs {
    // Stores the default value value used by this contract.
    defaultValue?: GNHashtable;
    // Indicates whether must non null.
    mustNonNull?: boolean;
    // Stores the min length value used by this contract.
    minLength?: number;
    // Stores the max length value used by this contract.
    maxLength?: number;
}

interface GNArrayDataMemberArgs extends OtherDataMemberArgs {
    // Stores the default value value used by this contract.
    defaultValue?: GNArray;
    // Indicates whether must non null.
    mustNonNull?: boolean;
    // Stores the min length value used by this contract.
    minLength?: number;
    // Stores the max length value used by this contract.
    maxLength?: number;
    // Stores the element cls value used by this contract.
    elementCls?: new (...args: any[]) => any;
}

/**
 * Executes the data member workflow.
 * @param args Provides the args value used by this operation.
 */
export const DataMember = (args: DataMemberArgs) => (prototype: any, propertyKey: string) => {
    // Stores the field value used in the current execution flow.
    let field = initGNObjectFieldMetadata<GNEnhancedObjectFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional == null ? false : args.isOptional;
    field.defaultValue = args.defaultValue;
    field.gnFieldType = args.gnFieldType == null ? GNFieldDataType.Other : args.gnFieldType;

    field.activeConditionValid = false;
};

/**
 * Executes the string data member workflow.
 * @param args Provides the args value used by this operation.
 */
export const StringDataMember = (args: StringDataMemberArgs) => (prototype: any, propertyKey: string) => {
    // Stores the field value used in the current execution flow.
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

/**
 * Executes the boolean data member workflow.
 * @param args Provides the args value used by this operation.
 */
export const BooleanDataMember = (args: BooleanDataMemberArgs) => (prototype: any, propertyKey: string) => {
    // Stores the field value used in the current execution flow.
    let field = initGNObjectFieldMetadata<GNEnhancedObjectFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional == null ? false : args.isOptional;
    field.defaultValue = args.defaultValue;
    field.gnFieldType = GNFieldDataType.Boolean;

    field.activeConditionValid = false;
};

/**
 * Executes the GearN hashtable data member workflow.
 * @param args Provides the args value used by this operation.
 */
export const GNHashtableDataMember = (args: GNHashtableDataMemberArgs) => (prototype: any, propertyKey: string) => {
    // Stores the field value used in the current execution flow.
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

/**
 * Executes the GearN array data member workflow.
 * @param args Provides the args value used by this operation.
 */
export const GNArrayDataMember = (args: GNArrayDataMemberArgs) => (prototype: any, propertyKey: string) => {
    // Stores the field value used in the current execution flow.
    let field = initGNObjectFieldMetadata<GNEnhancedObjectFieldMetadata>(prototype, propertyKey);
    if (args.elementCls != null) field.cls = args.elementCls;

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

/**
 * Executes the number data member workflow.
 * @param args Provides the args value used by this operation.
 */
export const NumberDataMember = (args: NumberDataMemberArgs) => (prototype: any, propertyKey: string) => {
    // Stores the field value used in the current execution flow.
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
            args.minValue = -Infinity;
        }

        if (args.maxValue == null) {
            args.maxValue = Infinity;
        }
    }

    field.minValue = args.minValue;
    field.maxValue = args.maxValue;
    field.mustInt = args.mustInt;
};
