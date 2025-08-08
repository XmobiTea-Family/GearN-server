import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { GamePlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { GroupMemberParam } from "./model/GroupMemberParam";
import { DisplayNameUtility } from "./../../../../../GN-common/helper/DisplayNameUtility";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class CreateGroupOperationRequest extends OperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	@StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true })
	public catalogId: string;

	@GNArrayDataMember({ code: ParameterCode.GroupMembers, isOptional: true, elementCls: GroupMemberParam })
	public groupMembers?: Array<GroupMemberParam>;

	@StringDataMember({ code: ParameterCode.DisplayName, defaultValue: "", isOptional: true })
	public displayName?: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerCreateGroupOperationRequest extends CreateGroupOperationRequest {

	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminCreateGroupOperationRequest extends ServerCreateGroupOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class CreateGroupRequestHandler extends GamePlayerBaseRequestHandler {

	public override getCode() {
		return OperationCode.CreateGroup;
	}

	public override getCommonOperationRequest() {
		return CreateGroupOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
			if (!secretInfo.getPermission().gamePlayer.createGroup.selfEnable) {
				return this.newOperationNotAllowError(request);
			}

			request.userId = authInfo.getUserId();
		}
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().gamePlayer.createGroup.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}
		else {
			if (!secretInfo.getPermission().gamePlayer.createGroup.selfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

		return this.execute({
			userId: request.userId,
			catalogId: request.catalogId,
			groupMembers: request.groupMembers,
			displayName: request.displayName,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerCreateGroupOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.createGroup.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			catalogId: request.catalogId,
			groupMembers: request.groupMembers,
			displayName: request.displayName,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminCreateGroupOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().gamePlayer.createGroup.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			catalogId: request.catalogId,
			groupMembers: request.groupMembers,
			displayName: request.displayName,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { userId: string, catalogId: string, groupMembers: Array<GroupMemberParam>, displayName: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_CreateGroup", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let gamePlayerFindOptions: GamePlayerFindOptions = {
			playerGroups: true,
		}

		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
		let playerGroupCatalogSettingsItem = gamePlayerSettings.playerGroupCatalogSettings.find(x => x.catalogId == request.catalogId);

		if (playerGroupCatalogSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CatalogIdNotFound);

			return operationResponse;
		}

		let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

		if (gamePlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
			return operationResponse;
		}

		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let groupId = StringUtility.generateRandomString(10, this.gnServer.getIdTypeCase());

		let result = {} as any;
		result["groupId"] = groupId;
		result["groupType"] = <number>OwnerType.GamePlayer;
		result["catalogId"] = request.catalogId;
		result["members"] = [{ "memberId": request.userId, "status": <number>GroupStatus.Member }];
		result["groupDatas"] = [];
		result["groupCurrencies"] = {};
		result["groupStatistics"] = {};
		result["groupInventories"] = [];
		result["removeStatus"] = { "tsRemove": 0, "reason": "" };
		result["segments"] = [];
		result["customDatas"] = {};
		result["tsCreate"] = currentMilliseconds;
		result["displayName"] = request.displayName;
		result["displayNameNormalize"] = DisplayNameUtility.normalizeString(request.displayName);
		result["avatar"] = { "type": 0, "value": "0" };
		result["tags"] = {};

		let group = await this.gnServer.getDatabase().createGroupAsync(result, secretInfo.getGameId());

		if (request.groupMembers != null) {
			for (let i = 0; i < request.groupMembers.length; i++) {
				let groupMember = request.groupMembers[i];

				if (groupMember.userId == request.userId) continue;

				let otherGamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(groupMember.userId, secretInfo.getGameId(), gamePlayerFindOptions);

				if (otherGamePlayer != null) {

					otherGamePlayer.setPlayerGroup(groupId, request.catalogId, <number>GroupStatus.WaitingAccept, currentMilliseconds);
					otherGamePlayer.saveAsync();

					group.setMember(request.userId, <number>GroupStatus.WaitingAccept);
				}
			}

			group.saveAsync();
		}

		gamePlayer.setPlayerGroup(groupId, request.catalogId, <number>GroupStatus.Member, currentMilliseconds);
		gamePlayer.saveAsync();

		let gnPlayerGroups = new GNArray();

		let gnPlayerGroup = new GNHashtable();

		gnPlayerGroup.add(ParameterCode.GroupId, group.getGroupId());
		gnPlayerGroup.add(ParameterCode.CatalogId, group.getCatalogId());
		gnPlayerGroup.add(ParameterCode.Status, <number>GroupStatus.Member);
		gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);

		gnPlayerGroups.add(gnPlayerGroup);

		let gnInfoResponseParameters = new GNHashtable();
		gnInfoResponseParameters.add(ParameterCode.PlayerGroups, gnPlayerGroups);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		this.gnServer.joinRoom(request.userId, groupId);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_CreateGroup", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
