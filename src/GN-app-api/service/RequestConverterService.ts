import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { IRequestConverterService, Constructor } from "./IRequestConverterService";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import { GNHashtable, GNArray, GNData } from "./../../GN-common/common/GNData";
import { GNEnhancedObjectFieldMetadata, GNEnhancedObjectMetadata, GNFieldDataType, getGNObjectMetadata } from "./../../GN-common/entity/DataMember";
import { InvalidMemberType } from "./../../GN-common/constant/enumType/InvalidMemberType";
import { CommonOperationRequest } from "./../../GN-common/entity/operationRequest/CommonOperationRequest";
import { OperationObject } from "./../../GN-common/entity/operationRequest/OperationObject";
import { OperationArray } from "./../../GN-common/entity/operationRequest/OperationArray";

/**
 * Converts raw request payloads into typed operation-request objects based on metadata decorators.
 */
export class RequestConverterService implements IRequestConverterService {
    // Metadata cache keyed by request/DTO class to avoid repeated reflection work.
    private declaredFieldsMap: Map<any, GNEnhancedObjectFieldMetadata[]>;

    /**
     * Returns the cached metadata for a decorated request or DTO class.
     * The cache keeps conversion fast because reflection metadata is reused across requests.
     * @param cls Decorated class that declares request fields through metadata.
     * @returns Decorated field metadata in declaration order.
     */
    public getGNEnhancedObjectFieldMetadata<T>(cls: Constructor<T>): GNEnhancedObjectFieldMetadata[] {
        let declaredFields = this.declaredFieldsMap.get(cls);
        if (declaredFields == null) {
            declaredFields = getGNObjectMetadata<GNEnhancedObjectMetadata>(cls).fields;
            this.declaredFieldsMap.set(cls, declaredFields);
        }

        return declaredFields;
    }

    /**
     * Creates a strongly typed operation request and validates every decorated field against the raw payload.
     * @param operationRequest Raw request wrapper that already exposes GearN parameters.
     * @param cls Target request type expected by the handler.
     * @returns Typed request instance populated with validation state and invalid-member details.
     */
    public createTOperationRequest<T extends OperationRequest>(operationRequest: OperationRequest, cls: Constructor<T>): T {
        let declaredFields = this.getGNEnhancedObjectFieldMetadata(cls);

        let answer = new cls();
        let answerAny = answer as any;
        answerAny.invalidMembers = [];

        answerAny.setOriginRequest = (operationRequest as any).setOriginRequest;
        answerAny.getOriginRequest = (operationRequest as any).getOriginRequest;
        answerAny.addInvalidMember = (operationRequest as any).addInvalidMember;
        answerAny.getInvalidMembers = (operationRequest as any).getInvalidMembers;

        // `CommonOperationRequest` hosts the invalid-member collection reused by every derived request type.
        let commonAnswer = answerAny as CommonOperationRequest;

        let isValidRequest = true;
        let parameters = operationRequest.getParameters();

        for (let i = 0; i < declaredFields.length; i++) {
            let field = declaredFields[i];
            let gnFieldType = field.gnFieldType;

            let containsKey = parameters.containsKey(field.code);
            let value = parameters.getObject(field.code);

            if (field.isOptional) {
                if (containsKey && value != null) {
                    if (gnFieldType == GNFieldDataType.GNHashtable) {
                        if (value instanceof GNHashtable) {
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
                        let lastValue = value;

                        answerAny[field.name] = lastValue;
                    }
                }
                else {
                    if (gnFieldType == GNFieldDataType.GNHashtable) {
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
                        let lastValue: boolean = field.defaultValue;

                        if (lastValue == null) {
                            lastValue = false;
                        }

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.Number) {
                        let lastValue: number = field.defaultValue;

                        if (lastValue == null) {
                            lastValue = 0;
                        }

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.String) {
                        let lastValue: string = field.defaultValue;

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.Other) {
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
                        let lastValue = value;

                        answerAny[field.name] = lastValue;
                    }
                }
                else {
                    if (gnFieldType == GNFieldDataType.GNHashtable) {
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
                        let lastValue = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        answerAny[field.name] = lastValue;
                    }
                }
            }
        }

        // Preserve the original request metadata so downstream handlers can still inspect the raw payload.
        answerAny.originRequest = (operationRequest as any).originRequest;
        answerAny.operationCode = operationRequest.getOperationCode();
        answerAny.requestId = operationRequest.getRequestId();
        answerAny.parameters = parameters;

        answerAny.isValid = isValidRequest;

        return answer as any as T;
    }

    /**
     * Converts a nested `GNHashtable` into a typed object using the same metadata rules as top-level requests.
     * @param gnHashtable Raw nested object payload.
     * @param cls Target DTO type for the nested payload.
     * @returns Wrapper containing the converted object and nested validation state.
     */
    public createTObject<T>(gnHashtable: GNHashtable, cls: Constructor<T>): OperationObject<T> {
        let declaredFields = this.getGNEnhancedObjectFieldMetadata(cls);

        let answer = new cls();
        let answerAny = answer as any;

        let commonAnswer = new OperationObject<T>();

        let isValidRequest = true;

        for (let i = 0; i < declaredFields.length; i++) {
            let field = declaredFields[i];
            let gnFieldType = field.gnFieldType;

            let containsKey = gnHashtable.containsKey(field.code);
            let value = gnHashtable.getObject(field.code);

            if (field.isOptional) {
                if (containsKey && value != null) {
                    if (gnFieldType == GNFieldDataType.GNHashtable) {
                        if (value instanceof GNHashtable) {
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
                        let lastValue = value;

                        answerAny[field.name] = lastValue;
                    }
                }
                else {
                    if (gnFieldType == GNFieldDataType.GNHashtable) {
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
                        let lastValue: boolean = field.defaultValue;

                        if (lastValue == null) {
                            lastValue = false;
                        }

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.Number) {
                        let lastValue: number = field.defaultValue;

                        if (lastValue == null) {
                            lastValue = 0;
                        }

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.String) {
                        let lastValue: string = field.defaultValue;

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.Other) {
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
                        let lastValue = value;

                        answerAny[field.name] = lastValue;
                    }
                }
                else {
                    if (gnFieldType == GNFieldDataType.GNHashtable) {
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
     * Converts a `GNArray` into a typed array of primitives or decorated nested objects.
     * @param gnArray Raw array payload from the request.
     * @param cls Element type expected inside the array.
     * @returns Wrapper containing the converted array and validation state.
     */
    public createTArray<T>(gnArray: GNArray, cls: Constructor<T>): OperationArray<T> {
        let tArray: T[] = [];

        let commonAnswer = new OperationArray<T>();

        let isValidRequest = true;

        let clsAny = cls as any;

        for (let i = 0; i < gnArray.count(); i++) {
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
                let lastValue = gnArray.getGNHashtable(i);

                if (clsAny == GNHashtable) {
                    answerAny = lastValue;
                }
                else {
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
     * Rebuilds a base `OperationRequest` from a transport-level request object.
     * This normalizes the parameter container into `GNHashtable` before typed conversion starts.
     * @param request Transport-level request parsed by the HTTP or socket layer.
     * @returns Base request wrapper ready for typed conversion.
     */
    public newOperationRequest(request: Request): OperationRequest {
        // Re-wrap the raw request parameters into `GNHashtable` so downstream converters can validate them uniformly.
        let answer = new CommonOperationRequest(request.getOperationCode());
        answer.setOriginRequest(request);
        answer.setRequestId(request.getRequestId());

        let parameters = new GNHashtable();
        let d = request.getParameters();

        let keys = Object.keys(d);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            parameters.add(key, d[key]);
        }

        answer.setParameters(parameters);
        return answer;
    }

    /**
     * Checks whether a numeric field satisfies the integer-only constraint declared in metadata.
     * @param number Numeric value being validated.
     * @returns `true` when the value is an integer.
     */
    private isInteger(number: number): boolean {
        return Number.isInteger(number);
    }

    /**
     * Creates the metadata cache used by request and DTO conversion.
     */
    constructor() {
        this.declaredFieldsMap = new Map<any, GNEnhancedObjectFieldMetadata[]>;
    }

}
