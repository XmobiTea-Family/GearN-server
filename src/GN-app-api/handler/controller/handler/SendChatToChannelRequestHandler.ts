import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";
import { OperationEvent } from "./../../../../GN-common/entity/operationEvent/OperationEvent";
import { EventCode } from "./../../../../GN-common/constant/EventCode";
import { ChatParameterCode } from "./../../../../GN-common/constant/parameterCode/ChatParameterCode";
import { ChatErrorCode } from "./../../../../GN-common/constant/errorCode/ChatErrorCode";
import { GNArray, GNHashtable } from "./../../../../GN-common/common/GNData";

class SendChatToChannelOperationRequest extends OperationRequest {
    @StringDataMember({ code: ChatParameterCode.Channel, minLength: 1, maxLength: 64, mustNonNull: true })
    channel: string;

    @StringDataMember({ code: ChatParameterCode.Message, minLength: 1, maxLength: 256, mustNonNull: true })
    message: string;

    public isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class SendChatToChannelRequestHandler extends RequestHandler {
    public getCode() {
        return OperationCode.SendChatToChannel;
    }

    public override getCommonOperationRequest() {
        return SendChatToChannelOperationRequest;
    }

    public async handle(
        authInfo: AuthInfo,
        operationRequest: OperationRequest
    ): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        // let gamePlayer = await this.gnServer.getDatabase().loadGamePlayer(authInfo.getUserId());

        let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());

        operationResponse.setReturnCode(ReturnCode.Ok);
        operationResponse.setScriptData(ParameterCode.ErrorCode, ChatErrorCode.Ok);

        let chatMessage = await this.gnServer.getChatService().addChatMessageAsync(authInfo.getUserId(), request.channel, request.message);

        let chatOperationEvent = new OperationEvent(EventCode.OnChannelChat, new GNHashtable());

        let gsChatMessage = new GNHashtable();
        gsChatMessage.add(ChatParameterCode.Message, chatMessage.message);
        gsChatMessage.add(ChatParameterCode.TsCreate, chatMessage.tsCreate);
        gsChatMessage.add(ChatParameterCode.UserId, chatMessage.senderId);
        let gsChatMessageLst = new GNArray();
        gsChatMessageLst.add(gsChatMessage);

        let gsChannelInfo = new GNHashtable();
        gsChannelInfo.add(ChatParameterCode.Channel, chatMessage.channel);
        gsChannelInfo.add(ChatParameterCode.ChatMessageLst, gsChatMessageLst);
        chatOperationEvent.setScriptData(ChatParameterCode.ChannelInfo, gsChannelInfo);

        if (this.postHandle != null) {
            await this.postHandle(authInfo, request, operationResponse, chatMessage, chatOperationEvent);
        }

        this.gnServer.sendEventToRoom(request.channel, chatOperationEvent);

        return operationResponse;
    }
}
