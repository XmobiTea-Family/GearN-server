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
    private declaredFieldsMap: Map<any, GNEnhancedObjectFieldMetadata[]>;

    public getGNEnhancedObjectFieldMetadata<T>(cls: Constructor<T>): GNEnhancedObjectFieldMetadata[] {
        let declaredFields = this.declaredFieldsMap.get(cls);
        if (declaredFields == null) {
            declaredFields = getGNObjectMetadata<GNEnhancedObjectMetadata>(cls).fields;
            this.declaredFieldsMap.set(cls, declaredFields);
        }

        return declaredFields;
    }

    public createTOperationRequest<T extends OperationRequest>(operationRequest: OperationRequest, cls: Constructor<T>): T {
        let declaredFields = this.getGNEnhancedObjectFieldMetadata(cls);

        let answer = new cls();
        let answerAny = answer as any;
        answerAny.invalidMembers = [];

        answerAny.setOriginRequest = (operationRequest as any).setOriginRequest;
        answerAny.getOriginRequest = (operationRequest as any).getOriginRequest;
        answerAny.addInvalidMember = (operationRequest as any).addInvalidMember;
        answerAny.getInvalidMembers = (operationRequest as any).getInvalidMembers;

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

        answerAny.originRequest = (operationRequest as any).originRequest;
        answerAny.operationCode = operationRequest.getOperationCode();
        answerAny.requestId = operationRequest.getRequestId();
        answerAny.parameters = parameters;

        answerAny.isValid = isValidRequest;

        return answer as any as T;
    }

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

    public newOperationRequest(request: Request): OperationRequest {
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

    private isInteger(number: number): boolean {
        return Number.isInteger(number);
    }

    constructor() {
        this.declaredFieldsMap = new Map<any, GNEnhancedObjectFieldMetadata[]>;
    }

}