import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {
    @BooleanDataMember({ code: GNParameterCode.StoreItems, isOptional: true, defaultValue: false })
    storeItems?: boolean;

    @BooleanDataMember({ code: GNParameterCode.StoreCurrencies, isOptional: true, defaultValue: false })
    storeCurrencies?: boolean;

    @BooleanDataMember({ code: GNParameterCode.PriceCurrencies, isOptional: true, defaultValue: false })
    priceCurrencies?: boolean;

    @BooleanDataMember({ code: GNParameterCode.InAppPurchase, isOptional: true, defaultValue: false })
    inAppPurchase?: boolean;

    @BooleanDataMember({ code: GNParameterCode.RemoveStatus, isOptional: true, defaultValue: false })
    removeStatus?: boolean;

    @BooleanDataMember({ code: GNParameterCode.DisplayName, isOptional: true, defaultValue: false })
    displayName?: boolean;

    @BooleanDataMember({ code: GNParameterCode.Avatar, isOptional: true, defaultValue: false })
    avatar?: boolean;

    @BooleanDataMember({ code: GNParameterCode.TsCreate, isOptional: true, defaultValue: false })
    tsCreate?: boolean;

    @BooleanDataMember({ code: GNParameterCode.Tags, isOptional: true, defaultValue: false })
    tags?: boolean;

    @BooleanDataMember({ code: GNParameterCode.StoreDatas, isOptional: true, defaultValue: false })
    storeDatas?: boolean;
}
