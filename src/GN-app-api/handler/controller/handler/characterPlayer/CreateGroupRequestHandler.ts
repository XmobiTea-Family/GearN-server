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

	// Stores the character ID value used by this instance.
	@StringDataMember({ code: ParameterCode.CharacterId, minLength: 11, maxLength: 11, mustNonNull: true })
	public characterId: string;

	// Stores the catalog ID value used by this instance.
	@StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true })
	public catalogId: string;

	// Stores the group members value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.GroupMembers, isOptional: true, elementCls: GroupMemberParam })
	public groupMembers?: Array<GroupMemberParam>;

	// Stores the display name value used by this instance.
	@StringDataMember({ code: ParameterCode.DisplayName, defaultValue: "", isOptional: true })
	public displayName?: string;

	// them data vao day

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerCreateGroupOperationRequest extends CreateGroupOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminCreateGroupOperationRequest extends ServerCreateGroupOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class CreateGroupRequestHandler extends CharacterPlayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.CreateGroup;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return CreateGroupOperationRequest;
	}

	/**
	 * Executes the handle workflow asynchronously.
	 * @param authInfo Provides the auth info value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		// Tracks whether method is allowed.
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

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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

	/**
	 * Executes the admin handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
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

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { characterId: string, catalogId: string, groupMembers: Array<GroupMemberParam>, displayName: string }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("characterPlayer_CreateGroup", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the character player find options value used in the current execution flow.
		let characterPlayerFindOptions: CharacterPlayerFindOptions = {
			playerGroups: true,
			owner: true,
		}

		// Stores the resolved character player settings instance for the current execution flow.
		let characterPlayerSettings = this.gnServer.getGNSettings().getCharacterPlayerSettings(secretInfo.getGameId());
		// Stores the player group catalog settings item value used in the current execution flow.
		let playerGroupCatalogSettingsItem = characterPlayerSettings.playerGroupCatalogSettings.find(x => x.catalogId == request.catalogId);

		if (playerGroupCatalogSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CatalogIdNotFound);

			return operationResponse;
		}

		// Stores the character player value used in the current execution flow.
		let characterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(request.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

		if (characterPlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CharacterPlayerNotFound);
			return operationResponse;
		}

		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		// Stores the group ID value used in the current execution flow.
		let groupId = StringUtility.generateRandomString(10, this.gnServer.getIdTypeCase());

		// Stores the result value used in the current execution flow.
		let result = {} as any;
		result["groupId"] = groupId;
		result["groupType"] = OwnerType.CharacterPlayer;
		result["catalogId"] = request.catalogId;
		result["members"] = [{ "memberId": request.characterId, "status": GroupStatus.Member }];
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

		this.gnServer.joinRoom(characterPlayer.getOwner().id, groupId);

		// Stores the group value used in the current execution flow.
		let group = await this.gnServer.getDatabase().groupRepository.createGroupAsync(result, secretInfo.getGameId());

		if (request.groupMembers != null) {
			for (let i = 0; i < request.groupMembers.length; i++) {
				// Stores the group member value used in the current execution flow.
				let groupMember = request.groupMembers[i];

				if (groupMember.characterId == request.characterId) continue;

				// Stores the other character player value used in the current execution flow.
				let otherCharacterPlayer = await this.gnServer.getDatabase().loadCharacterPlayerAsync(groupMember.characterId, secretInfo.getGameId(), characterPlayerFindOptions);

				if (otherCharacterPlayer != null) {

					otherCharacterPlayer.setPlayerGroup(groupId, request.catalogId, GroupStatus.WaitingAccept, currentMilliseconds);
					otherCharacterPlayer.saveAsync();

					group.setMember(groupMember.characterId, GroupStatus.WaitingAccept);
				
					this.gnServer.joinRoom(otherCharacterPlayer.getOwner().id, groupId);
				}
			}

			group.saveAsync();
		}

		characterPlayer.setPlayerGroup(groupId, request.catalogId, GroupStatus.Member, currentMilliseconds);
		characterPlayer.saveAsync();

		// Stores the GearN player groups value used in the current execution flow.
		let gnPlayerGroups = new GNArray();

		// Stores the GearN player group value used in the current execution flow.
		let gnPlayerGroup = new GNHashtable();

		gnPlayerGroup.add(ParameterCode.GroupId, group.getGroupId());
		gnPlayerGroup.add(ParameterCode.CatalogId, group.getCatalogId());
		gnPlayerGroup.add(ParameterCode.Status, GroupStatus.Member);
		gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);

		gnPlayerGroups.add(gnPlayerGroup);

		// Stores the GearN info response parameters value used in the current execution flow.
		let gnInfoResponseParameters = new GNHashtable();
		gnInfoResponseParameters.add(ParameterCode.PlayerGroups, gnPlayerGroups);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("characterPlayer_CreateGroup", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
