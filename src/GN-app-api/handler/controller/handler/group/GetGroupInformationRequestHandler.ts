import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { GroupBaseRequestHandler } from "./GroupBaseRequestHandler";
import { InfoRequestParam } from "./model/InfoRequestParam";
import { GroupStatus } from "./../../../../../GN-common/constant/enumType/GroupStatus";
import { OwnerType } from "./../../../../../GN-common/constant/enumType/OwnerType";

class GetGroupInformationOperationRequest extends OperationRequest {
	@StringDataMember({ code: ParameterCode.GroupId, minLength: 10, maxLength: 10, mustNonNull: true })
	groupId: string;

	@GNHashtableDataMember({ code: ParameterCode.InfoRequestParam, mustNonNull: true })
	infoRequestParam: InfoRequestParam;

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetGroupInformationOperationRequest extends GetGroupInformationOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetGroupInformationOperationRequest extends ServerGetGroupInformationOperationRequest {

	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetGroupInformationRequestHandler extends GroupBaseRequestHandler {
	public override getCode() {
		return OperationCode.GetGroupInformation;
	}

	public override getCommonOperationRequest() {
		return GetGroupInformationOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.getGroupInformation.otherSelfEnable && !secretInfo.getPermission().group.getGroupInformation.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		let allowMethod = false;
		let owned = false;

		if (secretInfo.getPermission().group.getGroupInformation.otherSelfEnable) {
			allowMethod = true;
		}

		if (secretInfo.getPermission().group.getGroupInformation.selfEnable) {
			let group = await this.gnServer.getDatabase().loadGroupAsync(request.groupId, secretInfo.getGameId(), {
				members: true,
				groupType: true,
			});

			if (group != null) {
				let groupType = group.getGroupType();
				if (groupType == <number>OwnerType.GamePlayer) {
					let memberItem = group.getMember(authInfo.getUserId());
					if (memberItem != null) {
						if (memberItem.status == <number>GroupStatus.Member) {
							allowMethod = true;
							owned = true;
						}
					}
				}
				else if (groupType == <number>OwnerType.CharacterPlayer) {
					let gamePlayer = await this.gnServer.getDatabase().loadGamePlayerAsync(authInfo.getUserId(), secretInfo.getGameId(), { playerCharacters: true });

					if (gamePlayer != null) {
						let characterPlayers = gamePlayer.getAllPlayerCharacters();

						if (characterPlayers != null) {
							for (let i = 0; i < characterPlayers.length; i++) {
								let characterPlayer = characterPlayers[i];

								let memberItem = group.getMember(characterPlayer.characterId);
								if (memberItem != null) {
									if (memberItem.status == <number>GroupStatus.Member) {
										allowMethod = true;
										owned = true;

										break;
									}
								}
							}
						}
					}
				}
			}
		}

		if (!allowMethod) {
			return this.newOperationNotAllowError(request);
		}

		if (owned) {
			this.generateInfoRequestParamForOwner(secretInfo, request.infoRequestParam);
		}
		else {
			this.generateInfoRequestParamForOther(secretInfo, request.infoRequestParam);
		}

		return this.execute({
			groupId: request.groupId,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetGroupInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.getGroupInformation.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForServer(secretInfo, request.infoRequestParam);

		return this.execute({
			groupId: request.groupId,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetGroupInformationOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().group.getGroupInformation.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		this.generateInfoRequestParamForAdmin(secretInfo, request.infoRequestParam);

		return this.execute({
			groupId: request.groupId,
			infoRequestParam: request.infoRequestParam,
		}, secretInfo, operationRequest);
	}

	private async execute(request: { groupId: string, infoRequestParam: InfoRequestParam }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("group_GetGroupInformation", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let groupFindOptions = this.convertToGroupFindOptions(request.infoRequestParam);

		let group = await this.gnServer.getDatabase().loadGroupAsync(request.groupId, secretInfo.getGameId(), groupFindOptions);

		if (group == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.GroupNotFound);
			return operationResponse;
		}

		operationResponse.setParameter(ParameterCode.InfoResponseParameters, this.generateInfoResponseParameters(group, request.infoRequestParam, secretInfo.getGameId()));

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("group_GetGroupInformation", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
