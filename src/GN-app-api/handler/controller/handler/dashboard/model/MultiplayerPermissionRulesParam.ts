import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class MultiplayerPermissionRulesParam {

	@GNHashtableDataMember({ code: ParameterCode.CancelAllMatchmakingTicket, isOptional: true })
	public cancelAllMatchmakingTicket?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CancelMatchmakingTicket, isOptional: true })
	public cancelMatchmakingTicket?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateMatchmakingTicket, isOptional: true })
	public createMatchmakingTicket?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetMatchmakingTicket, isOptional: true })
	public getMatchmakingTicket?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetMatch, isOptional: true })
	public getMatch?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetQueueStatistics, isOptional: true })
	public getQueueStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.JoinMatchmakingTicket, isOptional: true })
	public joinMatchmakingTicket?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ListMatchmakingTicketsForPlayer, isOptional: true })
	public listMatchmakingTicketsForPlayer?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAllMatchmakingTicket, isOptional: true })
	public getAllMatchmakingTicket?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAllMatch, isOptional: true })
	public getAllMatch?: PermissionRulesParam;

}
