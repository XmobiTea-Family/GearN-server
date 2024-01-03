import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";

export class EmailSettingsParam {
    @StringDataMember({ code: GNParameterCode.SendFrom })
    sendFrom: string;

    @StringDataMember({ code: GNParameterCode.SendGridApiKey })
    sendGridApiKey: string;

}
