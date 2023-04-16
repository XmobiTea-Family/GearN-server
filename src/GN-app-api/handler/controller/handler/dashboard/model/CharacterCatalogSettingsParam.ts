import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class CharacterCatalogSettingsParam {
    @StringDataMember({ code: GNParameterCode.CatalogId, minLength: 2, maxLength: 32 })
    catalogId: string;

    @StringDataMember({ code: GNParameterCode.DisplayName, isOptional: true })
    displayName?: string;
}
