import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { GNHashtableDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { AuthenticatePermissionRulesParam } from "./AuthenticatePermissionRulesParam";
import { CharacterPlayerPermissionRulesParam } from "./CharacterPlayerPermissionRulesParam";
import { ContentPermissionRulesParam } from "./ContentPermissionRulesParam";
import { GamePlayerPermissionRulesParam } from "./GamePlayerPermissionRulesParam";
import { GroupPermissionRulesParam } from "./GroupPermissionRulesParam";
import { InventoryPermissionRulesParam } from "./InventoryPermissionRulesParam";
import { MasterAdminPermissionRulesParam } from "./MasterAdminPermissionRulesParam";
import { MasterPlayerPermissionRulesParam } from "./MasterPlayerPermissionRulesParam";
import { MultiplayerPermissionRulesParam } from "./MultiplayerPermissionRulesParam";
import { StoreInventoryPermissionRulesParam } from "./StoreInventoryPermissionRulesParam";
import { CloudScriptPermissionRulesParam } from "./CloudScriptPermissionRulesParam";

export class PermissionParam {
    @GNHashtableDataMember({ code: GNParameterCode.Authenticate, isOptional: true })
    authenticate?: AuthenticatePermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.MasterPlayer, isOptional: true })
    masterPlayer?: MasterPlayerPermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GamePlayer, isOptional: true })
    gamePlayer?: GamePlayerPermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.CharacterPlayer, isOptional: true })
    characterPlayer?: CharacterPlayerPermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.Content, isOptional: true })
    content?: ContentPermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.Group, isOptional: true })
    group?: GroupPermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.Inventory, isOptional: true })
    inventory?: InventoryPermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.StoreInventory, isOptional: true })
    storeInventory?: StoreInventoryPermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.MasterAdmin, isOptional: true })
    masterAdmin?: MasterAdminPermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.Multiplayer, isOptional: true })
    multiplayer?: MultiplayerPermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.CloudScript, isOptional: true })
    cloudScript?: CloudScriptPermissionRulesParam;

}
