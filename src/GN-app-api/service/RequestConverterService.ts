import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { IRequestConverterService, Constructor } from "./IRequestConverterService";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import { GNHashtable, GNArray, GNData } from "./../../GN-common/common/GNData";
import { EnhancedFieldMetadata, EnhancedObjectMedata, FieldType } from "./../../GN-common/entity/DataMember";
import { getObjectMetadata } from "@clairejs/core";
import { InvalidMemberType } from "./../../GN-common/constant/enumType/InvalidMemberType";

export class RequestConverterService implements IRequestConverterService {
    private declaredFieldsMap: { [k: string]: EnhancedFieldMetadata[] };

    public createTOperationRequest<T extends OperationRequest>(operationRequest: OperationRequest, cls: Constructor<T>): T
    {
        let declaredFields = this.declaredFieldsMap[cls.name];
        if (declaredFields == null) {
            declaredFields = getObjectMetadata<EnhancedObjectMedata>(cls).fields;
            this.declaredFieldsMap[cls.name] = declaredFields;
        }

        let answer = new cls();
        let answerAny = answer as any;
        let isValidRequest = true;
        let parameters = operationRequest.getParameters();

        for (let i = 0; i < declaredFields.length; i++) {
            let field = declaredFields[i];
            let fieldType = field.fieldType;

            let containsKey = parameters.containsKey(field.code);
            let value = parameters.getObject(field.code);

            if (field.isOptional) {
                if (containsKey && value != null) {
                    if (fieldType == FieldType.GNHashtable) {
                        if (value instanceof GNHashtable) {
                            let lastValue = value as GNHashtable;

                            if (field.mustNonNull) {
                                if (lastValue == null) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableNull
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (lastValue != null) {
                                if (lastValue.count() < field.minLength) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNHashtableMinLength
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                                else if (lastValue.count() > field.maxLength) {
                                    answer.addInvalidMember({
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
                            answer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });
        
                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (fieldType == FieldType.GNArray) {
                        if (value instanceof GNArray) {
                            let lastValue = value as GNArray;

                            if (field.mustNonNull) {
                                if (lastValue == null) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayNull
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                            }

                            if (lastValue != null) {
                                if (lastValue.count() < field.minLength) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.GNArrayMinLength
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                                else if (lastValue.count() > field.maxLength) {
                                    answer.addInvalidMember({
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
                            answer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });
        
                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (fieldType == FieldType.Boolean) {
                        if (typeof value === "boolean") {
                            let lastValue: boolean = value as any as boolean;
    
                            if (lastValue == null) {
                                lastValue = false;
                            }
    
                            answerAny[field.name] = lastValue;
                        }
                        else {
                            answer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });
        
                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (fieldType == FieldType.Number) {
                        if (typeof value === "number") {
                            let lastValue: number = value as any as number;
    
                            if (lastValue == null) {
                                lastValue = 0;
                            }
    
                            if (field.activeConditionValid) {
                                if (field.mustInt === true) {
                                    if (!this.isInteger(lastValue)) {
                                        answer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.NumberMustInt
                                        });
                    
                                        isValidRequest = false;
                                        break;
                                    }
                                }
                                
                                if (lastValue < field.minValue) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMinValue
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                                else if (lastValue > field.maxValue) {
                                    answer.addInvalidMember({
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
                            answer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });
        
                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (fieldType == FieldType.String) {
                        if (typeof value === "string") {
                            let lastValue: string = value as any as string;

                            if (field.activeConditionValid) {
                                if (field.mustNonNull) {
                                    if (lastValue == null) {
                                        answer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.StringNull
                                        });
                    
                                        isValidRequest = false;
                                        break;
                                    }
                                }
        
                                if (lastValue != null) {
                                    if (lastValue.length < field.minLength) {
                                        answer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.StringMinLength
                                        });
                    
                                        isValidRequest = false;
                                        break;
                                    }
                                    else if (lastValue.length > field.maxLength) {
                                        answer.addInvalidMember({
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
                            answer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });
        
                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (fieldType == FieldType.Other) {
                        let lastValue = value;

                        answerAny[field.name] = lastValue;
                    }
                }
                else {
                    if (fieldType == FieldType.GNHashtable || fieldType == FieldType.GNArray) {
                        let lastValue: GNData = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        if (field.activeConditionValid) {
                            if (field.mustNonNull) {
                                let invalidMemberType = fieldType == FieldType.GNHashtable ? InvalidMemberType.GNHashtableNull : InvalidMemberType.GNArrayNull;
                                if (lastValue == null) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: invalidMemberType
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                            }
    
                            if (lastValue != null) {
                                if (lastValue.count() < field.minLength) {
                                    let invalidMemberType = fieldType == FieldType.GNHashtable ? InvalidMemberType.GNHashtableMinLength : InvalidMemberType.GNArrayMinLength;
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: invalidMemberType
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                                else if (lastValue.count() > field.maxLength) {
                                    let invalidMemberType = fieldType == FieldType.GNHashtable ? InvalidMemberType.GNHashtableMaxLength : InvalidMemberType.GNArrayMaxLength;
                                    answer.addInvalidMember({
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
                    else if (fieldType == FieldType.Boolean) {
                        let lastValue: boolean = false;
                        if (field.defaultValue != null) lastValue = field.defaultValue;
                        
                        answerAny[field.name] = lastValue;
                    }
                    else if (fieldType == FieldType.Number) {
                        let lastValue: number = 0;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        if (field.activeConditionValid) {
                            if (field.mustInt === true) {
                                if (!this.isInteger(lastValue)) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMustInt
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                            }
                            
                            if (lastValue < field.minValue) {
                                answer.addInvalidMember({
                                    code: field.code,
                                    invalidMemberType: InvalidMemberType.NumberMinValue
                                });
            
                                isValidRequest = false;
                                break;
                            }
                            else if (lastValue > field.maxValue) {
                                answer.addInvalidMember({
                                    code: field.code,
                                    invalidMemberType: InvalidMemberType.NumberMaxValue
                                });
            
                                isValidRequest = false;
                                break;
                            }
                        }

                        answerAny[field.name] = lastValue;
                    }
                    else if (fieldType == FieldType.String) {
                        let lastValue: string = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        if (field.activeConditionValid) {
                            if (field.mustNonNull) {
                                if (lastValue == null) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringNull
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                            }
    
                            if (lastValue != null) {
                                if (lastValue.length < field.minLength) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringMinLength
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                                else if (lastValue.length > field.maxLength) {
                                    answer.addInvalidMember({
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
                    else if (fieldType == FieldType.Other) {
                        let lastValue = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        answerAny[field.name] = lastValue;
                    }
                }
            }
            else {
                if (!containsKey) {
                    answer.addInvalidMember({
                        code: field.code,
                        invalidMemberType: InvalidMemberType.DataRequired
                    });

                    isValidRequest = false;
                    break;
                }

                if (value != null) {
                    if (fieldType == FieldType.GNHashtable) {
                        if (value instanceof GNHashtable) {
                            let lastValue = value as GNHashtable;

                            if (field.activeConditionValid) {
                                if (field.mustNonNull) {
                                    if (lastValue == null) {
                                        answer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.GNHashtableNull
                                        });
                    
                                        isValidRequest = false;
                                        break;
                                    }
                                }
    
                                if (lastValue != null) {
                                    if (lastValue.count() < field.minLength) {
                                        answer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.GNHashtableMinLength
                                        });
                    
                                        isValidRequest = false;
                                        break;
                                    }
                                    else if (lastValue.count() > field.maxLength) {
                                        answer.addInvalidMember({
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
                            answer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (fieldType == FieldType.GNArray) {
                        if (value instanceof GNArray) {
                            let lastValue = value as GNArray;

                            if (field.activeConditionValid) {
                                if (field.mustNonNull) {
                                    if (lastValue == null) {
                                        answer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.GNArrayNull
                                        });
                    
                                        isValidRequest = false;
                                        break;
                                    }
                                }
    
                                if (lastValue != null) {
                                    if (lastValue.count() < field.minLength) {
                                        answer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.GNArrayMinLength
                                        });
                    
                                        isValidRequest = false;
                                        break;
                                    }
                                    else if (lastValue.count() > field.maxLength) {
                                        answer.addInvalidMember({
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
                            answer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (fieldType == FieldType.Boolean) {
                        if (typeof value === "boolean") {
                            let lastValue: boolean = value as any as boolean;
                        
                            answerAny[field.name] = lastValue;
                        }
                        else {
                            answer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });
        
                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (fieldType == FieldType.Number) {
                        if (typeof value === "number") {
                            let lastValue: number = value as any as number;

                            if (field.activeConditionValid) {
                                if (field.mustInt === true) {
                                    if (!this.isInteger(lastValue)) {
                                        answer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.NumberMustInt
                                        });
                    
                                        isValidRequest = false;
                                        break;
                                    }
                                }
                                
                                if (lastValue < field.minValue) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMinValue
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                                else if (lastValue > field.maxValue) {
                                    answer.addInvalidMember({
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
                            answer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });
        
                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (fieldType == FieldType.String) {
                        if (typeof value === "string") {
                            let lastValue: string = value as any as string;

                            if (field.activeConditionValid) {
                                if (field.mustNonNull) {
                                    if (lastValue == null) {
                                        answer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.StringNull
                                        });
                    
                                        isValidRequest = false;
                                        break;
                                    }
                                }
        
                                if (lastValue != null) {
                                    if (lastValue.length < field.minLength) {
                                        answer.addInvalidMember({
                                            code: field.code,
                                            invalidMemberType: InvalidMemberType.StringMinLength
                                        });
                    
                                        isValidRequest = false;
                                        break;
                                    }
                                    else if (lastValue.length > field.maxLength) {
                                        answer.addInvalidMember({
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
                            answer.addInvalidMember({
                                code: field.code,
                                invalidMemberType: InvalidMemberType.TypeInvalid
                            });
        
                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (fieldType == FieldType.Other) {
                        let lastValue = value;

                        answerAny[field.name] = lastValue;
                    }
                }
                else {
                    if (fieldType == FieldType.GNHashtable || fieldType == FieldType.GNArray) {
                        let lastValue: GNData = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        if (field.activeConditionValid) {
                            if (field.mustNonNull) {
                                if (lastValue == null) {
                                    let invalidMemberType = fieldType == FieldType.GNHashtable ? InvalidMemberType.GNHashtableNull : InvalidMemberType.GNArrayNull;
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: invalidMemberType
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                            }
    
                            if (lastValue != null) {
                                if (lastValue.count() < field.minLength) {
                                    let invalidMemberType = fieldType == FieldType.GNHashtable ? InvalidMemberType.GNHashtableMinLength : InvalidMemberType.GNArrayMinLength;
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: invalidMemberType
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                                else if (lastValue.count() > field.maxLength) {
                                    let invalidMemberType = fieldType == FieldType.GNHashtable ? InvalidMemberType.GNHashtableMaxLength : InvalidMemberType.GNArrayMaxLength;
                                    answer.addInvalidMember({
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
                    else if (fieldType == FieldType.Boolean) {
                        let lastValue: boolean = false;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        answerAny[field.name] = lastValue;
                    }
                    else if (fieldType == FieldType.Number) {
                        let lastValue: number = 0;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        if (field.activeConditionValid) {
                            if (field.mustInt === true) {
                                if (!this.isInteger(lastValue)) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMustInt
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                            }
                            
                            if (lastValue < field.minLength) {
                                answer.addInvalidMember({
                                    code: field.code,
                                    invalidMemberType: InvalidMemberType.NumberMinValue
                                });
            
                                isValidRequest = false;
                                break;
                            }
                            else if (lastValue > field.maxLength) {
                                answer.addInvalidMember({
                                    code: field.code,
                                    invalidMemberType: InvalidMemberType.NumberMaxValue
                                });
            
                                isValidRequest = false;
                                break;
                            }
                        }

                        answerAny[field.name] = lastValue;
                    }
                    else if (fieldType == FieldType.String) {
                        let lastValue: string = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        if (field.activeConditionValid) {
                            if (field.mustNonNull) {
                                if (lastValue == null) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringNull
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                            }
    
                            if (lastValue != null) {
                                if (lastValue.length < field.minLength) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.StringMinLength
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
                                else if (lastValue.length > field.maxLength) {
                                    answer.addInvalidMember({
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
                    else if (fieldType == FieldType.Other) {
                        let lastValue = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        answerAny[field.name] = lastValue;
                    }
                }
            }
        }
        
        answerAny.originRequest = operationRequest.getOriginRequest();
        answerAny.operationCode = operationRequest.getOperationCode();
        answerAny.requestId = operationRequest.getRequestId();
        answerAny.parameters = parameters;

        answerAny.isValid = isValidRequest;

        return answer;
    }

    public newOperationRequest(request: Request): OperationRequest {
		let answer = new OperationRequest() as any;
		answer.originRequest = request;
		answer.operationCode = request.getCode();
		answer.requestId = request.getRequestId();
		let gnHashtable = new GNHashtable();

		let d = request.getParameters();

		let keys = Object.keys(d);
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];

			let keyInt = Number.parseInt(key);
			
			if (!isNaN(keyInt))
				gnHashtable.add(keyInt, d[key]);
		}

		answer.parameters = gnHashtable;

		return answer;
	}

    private isInteger(number: number): boolean {
        return Number.isInteger(number);
    }

    constructor() {
        this.declaredFieldsMap = {};
    }
}