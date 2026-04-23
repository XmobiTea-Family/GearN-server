import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo, SecretRole } from "./../../../../../GN-common/entity/SecretInfo";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { Match } from "./../../../../../GN-library/xdatabase/lib/entity/pro/Match";
import { MultiplayerBaseRequestHandler } from "./MultiplayerBaseRequestHandler";

class GetMatchOperationRequest extends OperationRequest {
	// Stores the match ID value used by this instance.
	@StringDataMember({ code: ParameterCode.MatchId, minLength: 15, maxLength: 15 })
	public matchId: string;

	// Indicates whether return member.
	@BooleanDataMember({ code: ParameterCode.ReturnMember, isOptional: true, defaultValue: false })
	public returnMember?: boolean;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetMatchOperationRequest extends GetMatchOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetMatchOperationRequest extends ServerGetMatchOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetMatchRequestHandler extends MultiplayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetMatch;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetMatchOperationRequest;
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

		if (!secretInfo.getPermission().multiplayer.getMatch.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: authInfo.getUserId(),
			matchId: request.matchId,
			returnMember: request.returnMember,
		}, SecretRole.Player, secretInfo, operationRequest);
	}

	/**
	 * Executes the server handle workflow asynchronously.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the request value used in the current execution flow.
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetMatchOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.getMatch.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: null,
			matchId: request.matchId,
			returnMember: request.returnMember,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetMatchOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.getMatch.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			userId: null,
			matchId: request.matchId,
			returnMember: request.returnMember,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { userId: string, matchId: string, returnMember: boolean }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_GetMatch", request, role, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the match collection value used in the current execution flow.
		let matchCollection = this.gnServer.getDatabase().systemGameCollection("Match", secretInfo.getGameId());

		// Stores the projection value used in the current execution flow.
		let projection: any = null;
		if (!request.returnMember) {
			projection = {
				members: false,
			}
		}

		// find tat ca nhung cai ticket nay
		let result = await matchCollection.findOne({ matchId: request.matchId }, {
			projection: projection
		});

		if (result == null) {
			operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchNotFound);
			return operationResponse;
		}

		// Stores the match value used in the current execution flow.
		let match = new Match(result, matchCollection);

		if (role == SecretRole.Player) {
			// Stores the member value used in the current execution flow.
			let members = match.getMembers();
			if (!members.some(m => m.userId === request.userId)) {
				operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.MatchNotFound);
				return operationResponse;
			}
		}

		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		// Stores the GearN match value used in the current execution flow.
		let gnMatch = new GNHashtable();

		gnMatch.add(ParameterCode.TsCreate, match.getTsCreate());
		gnMatch.add(ParameterCode.QueueName, match.getQueueName());
		gnMatch.add(ParameterCode.TimeToMatchInSeconds, match.getTimeToMatchInSeconds());
		gnMatch.add(ParameterCode.Status, match.getStatus());

		if (request.returnMember) {
			// Stores the GearN members value used in the current execution flow.
			let gnMembers = new GNArray();

			// Stores the members value used in the current execution flow.
			let members = match.getMembers();
			for (let i = 0; i < members.length; i++) {
				// Stores the member value used in the current execution flow.
				let member = members[i];

				// Stores the GearN member value used in the current execution flow.
				let gnMember = new GNHashtable();

				gnMember.add(ParameterCode.UserId, member.userId);
				gnMember.add(ParameterCode.TeamId, member.teamId);
				gnMember.add(ParameterCode.Attribute, member.attribute);

				gnMembers.add(gnMember);
			}

			gnMatch.add(ParameterCode.Members, gnMembers);
		}

		// Stores the server detail value used in the current execution flow.
		let serverDetail = match.getServerDetail();
		if (serverDetail != null) {
			// Stores the GearN server detail value used in the current execution flow.
			let gnServerDetail = new GNHashtable();

			gnServerDetail.add(ParameterCode.IpV4Address, serverDetail.ipV4Address);

			// Stores the GearN ports value used in the current execution flow.
			let gnPorts = new GNArray();
			// Stores the ports value used in the current execution flow.
			let ports = serverDetail.ports;

			for (let i = 0; i < ports.length; i++) {
				// Stores the port value used in the current execution flow.
				let port = ports[i];

				// Stores the GearN port value used in the current execution flow.
				let gnPort = new GNHashtable();

				gnPort.add(ParameterCode.Name, port.name);
				gnPort.add(ParameterCode.PublicPort, port.publicPort);
				gnPort.add(ParameterCode.PrivatePort, port.privatePort);
				gnPort.add(ParameterCode.Protocol, port.protocol);

				gnPorts.add(gnPort);
			}

			gnServerDetail.add(ParameterCode.Ports, gnPorts);

			gnMatch.add(ParameterCode.ServerDetail, gnServerDetail);
		}

		operationResponse.setParameter(ParameterCode.Match, gnMatch);

		await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_GetMatch", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
