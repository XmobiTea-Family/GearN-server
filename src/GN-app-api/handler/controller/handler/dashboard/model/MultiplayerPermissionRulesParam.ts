import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class MultiplayerPermissionRulesParam {

	// Indicates whether cel all matchmaking ticket can be performed.
	@GNHashtableDataMember({ code: ParameterCode.CancelAllMatchmakingTicket, isOptional: true })
	public cancelAllMatchmakingTicket?: PermissionRulesParam;

	// Indicates whether cel matchmaking ticket can be performed.
	@GNHashtableDataMember({ code: ParameterCode.CancelMatchmakingTicket, isOptional: true })
	public cancelMatchmakingTicket?: PermissionRulesParam;

	// Stores the create matchmaking ticket value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.CreateMatchmakingTicket, isOptional: true })
	public createMatchmakingTicket?: PermissionRulesParam;

	// Stores the get matchmaking ticket value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetMatchmakingTicket, isOptional: true })
	public getMatchmakingTicket?: PermissionRulesParam;

	// Stores the get match value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetMatch, isOptional: true })
	public getMatch?: PermissionRulesParam;

	// Stores the get queue statistics value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetQueueStatistics, isOptional: true })
	public getQueueStatistics?: PermissionRulesParam;

	// Stores the join matchmaking ticket value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.JoinMatchmakingTicket, isOptional: true })
	public joinMatchmakingTicket?: PermissionRulesParam;

	// Stores the list matchmaking tickets for player value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.ListMatchmakingTicketsForPlayer, isOptional: true })
	public listMatchmakingTicketsForPlayer?: PermissionRulesParam;

	// Stores the get all matchmaking ticket value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetAllMatchmakingTicket, isOptional: true })
	public getAllMatchmakingTicket?: PermissionRulesParam;

	// Stores the get all match value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetAllMatch, isOptional: true })
	public getAllMatch?: PermissionRulesParam;

}
