import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";
import { ChatParameterCode } from "./../../../../GN-common/constant/parameterCode/ChatParameterCode";
import { ChatErrorCode } from "./../../../../GN-common/constant/errorCode/ChatErrorCode";
import { GNArray, GNHashtable } from "../../../../GN-common/common/GNData";
import { SendChatToUserRequestHandler } from "./SendChatToUserRequestHandler";

class GetChatMessageUserOperationRequest extends OperationRequest {
    @StringDataMember({ code: ChatParameterCode.UserId, mustNonNull: true, minLength: 24, maxLength: 24 })
    userId: string;

    @NumberDataMember({ code: ChatParameterCode.Skip, minValue: 0, maxValue: 50})
    skip: number;

    @NumberDataMember({ code: ChatParameterCode.Limit, minValue: 0, maxValue: 50 })
    limit: number;

    public isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetChatMessageUserRequestHandler extends RequestHandler {
    public override getCode() {
        return OperationCode.SendChatToUser;
    }

    public override getCommonOperationRequest() {
        return GetChatMessageUserOperationRequest;
    }

    public override async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        // let gamePlayer = await this.gnServer.getDatabase().loadGamePlayer(authInfo.getUserId());

        let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());

        operationResponse.setReturnCode(ReturnCode.Ok);
        operationResponse.setScriptData(ParameterCode.ErrorCode, ChatErrorCode.Ok);

        let collection = this.gnServer.getDatabase().runtimeGameCollection("PlayerChatCollection");
        let receiveId = request.userId;
        let senderId = authInfo.getUserId();

        let results = await collection.find({"HashId": SendChatToUserRequestHandler.getHashPlayerChatId(receiveId, senderId)}).sort({"TsCreate": -1}).skip(request.skip).limit(request.skip).toArray();

        let gsChatMessageLst = new GNArray();

        for (let i = 0; i < results.length; i++) {
            let result = results[i];

            let gsChatMessage = new GNHashtable();
            gsChatMessage.add(ChatParameterCode.UserId, result["UserId"]);
            gsChatMessage.add(ChatParameterCode.Message, result["Message"]);
            gsChatMessage.add(ChatParameterCode.TsCreate, result["TsCreate"]);
            gsChatMessageLst.add(gsChatMessage);
        }

        operationResponse.setScriptData(ChatParameterCode.ChatMessageLst, gsChatMessageLst);

        return operationResponse;
    }

}
