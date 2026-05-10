import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
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
    // Stores the authenticate value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.Authenticate, isOptional: true })
    public authenticate?: AuthenticatePermissionRulesParam;

    // Stores the master player value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.MasterPlayer, isOptional: true })
    public masterPlayer?: MasterPlayerPermissionRulesParam;

    // Stores the game player value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.GamePlayer, isOptional: true })
    public gamePlayer?: GamePlayerPermissionRulesParam;

    // Stores the character player value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.CharacterPlayer, isOptional: true })
    public characterPlayer?: CharacterPlayerPermissionRulesParam;

    // Stores the content value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.Content, isOptional: true })
    public content?: ContentPermissionRulesParam;

    // Stores the group value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.Group, isOptional: true })
    public group?: GroupPermissionRulesParam;

    // Stores the inventory value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.Inventory, isOptional: true })
    public inventory?: InventoryPermissionRulesParam;

    // Stores the store inventory value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.StoreInventory, isOptional: true })
    public storeInventory?: StoreInventoryPermissionRulesParam;

    // Stores the master admin value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.Dashboard, isOptional: true })
    public dashboard?: MasterAdminPermissionRulesParam;

    // Stores the multiplayer value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.Multiplayer, isOptional: true })
    public multiplayer?: MultiplayerPermissionRulesParam;

    // Stores the cloud script value used by this instance.
    @GNHashtableDataMember({ code: ParameterCode.CloudScript, isOptional: true })
    public cloudScript?: CloudScriptPermissionRulesParam;
}
