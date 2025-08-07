import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { CharacterPlayerSettingsParam } from "./CharacterPlayerSettingsParam";
import { GamePlayerSettingsParam } from "./GamePlayerSettingsParam";
import { GroupSettingsParam } from "./GroupSettingsParam";
import { InventorySettingsParam } from "./InventorySettingsParam";

export class GameSettingsParam {
	@GNHashtableDataMember({ code: ParameterCode.GamePlayerSettings, isOptional: true })
	gamePlayerSettings?: GamePlayerSettingsParam;

	@GNHashtableDataMember({ code: ParameterCode.CharacterPlayerSettings, isOptional: true })
	characterPlayerSettings?: CharacterPlayerSettingsParam;

	@GNHashtableDataMember({ code: ParameterCode.GroupSettings, isOptional: true })
	groupSettings?: GroupSettingsParam;

	@GNHashtableDataMember({ code: ParameterCode.InventorySettings, isOptional: true })
	inventorySettings?: InventorySettingsParam;
}
