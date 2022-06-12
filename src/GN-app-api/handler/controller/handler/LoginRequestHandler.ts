const MAX_RANDOM_MESSAGE_COUNT = 100;

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

import { Md5Generate } from "./../../../../GN-common/helper/Md5Generate";
import { DisplayNameUltils } from "./../../../../GN-common/helper/DisplayNameUltils";

import bcrypt from "bcrypt";
import Web3 from "web3";
import { xRandom } from "./../../../../GN-library/xrandom/lib/xRandom";
import { Debug } from "./../../../../GN-library/xdebug/lib/xDebug";
import { DataMember } from "./../../../service/RequestConverterService";

const web3Instance = new Web3();

const randomMessages: string[] = [];
generateRandomMessage();

function generateRandomMessage() {
	for (let i = 0; i < MAX_RANDOM_MESSAGE_COUNT; i++) {
		let name = DisplayNameUltils.generateRandomString(50);
		let md5 = Md5Generate.getMd5(name);
		randomMessages.push(name + md5);
	}
}

export class LoginOperationRequest extends OperationRequest {
	@DataMember(LoginParameterCode.LoginType)
	loginType: number;

	@DataMember(LoginParameterCode.Username, true)
	username: string;
	@DataMember(LoginParameterCode.Password, true)
	password: string;
	@DataMember(LoginParameterCode.DeviceInfo, true)
	deviceInfo: string;
	@DataMember(LoginParameterCode.FacebookToken, true)
	facebookToken: string;
	@DataMember(LoginParameterCode.GoogleToken, true)
	googleToken: string;
	@DataMember(LoginParameterCode.UserId, true)
	userId: string;
	@DataMember(LoginParameterCode.AppleToken, true)
	appleToken: string;
	@DataMember(LoginParameterCode.DisplayName, true)
	displayName: string;
	@DataMember(LoginParameterCode.Signature, true)
	signature: string;
	@DataMember(LoginParameterCode.PublicAddress, true)
	publicAddress: string;
	@DataMember(LoginParameterCode.Message, true)
	message: string;
	@DataMember(LoginParameterCode.CustomId, true)
	customId: string;

	// constructor(operationRequest: OperationRequest) {
	// 	super(operationRequest);

	// 	this.loginType = this.parameters.getNumber(LoginParameterCode.LoginType);

	// 	if (this.loginType == LoginType.Account) {
	// 		this.username = this.parameters.getString(LoginParameterCode.Username);
	// 		this.password = this.parameters.getString(LoginParameterCode.Password);
	// 	} else if (this.loginType == LoginType.Device) {
	// 		this.deviceInfo = this.parameters.getString(LoginParameterCode.DeviceInfo);
	// 	} else if (this.loginType == LoginType.Facebook) {
	// 		this.facebookToken = this.parameters.getString(LoginParameterCode.FacebookToken);
	// 	} else if (this.loginType == LoginType.Google) {
	// 		this.googleToken = this.parameters.getString(LoginParameterCode.GoogleToken);
	// 	} else if (this.loginType == LoginType.Apple) {
	// 		this.appleToken = this.parameters.getString(LoginParameterCode.AppleToken);
	// 	} else if (this.loginType == LoginType.UserId) {
	// 		this.userId = this.parameters.getString(LoginParameterCode.UserId);
	// 	} else if (this.loginType == LoginType.PublicAddress) {
	// 		this.signature = this.parameters.getString(LoginParameterCode.Signature);
	// 		this.publicAddress = this.parameters.getString(LoginParameterCode.PublicAddress);
	// 		this.message = this.parameters.getString(LoginParameterCode.Message);
	// 	} else if (this.loginType == LoginType.CustomId) {
	// 		this.customId = this.parameters.getString(LoginParameterCode.CustomId);
	// 	}
	// }

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

			return true;
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
	protected DefaultSegments = { UserRole: UserRoleType.UserNonActivate };

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
			sparkPlayer = await this.gameApplication.getDatabase().createPlayerByDeviceInfo(deviceInfo, this.DefaultSegments, request.getOriginRequest().getIP());
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

	private async handleLoginOperationByGoogle(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		return this.newOperationInvalid(request);
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

		if (!sparkPlayer) {
			let appleDisplayName = loginOperationRequest.displayName;
			let appleId = result["email"] || "";

			if (!appleDisplayName) {
				if (appleId) {
					try {
						appleDisplayName = appleId.split("@")[0];
					} catch (err) {
						Debug.logException(err);
					}
				}
			}

			loginOperationRequest.appleUserId = appleUserId;
			loginOperationRequest.appleDisplayName = appleDisplayName;
			loginOperationRequest.appleId = appleId;

			if (authInfo != null) return await this.handleSyncCurrentAccountByAppleOperation(authInfo, request, appleToken, result);

			return await this.handleRegisterByAppleOperation(authInfo, request, result);
		}

		return await this.handleAppleAuthenticationResponse(authInfo, request, sparkPlayer, appleToken, result);
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
		if (loginOperationRequest.appleDisplayName) sparkPlayer.setFullname(loginOperationRequest.appleDisplayName);

		let email = loginOperationRequest.appleId;
		if (email) {
			// mail.sendFacebookRegisterMail(DEFAULT_LANGUAGE, email, sparkPlayer.getFullname());
			sparkPlayer.setUserEmail(email, true);
		}

		return await this.handleAppleAuthenticationResponse(authInfo, request, sparkPlayer, appleToken, result);
	}

	private async handleRegisterByAppleOperation(authInfo: AuthInfo, request: LoginOperationRequest, result: { [k: string]: any }) {
		let loginOperationRequest = request as any;

		let appleUserId = loginOperationRequest.appleUserId;
		let email = loginOperationRequest.appleId;

		let sparkPlayer = await this.gameApplication
			.getDatabase()
			.createPlayerByAppleUserId(appleUserId, this.DefaultSegments, request.getOriginRequest().getIP(), email);

		if (!sparkPlayer) {
			return this.newOperationInternalServerError(request);
		}

		if (loginOperationRequest.appleDisplayName) sparkPlayer.setFullname(loginOperationRequest.appleDisplayName);

		if (email) {
			// mail.sendFacebookRegisterMail(DEFAULT_LANGUAGE, email, sparkPlayer.getFullname());
		}

		return await this.handleAppleAuthenticationResponse(authInfo, request, sparkPlayer, loginOperationRequest.appleToken, result);
	}

	private async handleAppleAuthenticationResponse(
		authInfo: AuthInfo,
		request: LoginOperationRequest,
		sparkPlayer: xSparkPlayer,
		appleToken: string,
		result: { [k: string]: any }
	): Promise<OperationResponse> {
		let loginOperationRequest = request as any;

		let appleDisplayName = loginOperationRequest.appleDisplayName;
		let email = loginOperationRequest.appleId;
		let appleUserId = loginOperationRequest.appleUserId;

		this.gameApplication.getDatabase().saveAppleExternal(sparkPlayer.getUserId(), appleUserId, appleDisplayName, email, appleToken);

		return await this.onAuthenticationResponse(authInfo, request, sparkPlayer);
	}

	private async handleLoginOperationByUserId(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let userId = request.userId;

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayer(userId);
		if (!sparkPlayer) {
			let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setParameter(ParameterCode.ErrorCode, LoginErrorCode.UserDoesNotExists);

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

		let isMatch = randomMessages.indexOf(message) != -1;

		if (!isMatch) {
			let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setParameter(ParameterCode.ErrorCode, LoginErrorCode.RandomMessageExpired);

			return operationResponse;
		}

		if (this.getPublicAddress(message, signature) != publicAddress) {
			let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
			operationResponse.setReturnCode(ReturnCode.Ok);
			operationResponse.setParameter(ParameterCode.ErrorCode, LoginErrorCode.PublicAddressWrong);

			return operationResponse;
		}

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByPublicAddress(publicAddress);
		if (!sparkPlayer) {
			sparkPlayer = await this.gameApplication.getDatabase().createPlayerByPublicAddress(publicAddress, this.DefaultSegments, request.getOriginRequest().getIP());
		}

		return await this.onAuthenticationResponse(authInfo, request, sparkPlayer);
	}

	private async handleLoginOperationByPublicAddressSendRandomMessage(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		if (authInfo != null) {
			return this.newOperationInvalid(request);
		}

		let message = randomMessages[xRandom.randomInt(0, randomMessages.length)];

		let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
		operationResponse.setReturnCode(ReturnCode.Ok);
		operationResponse.setParameter(ParameterCode.ErrorCode, LoginErrorCode.Ok);

		operationResponse.setParameter(LoginParameterCode.Message, message);

		return operationResponse;
	}

	private getPublicAddress(message: string, signature: string): string {
		try {
			return web3Instance.eth.accounts.recover(message, signature);
		} catch (err) {
			Debug.logException(err);
			return "";
		}
	}

	private async handleLoginOperationByCustomId(authInfo: AuthInfo, request: LoginOperationRequest): Promise<OperationResponse> {
		let customId = request.customId;

		let sparkPlayer = await this.gameApplication.getDatabase().loadPlayerByCustomId(customId);
		if (!sparkPlayer) {
			sparkPlayer = await this.gameApplication.getDatabase().createPlayerByCustomId(customId, this.DefaultSegments, request.getOriginRequest().getIP());
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
					let operationResponse = new OperationResponse(request.getOperationCode(), request.getRequestId());
					operationResponse.setReturnCode(ReturnCode.Ok);
					operationResponse.setParameter(ParameterCode.ErrorCode, LoginErrorCode.UserHadBanned);
					operationResponse.setParameter(LoginParameterCode.TsExpire, banNormal["TsExpire"]);
					operationResponse.setParameter(LoginParameterCode.Reason, banNormal["Reason"]);

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

		let newAuth = AuthInfo.Builder().setUserId(userId).setRole(gamePlayer.getSegmentValue("UserRole")).build();
		let newAuthInfo = this.gameApplication.getApiMiddleware().generateAuthToken(newAuth);

		// if (oldAuthInfo) {
		// 	let roomId = oldAuthInfo.getOtherData("RoomId");
		// 	if (roomId != null) {
		// 		newAuthInfo.setOtherData("RoomId", roomId);
		// 	}
		// }

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
			.createPlayerByFacebookId(facebookId, this.DefaultSegments, request.getOriginRequest().getIP(), email);

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

		if (this.postHandle != null) {
			await this.postHandle(authInfo, request, operationResponse, gamePlayer, sparkPlayer);
		}

		return operationResponse;
	}
}
