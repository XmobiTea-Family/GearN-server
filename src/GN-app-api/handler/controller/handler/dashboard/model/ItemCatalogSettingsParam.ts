import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { ItemClassSettingsParam } from "./ItemClassSettingsParam";

export class ItemCatalogSettingsParam {
    // Stores the catalog ID value used by this instance.
    @StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32 })
    public catalogId: string;

    // Stores the item type value used by this instance.
    @NumberDataMember({ code: ParameterCode.ItemType, mustInt: true })
    public itemType: number;

    // Stores the item class settings value used by this instance.
    @GNArrayDataMember({ code: ParameterCode.ItemClassSettings, elementCls: ItemClassSettingsParam })
    public itemClassSettings: Array<ItemClassSettingsParam>;
}
