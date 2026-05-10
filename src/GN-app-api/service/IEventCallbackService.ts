import { SecretInfo, SecretRole } from "./../../GN-common/entity/SecretInfo";
import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../GN-common/entity/operationResponse/OperationResponse";

export interface OnPostCallbackFunction {
    (request: {}, secretInfo: SecretInfo, operationRequest: OperationRequest, operationResponse: OperationResponse): Promise<void>;
}

export interface IPostEventCallbackService {
    /**
     * Executes the subscriber event workflow.
     * @param eventName Provides the event name value used by this operation.
     * @param callbackFunction Provides the callback function value used by this operation.
     */
    subscriberEvent(eventName: string, callbackFunction: OnPostCallbackFunction): void;

    /**
     * Executes the un subscriber event workflow.
     * @param eventName Provides the event name value used by this operation.
     * @param callbackFunction Provides the callback function value used by this operation.
     */
    unSubscriberEvent(eventName: string, callbackFunction: OnPostCallbackFunction): void;

    /**
     * Executes the on event workflow.
     * @param eventName Provides the event name value used by this operation.
     * @param request Provides the request value used by this operation.
     * @param role Provides the role value used by this operation.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @param operationResponse Provides the operation response value used by this operation.
     */
    onEvent(eventName: string, request: {}, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest, operationResponse: OperationResponse): Promise<void>;
}

export interface OnPreCallbackFunction {
    (request: {}, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse>;
}

export interface IPreEventCallbackService {
    /**
     * Executes the subscriber event workflow.
     * @param eventName Provides the event name value used by this operation.
     * @param callbackFunction Provides the callback function value used by this operation.
     */
    subscriberEvent(eventName: string, callbackFunction: OnPreCallbackFunction): void;

    /**
     * Executes the un subscriber event workflow.
     * @param eventName Provides the event name value used by this operation.
     */
    unSubscriberEvent(eventName: string): void;

    /**
     * Executes the on event workflow.
     * @param eventName Provides the event name value used by this operation.
     * @param request Provides the request value used by this operation.
     * @param role Provides the role value used by this operation.
     * @param secretInfo Provides the secret info value used by this operation.
     * @param operationRequest Provides the operation request value used by this operation.
     * @returns Resolves with the operation result.
     */
    onEvent(eventName: string, request: {}, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse>;
}
