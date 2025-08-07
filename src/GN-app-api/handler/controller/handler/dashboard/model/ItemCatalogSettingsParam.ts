import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { ItemClassSettingsParam } from "./ItemClassSettingsParam";

export class ItemCatalogSettingsParam {
	@StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32 })
	catalogId: string;

	@NumberDataMember({ code: ParameterCode.ItemType, mustInt: true })
	itemType: number;

	@GNArrayDataMember({ code: ParameterCode.ItemClassSettings, elementCls: ItemClassSettingsParam })
	itemClassSettings: Array<ItemClassSettingsParam>;
}
