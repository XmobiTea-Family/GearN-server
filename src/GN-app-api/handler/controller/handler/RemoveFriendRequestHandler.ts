import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";
import { FriendErrorCode } from "./../../../../GN-common/constant/errorCode/FriendErrorCode";
import { FriendParameterCode } from "./../../../../GN-common/constant/parameterCode/FriendParameterCode";
import { FriendStatus } from "./../../../../GN-common/constant/enumType/FriendStatus";
import { OperationEvent } from "./../../../../GN-common/entity/operationEvent/OperationEvent";
import { EventCode } from "./../../../../GN-common/constant/EventCode";
import { GNArray, GNHashtable } from "./../../../../GN-common/common/GNData";

class RemoveFriendOperationRequest extends OperationRequest {
    @StringDataMember({ code: FriendParameterCode.FriendId, mustNonNull: true, minLength: 24, maxLength: 24 })
    friendId: string;

    public isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class RemoveFriendRequestHandler extends RequestHandler {
    public override getCode() {
        return OperationCode.RemoveFriend;
    }

    public override getCommonOperationRequest() {
        return RemoveFriendOperationRequest;
    }

    public override async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        // let gamePlayer = await this.gnServer.getDatabase().loadGamePlayer(authInfo.getUserId());

        let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());

        operationResponse.setReturnCode(ReturnCode.Ok);
        operationResponse.setScriptData(ParameterCode.ErrorCode, FriendErrorCode.Ok);

        let userId = authInfo.getUserId();
        let friendId = request.friendId;
        if (friendId == userId) {
            return this.newOperationInvalid(request);
        }

        let gameFriendCollection = this.gnServer.getDatabase().systemGameCollection("FriendCollection");
        let gameFriends = await gameFriendCollection.findOne({ "UserId": userId }) as any;
        let gameFriends2 = await gameFriendCollection.findOne({ "UserId": friendId }) as any;

        if (!gameFriends) gameFriends = { "UserId": userId, "Friends": [] };
        if (!gameFriends2) gameFriends2 = { "UserId": friendId, "Friends": [] };

        {
            let friends = gameFriends["Friends"] as any[];
            let friend = friends.find(x => x["UserId"] == friendId);

            let friendUpdateOperationEvent = new OperationEvent(EventCode.OnFriendUpdate, new GNHashtable());
            let gsFriendLst = new GNArray();
            let gsFriend = new GNHashtable();
            gsFriend.add(FriendParameterCode.FriendId, friendId);
            gsFriend.add(FriendParameterCode.FriendStatus, <number>FriendStatus.Unknown);
            gsFriendLst.add(gsFriend);
            friendUpdateOperationEvent.setScriptData(FriendParameterCode.FriendLst, gsFriendLst);
            this.gnServer.sendEventTo(userId, friendUpdateOperationEvent);

            if (friend) {
                let indexOf = friends.indexOf(friend);
                if (indexOf != -1) friends.splice(indexOf, 1);

                gameFriendCollection.updateOne({ "UserId": userId }, {
                    $set: {
                        "Friends": friends
                    }
                }, {
                    upsert: true
                });
            }
        }

        {
            let friends = gameFriends2["Friends"] as any[];
            let friend = friends.find(x => x["UserId"] == userId);

            let friendUpdateOperationEvent = new OperationEvent(EventCode.OnFriendUpdate, new GNHashtable());
            let gsFriendLst = new GNArray();
            let gsFriend = new GNHashtable();
            gsFriend.add(FriendParameterCode.FriendId, userId);
            gsFriend.add(FriendParameterCode.FriendStatus, <number>FriendStatus.Unknown);
            gsFriendLst.add(gsFriend);
            friendUpdateOperationEvent.setScriptData(FriendParameterCode.FriendLst, gsFriendLst);
            this.gnServer.sendEventTo(friendId, friendUpdateOperationEvent);

            if (friend) {
                let indexOf = friends.indexOf(friend);
                if (indexOf != -1) friends.splice(indexOf, 1);

                gameFriendCollection.updateOne({ "UserId": friendId }, {
                    $set: {
                        "Friends": friends
                    }
                }, {
                    upsert: true
                });
            }
        }

        if (this.postHandle != null) {
            await this.postHandle(authInfo, request, operationResponse);
        }

        return operationResponse;
    }

}
