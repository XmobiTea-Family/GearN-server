import { ParameterCode } from "./../../../../../../GN-common/constant/parameterCode/ParameterCode";
import { BooleanDataMember, GNHashtableDataMember, StringDataMember, GNArrayDataMember, NumberDataMember } from "./../../../../../../GN-common/entity/DataMember";
import { PermissionRulesParam } from "./PermissionRulesParam";

export class ContentPermissionRulesParam {

	// Stores the get content data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetContentData, isOptional: true })
	public getContentData?: PermissionRulesParam;

	// Stores the set content data value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.SetContentData, isOptional: true })
	public setContentData?: PermissionRulesParam;

	// Stores the create new file upload info value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.CreateNewFileUploadInfo, isOptional: true })
	public createNewFileUploadInfo?: PermissionRulesParam;

	// Stores the get file upload info list value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetFileUploadInfoList, isOptional: true })
	public getFileUploadInfoList?: PermissionRulesParam;

	// Stores the get file upload info value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.GetFileUploadInfo, isOptional: true })
	public getFileUploadInfo?: PermissionRulesParam;

	// Stores the remove file upload info value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.RemoveFileUploadInfo, isOptional: true })
	public removeFileUploadInfo?: PermissionRulesParam;

	// Stores the request download file upload info value used by this instance.
	@GNHashtableDataMember({ code: ParameterCode.RequestDownloadFileUploadInfo, isOptional: true })
	public requestDownloadFileUploadInfo?: PermissionRulesParam;

}
