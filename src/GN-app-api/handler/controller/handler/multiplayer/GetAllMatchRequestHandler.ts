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

class GetAllMatchOperationRequest extends OperationRequest {

	// Indicates whether return member.
	@BooleanDataMember({ code: ParameterCode.ReturnMember, isOptional: true, defaultValue: false })
	public returnMember?: boolean;

	// Stores the skip value used by this instance.
	@NumberDataMember({ code: ParameterCode.Skip, defaultValue: 0, minValue: 0, mustInt: true, isOptional: true })
	public skip?: number;

	// Stores the limit value used by this instance.
	@NumberDataMember({ code: ParameterCode.Limit, defaultValue: 10, minValue: 1, maxValue: 100, mustInt: true, isOptional: true })
	public limit?: number;

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetAllMatchOperationRequest extends GetAllMatchOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetAllMatchOperationRequest extends ServerGetAllMatchOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetAllMatchRequestHandler extends MultiplayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetAllMatch;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetAllMatchOperationRequest;
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

		if (!secretInfo.getPermission().multiplayer.getAllMatch.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			returnMember: request.returnMember,
			skip: request.skip,
			limit: request.limit,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetAllMatchOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.getAllMatch.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			returnMember: request.returnMember,
			skip: request.skip,
			limit: request.limit,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetAllMatchOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.getAllMatch.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			returnMember: request.returnMember,
			skip: request.skip,
			limit: request.limit,
		}, SecretRole.Admin, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { returnMember: boolean, skip: number, limit: number }, role: SecretRole, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_GetAllMatch", request, role, secretInfo, operationRequest);
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
				members: false
			}
		}

		// find tat ca nhung cai ticket nay
		let results = await matchCollection
			.find({}, {
				projection: projection
			})
			.sort({ "_id": -1 }).skip(request.skip).limit(request.limit);

		// Stores the GearN results value used in the current execution flow.
		let gnResults = new GNArray();

		while (await results.hasNext()) {
			// Stores the result value used in the current execution flow.
			let result = await results.next();

			// Stores the match value used in the current execution flow.
			let match = new Match(result, matchCollection);

			// Stores the GearN match value used in the current execution flow.
			let gnMatch = new GNHashtable();

			gnMatch.add(ParameterCode.MatchId, match.getMatchId());
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

			gnResults.add(gnMatch);
		}

		operationResponse.setParameter(ParameterCode.Results, gnResults);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_GetAllMatch", request, role, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
