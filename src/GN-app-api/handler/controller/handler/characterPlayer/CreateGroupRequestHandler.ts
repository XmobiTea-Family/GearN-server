import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { CharacterPlayerFindOptions } from "./../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { CharacterPlayerBaseRequestHandler } from "./CharacterPlayerBaseRequestHandler";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { GroupMemberParam } from "./model/GroupMemberParam";
import { DisplayNameUtility } from "./../../../../../GN-common/helper/DisplayNameUtility";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class CreateGroupOperationRequest extends OperationRequest {
	@StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
	characterId: string;

	@StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true })
	catalogId: string;

	@GNArrayDataMember({ code: ParameterCode.GroupMembers, isOptional: true, elementCls: GroupMemberParam })
	groupMembers?: Array<GroupMemberParam>;

	@StringDataMember({ code: ParameterCode.DisplayName, defaultValue: "", isOptional: true })
	displayName?: string;

	// them data vao day

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerCreateGroupOperationRequest extends CreateGroupOperationRequest {


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

export class CreateGroupRequestHandler extends CharacterPlayerBaseRequestHandler {
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

		let allowMethod = await this.isAllowMethod(authInfo.getUserId(), request.characterId, secretInfo.getGameId(), secretInfo.getPermission().characterPlayer.createGroup);

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
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

		if (!secretInfo.getPermission().characterPlayer.createGroup.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
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

		if (!secretInfo.getPermission().characterPlayer.createGroup.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			characterId: request.characterId,
			catalogId: request.catalogId,
			groupMembers: request.groupMembers,
			displayName: request.displayName,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { characterId: string, catalogId: string, groupMembers: Array<GroupMemberParam>, displayName: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_CreateGroup", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
			playerGroups: true,
		}

		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
		let playerGroupCatalogSettingsItem = characterPlayerSettings.playerGroupCatalogSettings.find(x => x.catalogId == request.catalogId);

		if (playerGroupCatalogSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CatalogIdNotFound);

			return operationResponse;
		}

		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

		if (characterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
			return operationResponse;
		}

		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		let groupId = StringUtility.generateRandomString(10, this.gnServer.getIdTypeCase());

		let result = {} as any;
		result["groupId"] = groupId;
		result["groupType"] = <number>OwnerType.CharacterPlayer;
		result["catalogId"] = request.catalogId;
		result["members"] = [{ "memberId": request.characterId, "status": <number>GroupStatus.Member }];
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

				if (groupMember.userId == request.characterId) continue;

				let otherCharacterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(groupMember.userId, secretInfo.getGameId(), characterPlayerFindOptions);

				if (otherCharacterPlayer != null) {

					otherCharacterPlayer.setPlayerGroup(groupId, request.catalogId, <number>GroupStatus.WaitingAccept, currentMilliseconds);
					otherCharacterPlayer.saveAsync();

					group.setMember(request.characterId, <number>GroupStatus.WaitingAccept);
				}
			}

			group.saveAsync();
		}

		characterPlayer.setPlayerGroup(groupId, request.catalogId, <number>GroupStatus.Member, currentMilliseconds);
		characterPlayer.saveAsync();

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

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_CreateGroup", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
