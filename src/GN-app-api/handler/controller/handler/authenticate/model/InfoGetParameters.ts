import { BooleanDataMember } from "@xmobitea/gn-typescript-client";
import { AuthenticateParameterCode } from "../../../../../../GN-common/constant/parameterCode/AuthenticateParameterCode";

export class InfoGetParameter {
    // @BooleanDataMember({ code: AuthenticateParameterCode.UserId, isOptional: true, defaultValue: true })
    // userId: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.UserId, isOptional: true, defaultValue: false })
    external: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.Segments, isOptional: true, defaultValue: false })
    segments: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.ScriptData, isOptional: true, defaultValue: false })
    scriptData: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.PrivateData, isOptional: true, defaultValue: false })
    privateData: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.DisplayName, isOptional: true, defaultValue: false })
    displayName: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.Avatar, isOptional: true, defaultValue: false })
    avatar: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.TsCreate, isOptional: true, defaultValue: false })
    tsCreate: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.Tags, isOptional: true, defaultValue: false })
    tags: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.PlayerBan, isOptional: true, defaultValue: false })
    playerBan: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.PlayerCurrencies, isOptional: true, defaultValue: false })
    playerCurrencies: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.PlayerStatistics, isOptional: true, defaultValue: false })
    playerStatistics: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.PlayerDatas, isOptional: true, defaultValue: false })
    playerDatas: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.IpAddressCreate, isOptional: true, defaultValue: false })
    ipAddressCreate: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.CountryCode, isOptional: true, defaultValue: false })
    countryCode: boolean;

    @BooleanDataMember({ code: AuthenticateParameterCode.TsLastLogin, isOptional: true, defaultValue: false })
    tsLastLogin: boolean;
}