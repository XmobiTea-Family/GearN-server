import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { CharacterPlayerSettingsParam } from "./CharacterPlayerSettingsParam";
import { GamePlayerSettingsParam } from "./GamePlayerSettingsParam";
import { GroupSettingsParam } from "./GroupSettingsParam";
import { InventorySettingsParam } from "./InventorySettingsParam";

export class GameSettingsParam {

	// Stores the game player settings value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GamePlayerSettings, isOptional: true })
	public gamePlayerSettings?: GamePlayerSettingsParam;

	// Stores the character player settings value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.CharacterPlayerSettings, isOptional: true })
	public characterPlayerSettings?: CharacterPlayerSettingsParam;

	// Stores the group settings value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GroupSettings, isOptional: true })
	public groupSettings?: GroupSettingsParam;

	// Stores the inventory settings value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.InventorySettings, isOptional: true })
	public inventorySettings?: InventorySettingsParam;

}
