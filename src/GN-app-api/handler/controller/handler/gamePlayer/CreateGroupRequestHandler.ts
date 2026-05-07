import * as mongodb from "mongodb";

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
import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { GamePlayerBaseRequestHandler } from "./GamePlayerBaseRequestHandler";
import { xDatetime } from "./../../../../../GN-library/xdatetime/lib/xDatetime";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";
import { GroupMemberParam } from "./model/GroupMemberParam";
import { DisplayNameUtility } from "./../../../../../GN-common/helper/DisplayNameUtility";
import { StringUtility } from "./../../../../../GN-common/helper/StringUtility";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";
import { Debug } from "./../../../../../GN-library/xdebug/lib/xDebug";
import { MemberItem } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MemberItem";

class CreateGroupOperationRequest extends OperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	public userId?: string;

	// Stores the catalog ID value used by this instance.
	@StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32, mustNonNull: true })
	public catalogId: string;

	// Stores the group members value used by this instance.
	@GNArrayDataMember({ code: ParameterCode.GroupMembers, isOptional: true, elementCls: GroupMemberParam })
	public groupMembers?: Array<GroupMemberParam>;

	// Stores the display name value used by this instance.
	@StringDataMember({ code: ParameterCode.DisplayName, defaultValue: "", isOptional: true })
	public displayName?: string;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerCreateGroupOperationRequest extends CreateGroupOperationRequest {

	// Indicates whether r ID should be used.
	@StringDataMember({ code: ParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	public declare userId: string;

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

export class CreateGroupRequestHandler extends GamePlayerBaseRequestHandler {

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
		}, SecretRole.Client, secretInfo, operationRequest);
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

		if (!secretInfo.getPermission().gamePlayer.createGroup.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			catalogId: request.catalogId,
			groupMembers: request.groupMembers,
			displayName: request.displayName,
		}, SecretRole.Server, secretInfo, operationRequest);
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

		if (!secretInfo.getPermission().gamePlayer.createGroup.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: request.userId,
			catalogId: request.catalogId,
			groupMembers: request.groupMembers,
			displayName: request.displayName,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, catalogId: string, groupMembers: Array<GroupMemberParam>, displayName: string }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("gamePlayer_CreateGroup", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the game player find options value used in the current execution flow.
		let gamePlayerFindOptions: GamePlayerFindOptions = {
			playerGroups: true,
			playerBan: true,
		}

		// Stores the resolved game player settings instance for the current execution flow.
		let gamePlayerSettings = this.gnServer.getGNSettings().getGamePlayerSettings(secretInfo.getGameId());
		// Stores the player group catalog settings item value used in the current execution flow.
		let playerGroupCatalogSettingsItem = gamePlayerSettings.playerGroupCatalogSettings.find(x => x.catalogId == request.catalogId);

		if (playerGroupCatalogSettingsItem == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.CatalogIdNotFound);

			return operationResponse;
		}

		// Stores the game player value used in the current execution flow.
		let gamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(request.userId, secretInfo.getGameId(), gamePlayerFindOptions);

		if (gamePlayer == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GamePlayerNotFound);
			return operationResponse;
		}
		if (role == SecretRole.Client) {
			// Stores the player ban value used in the current execution flow.
			let playerBan = gamePlayer.getPlayerBan();

			if (playerBan.tsExpire != 0) {
				let currentMilliseconds = xDatetime.getCurrentMilliseconds();
				if (playerBan.tsExpire == -1 || playerBan.tsExpire > currentMilliseconds) {
					operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.PlayerBan);
					operationResponse.setDebugMessage("GamePlayer is banned, reason " + playerBan.reason);

					return operationResponse;
				}
			}
		}

		// Stores the current milliseconds value used in the current execution flow.
		let currentMilliseconds = xDatetime.getCurrentMilliseconds();
		// Stores the group ID value used in the current execution flow.
		let groupId = StringUtility.generateRandomString(10, this.gnServer.getIdTypeCase());

		const session = this.gnServer.getDatabase().startSession();

		try {
			session.startTransaction();

			const members: MemberItem[] = [{ memberId: request.userId, status: GroupStatus.Member }];

			if (request.groupMembers != null) {
				for (let i = 0; i < request.groupMembers.length; i++) {
					// Stores the group member value used in the current execution flow.
					let groupMember = request.groupMembers[i];

					if (groupMember.userId == request.userId) continue;

					// Stores the other game player value used in the current execution flow.
					let otherGamePlayer = await this.gnServer.getDatabase().gamePlayerRepository.loadGamePlayerAsync(groupMember.userId, secretInfo.getGameId(), {
						playerGroups: true,
					});

					if (otherGamePlayer != null) {
						if (playerGroupCatalogSettingsItem.forceAcceptMember) {
							otherGamePlayer.setPlayerGroup(groupId, request.catalogId, GroupStatus.Member, currentMilliseconds);
							await otherGamePlayer.saveAsync(session);

							members.push({
								memberId: groupMember.userId,
								status: GroupStatus.Member
							});

							this.gnServer.joinRoom(groupMember.userId, groupId);
						}
						else {
							otherGamePlayer.setPlayerGroup(groupId, request.catalogId, GroupStatus.WaitingAccept, currentMilliseconds);
							await otherGamePlayer.saveAsync(session);

							members.push({
								memberId: groupMember.userId,
								status: GroupStatus.WaitingAccept
							});
						}
					}
				}
			}

			let group = await this.gnServer.getDatabase().groupRepository.createGroupAsync({
				_id: undefined,
				groupId: groupId,
				groupType: OwnerType.GamePlayer,
				catalogId: request.catalogId,
				members: members,
				groupDatas: {},
				groupCurrencies: {},
				groupStatistics: {},
				groupInventories: [],
				removeStatus: { tsRemove: 0 },
				segments: [],
				customDatas: {},
				tsCreate: currentMilliseconds,
				displayName: request.displayName,
				displayNameNormalize: DisplayNameUtility.normalizeString(request.displayName),
				avatar: { type: 0, value: "0" },
				tags: {},
			}, secretInfo.getGameId(), session);

			gamePlayer.setPlayerGroup(groupId, request.catalogId, GroupStatus.Member, currentMilliseconds);
			await gamePlayer.saveAsync(session);

			await session.commitTransaction();
		}
		catch (err) {
			await session.abortTransaction();

			Debug.logError(err);

			throw err;
		}
		finally {
			await session.endSession();
		}

		// Stores the GearN player groups value used in the current execution flow.
		let gnPlayerGroups = new GNArray();

		// Stores the GearN player group value used in the current execution flow.
		let gnPlayerGroup = new GNHashtable();

		gnPlayerGroup.add(ParameterCode.GroupId, groupId);
		gnPlayerGroup.add(ParameterCode.CatalogId, request.catalogId);
		gnPlayerGroup.add(ParameterCode.Status, GroupStatus.Member);
		gnPlayerGroup.add(ParameterCode.TsLastStatusUpdate, currentMilliseconds);

		gnPlayerGroups.add(gnPlayerGroup);

		// Stores the GearN info response parameters value used in the current execution flow.
		let gnInfoResponseParameters = new GNHashtable();
		gnInfoResponseParameters.add(ParameterCode.PlayerGroups, gnPlayerGroups);

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, gnInfoResponseParameters);

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		this.gnServer.joinRoom(request.userId, groupId);

		await this.gnServer.getPostEventCallbackService().onEvent("gamePlayer_CreateGroup", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
