import { OperationRequest } from "./../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "./../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "./../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "./../../../../../GN-common/entity/DataMember";
import { MasterPlayerParameterCode } from "./../../../../../GN-common/constant/parameterCode/MasterPlayerParameterCode";
import { GNArray, GNHashtable } from "./../../../../../GN-common/common/GNData";
import { MasterPlayerErrorCode } from "../../../../../GN-common/constant/errorCode/MasterPlayerErrorCode";

import { MasterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/MasterPlayerFindOptions";
import { RequestHandler } from "../base/RequestHandler";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";

class GetExternalOperationRequest extends OperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, isOptional: true })
	userId: string;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class ServerGetExternalOperationRequest extends OperationRequest {
    @StringDataMember({ code: MasterPlayerParameterCode.UserId, minLength: 10, maxLength: 10, mustNonNull: true })
	userId: string;

    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

class AdminGetExternalOperationRequest extends ServerGetExternalOperationRequest {
    public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetExternalRequestHandler extends RequestHandler {
	public override getCode() {
		return OperationCode.GetExternal;
	}

	public override getCommonOperationRequest() {
		return GetExternalOperationRequest;
	}

	public async handle(authInfo: AuthInfo, secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, this.getCommonOperationRequest());

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		if (!request.userId) {
            if (!secretInfo.getPermission().masterPlayer.getExternal.selfEnable) {
                return this.newOperationNotAllowError(request);
            }

            request.userId = authInfo.getUserId();
        }
		else if (request.userId != authInfo.getUserId()) {
			if (!secretInfo.getPermission().masterPlayer.getExternal.otherSelfEnable) {
				return this.newOperationNotAllowError(request);
			}
		}

        return this.execute(request.userId, operationRequest);
	}

    public async serverHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, ServerGetExternalOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.getExternal.serverSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, operationRequest);
    }

    public async adminHandle(secretInfo: SecretInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
        let request = this.requestConverterService.createTOperationRequest(operationRequest, AdminGetExternalOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

        if (!secretInfo.getPermission().masterPlayer.getExternal.adminSelfEnable) {
            return this.newOperationNotAllowError(request);
        }

        return this.execute(request.userId, operationRequest);
    }

    private async execute(userId: string, operationRequest: OperationRequest): Promise<OperationResponse> {
		let masterPlayerFindOptions: MasterPlayerFindOptions = {
            external: true
        }

		let operationResponse = new OperationResponse(operationRequest.getOperationCode(), operationRequest.getRequestId(), operationRequest.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);

		let masterPlayer = await this.gnServer.getDatabase().loadMasterPlayerAsync(userId, masterPlayerFindOptions);

		if (masterPlayer == null) {
            operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.PlayerNotFound);
            return operationResponse;
		}

		let gnInfoGetParameters = new GNHashtable();

        let gnExternal = new GNHashtable();

        let externalItem = masterPlayer.getExternal();

        if (externalItem.device != null) {
            let gnDevice = new GNHashtable();

            if (externalItem.device.customDeviceId != null) gnDevice.add(MasterPlayerParameterCode.CustomDeviceId, externalItem.device.customDeviceId);
            if (externalItem.device.androidDeviceId != null) gnDevice.add(MasterPlayerParameterCode.AndroidDeviceId, externalItem.device.androidDeviceId);
            if (externalItem.device.iOSDeviceId != null) gnDevice.add(MasterPlayerParameterCode.iOSDeviceId, externalItem.device.iOSDeviceId);
            if (externalItem.device.windowsPhoneDeviceId != null) gnDevice.add(MasterPlayerParameterCode.WindowsPhoneDeviceId, externalItem.device.windowsPhoneDeviceId);
            if (externalItem.device.windowsDeviceId != null) gnDevice.add(MasterPlayerParameterCode.WindowsDeviceId, externalItem.device.windowsDeviceId);
            if (externalItem.device.linuxDeviceId != null) gnDevice.add(MasterPlayerParameterCode.LinuxDeviceId, externalItem.device.linuxDeviceId);
            if (externalItem.device.macOSDeviceId != null) gnDevice.add(MasterPlayerParameterCode.MacOSDeviceId, externalItem.device.macOSDeviceId);
            if (externalItem.device.editorDeviceId != null) gnDevice.add(MasterPlayerParameterCode.EditorDeviceId, externalItem.device.editorDeviceId);

            gnExternal.add(MasterPlayerParameterCode.Device, gnDevice);
        }
        
        if (externalItem.account != null) {
            let gnAccount = new GNHashtable();

            if (externalItem.account.username != null) gnAccount.add(MasterPlayerParameterCode.Username, externalItem.account.username);

            gnExternal.add(MasterPlayerParameterCode.Account, gnAccount);
        }

        if (externalItem.custom != null) {
            let gnCustom = new GNHashtable();

            if (externalItem.custom.customId != null) gnCustom.add(MasterPlayerParameterCode.CustomId, externalItem.custom.customId);

            gnExternal.add(MasterPlayerParameterCode.Custom, gnCustom);
        }

        if (externalItem.apple != null) {
            let gnApple = new GNHashtable();

            if (externalItem.apple.appleId != null) gnApple.add(MasterPlayerParameterCode.AppleId, externalItem.apple.appleId);

            gnExternal.add(MasterPlayerParameterCode.Apple, gnApple);
        }

        if (externalItem.google != null) {
            let gnGoogle = new GNHashtable();

            if (externalItem.google.googleId != null) gnGoogle.add(MasterPlayerParameterCode.GoogleId, externalItem.google.googleId);

            gnExternal.add(MasterPlayerParameterCode.Custom, gnGoogle);
        }

        if (externalItem.facebook != null) {
            let gnFacebook = new GNHashtable();

            if (externalItem.facebook.facebookId != null) gnFacebook.add(MasterPlayerParameterCode.FacebookId, externalItem.facebook.facebookId);

            gnExternal.add(MasterPlayerParameterCode.Facebook, gnFacebook);
        }

        if (externalItem.genericService != null) {
            let gnGenericServices = new GNArray();

            if (externalItem.genericService.genericServices != null) {

                externalItem.genericService.genericServices.forEach((value, key: string) => {
                    let gnGenericService = new GNHashtable();
                    gnGenericService.add(MasterPlayerParameterCode.ServiceName, key);
                    gnGenericService.add(MasterPlayerParameterCode.ServiceId, value.serviceId);

                    gnGenericServices.add(gnGenericService);
                });
            }

            gnExternal.add(MasterPlayerParameterCode.GenericService, gnGenericServices);
        }

        gnInfoGetParameters.add(MasterPlayerParameterCode.External, gnExternal);

        operationResponse.setParameter(MasterPlayerParameterCode.InfoGetParameters, gnInfoGetParameters);
        
		operationResponse.setParameter(ParameterCode.ErrorCode, MasterPlayerErrorCode.Ok);
		return operationResponse;
    }
}
