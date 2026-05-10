import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNArrayDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class InfoRequestParam {
    // Indicates whether store items.
    @BooleanDataMember({ code: ParameterCode.StoreItems, isOptional: true, defaultValue: false })
    public storeItems?: boolean;

    // Indicates whether store item type.
    @BooleanDataMember({ code: ParameterCode.StoreItemType, isOptional: true, defaultValue: false })
    public storeItemType?: boolean;

    // Indicates whether store currencies.
    @BooleanDataMember({ code: ParameterCode.StoreCurrencies, isOptional: true, defaultValue: false })
    public storeCurrencies?: boolean;

    // Indicates whether price currencies.
    @BooleanDataMember({ code: ParameterCode.PriceCurrencies, isOptional: true, defaultValue: false })
    public priceCurrencies?: boolean;

    // Indicates whether in app purchase.
    @BooleanDataMember({ code: ParameterCode.InAppPurchase, isOptional: true, defaultValue: false })
    public inAppPurchase?: boolean;

    // Indicates whether remove status.
    @BooleanDataMember({ code: ParameterCode.RemoveStatus, isOptional: true, defaultValue: false })
    public removeStatus?: boolean;

    // Indicates whether display name.
    @BooleanDataMember({ code: ParameterCode.DisplayName, isOptional: true, defaultValue: false })
    public displayName?: boolean;

    // Indicates whether avatar.
    @BooleanDataMember({ code: ParameterCode.Avatar, isOptional: true, defaultValue: false })
    public avatar?: boolean;

    // Indicates whether timestamp create.
    @BooleanDataMember({ code: ParameterCode.TsCreate, isOptional: true, defaultValue: false })
    public tsCreate?: boolean;

    // Indicates whether tags.
    @BooleanDataMember({ code: ParameterCode.Tags, isOptional: true, defaultValue: false })
    public tags?: boolean;

    // Indicates whether store datas.
    @BooleanDataMember({ code: ParameterCode.StoreDatas, isOptional: true, defaultValue: false })
    public storeDatas?: boolean;
}
