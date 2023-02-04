import { GNHashtable } from "../../../../GN-common/common/GNData";
import { ChatErrorCode } from "../../../../GN-common/constant/errorCode/ChatErrorCode";
import { EventCode } from "../../../../GN-common/constant/EventCode";
import { OperationCode } from "../../../../GN-common/constant/OperationCode";
import { ChatParameterCode } from "../../../../GN-common/constant/parameterCode/ChatParameterCode";
import { ParameterCode } from "../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "../../../../GN-common/constant/ReturnCode";
import { AuthInfo } from "../../../../GN-common/entity/AuthInfo";
import { OperationEvent } from "../../../../GN-common/entity/operationEvent/OperationEvent";
import { OperationRequest } from "../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "../../../../GN-common/entity/operationResponse/OperationResponse";
import { AvatarChannel } from "../../../service/IChatService";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "../../../../GN-common/entity/DataMember";
import { RequestHandler } from "./base/RequestHandler";

class EditChatChannelOperationRequest extends OperationRequest {
    @StringDataMember({ code: ChatParameterCode.Channel, minLength: 1, maxLength: 64, mustNonNull: true })
    channel: string;

    @StringDataMember({ code: ChatParameterCode.Name, minLength: 1, maxLength: 64, mustNonNull: true, isOptional: true })
    name: string;

    @GNHashtableDataMember({ code: ChatParameterCode.AvatarChannel, minLength: 2, maxLength: 2, isOptional: true })
    avatarChannel: GNHashtable;

    @NumberDataMember({ code: ChatParameterCode.ChannelType, mustInt: true, isOptional: true })
    channelType: number;

    public isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class EditChatChannelRequestHandler extends RequestHandler {
    public getCode() {
        return OperationCode.EditChatInfoChannel;
    }

    public override getCommonOperationRequest() {
        return EditChatChannelOperationRequest;
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

        let avatarChannel: AvatarChannel = null;
        if (request.avatarChannel != null) {
            avatarChannel = new AvatarChannel();

            avatarChannel.type = request.avatarChannel.getNumber(ChatParameterCode.Type);
            avatarChannel.value = request.avatarChannel.getString(ChatParameterCode.Value);
        }

        let chatChannel = await this.gnServer.getChatService().editChatChannelAsync(request.channel, request.name, avatarChannel, request.channelType);
        if (chatChannel != null) {
            let channelOperationEvent = new OperationEvent(EventCode.OnUpdateChannel, new GNHashtable());

            let gsChannelInfo = new GNHashtable();
            gsChannelInfo.add(ChatParameterCode.Channel, chatChannel.channel);

            if (request.name != null) {
                gsChannelInfo.add(ChatParameterCode.Name, chatChannel.name);
            }

            if (request.avatarChannel != null) {
                let gsAvatarChannel = new GNHashtable();

                gsAvatarChannel.add(ChatParameterCode.Type, chatChannel.avatarChannel.type);
                gsAvatarChannel.add(ChatParameterCode.Value, chatChannel.avatarChannel.value);

                gsChannelInfo.add(ChatParameterCode.AvatarChannel, gsAvatarChannel);
            }

            if (request.channelType != null) {
                gsChannelInfo.add(ChatParameterCode.ChannelType, chatChannel.channelType);
            }

            channelOperationEvent.setScriptData(ChatParameterCode.ChannelInfo, gsChannelInfo);
            this.gnServer.sendEventToRoom(request.channel, channelOperationEvent);
        }

        return operationResponse;
    }
}
