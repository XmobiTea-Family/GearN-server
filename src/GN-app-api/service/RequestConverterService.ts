import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { IRequestConverterService, Constructor } from "./IRequestConverterService";
import { getObjectMetadata, ObjectFieldMetadata, ObjectMetadata, initFieldMetadata, DataType } from "@clairejs/core";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import { GNHashtable, GNArray } from "./../../GN-common/common/GNData";

interface EnhancedFieldMetadata extends ObjectFieldMetadata {
    code: number;
    isOptional?: boolean;
}

interface EnhancedObjectMedata extends ObjectMetadata {
    fields: EnhancedFieldMetadata[];
}

export const DataMember = (code: number, isOptional?: boolean) => (prototype: any, propertyKey: string) => {
    let field = initFieldMetadata<EnhancedFieldMetadata>(prototype, propertyKey);
    field.code = code;
    field.isOptional = isOptional;
};

export class RequestConverterService implements IRequestConverterService {
    private declaredFieldsMap: { [k: string]: EnhancedFieldMetadata[] };

    public createTOperationRequest<T extends OperationRequest>(operationRequest: OperationRequest, cls: Constructor<T>): T
    {
        let declaredFields = this.declaredFieldsMap[cls.name];
        if (declaredFields == null) {
            declaredFields = getObjectMetadata<EnhancedObjectMedata>(cls).fields;
            this.declaredFieldsMap[cls.name] = declaredFields;
        }

        let answer = new cls() as any;
        let isValidRequest = true;
        let parameters = operationRequest.getParameters();

        for (let i = 0; i < declaredFields.length; i++) {
            let field = declaredFields[i];

            if (field.isOptional) {
                let value = parameters.getObject(field.code);
                if (value != null) {
                    let fieldType = field.dataType;

                    if (fieldType == DataType.OBJECT) {
                        if (value instanceof GNHashtable && answer[field.name] instanceof GNHashtable) {
                            let valueGNHashtable = value as GNHashtable;
                            answer[field.name] = valueGNHashtable;
                        }
                        else if (value instanceof GNArray && answer[field.name] instanceof GNArray) {
                            let valueGNArray = value as GNArray;
                            answer[field.name] = valueGNArray;
                        }
                    }
                    else answer[field.name] = value;
                }
            }
            else {
                if (parameters.containsKey(field.code)) {
                    let value = parameters.getObject(field.code);

                    if (value != null) {
                        let fieldType = field.dataType;

                        if (fieldType == DataType.OBJECT) {
                            if (value instanceof GNHashtable && answer[field.name] instanceof GNHashtable) {
                                let valueGNHashtable = value as GNHashtable;
                                answer[field.name] = valueGNHashtable;
                            }
                            else if (value instanceof GNArray && answer[field.name] instanceof GNArray) {
                                let valueGNArray = value as GNArray;
                                answer[field.name] = valueGNArray;
                            }
                            else {
                                isValidRequest = false;
                                break;
                            }
                        }
                        else answer[field.name] = value;
                    }
                    else answer[field.name] = null;
                }
                else {
                    isValidRequest = false;
                    break;
                }
            }
        }
        
        answer.originRequest = operationRequest.getOriginRequest();
        answer.operationCode = operationRequest.getOperationCode();
        answer.requestId = operationRequest.getRequestId();
        answer.parameters = parameters;

        answer.isValid = isValidRequest;

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

    constructor() {
        this.declaredFieldsMap = {};
    }
}