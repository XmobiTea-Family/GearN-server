import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { ItemClassSettingsParam } from "./ItemClassSettingsParam";

export class ItemCatalogSettingsParam {
    @StringDataMember({ code: GNParameterCode.CatalogId, minLength: 2, maxLength: 32 })
    catalogId: string;

    @NumberDataMember({ code: GNParameterCode.ItemType, mustInt: true })
    itemType: number;

    @GNArrayDataMember({ code: GNParameterCode.ItemClassSettings, elementCls: ItemClassSettingsParam })
    itemClassSettings: Array<ItemClassSettingsParam>;
}
