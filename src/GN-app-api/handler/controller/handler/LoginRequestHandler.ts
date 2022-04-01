import { RequestHandler } from "./base/RequestHandler";

import { OperationRequest } from "./../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "./../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "./../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "./../../../../GN-common/entity/AuthInfo";
import { LoginParameterCode } from "./../../../../GN-common/constant/parameterCode/LoginParameterCode";
import { LoginType } from "./../../../../GN-common/constant/enumType/LoginType";
import { ReturnCode } from "./../../../../GN-common/constant/ReturnCode";
import { ParameterCode } from "./../../../../GN-common/constant/parameterCode/ParameterCode";
import { LoginErrorCode } from "./../../../../GN-common/constant/errorCode/LoginErrorCode";
import { UserRoleType } from "./../../../../GN-common/constant/enumType/UserRoleType";
import { xSparkPlayer } from "./../../../../GN-library/xdatabase/lib/entity/xSparkPlayer";
import { xDatetime } from "./../../../../GN-library/xdatetime/lib/xDatetime";
import { xGamePlayer } from "./../../../../GN-library/xdatabase/lib/entity/xGamePlayer";

import bcrypt from "bcrypt";

const DefaultSegments = { UserRole: UserRoleType.UserNonActivate };

class LoginOperationRequest extends OperationRequest {
	loginType: number;
	username: string;
	password: string;
	deviceInfo: string;
	facebookToken: string;
	googleToken: string;
	userId: string;
	appleToken: string;
	displayName: string;
	signature: string;
	publicAddress: string;
	message: string;
	customId: string;

	constructor(operationRequest: OperationRequest) {
		super(operationRequest);

		this.loginType = this.parameters.getNumber(LoginParameterCode.LoginType);

		if (this.loginType == LoginType.Account) {
			this.username = this.parameters.getString(LoginParameterCode.Username);
			this.password = this.parameters.getString(LoginParameterCode.Password);
		} else if (this.loginType == LoginType.Device) {
			this.deviceInfo = this.parameters.getString(LoginParameterCode.DeviceInfo);
		} else if (this.loginType == LoginType.Facebook) {
			this.facebookToken = this.parameters.getString(LoginParameterCode.FacebookToken);
		} else if (this.loginType == LoginType.Google) {
			this.googleToken = this.parameters.getString(LoginParameterCode.GoogleToken);
		} else if (this.loginType == LoginType.Apple) {
			this.appleToken = this.parameters.getString(LoginParameterCode.AppleToken);
		} else if (this.loginType == LoginType.UserId) {
			this.userId = this.parameters.getString(LoginParameterCode.UserId);
		} else if (this.loginType == LoginType.PublicAddress) {
			this.signature = this.parameters.getString(LoginParameterCode.Signature);
			this.publicAddress = this.parameters.getString(LoginParameterCode.PublicAddress);
			this.message = this.parameters.getString(LoginParameterCode.Message);
		} else if (this.loginType == LoginType.CustomId) {
			this.customId = this.parameters.getString(LoginParameterCode.CustomId);
		}
	}

	public isValidRequest() {
		if (this.loginType == LoginType.Account) {
			if (!this.username) return false;
			if (!this.password) return false;

			return true;
		} else if (this.loginType == LoginType.Device) {
			if (!this.deviceInfo) return false;

			return true;
		} else if (this.loginType == LoginType.Facebook) {
			if (!this.facebookToken) return false;

			return true;
		} else if (this.loginType == LoginType.Google) {
			if (!this.googleToken) return false;

			return true;
		} else if (this.loginType == LoginType.Apple) {
			if (!this.appleToken) return false;

			return true;
		} else if (this.loginType == LoginType.UserId) {
			if (!this.userId) return false;

			return true;
		} else if (this.loginType == LoginType.PublicAddress) {
			if (!this.signature) return false;
			if (!this.publicAddress) return false;
			if (!this.message) return false;

			return true;
		} else if (this.loginType == LoginType.CustomId) {
			if (!this.customId) return false;

			return true;
		}

		return false;
	}
}

export class LoginRequestHandler extends RequestHandler {
	public getCode() {
		return OperationCode.Login;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = new LoginOperationRequest(operationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let loginType = request.loginType;

		if (loginType == LoginType.Account) {
			return await this.handleLoginOperationByAccount(authInfo, request);
		} else if (loginType == LoginType.Device) {
			return await this.handleLoginOperationByDevice(authInfo, request);
		} else if (loginType == LoginType.Facebook) {
			return await this.handleLoginOperationByFacebook(authInfo, request);
		} else if (loginType == LoginType.Google) {
			return await this.handleLoginOperationByGoogle(authInfo, request);
		} else if (loginType == LoginType.Apple) {
			return await this.handleLoginOperationByApple(authInfo, request);
		} else if (loginType == LoginType.UserId) {
			return await this.handleLoginOperationByUserId(authInfo, request);
		} else if (loginType == LoginType.PublicAddress) {
			return await this.handleLoginOperationByPublicAddress(authInfo, request);
		} else if (loginType == LoginType.CustomId) {
			return await this.handleLoginOperationByCustomId(authInfo, request);
		}

		return this.newOperationInvalid(request);
	}

	private async handleLoginOperationByAccount(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let username = request.username.toLowerCase();
		let password = request.password;

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByUsername(username);
		if (sparkPlayer == null) {
			let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setParameter(ParameterCode.ErrorCode, LoginErrorCode.UserDoesNotExists);

			return operationResponse;
		}

		let isMatch = await bcrypt.compare(password, sparkPlayer.getPassword());

		if (!isMatch) {
			let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setParameter(ParameterCode.ErrorCode, LoginErrorCode.UserDoesNotExists);

			return operationResponse;
		}

		return await this.onAuthenticationResponse(authInfo, request, sparkPlayer);
	}

	private async handleLoginOperationByDevice(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let deviceInfo = request.deviceInfo;

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByDeviceInfo(deviceInfo);
		if (!sparkPlayer) {
			sparkPlayer = await this.gameApplication.getDatabase().createPlayerByDeviceInfo(deviceInfo, DefaultSegments, request.getOriginRequest().getIP());
		}

		return await this.onAuthenticationResponse(authInfo, request, sparkPlayer);
	}

	private async handleLoginOperationByFacebook(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let facebookToken = request.facebookToken;

		let result = await this.gameApplication.getFacebookService().getBasicInfoByAccessToken(facebookToken);

		if (result["error"] != null) {
			let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setParameter(ParameterCode.ErrorCode, LoginErrorCode.ErrorWhenLoginFacebook);

			return operationResponse;
		}

		let facebookId = result["id"];
		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByFacebookId(facebookId);

		if (!sparkPlayer) {
			let facebookDisplayName = result["name"] || "";
			let facebookEmail = result["email"] || "";

			let loginOperationRequest = request as any;

			loginOperationRequest.facebookId = facebookId;
			loginOperationRequest.facebookDisplayName = facebookDisplayName;
			loginOperationRequest.facebookEmail = facebookEmail;

			if (authInfo != null) return await this.handleSyncCurrentAccountByFacebookOperation(authInfo, request, facebookToken, result);

			return await this.handleRegisterByFacebookOperation(authInfo, request, result);
		}

		return await this.handleFacebookAuthenticationResponse(authInfo, request, sparkPlayer, facebookToken, result);
	}

	private async handleLoginOperationByGoogle(authInfo: AuthInfo, request: LoginOperationRequest) {
		return this.newOperationInvalid(request);
	}

	private async handleLoginOperationByApple(authInfo: AuthInfo, request: LoginOperationRequest) {
		return this.newOperationInvalid(request);
	}

	private async handleLoginOperationByUserId(authInfo: AuthInfo, request: LoginOperationRequest) {
		return this.newOperationInvalid(request);
	}

	private async handleLoginOperationByPublicAddress(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let publicAddress = request.publicAddress;

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByPublicAddress(publicAddress);
		if (!sparkPlayer) {
			sparkPlayer = await this.gameApplication.getDatabase().createPlayerByPublicAddress(publicAddress, DefaultSegments, request.getOriginRequest().getIP());
		}

		return await this.onAuthenticationResponse(authInfo, request, sparkPlayer);
	}

	private async handleLoginOperationByCustomId(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let customId = request.customId;

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByCustomId(customId);
		if (!sparkPlayer) {
			sparkPlayer = await this.gameApplication.getDatabase().createPlayerByCustomId(customId, DefaultSegments, request.getOriginRequest().getIP());
		}

		return await this.onAuthenticationResponse(authInfo, request, sparkPlayer);
	}

	private async onAuthenticationResponse(authInfo: AuthInfo, request: LoginOperationRequest, sparkPlayer: xSparkPlayer): Promise<OperationResponse> {
		sparkPlayer.updateTsLastSeen();

		let currentMillisecond = xDatetime.getCurrentMilliseconds();

		let banNormal = sparkPlayer.getUserBan("Normal");
		if (banNormal != null) {
			if (banNormal["IsBan"]) {
				if (banNormal["TsExpire"] > currentMillisecond) {
					let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
					operationResponse.setReturnCode(ReturnCode.Ok);
					operationResponse.setParameter(ParameterCode.ErrorCode, LoginErrorCode.UserHadBanned);
					operationResponse.setParameter(LoginParameterCode.TsExpire, banNormal["TsExpire"]);

					return operationResponse;
				} else {
					banNormal["IsBan"] = false;
					sparkPlayer.setUserBan("Normal", banNormal);
				}
			}
		}

		// Check user online in this account
		let userId = sparkPlayer.getUserId();

		if (!request.userId) {
			// xDatabase.addPlayerDeviceInfoLog(userId, masterClient.deviceInfo);
			// xDatabase.addPlayerIPLog(userId, masterClient.IPAddress);
		}

		let gamePlayer = await this.gameApplication.getDatabase().loadGamePlayer(userId);
		if (!gamePlayer) {
			return this.newOperationInternalServerError(request);
		}

		let oldAuthInfo = this.gameApplication.getApiMiddleware().getAuthInfoByUserId(userId);

		if (oldAuthInfo) {
			oldAuthInfo.setOtherUserLogin(true);
			this.gameApplication.getApiMiddleware().updateAuthInfo(oldAuthInfo);
			// Remove cái này đi
		}

		let newAuth = AuthInfo.Builder().setUserId(userId).setRole(gamePlayer.getSegmentValue("UserRole")).build();
		let newAuthInfo = this.gameApplication.getApiMiddleware().generateAuthToken(newAuth);

		if (oldAuthInfo) {
			let roomId = oldAuthInfo.getOtherData("RoomId");
			if (roomId != null) {
				newAuthInfo.setOtherData("RoomId", roomId);
			}
		}

		return await this.handleLoginSuccess(newAuthInfo, request, sparkPlayer, gamePlayer);
	}

	private async handleSyncCurrentAccountByFacebookOperation(
		authInfo: AuthInfo,
		request: LoginOperationRequest,
		facebookToken: string,
		fbBasicInfo: { [k: string]: any }
	): Promise<OperationResponse> {
		// application.RemoveSubscriber(UserId);
		let loginOperationRequest = request as any;
		let fbId = loginOperationRequest.facebookId;

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayer(authInfo.getUserId());
		if (!sparkPlayer) {
			return this.newOperationInternalServerError(request);
		}

		if (sparkPlayer.getUserExternal("FacebookId") == fbId) {
			return this.newOperationInvalid(request);
		}

		sparkPlayer.setUserExternal("FacebookId", fbId);
		if (loginOperationRequest.facebookDisplayName) sparkPlayer.setFullname(loginOperationRequest.facebookDisplayName);

		let email = loginOperationRequest.facebookEmail;
		if (email) {
			// mail.sendFacebookRegisterMail(DEFAULT_LANGUAGE, email, sparkPlayer.getFullname());
			sparkPlayer.setUserEmail(email, true);
		}

		return await this.handleFacebookAuthenticationResponse(authInfo, request, sparkPlayer, facebookToken, fbBasicInfo);
	}

	private async handleRegisterByFacebookOperation(authInfo: AuthInfo, request: LoginOperationRequest, fbBasicInfo: { [k: string]: any }) {
		let loginOperationRequest = request as any;

		let facebookId = loginOperationRequest.facebookId;
		let email = loginOperationRequest.facebookEmail;

		let sparkPlayer = await this.gameApplication.getDatabase().createPlayerByFacebookId(facebookId, DefaultSegments, request.getOriginRequest().getIP(), email);

		if (!sparkPlayer) {
			return this.newOperationInternalServerError(request);
		}

		sparkPlayer.setFullname(loginOperationRequest.facebookDisplayName);

		if (email) {
			// mail.sendFacebookRegisterMail(DEFAULT_LANGUAGE, email, sparkPlayer.getFullname());
		}

		return await this.handleFacebookAuthenticationResponse(authInfo, request, sparkPlayer, loginOperationRequest.facebookToken, fbBasicInfo);
	}

	private async handleFacebookAuthenticationResponse(
		authInfo: AuthInfo,
		request: LoginOperationRequest,
		sparkPlayer: xSparkPlayer,
		facebookToken: string,
		fbBasicInfo: { [k: string]: any }
	): Promise<OperationResponse> {
		let facebookName = fbBasicInfo["name"] || "";
		let userId = sparkPlayer.getUserId();
		this.gameApplication.getDatabase().saveFBExternal(userId, fbBasicInfo["id"], facebookName, fbBasicInfo["email"] || "", facebookToken);

		if (fbBasicInfo["friends"]) {
			let friendArr = fbBasicInfo["friends"]["data"];

			let socialFriendUserIds = [];

			for (let i = 0; i < friendArr.length; i++) {
				let friend = friendArr[i];

				let thisFBId = friend["id"];
				let thisExternal = await this.gameApplication.getDatabase().loadFBExternal(thisFBId);

				if (thisExternal != null) {
					let thisUserId = thisExternal["UserId"];
					socialFriendUserIds.push({
						UserId: thisUserId,
						ExternalSystemId: "FB",
					});
				}
			}

			this.gameApplication.getDatabase().saveFriend(userId, { SocialFriendUserIds: socialFriendUserIds });
		}

		return await this.onAuthenticationResponse(authInfo, request, sparkPlayer);
	}

	private async handleLoginSuccess(
		authInfo: AuthInfo,
		request: LoginOperationRequest,
		sparkPlayer: xSparkPlayer,
		gamePlayer: xGamePlayer
	): Promise<OperationResponse> {
		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);
		operationResponse.setParameter(ParameterCode.ErrorCode, LoginErrorCode.Ok);
		operationResponse.setParameter(ParameterCode.AuthToken, authInfo.getAuthToken());

		return operationResponse;
	}
}
