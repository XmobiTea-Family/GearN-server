import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class ContentPermissionRulesParam {

	@GNHashtableDataMember({ code: ParameterCode.GetContentData, isOptional: true })
	public getContentData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.SetContentData, isOptional: true })
	public setContentData?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.CreateNewFileUploadInfo, isOptional: true })
	public createNewFileUploadInfo?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetFileUploadInfoList, isOptional: true })
	public getFileUploadInfoList?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.GetFileUploadInfo, isOptional: true })
	public getFileUploadInfo?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RemoveFileUploadInfo, isOptional: true })
	public removeFileUploadInfo?: PermissionRulesParam;

	@GNHashtableDataMember({ code: ParameterCode.RequestDownloadFileUploadInfo, isOptional: true })
	public requestDownloadFileUploadInfo?: PermissionRulesParam;

}
