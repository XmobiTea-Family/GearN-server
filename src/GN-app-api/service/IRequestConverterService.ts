import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import { GNEnhancedObjectFieldMetadata } from "./../../GN-common/entity/DataMember";
import { GNArray, GNHashtable } from "@xmobitea/gn-typescript-client";

export type Constructor<T> = { new(...args: any[]): T };

export interface IRequestConverterService {
    getGNEnhancedObjectFieldMetadata<T>(cls: Constructor<T>): GNEnhancedObjectFieldMetadata[];
    createTOperationRequest<T extends OperationRequest>(operationRequest: OperationRequest, cls: Constructor<T>): T;
    createTObject<T>(gnHashtable: GNHashtable, cls: Constructor<T>): T;
    createTArray<T>(gnArray: GNArray, cls: Constructor<T>): T;
    newOperationRequest(request: Request): OperationRequest;

}