import { ObjectFieldMetadata, ObjectMetadata, initFieldMetadata } from "@clairejs/core";
import { GNArray, GNHashtable } from "./../common/GNData";

export interface EnhancedFieldMetadata extends ObjectFieldMetadata {
    code: number;
    isOptional?: boolean;
    defaultValue: any;

    activeConditionValid: boolean;
    mustNonNull?: boolean;
    minLength?: number;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    mustInt?: boolean;
}

export interface EnhancedObjectMedata extends ObjectMetadata {
    fields: EnhancedFieldMetadata[];
}

interface DataMemberArgs {
    code: number;
    isOptional?: boolean;
    defaultValue?: any;
}

interface OtherDataMemberArgs extends DataMemberArgs {
    
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
    field.isOptional = args.isOptional;
    field.defaultValue = args.defaultValue;

    field.activeConditionValid = false;
};

export const StringDataMember = (args: StringDataMemberArgs) => (prototype: any, propertyKey: string) => {
    let field = initFieldMetadata<EnhancedFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional;
    field.defaultValue = args.defaultValue;

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

export const BooleanDataMemberArgs = (args: BooleanDataMemberArgs) => (prototype: any, propertyKey: string) => {
    let field = initFieldMetadata<EnhancedFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional;
    field.defaultValue = args.defaultValue;

    field.activeConditionValid = false;
};

export const GNHashtableDataMember = (args: GNHashtableDataMemberArgs) => (prototype: any, propertyKey: string) => {
    let field = initFieldMetadata<EnhancedFieldMetadata>(prototype, propertyKey);
    field.code = args.code;
    field.isOptional = args.isOptional;
    field.defaultValue = args.defaultValue;

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
    field.isOptional = args.isOptional;
    field.defaultValue = args.defaultValue;

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
    field.isOptional = args.isOptional;
    field.defaultValue = args.defaultValue;

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
