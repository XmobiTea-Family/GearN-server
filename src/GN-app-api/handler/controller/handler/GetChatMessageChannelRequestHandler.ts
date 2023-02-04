import { ChatParameterCode } from "./../../../../GN-common/constant/parameterCode/ChatParameterCode";
import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { RequestHandler } from "./base/RequestHandler";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";
import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ChatErrorCode } from "./../../../../GN-common/constant/errorCode/ChatErrorCode";
import { GNArray, GNHashtable } from "./../../../../GN-common/common/GNData";

class GetChatMessageChannelOperationRequest extends OperationRequest {
    @StringDataMember({ code: ChatParameterCode.Channel, minLength: 1, maxLength: 64, mustNonNull: true })
    channel: string;

    @NumberDataMember({ code: ChatParameterCode.Skip, minValue: 0, maxValue: 50, mustInt: true })
    skip: number;

    @NumberDataMember({ code: ChatParameterCode.Limit, minValue: 0, maxValue: 50, mustInt: true })
    limit: number;

    public isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetChatMessageChannelRequestHandler extends RequestHandler {
    public getCode() {
        return OperationCode.GetChatMessageChannel;
    }

    public override getCommonOperationRequest() {
        return GetChatMessageChannelOperationRequest;
    }

    public async handle(
        authInfo: AuthInfo,
        operationRequest: OperationRequest
    ): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, GetChatMessageChannelOperationRequest);

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());

        operationResponse.setReturnCode(ReturnCode.Ok);
        operationResponse.setScriptData(ParameterCode.ErrorCode, ChatErrorCode.Ok);

        let channelInfo = await this.gnServer.getChatService().getChannelInfoAsync(request.channel);
        let messages = channelInfo.messages;

        let startI = messages.length - request.skip;
        if (startI > messages.length) startI = messages.length;

        let endI = startI - request.limit;
        if (endI < 0) endI = 0;

        let gsMessages = new GNArray();
        for (let i = startI - 1; i >= endI; i--) {
            let message = messages[i];

            let gsMessage = new GNHashtable();
            gsMessage.add(ChatParameterCode.Message, message.message);
            gsMessage.add(ChatParameterCode.TsLastUpdate, message.tsLastUpdate);
            gsMessage.add(ChatParameterCode.TsCreate, message.tsCreate);

            let messageEditeds = message.messageEditeds;
            if (messageEditeds.length != 0) {
                let gsMessageEditeds = new GNArray();
                for (let j = 0; j < messageEditeds.length; j++) {
                    let messageEdited = messageEditeds[j];

                    let gsMessageEdited = new GNHashtable();

                    gsMessageEdited.add(ChatParameterCode.Message, messageEdited.message);
                    gsMessageEdited.add(ChatParameterCode.TsCreate, messageEdited.tsCreate);

                    gsMessageEditeds.add(gsMessageEdited);
                }

                gsMessage.add(ChatParameterCode.MessageEditeds, gsMessageEditeds);
            }

            gsMessage.add(ChatParameterCode.UserId, message.senderId);
            if (message.isDelete) gsMessage.add(ChatParameterCode.IsDelete, message.isDelete);

            gsMessages.add(gsMessage);
        }

        let gsChannelInfo = new GNHashtable();
        gsChannelInfo.add(ChatParameterCode.ChatMessageLst, gsMessages);

        operationResponse.setScriptData(ChatParameterCode.ChannelInfo, gsChannelInfo);

        if (this.postHandle != null) {
            await this.postHandle(authInfo, request, operationResponse);
        }

        return operationResponse;
    }
}
