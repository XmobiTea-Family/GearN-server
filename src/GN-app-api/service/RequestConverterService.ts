import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { IRequestConverterService, Constructor } from "./IRequestConverterService";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import { GNHashtable, GNArray, GNData } from "./../../GN-common/common/GNData";
import { GNEnhancedObjectFieldMetadata, GNEnhancedObjectMedata, GNFieldDataType, getGNObjectMetadata } from "./../../GN-common/entity/DataMember";
import { InvalidMemberType } from "./../../GN-common/constant/enumType/InvalidMemberType";
import { CommonOperationRequest } from "./../../GN-common/entity/operationRequest/CommonOperationRequest";

export class RequestConverterService implements IRequestConverterService {
    private declaredFieldsMap: { [k: string]: GNEnhancedObjectFieldMetadata[] };

    public createTOperationRequest<T extends OperationRequest>(operationRequest: OperationRequest, cls: Constructor<T>): T {
        let declaredFields = this.declaredFieldsMap[cls.name];
        if (declaredFields == null) {
            declaredFields = getGNObjectMetadata<GNEnhancedObjectMedata>(cls).fields;
            this.declaredFieldsMap[cls.name] = declaredFields;
        }

        let answer = new cls();
        let answerAny = answer as any;
        answerAny.invalidMembers = [];
        let commonAnswer = answerAny as CommonOperationRequest;

        let isValidRequest = true;
        let parameters = operationRequest.getParameters();
        let encrypted = operationRequest.isEncrypted();

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
                                if (lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMaxLength
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
                    else if (gnFieldType == GNFieldDataType.GNArray) {
                        if (value instanceof GNArray) {
                            let lastValue = value as GNArray;

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
                                if (lastValue.count() < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (lastValue.count() > field.maxLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMaxLength
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
                    else if (gnFieldType == GNFieldDataType.Boolean) {
                        if (typeof value === "boolean") {
                            let lastValue: boolean = value as any as boolean;

                            if (lastValue == null) {
                                lastValue = false;
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
                    else if (gnFieldType == GNFieldDataType.Number) {
                        if (typeof value === "number") {
                            let lastValue: number = value as any as number;

                            if (lastValue == null) {
                                lastValue = 0;
                            }

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

                                if (lastValue < field.minValue) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMinValue
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (lastValue > field.maxValue) {
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
                                    if (lastValue.length < field.minLength) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.StringMinLength
                                        });

                                        isValidRequest = false;
                                        break;
                                    }
                                    else if (lastValue.length > field.maxLength) {
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
                    if (gnFieldType == GNFieldDataType.GNHashtable || gnFieldType == GNFieldDataType.GNArray) {
                        let lastValue: GNData = field.defaultValue;

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.Boolean) {
                        let lastValue: boolean = field.defaultValue;

                        answerAny[field.name] = lastValue;
                    }
                    else if (gnFieldType == GNFieldDataType.Number) {
                        let lastValue: number = field.defaultValue;

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
                                    if (lastValue.count() < field.minLength) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.GNHashtableMinLength
                                        });

                                        isValidRequest = false;
                                        break;
                                    }
                                    else if (lastValue.count() > field.maxLength) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.GNHashtableMaxLength
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
                    else if (gnFieldType == GNFieldDataType.GNArray) {
                        if (value instanceof GNArray) {
                            let lastValue = value as GNArray;

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
                                    if (lastValue.count() < field.minLength) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.GNArrayMinLength
                                        });

                                        isValidRequest = false;
                                        break;
                                    }
                                    else if (lastValue.count() > field.maxLength) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.GNArrayMaxLength
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

                                if (lastValue < field.minValue) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMinValue
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (lastValue > field.maxValue) {
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
                                    if (lastValue.length < field.minLength) {
                                        commonAnswer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.StringMinLength
                                        });

                                        isValidRequest = false;
                                        break;
                                    }
                                    else if (lastValue.length > field.maxLength) {
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
                    if (gnFieldType == GNFieldDataType.GNHashtable || gnFieldType == GNFieldDataType.GNArray) {
                        let lastValue: GNData = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        if (field.activeConditionValid) {
                            if (field.mustNonNull) {
                                if (lastValue == null) {
                                    let invalidMemberType = gnFieldType == GNFieldDataType.GNHashtable ? InvalidMemberType.GNHashtableNull : InvalidMemberType.GNArrayNull;
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: invalidMemberType
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (lastValue != null) {
                                if (lastValue.count() < field.minLength) {
                                    let invalidMemberType = gnFieldType == GNFieldDataType.GNHashtable ? InvalidMemberType.GNHashtableMinLength : InvalidMemberType.GNArrayMinLength;
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: invalidMemberType
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (lastValue.count() > field.maxLength) {
                                    let invalidMemberType = gnFieldType == GNFieldDataType.GNHashtable ? InvalidMemberType.GNHashtableMaxLength : InvalidMemberType.GNArrayMaxLength;
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: invalidMemberType
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                            }
                        }

                        answerAny[field.name] = lastValue;
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
                                if (lastValue.length < field.minLength) {
                                    commonAnswer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringMinLength
                                    });

                                    isValidRequest = false;
                                    break;
                                }
                                else if (lastValue.length > field.maxLength) {
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
        answerAny.encrypted = encrypted;

        answerAny.isValid = isValidRequest;

        return answer as any as T;
    }

    public newOperationRequest(request: Request): OperationRequest {
        let answer = new CommonOperationRequest(request.getCode(), request.isEncrypted());
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
        this.declaredFieldsMap = {};
    }

}