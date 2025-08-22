import { SecretInfo } from "./../../GN-common/entity/SecretInfo";
import { OperationRequest } from "./../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../GN-common/entity/operationResponse/OperationResponse";

export interface OnPostCallbackFunction {
	(request: {}, secretInfo: SecretInfo, operationRequest: OperationRequest, operationResponse: OperationResponse): Promise<void>;
}

export interface IPostEventCallbackService {
	subscriberEvent(eventName: string, callbackFunction: OnPostCallbackFunction): void;

	unSubscriberEvent(eventName: string, callbackFunction: OnPostCallbackFunction): void;

	onEvent(eventName: string, request: {}, secretInfo: SecretInfo, operationRequest: OperationRequest, operationResponse: OperationResponse): Promise<void>;

}

export interface OnPreCallbackFunction {
	(request: {}, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse>;
}

export interface IPreEventCallbackService {
	subscriberEvent(eventName: string, callbackFunction: OnPreCallbackFunction): void;

	unSubscriberEvent(eventName: string): void;

	onEvent(eventName: string, request: {}, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse>;

}
