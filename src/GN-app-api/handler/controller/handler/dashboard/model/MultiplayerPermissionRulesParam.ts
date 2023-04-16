import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class MultiplayerPermissionRulesParam {
    @GNHashtableDataMember({ code: GNParameterCode.CancelAllMatchmakingTicket, isOptional: true })
    cancelAllMatchmakingTicket?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.CancelMatchmakingTicket, isOptional: true })
    cancelMatchmakingTicket?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.CreateMatchmakingTicket, isOptional: true })
    createMatchmakingTicket?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetMatchmakingTicket, isOptional: true })
    getMatchmakingTicket?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetMatch, isOptional: true })
    getMatch?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetQueueStatistics, isOptional: true })
    getQueueStatistics?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.JoinMatchmakingTicket, isOptional: true })
    joinMatchmakingTicket?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.ListMatchmakingTicketsForPlayer, isOptional: true })
    listMatchmakingTicketsForPlayer?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetAllMatchmakingTicket, isOptional: true })
    getAllMatchmakingTicket?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetAllMatch, isOptional: true })
    getAllMatch?: PermissionRulesParam;

}
