import { ChatErrorCode } from "./../../../../GN-common/constant/errorCode/ChatErrorCode";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";
import { ChatParameterCode } from "./../../../../GN-common/constant/parameterCode/ChatParameterCode";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";
import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { RequestHandler } from "./base/RequestHandler";

class LeaveChatChannelOperationRequest extends OperationRequest {
    @StringDataMember({ code: ChatParameterCode.Channel, minLength: 1, maxLength: 64, mustNonNull: true })
    channel: string;

    public isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class LeaveChatChannelRequestHandler extends RequestHandler {
    public getCode() {
        return OperationCode.LeaveChatChannel;
    }

    public override getCommonOperationRequest() {
        return LeaveChatChannelOperationRequest;
    }

    public async handle(
        authInfo: AuthInfo,
        operationRequest: OperationRequest
    ): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());

        operationResponse.setReturnCode(ReturnCode.Ok);
        operationResponse.setScriptData(ParameterCode.ErrorCode, ChatErrorCode.Ok);

        this.gnServer.getChatService().unSubscriberChannelAsync(authInfo.getUserId(), request.channel);

        this.gnServer.leaveRoom(request.channel, request.channel);

        if (this.postHandle != null) {
            await this.postHandle(authInfo, request, operationResponse);
        }

        return operationResponse;
    }
}
