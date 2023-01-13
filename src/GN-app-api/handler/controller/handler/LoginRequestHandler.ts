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
import { GoogleLoginType } from "./../../../../GN-common/constant/enumType/GoogleLoginType";

import bcrypt from "bcrypt";

import { Debug } from "./../../../../GN-library/xdebug/lib/xDebug";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember } from "./../../../../GN-common/entity/DataMember";

export class LoginOperationRequest extends OperationRequest {
	@NumberDataMember({ code: LoginParameterCode.LoginType, minValue: 1, maxValue: 15, mustInt: true })
	loginType: number;

	@StringDataMember({ code: LoginParameterCode.Username, isOptional: true })
	username: string;
	@StringDataMember({ code: LoginParameterCode.Password, isOptional: true })
	password: string;
	@StringDataMember({ code: LoginParameterCode.DeviceInfo, isOptional: true })
	deviceInfo: string;
	@StringDataMember({ code: LoginParameterCode.FacebookToken, isOptional: true })
	facebookToken: string;
	@StringDataMember({ code: LoginParameterCode.GoogleToken, isOptional: true, maxLength: 1500, minLength: 100 })
	googleToken: string;
	@NumberDataMember({ code: LoginParameterCode.GoogleLoginType, isOptional: true, minValue: 1, maxValue: 2 })
	googleLoginType: number;
	@StringDataMember({ code: LoginParameterCode.UserId, isOptional: true })
	userId: string;
	@StringDataMember({ code: LoginParameterCode.AppleToken, isOptional: true })
	appleToken: string;
	@StringDataMember({ code: LoginParameterCode.DisplayName, isOptional: true })
	displayName: string;
	@StringDataMember({ code: LoginParameterCode.Signature, isOptional: true })
	signature: string;
	@StringDataMember({ code: LoginParameterCode.PublicAddress, isOptional: true })
	publicAddress: string;
	@StringDataMember({ code: LoginParameterCode.Message, isOptional: true })
	message: string;
	@StringDataMember({ code: LoginParameterCode.CustomId, isOptional: true })
	customId: string;

	public isValidRequest() {
		if (!super.isValidRequest()) return false;

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

			if (this.googleLoginType == GoogleLoginType.AccessToken) {
				return true;
			}
			else if (this.googleLoginType == GoogleLoginType.IdToken) {
				return true;
			}

			return false;
		} else if (this.loginType == LoginType.Apple) {
			if (!this.appleToken) return false;

			return true;
		} else if (this.loginType == LoginType.UserId) {
			if (!this.userId) return false;

			return true;
		} else if (this.loginType == LoginType.PublicAddress) {
			if (!this.signature && !this.publicAddress && !this.message) return true;

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
	protected defaultSegments = { UserRole: UserRoleType.UserNonActivate };

	public getCode() {
		return OperationCode.Login;
	}

	public async handle(authInfo: AuthInfo, operationRequest: OperationRequest): Promise<OperationResponse> {
		let request = this.requestConverterService.createTOperationRequest(operationRequest, LoginOperationRequest);

		if (!request.isValidRequest()) {
			return this.newInvalidRequestParameters(request);
		}

		let loginType = request.loginType;

		if (this.gameApplication.getLoginTypeEnables().indexOf(loginType) != -1) {
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
		}

		return this.newOperationInvalid(request);
	}

	private async handleLoginOperationByAccount(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let username = request.username.toLowerCase();
		let password = request.password;

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByUsername(username);
		if (sparkPlayer == null) {
			let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setScriptData(ParameterCode.ErrorCode, LoginErrorCode.UserDoesNotExists);

			return operationResponse;
		}

		let isMatch = await bcrypt.compare(password, sparkPlayer.getPassword());

		if (!isMatch) {
			let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setScriptData(ParameterCode.ErrorCode, LoginErrorCode.UserDoesNotExists);

			return operationResponse;
		}

		return await this.onAuthenticationResponse(authInfo, request, sparkPlayer);
	}

	private async handleLoginOperationByDevice(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let deviceInfo = request.deviceInfo;

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByDeviceInfo(deviceInfo);
		if (!sparkPlayer) {
			sparkPlayer = await this.gameApplication.getDatabase().createPlayerByDeviceInfo(deviceInfo, this.defaultSegments, (request as any).originRequest.getIP());
		}

		return await this.onAuthenticationResponse(authInfo, request, sparkPlayer);
	}

	private async handleLoginOperationByFacebook(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let facebookToken = request.facebookToken;

		let result = await this.gameApplication.getFacebookService().getBasicInfoByAccessToken(facebookToken);

		if (result["error"] != null) {
			let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setScriptData(ParameterCode.ErrorCode, LoginErrorCode.ErrorWhenLoginFacebook);

			return operationResponse;
		}

		let facebookId = result["id"];
		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByFacebookId(facebookId);

		let displayName = result["name"] || "";
		let facebookEmail = result["email"] || "";

		if (!displayName) displayName = request.displayName;

		let loginOperationRequest = request as any;

		loginOperationRequest.facebookId = facebookId;
		loginOperationRequest.displayName = displayName;
		loginOperationRequest.facebookEmail = facebookEmail;

		if (!sparkPlayer) {
			if (authInfo != null) return await this.handleSyncCurrentAccountByFacebookOperation(authInfo, request, facebookToken, result);

			return await this.handleRegisterByFacebookOperation(authInfo, request, result);
		}

		return await this.handleFacebookAuthenticationResponse(authInfo, request, sparkPlayer, facebookToken, result);
	}

	private async handleLoginOperationByApple(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let appleToken = request.appleToken;

		let result = await this.gameApplication.getAppleService().verifyAppleToken(appleToken);

		if (result["error"] != null) {
			return this.newOperationInvalid(request);
		}

		let loginOperationRequest = request as any;

		let appleUserId = result["sub"];
		loginOperationRequest.appleUserId = appleUserId;
		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByAppleUserId(appleUserId);

		let displayName = loginOperationRequest.displayName;
		let appleId = result["email"] || "";

		if (!displayName) {
			if (appleId) {
				try {
					displayName = appleId.split("@")[0];
				} catch (err) {
					Debug.logException(err);
				}
			}
		}

		loginOperationRequest.appleUserId = appleUserId;
		loginOperationRequest.displayName = displayName;
		loginOperationRequest.appleId = appleId;

		if (!sparkPlayer) {
			if (authInfo != null) return await this.handleSyncCurrentAccountByAppleOperation(authInfo, request, appleToken, result);

			return await this.handleRegisterByAppleOperation(authInfo, request, result);
		}

		return await this.handleAppleAuthenticationResponse(authInfo, request, sparkPlayer, appleToken, result);
	}

	private async handleLoginOperationByGoogle(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let googleToken = request.googleToken;
		let googleLoginType = request.googleLoginType;

		let result = googleLoginType == GoogleLoginType.AccessToken ? await this.gameApplication.getGoogleService().verifyGoogleTokenViaAccessToken(googleToken) : googleLoginType == GoogleLoginType.IdToken ? await this.gameApplication.getGoogleService().verifyGoogleTokenViaIdToken(googleToken) : { "error": "Invalid GoogleLoginType" };

		if (result["error"] != null) {
			return this.newOperationInvalid(request);
		}

		let loginOperationRequest = request as any;

		let googleUserId = result["sub"];
		loginOperationRequest.googleUserId = googleUserId;
		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByGoogleUserId(googleUserId);

		let displayName = result["name"] || "";
		let email = result["email"] || "";

		if (!displayName) displayName = request.displayName;

		if (!displayName) {
			if (email) {
				try {
					displayName = email.split("@")[0];
				} catch (err) {
					Debug.logException(err);
				}
			}
		}

		loginOperationRequest.googleUserId = googleUserId;
		loginOperationRequest.displayName = displayName;
		loginOperationRequest.email = email;

		if (!sparkPlayer) {
			if (authInfo != null) return await this.handleSyncCurrentAccountByGoogleOperation(authInfo, request, googleToken, result);

			return await this.handleRegisterByGoogleOperation(authInfo, request, result);
		}

		return await this.handleGoogleAuthenticationResponse(authInfo, request, sparkPlayer, googleToken, result);
	}

	private async handleSyncCurrentAccountByAppleOperation(
		authInfo: AuthInfo,
		request: LoginOperationRequest,
		appleToken: string,
		result: { [k: string]: any }
	): Promise<OperationResponse> {
		let loginOperationRequest = request as any;
		let appleUserId = loginOperationRequest.appleUserId;

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayer(authInfo.getUserId());
		if (!sparkPlayer) {
			return this.newOperationInternalServerError(request);
		}

		if (sparkPlayer.getUserExternal("AppleUserId") == appleUserId) {
			return this.onAuthenticationResponse(authInfo, request, sparkPlayer);
		}

		sparkPlayer.setUserExternal("AppleUserId", appleUserId);
		if (loginOperationRequest.displayName) sparkPlayer.setFullname(loginOperationRequest.displayName);

		let email = loginOperationRequest.appleId;
		if (email) {
			// mail.sendFacebookRegisterMail(DEFAULT_LANGUAGE, email, sparkPlayer.getFullname());
			sparkPlayer.setUserEmail(email, true);
		}

		return await this.handleAppleAuthenticationResponse(authInfo, request, sparkPlayer, appleToken, result);
	}

	private async handleSyncCurrentAccountByGoogleOperation(
		authInfo: AuthInfo,
		request: LoginOperationRequest,
		googleToken: string,
		result: { [k: string]: any }
	): Promise<OperationResponse> {
		let loginOperationRequest = request as any;
		let googleUserId = loginOperationRequest.googleUserId;

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayer(authInfo.getUserId());
		if (!sparkPlayer) {
			return this.newOperationInternalServerError(request);
		}

		if (sparkPlayer.getUserExternal("GoogleUserId") == googleUserId) {
			return this.onAuthenticationResponse(authInfo, request, sparkPlayer);
		}

		sparkPlayer.setUserExternal("GoogleUserId", googleUserId);
		if (loginOperationRequest.displayName) sparkPlayer.setFullname(loginOperationRequest.displayName);

		let email = loginOperationRequest.email;
		if (email) {
			// mail.sendFacebookRegisterMail(DEFAULT_LANGUAGE, email, sparkPlayer.getFullname());
			sparkPlayer.setUserEmail(email, true);
		}

		return await this.handleGoogleAuthenticationResponse(authInfo, request, sparkPlayer, googleToken, result);
	}

	private async handleRegisterByAppleOperation(authInfo: AuthInfo, request: LoginOperationRequest, result: { [k: string]: any }) {
		let loginOperationRequest = request as any;

		let appleUserId = loginOperationRequest.appleUserId;
		let email = loginOperationRequest.appleId;

		let sparkPlayer = await this.gameApplication
			.getDatabase()
			.createPlayerByAppleUserId(appleUserId, this.defaultSegments, (request as any).originRequest.getIP(), email);

		if (!sparkPlayer) {
			return this.newOperationInternalServerError(request);
		}

		if (loginOperationRequest.displayName) sparkPlayer.setFullname(loginOperationRequest.displayName);

		if (email) {
			// mail.sendFacebookRegisterMail(DEFAULT_LANGUAGE, email, sparkPlayer.getFullname());
		}

		return await this.handleAppleAuthenticationResponse(authInfo, request, sparkPlayer, loginOperationRequest.appleToken, result);
	}

	private async handleRegisterByGoogleOperation(authInfo: AuthInfo, request: LoginOperationRequest, result: { [k: string]: any }) {
		let loginOperationRequest = request as any;

		let googleUserId = loginOperationRequest.googleUserId;
		let email = loginOperationRequest.email;

		let sparkPlayer = await this.gameApplication
			.getDatabase()
			.createPlayerByGoogleUserId(googleUserId, this.defaultSegments, (request as any).originRequest.getIP(), email);

		if (!sparkPlayer) {
			return this.newOperationInternalServerError(request);
		}

		if (loginOperationRequest.displayName) sparkPlayer.setFullname(loginOperationRequest.displayName);

		if (email) {
			// mail.sendFacebookRegisterMail(DEFAULT_LANGUAGE, email, sparkPlayer.getFullname());
		}

		return await this.handleGoogleAuthenticationResponse(authInfo, request, sparkPlayer, loginOperationRequest.googleToken, result);
	}

	private async handleAppleAuthenticationResponse(
		authInfo: AuthInfo,
		request: LoginOperationRequest,
		sparkPlayer: xSparkPlayer,
		appleToken: string,
		result: { [k: string]: any }
	): Promise<OperationResponse> {
		let loginOperationRequest = request as any;

		let displayName = loginOperationRequest.displayName;
		let email = loginOperationRequest.appleId;
		let appleUserId = loginOperationRequest.appleUserId;

		this.gameApplication.getDatabase().saveAppleExternal(sparkPlayer.getUserId(), appleUserId, displayName, email, appleToken, result);

		return await this.onAuthenticationResponse(authInfo, request, sparkPlayer);
	}

	private async handleGoogleAuthenticationResponse(
		authInfo: AuthInfo,
		request: LoginOperationRequest,
		sparkPlayer: xSparkPlayer,
		googleToken: string,
		result: { [k: string]: any }
	): Promise<OperationResponse> {
		let loginOperationRequest = request as any;

		let displayName = loginOperationRequest.displayName;
		let email = loginOperationRequest.email;
		let googleUserId = loginOperationRequest.googleUserId;

		this.gameApplication.getDatabase().saveGoogleExternal(sparkPlayer.getUserId(), googleUserId, displayName, email, googleToken, result);

		return await this.onAuthenticationResponse(authInfo, request, sparkPlayer);
	}

	private async handleLoginOperationByUserId(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let userId = request.userId;

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayer(userId);
		if (!sparkPlayer) {
			let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setScriptData(ParameterCode.ErrorCode, LoginErrorCode.UserDoesNotExists);

			return operationResponse;
		}

		return await this.onAuthenticationResponse(authInfo, request, sparkPlayer);
	}

	private async handleLoginOperationByPublicAddress(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let message = request.message;
		let publicAddress = request.publicAddress;
		let signature = request.signature;

		if (!signature && !publicAddress && !message) {
			return await this.handleLoginOperationByPublicAddressSendRandomMessage(authInfo, request);
		}

		if (!this.gameApplication.getWeb3Service().isMatch(message)) {
			let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setScriptData(ParameterCode.ErrorCode, LoginErrorCode.RandomMessageExpired);

			return operationResponse;
		}

		if (this.gameApplication.getWeb3Service().getPublicAddress(message, signature) != publicAddress) {
			let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setScriptData(ParameterCode.ErrorCode, LoginErrorCode.PublicAddressWrong);

			return operationResponse;
		}

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByPublicAddress(publicAddress);
		if (!sparkPlayer) {
			sparkPlayer = await this.gameApplication.getDatabase().createPlayerByPublicAddress(publicAddress, this.defaultSegments, (request as any).originRequest.getIP());
		}

		return await this.onAuthenticationResponse(authInfo, request, sparkPlayer);
	}

	private async handleLoginOperationByPublicAddressSendRandomMessage(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		if (authInfo != null) {
			return this.newOperationInvalid(request);
		}

		let message = this.gameApplication.getWeb3Service().getRandomMessage();

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);
		operationResponse.setScriptData(ParameterCode.ErrorCode, LoginErrorCode.Ok);

		operationResponse.setScriptData(LoginParameterCode.Message, message);

		return operationResponse;
	}

	private async handleLoginOperationByCustomId(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let customId = request.customId;

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByCustomId(customId);
		if (!sparkPlayer) {
			sparkPlayer = await this.gameApplication.getDatabase().createPlayerByCustomId(customId, this.defaultSegments, (request as any).originRequest.getIP());
		}

		return await this.onAuthenticationResponse(authInfo, request, sparkPlayer);
	}

	protected async onAuthenticationResponse(authInfo: AuthInfo, request: LoginOperationRequest, sparkPlayer: xSparkPlayer): Promise<OperationResponse> {
		sparkPlayer.updateTsLastSeen();

		let currentMillisecond = xDatetime.getCurrentMilliseconds();

		let banNormal = sparkPlayer.getUserBan("Normal");
		if (banNormal != null) {
			if (banNormal["IsBan"]) {
				if (banNormal["TsExpire"] > currentMillisecond) {
					let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
					operationResponse.setReturnCode(ReturnCode.Ok);
					operationResponse.setScriptData(ParameterCode.ErrorCode, LoginErrorCode.UserHadBanned);
					operationResponse.setScriptData(LoginParameterCode.TsExpire, banNormal["TsExpire"]);
					operationResponse.setScriptData(LoginParameterCode.Reason, banNormal["Reason"]);

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
		}

		if (request.displayName && !gamePlayer.getDisplayName()) {
			gamePlayer.setDisplayName(request.displayName);

			if (gamePlayer.getSegmentValue("UserRole") == UserRoleType.UserNonActivate) {
				gamePlayer.setSegmentValue("UserRole", UserRoleType.User);
			}
		}

		let newAuth = AuthInfo.Builder()
			.setUserId(userId)
			.setRole(gamePlayer.getSegmentValue("UserRole"))
			.setSocketId('')
			.setSocketRoomIds([])
			.build();
		let newAuthInfo = this.gameApplication.getApiMiddleware().generateAuthToken(newAuth);

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
			return this.onAuthenticationResponse(authInfo, request, sparkPlayer);
		}

		sparkPlayer.setUserExternal("FacebookId", fbId);
		if (loginOperationRequest.displayName) sparkPlayer.setFullname(loginOperationRequest.displayName);

		let email = loginOperationRequest.facebookEmail;
		if (email) {
			// mail.sendFacebookRegisterMail(DEFAULT_LANGUAGE, email, sparkPlayer.getFullname());
			sparkPlayer.setUserEmail(email, true);
		}

		return await this.handleFacebookAuthenticationResponse(authInfo, request, sparkPlayer, facebookToken, fbBasicInfo);
	}

	private async handleRegisterByFacebookOperation(
		authInfo: AuthInfo,
		request: LoginOperationRequest,
		fbBasicInfo: { [k: string]: any }
	): Promise<OperationResponse> {
		let loginOperationRequest = request as any;

		let facebookId = loginOperationRequest.facebookId;
		let email = loginOperationRequest.facebookEmail;

		let sparkPlayer = await this.gameApplication
			.getDatabase()
			.createPlayerByFacebookId(facebookId, this.defaultSegments, (request as any).originRequest.getIP(), email);

		if (!sparkPlayer) {
			return this.newOperationInternalServerError(request);
		}

		if (loginOperationRequest.displayName) sparkPlayer.setFullname(loginOperationRequest.displayName);

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
		this.gameApplication.getDatabase().saveFBExternal(userId, fbBasicInfo["id"], facebookName, fbBasicInfo["email"] || "", facebookToken, fbBasicInfo);

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
		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId(), request.isEncrypted());
		operationResponse.setReturnCode(ReturnCode.Ok);
		operationResponse.setScriptData(ParameterCode.ErrorCode, LoginErrorCode.Ok);
		operationResponse.setScriptData(ParameterCode.AuthToken, authInfo.getAuthToken());
		operationResponse.setScriptData(ParameterCode.UserId, authInfo.getUserId());

		if (this.postHandle != null) {
			await this.postHandle(authInfo, request, operationResponse, gamePlayer, sparkPlayer);
		}

		return operationResponse;
	}

}
