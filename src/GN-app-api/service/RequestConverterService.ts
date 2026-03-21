import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { IRequestConverterService, Constructor } from "./IRequestConverterService";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import { GNHashtable, GNArray, GNData } from "./../../GN-common/common/GNData";
import { GNEnhancedObjectFieldMetadata, GNEnhancedObjectMetadata, GNFieldDataType, getGNObjectMetadata } from "./../../GN-common/entity/DataMember";
import { InvalidMemberType } from "./../../GN-common/constant/enumType/InvalidMemberType";
import { CommonOperationRequest } from "./../../GN-common/entity/operationRequest/CommonOperationRequest";
import { OperationObject } from "./../../GN-common/entity/operationRequest/OperationObject";
import { OperationArray } from "./../../GN-common/entity/operationRequest/OperationArray";

export class RequestConverterService implements IRequestConverterService {
    // Stores the declared fields map collection used by this instance.
    private declaredFieldsMap: Map<any, GNEnhancedObjectFieldMetadata[]>;

    /**
     * Returns the GearN enhanced object field metadata.
     * @param cls Provides the cls value used by this operation.
     * @returns Returns the GearN enhanced object field metadata.
     */
    public getGNEnhancedObjectFieldMetadata<T>(cls: Constructor<T>): GNEnhancedObjectFieldMetadata[] {
        // Stores the declared fields value used in the current execution flow.
        let declaredFields = this.declaredFieldsMap.get(cls);
        if (declaredFields == null) {
            declaredFields = getGNObjectMetadata<GNEnhancedObjectMetadata>(cls).fields;
            this.declaredFieldsMap.set(cls, declaredFields);
        }

        return declaredFields;
    }

    /**
     * Creates the operation request.
     * @param operationRequest Provides the operation request value used by this operation.
     * @param cls Provides the cls value used by this operation.
     * @returns Returns the operation result.
     */
    public createTOperationRequest<T extends OperationRequest>(operationRequest: OperationRequest, cls: Constructor<T>): T {
        // Stores the declared fields value used in the current execution flow.
        let declaredFields = this.getGNEnhancedObjectFieldMetadata(cls);

        // Stores the answer value used in the current execution flow.
        let answer = new cls();
        // Stores the answer any value used in the current execution flow.
        let answerAny = answer as any;
        answerAny.invalidMembers = [];

        answerAny.setOriginRequest = (operationRequest as any).setOriginRequest;
        answerAny.getOriginRequest = (operationRequest as any).getOriginRequest;
        answerAny.addInvalidMember = (operationRequest as any).addInvalidMember;
        answerAny.getInvalidMembers = (operationRequest as any).getInvalidMembers;

        // Stores the common answer value used in the current execution flow.
        let commonAnswer = answerAny as CommonOperationRequest;

        // Tracks whether valid request.
        let isValidRequest = true;
        // Stores the parameters value used in the current execution flow.
        let parameters = operationRequest.getParameters();

        for (let i = 0; i < declaredFields.length; i++) {
            // Stores the field value used in the current execution flow.
            let field = declaredFields[i];
            // Stores the GearN field type value used in the current execution flow.
            let gnFieldType = field.gnFieldType;

            // Stores the contains key value used in the current execution flow.
            let containsKey = parameters.containsKey(field.code);
            // Stores the value value used in the current execution flow.
            let value = parameters.getObject(field.code);

            if (field.isOptional) {
                if (containsKey && value != null) {
                    if (gnFieldType == GNFieldDataType.GNHashtable) {
                        if (value instanceof GNHashtable) {
                            // Stores the last value value used in the current execution flow.
                            let lastValue = value as GNHashtable;

                            if (field.activeConditionValid) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (field.cls == GNHashtable) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTObject(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getObject();
                            }
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.GNArray) {
                        if (value instanceof GNArray) {
                            // Stores the last value value used in the current execution flow.
                            let lastValue = value as GNArray;

                            if (field.activeConditionValid) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (field.cls == GNArray) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTArray(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getArray();
                            }
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.Boolean) {
                        if (typeof value === "boolean") {
                            // Stores the last value value used in the current execution flow.
                            let lastValue: boolean = value as boolean;

                            answerAny[field.name] = lastValue;
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.Number) {
                        if (typeof value === "number") {
                            // Stores the last value value used in the current execution flow.
                            let lastValue: number = value as number;

                            if (field.activeConditionValid) {
                                if (field.mustInt == true) {
                                    if (!this.isInteger(lastValue)) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.NumberMustInt
                                        });

                                        isValidRequest = false;
                                        break;
                                    }
                                }

                                if (field.minValue != null && lastValue < field.minValue) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMinValue
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxValue != null && lastValue > field.maxValue) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMaxValue
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            answerAny[field.name] = lastValue;
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.String) {
                        if (typeof value === "string") {
                            // Stores the last value value used in the current execution flow.
                            let lastValue: string = value as string;

                            if (field.activeConditionValid) {
                                if (field.minLength != null && lastValue.length < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.length > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            answerAny[field.name] = lastValue;
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.Other) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue = value;

                        answerAny[field.name] = lastValue;
                    }
                }
                else {
                    if (gnFieldType == GNFieldDataType.GNHashtable) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: GNHashtable = field.defaultValue;

                        if (lastValue == null) {
                            answerAny[field.name] = lastValue;
                        }
                        else {
                            if (field.activeConditionValid) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (field.cls == GNHashtable) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTObject(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getObject();
                            }
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.GNArray) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: GNArray = field.defaultValue;

                        if (lastValue == null) {
                            answerAny[field.name] = lastValue;
                        }
                        else {
                            if (field.activeConditionValid) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (field.cls == GNArray) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTArray(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getArray();
                            }
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.Boolean) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: boolean = field.defaultValue;

                        if (lastValue == null) {
                            lastValue = false;
                        }

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.Number) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: number = field.defaultValue;

                        if (lastValue == null) {
                            lastValue = 0;
                        }

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.String) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: string = field.defaultValue;

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.Other) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue = field.defaultValue;

                        answerAny[field.name] = lastValue;
                    }
                }
            }
            else {
                if (!containsKey) {
                    commonAnswer.addInvalidMember({
                        code: field.code,
                        invalidMemberType: InvalidMemberType.DataRequired
                    });

                    isValidRequest = false;
                    break;
                }

                if (value != null) {
                    if (gnFieldType == GNFieldDataType.GNHashtable) {
                        if (value instanceof GNHashtable) {
                            // Stores the last value value used in the current execution flow.
                            let lastValue = value as GNHashtable;

                            if (field.activeConditionValid) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (field.cls == GNHashtable) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTObject(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getObject();
                            }
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.GNArray) {
                        if (value instanceof GNArray) {
                            // Stores the last value value used in the current execution flow.
                            let lastValue = value as GNArray;

                            if (field.activeConditionValid) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (field.cls == GNArray) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTArray(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getArray();
                            }
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.Boolean) {
                        if (typeof value === "boolean") {
                            // Stores the last value value used in the current execution flow.
                            let lastValue: boolean = value as any as boolean;

                            answerAny[field.name] = lastValue;
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.Number) {
                        if (typeof value === "number") {
                            // Stores the last value value used in the current execution flow.
                            let lastValue: number = value as any as number;

                            if (field.activeConditionValid) {
                                if (field.mustInt === true) {
                                    if (!this.isInteger(lastValue)) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.NumberMustInt
                                        });

                                        isValidRequest = false;
                                        break;
                                    }
                                }

                                if (field.minValue != null && lastValue < field.minValue) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMinValue
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxValue != null && lastValue > field.maxValue) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMaxValue
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            answerAny[field.name] = lastValue;
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.String) {
                        if (typeof value === "string") {
                            // Stores the last value value used in the current execution flow.
                            let lastValue: string = value as any as string;

                            if (field.activeConditionValid) {
                                if (field.mustNonNull) {
                                    if (lastValue == null) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.StringNull
                                        });

                                        isValidRequest = false;
                                        break;
                                    }
                                }

                                if (lastValue != null) {
                                    if (field.minLength != null && lastValue.length < field.minLength) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.StringMinLength
                                        });

                                        isValidRequest = false;
                                        break;
                                    }
                                    else if (field.maxLength != null && lastValue.length > field.maxLength) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.StringMaxLength
                                        });

                                        isValidRequest = false;
                                        break;
                                    }
                                }
                            }

                            answerAny[field.name] = lastValue;
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.Other) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue = value;

                        answerAny[field.name] = lastValue;
                    }
                }
                else {
                    if (gnFieldType == GNFieldDataType.GNHashtable) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: GNHashtable = field.defaultValue;

                        if (field.activeConditionValid) {
                            if (field.mustNonNull) {
                                if (lastValue == null) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableNull
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (lastValue != null) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }
                        }

                        if (lastValue != null) {
                            if (field.cls == GNHashtable) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTObject(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getObject();
                            }
                        }
                        else answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.GNArray) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: GNArray = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        if (field.activeConditionValid) {
                            if (field.mustNonNull) {
                                if (lastValue == null) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayNull
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (lastValue != null) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }
                        }

                        if (lastValue != null) {
                            if (field.cls == GNArray) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTArray(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getArray();
                            }
                        }
                        else answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.Boolean) {
                        commonAnswer.addInvalidMember({
                            code: field.code,
                            invalidMemberType: InvalidMemberType.TypeInvalid
                        });

                        isValidRequest = false;
                        break;
                    }
                    else if (gnFieldType == GNFieldDataType.Number) {
                        commonAnswer.addInvalidMember({
                            code: field.code,
                            invalidMemberType: InvalidMemberType.TypeInvalid
                        });

                        isValidRequest = false;
                        break;
                    }
                    else if (gnFieldType == GNFieldDataType.String) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: string = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        if (field.activeConditionValid) {
                            if (field.mustNonNull) {
                                if (lastValue == null) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringNull
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (lastValue != null) {
                                if (field.minLength != null && lastValue.length < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.length > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }
                        }

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.Other) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        answerAny[field.name] = lastValue;
                    }
                }
            }
        }

        answerAny.originRequest = (operationRequest as any).originRequest;
        answerAny.operationCode = operationRequest.getOperationCode();
        answerAny.requestId = operationRequest.getRequestId();
        answerAny.parameters = parameters;

        answerAny.isValid = isValidRequest;

        return answer as any as T;
    }

    /**
     * Creates the object.
     * @param gnHashtable Provides the GearN hashtable value used by this operation.
     * @param cls Provides the cls value used by this operation.
     * @returns Returns the operation result.
     */
    public createTObject<T>(gnHashtable: GNHashtable, cls: Constructor<T>): OperationObject<T> {
        // Stores the declared fields value used in the current execution flow.
        let declaredFields = this.getGNEnhancedObjectFieldMetadata(cls);

        // Stores the answer value used in the current execution flow.
        let answer = new cls();
        // Stores the answer any value used in the current execution flow.
        let answerAny = answer as any;

        // Stores the common answer value used in the current execution flow.
        let commonAnswer = new OperationObject<T>();

        // Tracks whether valid request.
        let isValidRequest = true;

        for (let i = 0; i < declaredFields.length; i++) {
            // Stores the field value used in the current execution flow.
            let field = declaredFields[i];
            // Stores the GearN field type value used in the current execution flow.
            let gnFieldType = field.gnFieldType;

            // Stores the contains key value used in the current execution flow.
            let containsKey = gnHashtable.containsKey(field.code);
            // Stores the value value used in the current execution flow.
            let value = gnHashtable.getObject(field.code);

            if (field.isOptional) {
                if (containsKey && value != null) {
                    if (gnFieldType == GNFieldDataType.GNHashtable) {
                        if (value instanceof GNHashtable) {
                            // Stores the last value value used in the current execution flow.
                            let lastValue = value as GNHashtable;

                            if (field.activeConditionValid) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (field.cls == GNHashtable) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTObject(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getObject();
                            }
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.GNArray) {
                        if (value instanceof GNArray) {
                            // Stores the last value value used in the current execution flow.
                            let lastValue = value as GNArray;

                            if (field.activeConditionValid) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (field.cls == GNArray) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTArray(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getArray();
                            }
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.Boolean) {
                        if (typeof value === "boolean") {
                            // Stores the last value value used in the current execution flow.
                            let lastValue: boolean = value as boolean;

                            answerAny[field.name] = lastValue;
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.Number) {
                        if (typeof value === "number") {
                            // Stores the last value value used in the current execution flow.
                            let lastValue: number = value as number;

                            if (field.activeConditionValid) {
                                if (field.mustInt == true) {
                                    if (!this.isInteger(lastValue)) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.NumberMustInt
                                        });

                                        isValidRequest = false;
                                        break;
                                    }
                                }

                                if (field.minValue != null && lastValue < field.minValue) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMinValue
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxValue != null && lastValue > field.maxValue) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMaxValue
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            answerAny[field.name] = lastValue;
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.String) {
                        if (typeof value === "string") {
                            // Stores the last value value used in the current execution flow.
                            let lastValue: string = value as string;

                            if (field.activeConditionValid) {
                                if (field.minLength != null && lastValue.length < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.length > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            answerAny[field.name] = lastValue;
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.Other) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue = value;

                        answerAny[field.name] = lastValue;
                    }
                }
                else {
                    if (gnFieldType == GNFieldDataType.GNHashtable) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: GNHashtable = field.defaultValue;

                        if (lastValue == null) {
                            answerAny[field.name] = lastValue;
                        }
                        else {
                            if (field.activeConditionValid) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (field.cls == GNHashtable) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTObject(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getObject();
                            }
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.GNArray) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: GNArray = field.defaultValue;

                        if (lastValue == null) {
                            answerAny[field.name] = lastValue;
                        }
                        else {
                            if (field.activeConditionValid) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (field.cls == GNArray) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTArray(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getArray();
                            }
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.Boolean) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: boolean = field.defaultValue;

                        if (lastValue == null) {
                            lastValue = false;
                        }

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.Number) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: number = field.defaultValue;

                        if (lastValue == null) {
                            lastValue = 0;
                        }

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.String) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: string = field.defaultValue;

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.Other) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue = field.defaultValue;

                        answerAny[field.name] = lastValue;
                    }
                }
            }
            else {
                if (!containsKey) {
                    commonAnswer.addInvalidMember({
                        code: field.code,
                        invalidMemberType: InvalidMemberType.DataRequired
                    });

                    isValidRequest = false;
                    break;
                }

                if (value != null) {
                    if (gnFieldType == GNFieldDataType.GNHashtable) {
                        if (value instanceof GNHashtable) {
                            // Stores the last value value used in the current execution flow.
                            let lastValue = value as GNHashtable;

                            if (field.activeConditionValid) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (field.cls == GNHashtable) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTObject(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getObject();
                            }
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.GNArray) {
                        if (value instanceof GNArray) {
                            // Stores the last value value used in the current execution flow.
                            let lastValue = value as GNArray;

                            if (field.activeConditionValid) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (field.cls == GNArray) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTArray(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getArray();
                            }
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.Boolean) {
                        if (typeof value === "boolean") {
                            // Stores the last value value used in the current execution flow.
                            let lastValue: boolean = value as any as boolean;

                            answerAny[field.name] = lastValue;
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.Number) {
                        if (typeof value === "number") {
                            // Stores the last value value used in the current execution flow.
                            let lastValue: number = value as any as number;

                            if (field.activeConditionValid) {
                                if (field.mustInt === true) {
                                    if (!this.isInteger(lastValue)) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.NumberMustInt
                                        });

                                        isValidRequest = false;
                                        break;
                                    }
                                }

                                if (field.minValue != null && lastValue < field.minValue) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMinValue
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxValue != null && lastValue > field.maxValue) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMaxValue
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            answerAny[field.name] = lastValue;
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.String) {
                        if (typeof value === "string") {
                            // Stores the last value value used in the current execution flow.
                            let lastValue: string = value as any as string;

                            if (field.activeConditionValid) {
                                if (field.mustNonNull) {
                                    if (lastValue == null) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.StringNull
                                        });

                                        isValidRequest = false;
                                        break;
                                    }
                                }

                                if (lastValue != null) {
                                    if (field.minLength != null && lastValue.length < field.minLength) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.StringMinLength
                                        });

                                        isValidRequest = false;
                                        break;
                                    }
                                    else if (field.maxLength != null && lastValue.length > field.maxLength) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.StringMaxLength
                                        });

                                        isValidRequest = false;
                                        break;
                                    }
                                }
                            }

                            answerAny[field.name] = lastValue;
                        }
                        else {
                            commonAnswer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (gnFieldType == GNFieldDataType.Other) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue = value;

                        answerAny[field.name] = lastValue;
                    }
                }
                else {
                    if (gnFieldType == GNFieldDataType.GNHashtable) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: GNHashtable = field.defaultValue;

                        if (field.activeConditionValid) {
                            if (field.mustNonNull) {
                                if (lastValue == null) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableNull
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (lastValue != null) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }
                        }

                        if (lastValue != null) {
                            if (field.cls == GNHashtable) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTObject(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getObject();
                            }
                        }
                        else answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.GNArray) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: GNArray = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        if (field.activeConditionValid) {
                            if (field.mustNonNull) {
                                if (lastValue == null) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayNull
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (lastValue != null) {
                                if (field.minLength != null && lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }
                        }

                        if (lastValue != null) {
                            if (field.cls == GNArray) {
                                answerAny[field.name] = lastValue;
                            }
                            else {
                                // Stores the operation object value used in the current execution flow.
                                let operationObject = this.createTArray(lastValue, field.cls);

                                if (!operationObject.isValidObject()) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.TypeInvalid
                                    });

                                    isValidRequest = false;
                                    break;
                                }

                                answerAny[field.name] = operationObject.getArray();
                            }
                        }
                        else answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.Boolean) {
                        commonAnswer.addInvalidMember({
                            code: field.code,
                            invalidMemberType: InvalidMemberType.TypeInvalid
                        });

                        isValidRequest = false;
                        break;
                    }
                    else if (gnFieldType == GNFieldDataType.Number) {
                        commonAnswer.addInvalidMember({
                            code: field.code,
                            invalidMemberType: InvalidMemberType.TypeInvalid
                        });

                        isValidRequest = false;
                        break;
                    }
                    else if (gnFieldType == GNFieldDataType.String) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue: string = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        if (field.activeConditionValid) {
                            if (field.mustNonNull) {
                                if (lastValue == null) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringNull
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (lastValue != null) {
                                if (field.minLength != null && lastValue.length < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (field.maxLength != null && lastValue.length > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringMaxLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }
                        }

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.Other) {
                        // Stores the last value value used in the current execution flow.
                        let lastValue = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        answerAny[field.name] = lastValue;
                    }
                }
            }
        }

        (<any>commonAnswer).isValid = isValidRequest;
        commonAnswer.setObject(answer);

        return commonAnswer;
    }

    /**
     * Creates the array.
     * @param gnArray Provides the GearN array value used by this operation.
     * @param cls Provides the cls value used by this operation.
     * @returns Returns the operation result.
     */
    public createTArray<T>(gnArray: GNArray, cls: Constructor<T>): OperationArray<T> {
        // Stores the array value used in the current execution flow.
        let tArray: T[] = [];

        // Stores the common answer value used in the current execution flow.
        let commonAnswer = new OperationArray<T>();

        // Tracks whether valid request.
        let isValidRequest = true;

        // Stores the cls any value used in the current execution flow.
        let clsAny = cls as any;

        for (let i = 0; i < gnArray.count(); i++) {
            // Stores the answer any value used in the current execution flow.
            let answerAny: any;

            if (clsAny == Number) {
                answerAny = gnArray.getNumber(i);

                if (answerAny == null) {
                    isValidRequest = false;
                    break;
                }
            }
            else if (clsAny == Boolean) {
                answerAny = gnArray.getBoolean(i);

                if (answerAny == null) {
                    isValidRequest = false;
                    break;
                }
            }
            else if (clsAny == String) {
                answerAny = gnArray.getString(i);
            }
            else {
                // Stores the last value value used in the current execution flow.
                let lastValue = gnArray.getGNHashtable(i);

                if (clsAny == GNHashtable) {
                    answerAny = lastValue;
                }
                else {
                    // Stores the operation object value used in the current execution flow.
                    let operationObject = this.createTObject(lastValue, cls);

                    if (!operationObject.isValidObject()) {
                        isValidRequest = false;
                        break;
                    }

                    answerAny = operationObject.getObject();
                }
            }

            tArray.push(answerAny);
        }

        (<any>commonAnswer).isValid = isValidRequest;
        commonAnswer.setArray(tArray);

        return commonAnswer;
    }

    /**
     * Executes the new operation request workflow.
     * @param request Provides the request value used by this operation.
     * @returns Returns the operation result.
     */
    public newOperationRequest(request: Request): OperationRequest {
        // Stores the answer value used in the current execution flow.
        let answer = new CommonOperationRequest(request.getOperationCode());
        answer.setOriginRequest(request);
        answer.setRequestId(request.getRequestId());

        // Stores the parameters value used in the current execution flow.
        let parameters = new GNHashtable();
        // Stores the d value used in the current execution flow.
        let d = request.getParameters();

        // Stores the keys value used in the current execution flow.
        let keys = Object.keys(d);
        for (let i = 0; i < keys.length; i++) {
            // Stores the key value used in the current execution flow.
            let key = keys[i];
            parameters.add(key, d[key]);
        }

        answer.setParameters(parameters);
        return answer;
    }

    /**
     * Checks whether integer.
     * @param number Provides the number value used by this operation.
     * @returns Returns the operation result.
     */
    private isInteger(number: number): boolean {
        return Number.isInteger(number);
    }

    /**
     * Initializes a new request converter service instance.
     */
    constructor() {
        this.declaredFieldsMap = new Map<any, GNEnhancedObjectFieldMetadata[]>;
    }

}