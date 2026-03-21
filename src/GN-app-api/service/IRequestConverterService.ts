import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { Request } from "./../../GN-common/entity/operationRequest/base/Request";
import { OperationObject } from "./../../GN-common/entity/operationRequest/OperationObject";
import { OperationArray } from "./../../GN-common/entity/operationRequest/OperationArray";
import { GNArray, GNHashtable } from "./../../GN-common/common/GNData";
import { GNEnhancedObjectFieldMetadata } from "./../../GN-common/entity/DataMember";

export type Constructor<T> = { new(...args: any[]): T };

export interface IRequestConverterService {
	/**
	 * Returns the GearN enhanced object field metadata.
	 * @param cls Provides the cls value used by this operation.
	 * @returns Returns the GearN enhanced object field metadata.
	 */
	getGNEnhancedObjectFieldMetadata<T>(cls: Constructor<T>): GNEnhancedObjectFieldMetadata[];
	/**
	 * Creates the operation request.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @param cls Provides the cls value used by this operation.
	 * @returns Returns the operation result.
	 */
	createTOperationRequest<T extends OperationRequest>(operationRequest: OperationRequest, cls: Constructor<T>): T;
	/**
	 * Creates the object.
	 * @param gnHashtable Provides the GearN hashtable value used by this operation.
	 * @param cls Provides the cls value used by this operation.
	 * @returns Returns the operation result.
	 */
	createTObject<T>(gnHashtable: GNHashtable, cls: Constructor<T>): OperationObject<T>;
	/**
	 * Creates the array.
	 * @param gnArray Provides the GearN array value used by this operation.
	 * @param cls Provides the cls value used by this operation.
	 * @returns Returns the operation result.
	 */
	createTArray<T>(gnArray: GNArray, cls: Constructor<T>): OperationArray<T>;
	/**
	 * Executes the new operation request workflow.
	 * @param request Provides the request value used by this operation.
	 * @returns Returns the operation result.
	 */
	newOperationRequest(request: Request): OperationRequest;

}
