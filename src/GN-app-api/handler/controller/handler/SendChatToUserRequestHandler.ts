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
import { Md5Generate } from "./../../../../GN-common/helper/Md5Generate";
import { GNArray, GNHashtable } from "../../../../GN-common/common/GNData";

class SendChatToUserOperationRequest extends OperationRequest {
    @StringDataMember({ code: ChatParameterCode.UserId, mustNonNull: true, minLength: 24, maxLength: 24 })
    userId: string;

    @StringDataMember({ code: ChatParameterCode.Message, mustNonNull: true, minLength: 3, maxLength: 128 })
    message: string;

    @BooleanDataMember({ code: ChatParameterCode.SaveToDatabase })
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

        if (userId0 < userId1) answer = userId0 + userId1;
        else answer = userId1 + userId0;

        answer = Md5Generate.getMd5(answer);

        return answer;
    }

    public override async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();
        // let gamePlayer = await this.gnServer.getDatabase().loadGamePlayer(authInfo.getUserId());

        let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());

        operationResponse.setReturnCode(ReturnCode.Ok);
        operationResponse.setScriptData(ParameterCode.ErrorCode, ChatErrorCode.Ok);

        let receiveId = request.userId;
        let senderId = authInfo.getUserId();
        let message = request.message;

        let gsChatMessage = new GNHashtable();
        gsChatMessage.add(ChatParameterCode.UserId, senderId);
        gsChatMessage.add(ChatParameterCode.Message, message);
        gsChatMessage.add(ChatParameterCode.TsCreate, currentMilliseconds);
        let gsChatMessageLst = new GNArray();
        gsChatMessageLst.add(gsChatMessage);

        let chatOperationEvent = new OperationEvent(EventCode.OnPlayerChat, new GNHashtable());
        chatOperationEvent.setScriptData(ChatParameterCode.ChatMessageLst, gsChatMessageLst);
        this.gnServer.sendEventTo(receiveId, chatOperationEvent);

        if (request.saveToDatabase) {
            let collection = this.gnServer.getDatabase().runtimeGameCollection("PlayerChatCollection");
            let result = {
                "HashId": SendChatToUserRequestHandler.getHashPlayerChatId(receiveId, senderId),
                "UserId": senderId,
                "Message": message,
                "TsCreate": currentMilliseconds
            };

            collection.insertOne(result);
        }

        return operationResponse;
    }

}
