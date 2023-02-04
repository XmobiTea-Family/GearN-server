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
import { GNArray, GNHashtable } from "./../../../../GN-common/common/GNData";

class GetFriendsOperationRequest extends OperationRequest {
    public isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class GetFriendsRequestHandler extends RequestHandler {
    public override getCode() {
        return OperationCode.GetFriends;
    }

    public override getCommonOperationRequest() {
        return GetFriendsOperationRequest;
    }

    public override async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());

        operationResponse.setReturnCode(ReturnCode.Ok);
        operationResponse.setScriptData(ParameterCode.ErrorCode, FriendErrorCode.Ok);

        let friendLst = [];
        let gsFriendLst = new GNArray();

        let userId = authInfo.getUserId();
        let systemFriends = await this.gnServer.getDatabase().loadFriend(userId);
        if (systemFriends) {
            let socialFriendUserIds = systemFriends["SocialFriendUserIds"];
            for (let i = 0; i < socialFriendUserIds.length; i++) {
                let socialFriend = socialFriendUserIds[i];
                friendLst.push({
                    "UserId": socialFriend["UserId"]
                });

                let gsFriend = new GNHashtable();
                gsFriend.add(FriendParameterCode.FriendId, socialFriend["UserId"]);
                gsFriend.add(FriendParameterCode.IsSocialLoginFriend, true);
                gsFriendLst.add(gsFriend);
            }
        }

        let gameFriendCollection = this.gnServer.getDatabase().systemGameCollection("FriendCollection");
        let gameFriends = await gameFriendCollection.findOne({ "UserId": userId });

        if (gameFriends) {
            let friends = gameFriends["Friends"];
            for (let i = 0; i < friends.length; i++) {
                let friend = friends[i];
                let friendUserId = friend["UserId"];

                let isExist = false;
                for (let j = 0; j < friendLst.length; j++) {
                    if (friendLst[j]["UserId"] == friendUserId) {
                        isExist = true;
                        break;
                    }
                }
                if (!isExist) {
                    friendLst.push({
                        "UserId": friendUserId,
                        "Status": friend["Status"]
                    });

                    let gsFriend = new GNHashtable();
                    gsFriend.add(FriendParameterCode.FriendId, friendUserId);
                    let friendStatus = friend["Status"];
                    gsFriend.add(FriendParameterCode.FriendStatus, friendStatus);
                    gsFriend.add(FriendParameterCode.TsUpdate, friend["TsUpdate"]);

                    gsFriendLst.add(gsFriend);
                }
            }
        }

        operationResponse.setScriptData(FriendParameterCode.FriendLst, gsFriendLst);

        return operationResponse;
    }

}
