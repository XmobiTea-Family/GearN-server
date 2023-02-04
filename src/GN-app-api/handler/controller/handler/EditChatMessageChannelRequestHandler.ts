import { ChatErrorCode } from "./../../../../GN-common/constant/errorCode/ChatErrorCode";
import { EventCode } from "./../../../../GN-common/constant/EventCode";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { OperationEvent } from "./../../../../GN-common/entity/operationEvent/OperationEvent";
import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { RequestHandler } from "./base/RequestHandler";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";
import { ChatParameterCode } from "./../../../../GN-common/constant/parameterCode/ChatParameterCode";
import { xDatetime } from "./../../../../GN-library/xdatetime/lib/xDatetime";
import { GNArray, GNHashtable } from "./../../../../GN-common/common/GNData";

class EditChatMessageChannelOperationRequest extends OperationRequest {
    @NumberDataMember({ code: ChatParameterCode.TsCreate, mustInt: true })
    tsCreate: number;

    @StringDataMember({ code: ChatParameterCode.Channel, minLength: 1, maxLength: 64, mustNonNull: true })
    channel: string;

    @StringDataMember({ code: ChatParameterCode.Message, minLength: 1, maxLength: 256, isOptional: true })
    message: string;

    @BooleanDataMember({ code: ChatParameterCode.IsDelete, isOptional: true })
    isDelete: boolean;

    public isValidRequest() {
        if (!super.isValidRequest()) return false;

        if (this.message == null && this.isDelete == null) return false;

        return true;
    }
}

export class EditChatMessageChannelRequestHandler extends RequestHandler {
    public getCode() {
        return OperationCode.EditChatMessageChannel;
    }

    public override getCommonOperationRequest() {
        return EditChatMessageChannelOperationRequest;
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

        let chatMessage = await this.gnServer.getChatService().editChatMessageAsync(authInfo.getUserId(), false, request.tsCreate, request.channel, request.message, request.isDelete);

        if (chatMessage == null) {
            operationResponse.setScriptData(ParameterCode.ErrorCode, ChatErrorCode.UserDoesNotSender);
        }
        else {
            operationResponse.setScriptData(ParameterCode.ErrorCode, ChatErrorCode.Ok);

            let chatOperationEvent = new OperationEvent(EventCode.OnChannelChat, new GNHashtable());

            let gsChatMessage = new GNHashtable();
            gsChatMessage.add(ChatParameterCode.Channel, chatMessage.channel);
            gsChatMessage.add(ChatParameterCode.TsCreate, chatMessage.tsCreate);

            if (request.message != null) {
                gsChatMessage.add(ChatParameterCode.Message, chatMessage.message);

                let gsMessageEditeds = new GNArray();
                {
                    let gsMessageEdited = new GNHashtable();

                    gsMessageEdited.add(ChatParameterCode.Message, request.message);
                    gsMessageEdited.add(ChatParameterCode.TsCreate, xDatetime.getCurrentMilliseconds());

                    gsMessageEditeds.add(gsMessageEdited);
                }

                gsChatMessage.add(ChatParameterCode.MessageEdited, gsMessageEditeds);
            }

            if (request.isDelete != null) {
                gsChatMessage.add(ChatParameterCode.IsDelete, chatMessage.isDelete);
            }

            gsChatMessage.add(ChatParameterCode.TsLastUpdate, chatMessage.tsLastUpdate);

            chatOperationEvent.setScriptData(ChatParameterCode.ChatMessage, gsChatMessage);

            this.gnServer.sendEventToRoom(request.channel, chatOperationEvent);
        }

        return operationResponse;
    }
}
