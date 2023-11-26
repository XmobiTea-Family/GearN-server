import { GNParameterCode } from "./../../../../../../GN-common/constant/parameterCode/GNParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class ContentPermissionRulesParam {
    @GNHashtableDataMember({ code: GNParameterCode.GetContentData, isOptional: true })
    getContentData?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.SetContentData, isOptional: true })
    setContentData?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.CreateNewFileUploadInfo, isOptional: true })
    createNewFileUploadInfo?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetFileUploadInfoList, isOptional: true })
    getFileUploadInfoList?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.GetFileUploadInfo, isOptional: true })
    getFileUploadInfo?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.RemoveFileUploadInfo, isOptional: true })
    removeFileUploadInfo?: PermissionRulesParam;

    @GNHashtableDataMember({ code: GNParameterCode.RequestDownloadFileUploadInfo, isOptional: true })
    requestDownloadFileUploadInfo?: PermissionRulesParam;

}
