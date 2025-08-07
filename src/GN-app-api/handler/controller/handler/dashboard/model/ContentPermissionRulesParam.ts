import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class ContentPermissionRulesParam {
	@GNHashtableDataMember({ code: ParameterCode.GetContentData, isOptional: true })
	getContentData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetContentData, isOptional: true })
	setContentData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateNewFileUploadInfo, isOptional: true })
	createNewFileUploadInfo?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetFileUploadInfoList, isOptional: true })
	getFileUploadInfoList?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetFileUploadInfo, isOptional: true })
	getFileUploadInfo?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveFileUploadInfo, isOptional: true })
	removeFileUploadInfo?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RequestDownloadFileUploadInfo, isOptional: true })
	requestDownloadFileUploadInfo?: PermissionRulesParam;

}
