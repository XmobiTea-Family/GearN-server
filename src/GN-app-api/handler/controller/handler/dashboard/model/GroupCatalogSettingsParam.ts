import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class GroupCatalogSettingsParam {
    // Stores the catalog ID value used by this instance.
    @StringDataMember({ code: ParameterCode.CatalogId, minLength: 2, maxLength: 32 })
    public catalogId: string;

    // Stores the description value used by this instance.
    @StringDataMember({ code: ParameterCode.Description })
    public description: string;

    // Indicates whether force accept member.
    @BooleanDataMember({ code: ParameterCode.ForceAcceptMember })
    public forceAcceptMember: boolean;
}
