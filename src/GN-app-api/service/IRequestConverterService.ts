import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";

export type Constructor<T> = { new(...args: any[]): T };

export interface IRequestConverterService {
    createTOperationRequest<T extends OperationRequest>(operationRequest: OperationRequest, cls: Constructor<T>): T;
    newOperationRequest(request: Request): OperationRequest;

}