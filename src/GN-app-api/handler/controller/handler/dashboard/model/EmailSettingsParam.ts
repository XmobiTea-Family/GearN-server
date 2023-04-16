import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class EmailSettingsParam {
    @StringDataMember({ code: GNParameterCode.SendFrom })
    sendFrom: string;

    @BooleanDataMember({ code: GNParameterCode.Secure })
    secure: boolean;

    @StringDataMember({ code: GNParameterCode.Host })
    host: string;

    @NumberDataMember({ code: GNParameterCode.Port })
    port: number;

    @StringDataMember({ code: GNParameterCode.Username })
    username: string;

    @StringDataMember({ code: GNParameterCode.Password })
    password: string;

}
