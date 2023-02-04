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
import { SendChatToUserRequestHandler } from "./SendChatToUserRequestHandler";

class EditChatMessageUserOperationRequest extends OperationRequest {
    @NumberDataMember({ code: ChatParameterCode.TsCreate, mustInt: true })
    tsCreate: number;

    @StringDataMember({ code: ChatParameterCode.UserId, minLength: 24, maxLength: 24, mustNonNull: true })
    userId: string;

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

export class EditChatMessageUserRequestHandler extends RequestHandler {
    public getCode() {
        return OperationCode.EditChatMessageUser;
    }

    public override getCommonOperationRequest() {
        return EditChatMessageUserOperationRequest;
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

        let receiveId = request.userId;
        let senderId = authInfo.getUserId();
        let hashId = SendChatToUserRequestHandler.getHashPlayerChatId(receiveId, senderId);

        operationResponse.setReturnCode(ReturnCode.Ok);

        let collection = this.gnServer.getDatabase().runtimeGameCollection("UserMessageCollection");
        let chatMessage = await collection.findOne({ "HashId": hashId, "TsCreate": request.tsCreate });

        if (chatMessage == null || chatMessage["SenderId"] != senderId) {
            operationResponse.setScriptData(ParameterCode.ErrorCode, ChatErrorCode.UserDoesNotSender);
        }
        else {
            operationResponse.setScriptData(ParameterCode.ErrorCode, ChatErrorCode.Ok);

            let currentMilliseconds = xDatetime.getCurrentMilliseconds();

            let chatOperationEvent = new OperationEvent(EventCode.OnUserChat, new GNHashtable());

            let gsChatMessage = new GNHashtable();
            gsChatMessage.add(ChatParameterCode.TsCreate, chatMessage["TsCreate"]);

            if (request.message != null) {

                let editChatMessage = {
                    "Message": chatMessage["Message"],
                    "TsCreate": currentMilliseconds,
                }
                
                let messageEditeds = chatMessage["MessageEditeds"];

                messageEditeds.push(editChatMessage);

                chatMessage["Message"] = request.message;

                gsChatMessage.add(ChatParameterCode.Message, chatMessage["Message"]);

                let gsMessageEditeds = new GNArray();
                for (let j = 0; j < messageEditeds.length; j++) {
                    let messageEdited = messageEditeds[j];

                    let gsMessageEdited = new GNHashtable();

                    gsMessageEdited.add(ChatParameterCode.Message, messageEdited["Message"]);
                    gsMessageEdited.add(ChatParameterCode.TsCreate, messageEdited["TsCreate"]);

                    gsMessageEditeds.add(gsMessageEdited);
                }

                gsChatMessage.add(ChatParameterCode.MessageEditeds, gsMessageEditeds);
            }

            if (request.isDelete != null) {
                chatMessage["IsDelete"] = request.isDelete;
                gsChatMessage.add(ChatParameterCode.IsDelete, chatMessage["IsDelete"]);
            }

            chatMessage["TsLastUpdate"] = currentMilliseconds;
            gsChatMessage.add(ChatParameterCode.TsLastUpdate, chatMessage["TsLastUpdate"]);

            let gsChatMessageLst = new GNArray();
            gsChatMessageLst.add(gsChatMessage);

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

            collection.replaceOne({ "_id": chatMessage._id }, chatMessage);
        }

        return operationResponse;
    }
}
