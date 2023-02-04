import { FriendErrorCode } from "./../../../../GN-common/constant/errorCode/FriendErrorCode";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";
import { FriendParameterCode } from "./../../../../GN-common/constant/parameterCode/FriendParameterCode";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";
import { RequestHandler } from "./base/RequestHandler";
import mongodb from "mongodb";

class FindPlayerOperationRequest extends OperationRequest {
    @StringDataMember({ code: FriendParameterCode.Keyword, minLength: 3, maxLength: 64, mustNonNull: true })
    keyword: string;

    @NumberDataMember({ code: FriendParameterCode.Skip, minValue: 0, maxValue: 50})
    skip: number;

    @NumberDataMember({ code: FriendParameterCode.Limit, minValue: 0, maxValue: 50 })
    limit: number;

    public isValidRequest() {
        if (!super.isValidRequest()) return false;

        return true;
    }
}

export class FindPlayerRequestHandler extends RequestHandler {
    public getCode() {
        return OperationCode.FindPlayer;
    }

    public override getCommonOperationRequest() {
        return FindPlayerOperationRequest;
    }

    public async handle(
        authInfo: AuthInfo,
        operationRequest: OperationRequest
    ): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

        if (!request.isValidRequest()) {
            return this.newInvalidRequestParameters(request);
        }

        let skip = request.skip;
        let limit = request.limit;
        let keyword = request.keyword;

        let userId = authInfo.getUserId();

        let tempPlayerLst: string[] = [];

        let displayNameNormalizeCollection = this.gnServer.getDatabase().runtimeGameCollection("DisplayNameNormalizeCollection");


        let results: mongodb.WithId<mongodb.Document>[] = null;

        if (keyword.length == 24) {
            results = await displayNameNormalizeCollection.find({ "UserId": keyword }).toArray();
        }

        if (results == null || results.length == 0) {
            results = await displayNameNormalizeCollection.find({ "DisplayName": { $regex: keyword.toLowerCase() } }).sort({ "Ts": -1 }).skip(skip).limit(limit).toArray();
        }

        for (let i = 0; i < results.length; i++) {
            let friendId = results[i]["UserId"];
            if (friendId != userId && tempPlayerLst.indexOf(friendId) == -1) {
                tempPlayerLst.push(friendId);
            }
        }

        let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());

        operationResponse.setReturnCode(ReturnCode.Ok);
        operationResponse.setScriptData(ParameterCode.ErrorCode, FriendErrorCode.Ok);

        operationResponse.setScriptData(FriendParameterCode.PlayerLst, tempPlayerLst);

        if (this.postHandle != null) {
            await this.postHandle(authInfo, request, operationResponse);
        }

        return operationResponse;
    }
}
