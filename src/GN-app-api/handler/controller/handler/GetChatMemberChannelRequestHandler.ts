import { ChatParameterCode } from "./../../../../GN-common/constant/parameterCode/ChatParameterCode";
import { RequestHandler } from "./base/RequestHandler";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";
import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ChatErrorCode } from "./../../../../GN-common/constant/errorCode/ChatErrorCode";
import { GNArray, GNHashtable } from "./../../../../GN-common/common/GNData";

class GetChatMemberChannelOperationRequest extends OperationRequest {
    @StringDataMember({ code: ChatParameterCode.Channel, minLength: 1, maxLength: 64, mustNonNull: true })
    channel: string;

    public isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetChatMemberChannelRequestHandler extends RequestHandler {
    public getCode() {
        return OperationCode.GetChatMemberChannel;
    }

    public override getCommonOperationRequest() {
        return GetChatMemberChannelOperationRequest;
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

        let channelInfo = await this.gnServer.getChatService().getChannelInfoAsync(request.channel);
        let gsChannelInfo = new GNHashtable();

        let gsUsers = new GNArray();

        for (let i = 0; i < channelInfo.users.length; i++) {
            let user = channelInfo.users[i];

            let gsUser = new GNHashtable();
            gsUser.add(ChatParameterCode.TsJoin, user.tsJoin);
            gsUser.add(ChatParameterCode.UserId, user.userId);

            gsUsers.add(gsUser);
        }

        gsChannelInfo.add(ChatParameterCode.Members, gsUsers);

        operationResponse.setScriptData(ChatParameterCode.ChannelInfo, gsChannelInfo);

        if (this.postHandle != null) {
            await this.postHandle(authInfo, request, operationResponse);
        }

        return operationResponse;
    }
}
