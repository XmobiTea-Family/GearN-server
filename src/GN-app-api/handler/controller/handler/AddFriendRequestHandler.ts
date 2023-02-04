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
import { xDatetime } from "./../../../../GN-library/xdatetime/lib/xDatetime";

class AddFriendOperationRequest extends OperationRequest {
    @StringDataMember({ code: FriendParameterCode.FriendId, mustNonNull: true, minLength: 24, maxLength: 24 })
    friendId: string;

    @BooleanDataMember({ code: FriendParameterCode.ForceAddFriend })
    forceAddFriend: boolean;

    public isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class AddFriendRequestHandler extends RequestHandler {
    public override getCode() {
        return OperationCode.AddFriend;
    }

    public override getCommonOperationRequest() {
        return AddFriendOperationRequest;
    }

    public override async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let userId = authInfo.getUserId();
        let friendId = request.friendId;
        if (friendId == userId) {
            return this.newOperationInvalid(request);
        }

        let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());

        operationResponse.setReturnCode(ReturnCode.Ok);
        operationResponse.setScriptData(ParameterCode.ErrorCode, FriendErrorCode.Ok);

        let gameFriendCollection = this.gnServer.getDatabase().systemGameCollection("FriendCollection");
        let gameFriends = await gameFriendCollection.findOne({ "UserId": userId }) as any;
        let gameFriends2 = await gameFriendCollection.findOne({ "UserId": friendId }) as any;

        if (!gameFriends) gameFriends = { "UserId": userId, "Friends": [] };
        if (!gameFriends2) gameFriends2 = { "UserId": friendId, "Friends": [] };

        let currentMilliseconds = xDatetime.getCurrentMilliseconds();

        {
            let friends = gameFriends["Friends"] as any[];
            let friend = friends.find(x => x["UserId"] == friendId);
            if (!friend) {
                friend = {
                    "UserId": friendId,
                    "Status": <number>FriendStatus.SentRequestAndWaitingAccept
                };

                friends.push(friend);
            }

            friend["TsUpdate"] = currentMilliseconds;

            if (request.forceAddFriend) {
                friend["Status"] = <number>FriendStatus.WaitingAccept;
            }

            let currentStatus = <FriendStatus>friend["Status"];
            if (currentStatus == FriendStatus.Friend) {

            }
            else if (currentStatus == FriendStatus.SentRequestAndWaitingAccept) {

            }
            else if (currentStatus == FriendStatus.WaitingAccept) {
                currentStatus = FriendStatus.Friend;
            }
            else if (currentStatus == FriendStatus.Unknown) {
                currentStatus = FriendStatus.SentRequestAndWaitingAccept;
            }

            friend["Status"] = <number>currentStatus;

            let friendUpdateOperationEvent = new OperationEvent(EventCode.OnFriendUpdate, new GNHashtable());
            let gsFriendLst = new GNArray();
            let gsFriend = new GNHashtable();
            gsFriend.add(FriendParameterCode.FriendId, friend["UserId"]);
            gsFriend.add(FriendParameterCode.FriendStatus, friend["Status"]);
            gsFriend.add(FriendParameterCode.TsUpdate, friend["TsUpdate"]);
            gsFriendLst.add(gsFriend);
            friendUpdateOperationEvent.setScriptData(FriendParameterCode.FriendLst, gsFriendLst);
            this.gnServer.sendEventTo(userId, friendUpdateOperationEvent);

            gameFriendCollection.updateOne({ "UserId": userId }, {
                $set: {
                    "Friends": friends
                }
            }, {
                upsert: true
            });
        }

        {
            let friends = gameFriends2["Friends"] as any[];
            let friend = friends.find(x => x["UserId"] == userId);
            if (!friend) {
                friend = {
                    "UserId": userId,
                    "Status": <number>FriendStatus.WaitingAccept
                };

                friends.push(friend);
            }

            friend["TsUpdate"] = currentMilliseconds;

            if (request.forceAddFriend) {
                friend["Status"] = <number>FriendStatus.SentRequestAndWaitingAccept;
            }

            let currentStatus = <FriendStatus>friend["Status"];
            if (currentStatus == FriendStatus.Friend) {

            }
            else if (currentStatus == FriendStatus.SentRequestAndWaitingAccept) {
                currentStatus = FriendStatus.Friend;
            }
            else if (currentStatus == FriendStatus.WaitingAccept) {

            }
            else if (currentStatus == FriendStatus.Unknown) {
                currentStatus = FriendStatus.WaitingAccept;
            }

            friend["Status"] = <number>currentStatus;

            let friendUpdateOperationEvent = new OperationEvent(EventCode.OnFriendUpdate, new GNHashtable());
            let gsFriendLst = new GNArray();
            let gsFriend = new GNHashtable();
            gsFriend.add(FriendParameterCode.FriendId, friend["UserId"]);
            gsFriend.add(FriendParameterCode.FriendStatus, friend["Status"]);
            gsFriend.add(FriendParameterCode.TsUpdate, friend["TsUpdate"]);
            gsFriendLst.add(gsFriend);
            friendUpdateOperationEvent.setScriptData(FriendParameterCode.FriendLst, gsFriendLst);

            this.gnServer.sendEventTo(friendId, friendUpdateOperationEvent);

            gameFriendCollection.updateOne({ "UserId": friendId }, {
                $set: {
                    "Friends": friends
                }
            }, {
                upsert: true
            });
        }

        return operationResponse;
    }

}
