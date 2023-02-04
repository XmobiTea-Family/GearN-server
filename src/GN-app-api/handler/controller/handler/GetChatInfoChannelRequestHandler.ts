import { GNHashtable } from "./../../../../GN-common/common/GNData";
import { ChatErrorCode } from "./../../../../GN-common/constant/errorCode/ChatErrorCode";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";
import { ChatParameterCode } from "./../../../../GN-common/constant/parameterCode/ChatParameterCode";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { RequestHandler } from "./base/RequestHandler";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";

class GetChatInfoChannelOperationRequest extends OperationRequest {
    @StringDataMember({ code: ChatParameterCode.Channel, minLength: 1, maxLength: 64, mustNonNull: true })
    channel: string;

    public isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetChatInfoChannelRequestHandler extends RequestHandler {
    public getCode() {
        return OperationCode.GetChatInfoChannel;
    }

    public override getCommonOperationRequest() {
        return GetChatInfoChannelOperationRequest;
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
        gsChannelInfo.add(ChatParameterCode.Name, channelInfo.name);

        let gsAvatarChannel = {} as any;
        gsAvatarChannel[ChatParameterCode.Type] = channelInfo.avatarChannel.type;
        gsAvatarChannel[ChatParameterCode.Value] = channelInfo.avatarChannel.value;
        gsChannelInfo.add(ChatParameterCode.AvatarChannel, gsAvatarChannel);
        gsChannelInfo.add(ChatParameterCode.TsCreate, channelInfo.tsCreate);
        gsChannelInfo.add(ChatParameterCode.ChannelType, channelInfo.channelType);
        gsChannelInfo.add(ChatParameterCode.UserCount, channelInfo.users.length);

        operationResponse.setScriptData(ChatParameterCode.ChannelInfo, gsChannelInfo);
        return operationResponse;
    }
}
