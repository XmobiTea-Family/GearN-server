import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { CharacterPlayerSettingsParam } from "./CharacterPlayerSettingsParam";
import { GamePlayerSettingsParam } from "./GamePlayerSettingsParam";
import { GroupSettingsParam } from "./GroupSettingsParam";
import { InventorySettingsParam } from "./InventorySettingsParam";

export class GameSettingsParam {
    @GNHashtableDataMember({ code: GNParameterCode.GamePlayerSettings, isOptional: true })
    gamePlayerSettings?: GamePlayerSettingsParam;

    @GNHashtableDataMember({ code: GNParameterCode.CharacterPlayerSettings, isOptional: true })
    characterPlayerSettings?: CharacterPlayerSettingsParam;

    @GNHashtableDataMember({ code: GNParameterCode.GroupSettings, isOptional: true })
    groupSettings?: GroupSettingsParam;

    @GNHashtableDataMember({ code: GNParameterCode.InventorySettings, isOptional: true })
    inventorySettings?: InventorySettingsParam;
}
