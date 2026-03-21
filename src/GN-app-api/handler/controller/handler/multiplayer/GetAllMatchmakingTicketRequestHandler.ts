import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";

import { ErrorCode } from "./../../../../../GN-common/constant/errorCode/ErrorCode";

import { SecretInfo } from "./../../../../../GN-common/entity/SecretInfo";
import { MatchmakingTicketStatus } from "./../../../../../GN-common/constant/enumType/MatchmakingTicketStatus";
import { MatchmakingTicket } from "./../../../../../GN-library/xdatabase/lib/entity/pro/MatchmakingTicket";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { MultiplayerBaseRequestHandler } from "./MultiplayerBaseRequestHandler";

class GetAllMatchmakingTicketOperationRequest extends OperationRequest {

	// Stores the status value used by this instance.
	@NumberDataMember({ code: ParameterCode.Status, minValue: 1, maxValue: 5, isOptional: true, mustInt: true })
	public status?: number;

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

class ServerGetAllMatchmakingTicketOperationRequest extends GetAllMatchmakingTicketOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetAllMatchmakingTicketOperationRequest extends ServerGetAllMatchmakingTicketOperationRequest {

	/**
	 * Checks whether valid request.
	 */
	public override isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetAllMatchmakingTicketRequestHandler extends MultiplayerBaseRequestHandler {

	/**
	 * Returns the code.
	 */
	public override getCode() {
		return OperationCode.GetAllMatchmakingTicket;
	}

	/**
	 * Returns the common operation request.
	 */
	public override getCommonOperationRequest() {
		return GetAllMatchmakingTicketOperationRequest;
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

		if (!secretInfo.getPermission().multiplayer.getAllMatchmakingTicket.selfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			status: request.status,
			returnMember: request.returnMember,
			skip: request.skip,
			limit: request.limit,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetAllMatchmakingTicketOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.getAllMatchmakingTicket.serverSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			status: request.status,
			returnMember: request.returnMember,
			skip: request.skip,
			limit: request.limit,
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
		let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetAllMatchmakingTicketOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!secretInfo.getPermission().multiplayer.getAllMatchmakingTicket.adminSelfEnable) {
			return this.newOperationNotAllowError(request);
		}

		return this.execute({
			status: request.status,
			returnMember: request.returnMember,
			skip: request.skip,
			limit: request.limit,
		}, secretInfo, operationRequest);
	}

	/**
	 * Executes the execute workflow asynchronously.
	 * @param request Provides the request value used by this operation.
	 * @param secretInfo Provides the secret info value used by this operation.
	 * @param operationRequest Provides the operation request value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async execute(request: { status: number, returnMember: boolean, skip: number, limit: number }, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		// Stores the operation response value used in the current execution flow.
		let operationResponse = await this.gnServer.getPreEventCallbackService().onEvent("multiplayer_GetAllMatchmakingTicket", request, secretInfo, operationRequest);
		if (operationResponse != null) {
			return operationResponse;
		}

		operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);

		// Stores the matchmaking ticket collection value used in the current execution flow.
		let matchmakingTicketCollection = this.gnServer.getDatabase().runtimeGameCollection("MatchmakingTicket", secretInfo.getGameId());

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;
		if (request.status != null && request.status != 0) {
			$filter["status"] = request.status;
		}

		// Stores the projection value used in the current execution flow.
		let projection = null;
		if (!request.returnMember) {
			projection = {
				"members": false
			}
		}

		// Stores the GearN results value used in the current execution flow.
		let gnResults = new GNArray();
		// Stores the results value used in the current execution flow.
		let results = await matchmakingTicketCollection
			.find($filter, { projection: projection })
			.sort({ "_id": -1 })
			.skip(request.skip)
			.limit(request.limit);

		while (await results.hasNext()) {
			// Stores the result value used in the current execution flow.
			let result = await results.next();

			// Stores the matchmaking ticket value used in the current execution flow.
			let matchmakingTicket = new MatchmakingTicket(result, matchmakingTicketCollection);

			// Stores the GearN matchmaking ticket value used in the current execution flow.
			let gnMatchmakingTicket = new GNHashtable();

			gnMatchmakingTicket.add(ParameterCode.TicketId, matchmakingTicket.getTicketId());
			gnMatchmakingTicket.add(ParameterCode.TsCreate, matchmakingTicket.getTsCreate());
			gnMatchmakingTicket.add(ParameterCode.CreatorId, matchmakingTicket.getCreatorId());
			gnMatchmakingTicket.add(ParameterCode.GiveUpAfterSeconds, matchmakingTicket.getGiveUpAfterSeconds());
			gnMatchmakingTicket.add(ParameterCode.QueueName, matchmakingTicket.getQueueName());
			gnMatchmakingTicket.add(ParameterCode.Status, matchmakingTicket.getStatus());

			if (matchmakingTicket.getStatus() == <number>MatchmakingTicketStatus.Matched) {
				gnMatchmakingTicket.add(ParameterCode.MatchId, matchmakingTicket.getMatchId());
			}

			if (request.returnMember) {
				// Stores the GearN members value used in the current execution flow.
				let gnMembers = new GNArray();

				// Stores the members value used in the current execution flow.
				let members = matchmakingTicket.getMembers();
				for (let i = 0; i < members.length; i++) {
					// Stores the member value used in the current execution flow.
					let member = members[i];

					// Stores the GearN member value used in the current execution flow.
					let gnMember = new GNHashtable();

					gnMember.add(ParameterCode.UserId, member.userId);
					gnMember.add(ParameterCode.Status, member.status);
					gnMember.add(ParameterCode.Attribute, member.attribute);

					gnMembers.add(gnMember);
				}

				gnMatchmakingTicket.add(ParameterCode.Members, gnMembers);
			}

			gnResults.add(gnMatchmakingTicket);
		}

		operationResponse.setParameter(ParameterCode.Results, gnResults);
		operationResponse.setParameter(ParameterCode.ErrorCode, ErrorCode.Ok);

		await this.gnServer.getPostEventCallbackService().onEvent("multiplayer_GetAllMatchmakingTicket", request, secretInfo, operationRequest, operationResponse);

		return operationResponse;
	}
}
