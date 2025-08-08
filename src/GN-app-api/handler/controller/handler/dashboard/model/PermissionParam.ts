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

	@GNHashtableDataMember({ code: ParameterCode.Authenticate, isOptional: true })
	public authenticate?: AuthenticatePermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.MasterPlayer, isOptional: true })
	public masterPlayer?: MasterPlayerPermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GamePlayer, isOptional: true })
	public gamePlayer?: GamePlayerPermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CharacterPlayer, isOptional: true })
	public characterPlayer?: CharacterPlayerPermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.Content, isOptional: true })
	public content?: ContentPermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.Group, isOptional: true })
	public group?: GroupPermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.Inventory, isOptional: true })
	public inventory?: InventoryPermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.StoreInventory, isOptional: true })
	public storeInventory?: StoreInventoryPermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.MasterAdmin, isOptional: true })
	public masterAdmin?: MasterAdminPermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.Multiplayer, isOptional: true })
	public multiplayer?: MultiplayerPermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CloudScript, isOptional: true })
	public cloudScript?: CloudScriptPermissionRulesParam;

}
