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
import { xDatetime } from "./../../../../GN-library/xdatetime/lib/xDatetime";
import { ChatParameterCode } from "./../../../../GN-common/constant/parameterCode/ChatParameterCode";
import { ChatErrorCode } from "./../../../../GN-common/constant/errorCode/ChatErrorCode";
import { GNArray, GNHashtable } from "./../../../../GN-common/common/GNData";

class SendChatToUserOperationRequest extends OperationRequest {
    @StringDataMember({ code: ChatParameterCode.UserId, mustNonNull: true, minLength: 24, maxLength: 24 })
    userId: string;

    @StringDataMember({ code: ChatParameterCode.Message, mustNonNull: true, minLength: 1, maxLength: 256 })
    message: string;

    @BooleanDataMember({ code: ChatParameterCode.SaveToDatabase, defaultValue: false, isOptional: true })
    saveToDatabase: boolean;

    public isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class SendChatToUserRequestHandler extends RequestHandler {
    public override getCode() {
        return OperationCode.SendChatToUser;
    }

    public override getCommonOperationRequest() {
        return SendChatToUserOperationRequest;
    }

    static getHashPlayerChatId(userId0: string, userId1: string) {
        let answer = '';

        if (userId0 < userId1) answer = userId0 + '_' + userId1;
        else answer = userId1 + '_' + userId0;

        return answer;
    }

    public override async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());

        operationResponse.setReturnCode(ReturnCode.Ok);
        operationResponse.setScriptData(ParameterCode.ErrorCode, ChatErrorCode.Ok);

        let receiveId = request.userId;
        let senderId = authInfo.getUserId();
        let hashId = SendChatToUserRequestHandler.getHashPlayerChatId(receiveId, senderId);

        let message = request.message;

        let chatMessage = {
            "HashId": hashId,
            "SenderId": senderId,
            "Message": message,
            "TsCreate": currentMilliseconds,
            "TsLastUpdate": currentMilliseconds,
            "MessageEditeds": [] as any
        };

        let gsChatMessage = new GNHashtable();
        gsChatMessage.add(ChatParameterCode.UserId, chatMessage["SenderId"]);
        gsChatMessage.add(ChatParameterCode.Message, chatMessage["Message"]);
        gsChatMessage.add(ChatParameterCode.TsCreate, chatMessage["TsCreate"]);
        let gsChatMessageLst = new GNArray();
        gsChatMessageLst.add(gsChatMessage);

        let chatOperationEvent = new OperationEvent(EventCode.OnUserChat, new GNHashtable());
        chatOperationEvent.setScriptData(ChatParameterCode.ChatMessageLst, gsChatMessageLst);

        let tempChatOperationEvent1 = new OperationEvent(EventCode.OnUserChat, GNHashtable.builder().addAll(chatOperationEvent.getParameters().dict).build());
        tempChatOperationEvent1.setScriptData(ChatParameterCode.UserId, senderId);

        let tempChatOperationEvent2 = new OperationEvent(EventCode.OnUserChat, GNHashtable.builder().addAll(chatOperationEvent.getParameters().dict).build());
        tempChatOperationEvent2.setScriptData(ChatParameterCode.UserId, receiveId);

        if (this.postHandle != null) {
            await this.postHandle(authInfo, request, operationResponse, chatMessage, tempChatOperationEvent1, tempChatOperationEvent2);
        }

        this.gnServer.sendEventTo(receiveId, tempChatOperationEvent1);
        this.gnServer.sendEventTo(senderId, tempChatOperationEvent2);

        if (request.saveToDatabase) {
            let collection = this.gnServer.getDatabase().runtimeGameCollection("UserMessageCollection");

            collection.insertOne(chatMessage);
        }

        return operationResponse;
    }

}
