import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import { GNEnhancedObjectFieldMetadata } from "./../../GN-common/entity/DataMember";

export type Constructor<T> = { new(...args: any[]): T };

export interface IRequestConverterService {
    getGNEnhancedObjectFieldMetadata<T extends OperationRequest>(cls: Constructor<T>): GNEnhancedObjectFieldMetadata[];
    createTOperationRequest<T extends OperationRequest>(operationRequest: OperationRequest, cls: Constructor<T>): T;
    newOperationRequest(request: Request): OperationRequest;

}