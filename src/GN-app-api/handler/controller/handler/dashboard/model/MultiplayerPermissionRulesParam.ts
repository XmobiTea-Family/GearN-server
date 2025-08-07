import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class MultiplayerPermissionRulesParam {
	@GNHashtableDataMember({ code: ParameterCode.CancelAllMatchmakingTicket, isOptional: true })
	cancelAllMatchmakingTicket?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CancelMatchmakingTicket, isOptional: true })
	cancelMatchmakingTicket?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateMatchmakingTicket, isOptional: true })
	createMatchmakingTicket?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetMatchmakingTicket, isOptional: true })
	getMatchmakingTicket?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetMatch, isOptional: true })
	getMatch?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetQueueStatistics, isOptional: true })
	getQueueStatistics?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.JoinMatchmakingTicket, isOptional: true })
	joinMatchmakingTicket?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.ListMatchmakingTicketsForPlayer, isOptional: true })
	listMatchmakingTicketsForPlayer?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAllMatchmakingTicket, isOptional: true })
	getAllMatchmakingTicket?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetAllMatch, isOptional: true })
	getAllMatch?: PermissionRulesParam;

}
