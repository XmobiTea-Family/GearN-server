import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class FriendCatalogSettingsParam {
    @StringDataMember({ code: GNParameterCode.CatalogId, minLength: 2, maxLength: 32 })
    catalogId: string;

    @BooleanDataMember({ code: GNParameterCode.ForceAcceptFriend })
    forceAcceptFriend: boolean;
}
