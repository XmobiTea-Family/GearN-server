import { ObjectFieldMetadata, ObjectMetadata, initFieldMetadata } from "@clairejs/core";
import { GNArray, GNHashtable } from "./../common/GNData";

export interface EnhancedFieldMetadata extends ObjectFieldMetadata {
    code: string;
    isOptional: boolean;
    fieldType: FieldType;
    defaultValue: any;

    activeConditionValid: boolean;

    mustNonNull?: boolean;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    mustInt?: boolean;

}

export enum FieldType {
    Other = 0,
    Number = 1,
    String = 2,
    Boolean = 3,
    GNHashtable = 4,
    GNArray = 5,

}

export interface EnhancedObjectMedata extends ObjectMetadata {
    fields: EnhancedFieldMetadata[];

}

interface DataMemberBaseArgs {
    code: string;
    isOptional?: boolean;
    defaultValue?: any;

}

interface DataMemberArgs extends DataMemberBaseArgs {
    fieldType?: FieldType;

}

interface OtherDataMemberArgs extends DataMemberBaseArgs {

}

interface StringDataMemberArgs extends OtherDataMemberArgs {
    defaultValue?: string;
    mustNonNull?: boolean;
    minLength?: number;
    maxLength?: number;

}

interface BooleanDataMemberArgs extends OtherDataMemberArgs {
    defaultValue?: boolean;

}

interface NumberDataMemberArgs extends OtherDataMemberArgs {
    defaultValue?: number;
    minValue?: number;
    maxValue?: number;
    mustInt?: boolean;

}

interface GNHashtableDataMemberArgs extends OtherDataMemberArgs {
    defaultValue?: GNHashtable;
    mustNonNull?: boolean;
    minLength?: number;
    maxLength?: number;

}

interface GNArrayDataMemberArgs extends OtherDataMemberArgs {
    defaultValue?: GNArray;
    mustNonNull?: boolean;
    minLength?: number;
    maxLength?: number;

}

export const DataMember = (args: DataMemberArgs) => (prototype: any, propertyKey: string) => {
    let field = initFieldMetadata<EnhancedFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional == null ? false : args.isOptional;
    field.defaultValue = args.defaultValue;
    field.fieldType = args.fieldType == null ? FieldType.Other : args.fieldType;

    field.activeConditionValid = false;

};

export const StringDataMember = (args: StringDataMemberArgs) => (prototype: any, propertyKey: string) => {
    let field = initFieldMetadata<EnhancedFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional == null ? false : args.isOptional;
    field.defaultValue = args.defaultValue;
    field.fieldType = FieldType.String;

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
    let field = initFieldMetadata<EnhancedFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional == null ? false : args.isOptional;
    field.defaultValue = args.defaultValue;
    field.fieldType = FieldType.Boolean;

    field.activeConditionValid = false;

};

export const GNHashtableDataMember = (args: GNHashtableDataMemberArgs) => (prototype: any, propertyKey: string) => {
    let field = initFieldMetadata<EnhancedFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional == null ? false : args.isOptional;
    field.defaultValue = args.defaultValue;
    field.fieldType = FieldType.GNHashtable;

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
    let field = initFieldMetadata<EnhancedFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional == null ? false : args.isOptional;
    field.defaultValue = args.defaultValue;
    field.fieldType = FieldType.GNArray;

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
    let field = initFieldMetadata<EnhancedFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional == null ? false : args.isOptional;
    field.defaultValue = args.defaultValue;
    field.fieldType = FieldType.Number;

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
