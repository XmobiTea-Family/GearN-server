import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { IRequestConverterService, Constructor } from "./IRequestConverterService";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import { GNHashtable, GNArray, GNData } from "./../../GN-common/common/GNData";
import { EnhancedFieldMetadata, EnhancedObjectMedata } from "./../../GN-common/entity/DataMember";
import { getObjectMetadata, DataType } from "@clairejs/core";
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
            let fieldType = field.dataType;

            let containsKey = parameters.containsKey(field.code);
            let value = parameters.getObject(field.code);

            if (field.isOptional) {
                if (containsKey && value != null) {
                    if (fieldType == DataType.OBJECT) {
                        if (value instanceof GNHashtable && answerAny[field.name] instanceof GNHashtable) {
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
                        else if (value instanceof GNArray && answerAny[field.name] instanceof GNArray) {
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
                    else if (fieldType == DataType.BOOLEAN) {
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
                    else if (fieldType == DataType.NUMBER) {
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
                                
                                if (lastValue < field.minLength) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMinValue
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }
    
                                if (lastValue > field.minLength) {
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
                    else if (fieldType == DataType.STRING) {
                        let lastValue: string = value as any as string;

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
                            else if (lastValue.length > field.minLength) {
                                answer.addInvalidMember({
                                    code: field.code,
                                    invalidMemberType: InvalidMemberType.StringMaxLength
                                });
            
                                isValidRequest = false;
                                break;
                            }
                        }

                        answerAny[field.name] = lastValue;
                    }
                }
                else {
                    if (fieldType == DataType.OBJECT) {
                        let lastValue: GNData = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        if (answerAny[field.name] instanceof GNHashtable) {
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
                        else if (answerAny[field.name] instanceof GNArray) {
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
                    else if (fieldType == DataType.BOOLEAN) {
                        let lastValue: boolean = false;

                        if (field.defaultValue != null) lastValue = field.defaultValue;
                        
                        answerAny[field.name] = lastValue;
                    }
                    else if (fieldType == DataType.NUMBER) {
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

                            if (lastValue > field.minLength) {
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
                    else if (fieldType == DataType.STRING) {
                        let lastValue: string = null;

                        if (field.defaultValue != null) lastValue = field.defaultValue;

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
                            else if (lastValue.length > field.minLength) {
                                answer.addInvalidMember({
                                    code: field.code,
                                    invalidMemberType: InvalidMemberType.StringMaxLength
                                });
            
                                isValidRequest = false;
                                break;
                            }
                        }

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
                    if (fieldType == DataType.OBJECT) {
                        if (value instanceof GNHashtable && answerAny[field.name] instanceof GNHashtable) {
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
                        else if (value instanceof GNArray && answerAny[field.name] instanceof GNArray) {
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

                            isValidRequest = false;
                            break;
                        }
                    }
                    else if (fieldType == DataType.BOOLEAN) {
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
                    else if (fieldType == DataType.NUMBER) {
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
                                
                                if (lastValue < field.minLength) {
                                    answer.addInvalidMember({
                                        code: field.code,
                                        invalidMemberType: InvalidMemberType.NumberMinValue
                                    });
                
                                    isValidRequest = false;
                                    break;
                                }

                                if (lastValue > field.minLength) {
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
                    else if (fieldType == DataType.STRING) {
                        let lastValue: string = value as any as string;

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
                            else if (lastValue.length > field.minLength) {
                                answer.addInvalidMember({
                                    code: field.code,
                                    invalidMemberType: InvalidMemberType.StringMaxLength
                                });
            
                                isValidRequest = false;
                                break;
                            }
                        }

                        answerAny[field.name] = lastValue;
                    }
                }
                else {
                    if (fieldType == DataType.OBJECT) {
                        let lastValue: GNData = null;
                        if (field.defaultValue != null) lastValue = field.defaultValue;

                        if (answerAny[field.name] instanceof GNHashtable) {
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
                        else if (answerAny[field.name] instanceof GNArray) {
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
                    else if (fieldType == DataType.BOOLEAN) {
                        let lastValue: boolean = false;
                        
                        answerAny[field.name] = lastValue;
                    }
                    else if (fieldType == DataType.NUMBER) {
                        let lastValue: number = 0;

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

                            if (lastValue > field.minLength) {
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
                    else if (fieldType == DataType.STRING) {
                        let lastValue: string = null;

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
                            else if (lastValue.length > field.minLength) {
                                answer.addInvalidMember({
                                    code: field.code,
                                    invalidMemberType: InvalidMemberType.StringMaxLength
                                });
            
                                isValidRequest = false;
                                break;
                            }
                        }

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