const GN_VERSION = "2.6";

import { RequestController } from "./GN-app-api/handler/controller/RequestController";
import { OperationEvent } from "./GN-common/entity/operationEvent/OperationEvent";
import { Socket } from "socket.io";
import { xDatabase } from "./GN-library/xdatabase/lib/xDatabase";
import { FacebookService } from "./GN-app-api/service/FacebookService";
import { SocketApp } from "./GN-startup/SocketApp";
import { HttpApp } from "./GN-startup/HttpApp";
import { IRequestHandler } from "./GN-app-api/handler/controller/handler/base/IRequestHandler";
// import { AuthInfo } from "./GN-common/entity/AuthInfo";
import { OperationResponse } from "./GN-common/entity/operationResponse/OperationResponse";
import { Request } from "./GN-common/entity/operationRequest/base/Request";

import { AppleService } from "./GN-app-api/service/AppleService";
import { TimerService } from "./GN-app-api/service/TimerService";
import { IFacebookService } from "./GN-app-api/service/IFacebookService";
import { IAppleService } from "./GN-app-api/service/IAppleService";
import { ICloudScriptService } from "./GN-app-api/service/ICloudScriptService";
import { ITimerService } from "./GN-app-api/service/ITimerService";
import { OnRunSuccess } from "./GN-library/xbuilder/lib/OnRunSuccess";
import { ApiMiddleware } from "./GN-startup/middleware/ApiMiddleware";
import { IRequestConverterService } from "./GN-app-api/service/IRequestConverterService";
import { RequestConverterService } from "./GN-app-api/service/RequestConverterService";
import { IGoogleService } from "./GN-app-api/service/IGoogleService";
import { GoogleService } from "./GN-app-api/service/GoogleService";
import { CodeHelper } from "./GN-common/helper/CodeHelper";
import { IAnalyticsService } from "./GN-app-api/service/IAnalyticsService";
import { AnalyticsService } from "./GN-app-api/service/AnalyticsService";
import { IPushNotificationService } from "./GN-app-api/service/IPushNotificationService";
import { PushNotificationService } from "./GN-app-api/service/PushNotificationService";
import { IEmailService } from "./GN-app-api/service/IEmailService";
import { EmailService } from "./GN-app-api/service/EmailService";
import { ICacheService } from "./GN-app-api/service/ICacheService";
import { IConfigService } from "./GN-app-api/service/IConfigService";

import { RequestType } from "./GN-common/constant/enumType/RequestType";
import { xGNSettings } from "./GN-library/xsettings/lib/xGNSettings";
import { IPostEventCallbackService, IPreEventCallbackService } from "./GN-app-api/service/IEventCallbackService";
import { EventCallbackCloudScriptService, IEventCallbackCloudScriptService, PostEventCallbackService, PreEventCallbackService } from "./GN-app-api/service/EventCallbackService";

import { LoginByAccountRequestHandler as Authenticate_LoginByAccountRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByAccountRequestHandler";
import { LoginByAndroidDeviceIdRequestHandler as Authenticate_LoginByAndroidDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByAndroidDeviceIdRequestHandler";
import { LoginByAppleRequestHandler as Authenticate_LoginByAppleRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByAppleRequestHandler";
import { LoginByCustomDeviceIdRequestHandler as Authenticate_LoginByCustomDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByCustomDeviceIdRequestHandler";
import { LoginByCustomIdRequestHandler as Authenticate_LoginByCustomIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByCustomIdRequestHandler";
import { LoginByFacebookRequestHandler as Authenticate_LoginByFacebookRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByFacebookRequestHandler";
import { LoginByGenericServiceRequestHandler as Authenticate_LoginByGenericServiceRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByGenericServiceRequestHandler";
import { LoginByGoogleRequestHandler as Authenticate_LoginByGoogleRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByGoogleRequestHandler";
import { LoginByGooglePlayGameServiceRequestHandler as Authenticate_LoginByGooglePlayGameServiceRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByGooglePlayGameServiceRequestHandler";
import { LoginByGameCenterRequestHandler as Authenticate_LoginByGameCenterRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByGameCenterRequestHandler";
import { LoginByiOSDeviceIdRequestHandler as Authenticate_LoginByiOSDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByiOSDeviceIdRequestHandler";
import { LoginByWindowsPhoneDeviceIdRequestHandler as Authenticate_LoginByWindowsPhoneDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByWindowsPhoneDeviceIdRequestHandler";
import { RegisterAccountRequestHandler as Authenticate_RegisterAccountRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/RegisterAccountRequestHandler";
import { LoginByEditorDeviceIdRequestHandler as Authenticate_LoginByEditorDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByEditorDeviceIdRequestHandler";
import { LoginByLinuxDeviceIdRequestHandler as Authenticate_LoginByLinuxDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByLinuxDeviceIdRequestHandler";
import { LoginByMacOSDeviceIdRequestHandler as Authenticate_LoginByMacOSDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByMacOSDeviceIdRequestHandler";
import { LoginByWindowsDeviceIdRequestHandler as Authenticate_LoginByWindowsDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/LoginByWindowsDeviceIdRequestHandler";
import { RefreshAuthTokenRequestHandler as Authenticate_RefreshAuthTokenRequestHandler } from "./GN-app-api/handler/controller/handler/authenticate/RefreshAuthTokenRequestHandler";

import { LinkAccountRequestHandler as MasterPlayer_LinkAccountRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkAccountRequestHandler";
import { LinkAndroidDeviceIdRequestHandler as MasterPlayer_LinkAndroidDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkAndroidDeviceIdRequestHandler";
import { LinkAppleRequestHandler as MasterPlayer_LinkAppleRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkAppleRequestHandler";
import { LinkCustomDeviceIdRequestHandler as MasterPlayer_LinkCustomDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkCustomDeviceIdRequestHandler";
import { LinkCustomIdRequestHandler as MasterPlayer_LinkCustomIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkCustomIdRequestHandler";
import { LinkEditorDeviceIdRequestHandler as MasterPlayer_LinkEditorDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkEditorDeviceIdRequestHandler";
import { LinkFacebookRequestHandler as MasterPlayer_LinkFacebookRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkFacebookRequestHandler";
import { LinkGenericServiceRequestHandler as MasterPlayer_LinkGenericServiceRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkGenericServiceRequestHandler";
import { LinkGoogleRequestHandler as MasterPlayer_LinkGoogleRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkGoogleRequestHandler";
import { LinkGooglePlayGameServiceRequestHandler as MasterPlayer_LinkGooglePlayGameServiceRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkGooglePlayGameServiceRequestHandler";
import { LinkGameCenterRequestHandler as MasterPlayer_LinkGameCenterRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkGameCenterRequestHandler";
import { LinkiOSDeviceIdRequestHandler as MasterPlayer_LinkiOSDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkiOSDeviceIdRequestHandler";
import { LinkLinuxDeviceIdRequestHandler as MasterPlayer_LinkLinuxDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkLinuxDeviceIdRequestHandler";
import { LinkMacOSDeviceIdRequestHandler as MasterPlayer_LinkMacOSDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkMacOSDeviceIdRequestHandler";
import { LinkWindowsDeviceIdRequestHandler as MasterPlayer_LinkWindowsDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkWindowsDeviceIdRequestHandler";
import { LinkWindowsPhoneDeviceIdRequestHandler as MasterPlayer_LinkWindowsPhoneDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/LinkWindowsPhoneDeviceIdRequestHandler";
import { UnlinkAccountRequestHandler as MasterPlayer_UnlinkAccountRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkAccountRequestHandler";
import { UnlinkAndroidDeviceIdRequestHandler as MasterPlayer_UnlinkAndroidDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkAndroidDeviceIdRequestHandler";
import { UnlinkAppleRequestHandler as MasterPlayer_UnlinkAppleRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkAppleRequestHandler";
import { UnlinkCustomDeviceIdRequestHandler as MasterPlayer_UnlinkCustomDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkCustomDeviceIdRequestHandler";
import { UnlinkCustomIdRequestHandler as MasterPlayer_UnlinkCustomIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkCustomIdRequestHandler";
import { UnlinkEditorDeviceIdRequestHandler as MasterPlayer_UnlinkEditorDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkEditorDeviceIdRequestHandler";
import { UnlinkFacebookRequestHandler as MasterPlayer_UnlinkFacebookRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkFacebookRequestHandler";
import { UnlinkGenericServiceRequestHandler as MasterPlayer_UnlinkGenericServiceRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkGenericServiceRequestHandler";
import { UnlinkGoogleRequestHandler as MasterPlayer_UnlinkGoogleRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkGoogleRequestHandler";
import { UnlinkGooglePlayGameServiceRequestHandler as MasterPlayer_UnlinkGooglePlayGameServiceRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkGooglePlayGameServiceRequestHandler";
import { UnlinkGameCenterRequestHandler as MasterPlayer_UnlinkGameCenterRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkGameCenterRequestHandler";
import { UnlinkiOSDeviceIdRequestHandler as MasterPlayer_UnlinkiOSDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkiOSDeviceIdRequestHandler";
import { UnlinkLinuxDeviceIdRequestHandler as MasterPlayer_UnlinkLinuxDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkLinuxDeviceIdRequestHandler";
import { UnlinkMacOSDeviceIdRequestHandler as MasterPlayer_UnlinkMacOSDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkMacOSDeviceIdRequestHandler";
import { UnlinkWindowsDeviceIdRequestHandler as MasterPlayer_UnlinkWindowsDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkWindowsDeviceIdRequestHandler";
import { UnlinkWindowsPhoneDeviceIdRequestHandler as MasterPlayer_UnlinkWindowsPhoneDeviceIdRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/UnlinkWindowsPhoneDeviceIdRequestHandler";
import { AddSegmentRequestHandler as MasterPlayer_AddSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/AddSegmentRequestHandler";
import { RemoveSegmentRequestHandler as MasterPlayer_RemoveSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/RemoveSegmentRequestHandler";
import { GetSegmentRequestHandler as MasterPlayer_GetSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetSegmentRequestHandler";
import { SetTagRequestHandler as MasterPlayer_SetTagRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/SetTagRequestHandler";
import { RemoveTagRequestHandler as MasterPlayer_RemoveTagRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/RemoveTagRequestHandler";
import { GetTagRequestHandler as MasterPlayer_GetTagRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetTagRequestHandler";
import { GetDisplayNameRequestHandler as MasterPlayer_GetDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetDisplayNameRequestHandler";
import { SetDisplayNameRequestHandler as MasterPlayer_SetDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/SetDisplayNameRequestHandler";
import { GetTsCreateRequestHandler as MasterPlayer_GetTsCreateRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetTsCreateRequestHandler";
import { GetIpAddressCreateRequestHandler as MasterPlayer_GetIpAddressCreateRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetIpAddressCreateRequestHandler";
import { SetTsLastLoginRequestHandler as MasterPlayer_SetTsLastLoginRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/SetTsLastLoginRequestHandler";
import { GetTsLastLoginRequestHandler as MasterPlayer_GetTsLastLoginRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetTsLastLoginRequestHandler";
import { SetPlayerBanRequestHandler as MasterPlayer_SetPlayerBanRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/SetPlayerBanRequestHandler";
import { GetPlayerBanRequestHandler as MasterPlayer_GetPlayerBanRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPlayerBanRequestHandler";
import { SetCountryCodeRequestHandler as MasterPlayer_SetCountryCodeRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/SetCountryCodeRequestHandler";
import { GetCountryCodeRequestHandler as MasterPlayer_GetCountryCodeRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetCountryCodeRequestHandler";
import { ChangeAccountPasswordRequestHandler as MasterPlayer_ChangeAccountPasswordRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/ChangeAccountPasswordRequestHandler";
import { ResetAccountPasswordRequestHandler as MasterPlayer_ResetAccountPasswordRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/ResetAccountPasswordRequestHandler";
import { SetAvatarRequestHandler as MasterPlayer_SetAvatarRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/SetAvatarRequestHandler";
import { GetAvatarRequestHandler as MasterPlayer_GetAvatarRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetAvatarRequestHandler";
import { SetPlayerCurrencyRequestHandler as MasterPlayer_SetPlayerCurrencyRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/SetPlayerCurrencyRequestHandler";
import { GetPlayerCurrencyRequestHandler as MasterPlayer_GetPlayerCurrencyRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPlayerCurrencyRequestHandler";
import { SetPlayerStatisticsRequestHandler as MasterPlayer_SetPlayerStatisticsRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/SetPlayerStatisticsRequestHandler";
import { GetPlayerStatisticsRequestHandler as MasterPlayer_GetPlayerStatisticsRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPlayerStatisticsRequestHandler";
import { GetStatisticsLeaderboardRequestHandler as MasterPlayer_GetStatisticsLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetStatisticsLeaderboardRequestHandler";
import { GetStatisticsLeaderboardAroundPlayerRequestHandler as MasterPlayer_GetStatisticsLeaderboardAroundPlayerRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetStatisticsLeaderboardAroundPlayerRequestHandler";
import { GetCustomDataRequestHandler as MasterPlayer_GetCustomDataRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetCustomDataRequestHandler";
import { SetCustomDataRequestHandler as MasterPlayer_SetCustomDataRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/SetCustomDataRequestHandler";
import { SetPlayerDataRequestHandler as MasterPlayer_SetPlayerDataRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/SetPlayerDataRequestHandler";
import { GetPlayerDataRequestHandler as MasterPlayer_GetPlayerDataRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPlayerDataRequestHandler";
import { GetPlayerInformationRequestHandler as MasterPlayer_GetPlayerInformationRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPlayerInformationRequestHandler";
import { GetPlayersWithAppleRequestHandler as MasterPlayer_GetPlayersWithAppleRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPlayersWithAppleRequestHandler";
import { GetPlayersWithFacebookRequestHandler as MasterPlayer_GetPlayersWithFacebookRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPlayersWithFacebookRequestHandler";
import { GetPlayersWithGoogleRequestHandler as MasterPlayer_GetPlayersWithGoogleRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPlayersWithGoogleRequestHandler";
import { GetPlayersWithGooglePlayGameServiceRequestHandler as MasterPlayer_GetPlayersWithGooglePlayGameServiceRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPlayersWithGooglePlayGameServiceRequestHandler";
import { GetPlayersWithGameCenterRequestHandler as MasterPlayer_GetPlayersWithGameCenterRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPlayersWithGameCenterRequestHandler";
import { GetPlayersWithGenericServiceRequestHandler as MasterPlayer_GetPlayersWithGenericServiceRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPlayersWithGenericServiceRequestHandler";
import { GetPlayersWithSegmentRequestHandler as MasterPlayer_GetPlayersWithSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPlayersWithSegmentRequestHandler";
import { GetPlayersWithTagRequestHandler as MasterPlayer_GetPlayersWithTagRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPlayersWithTagRequestHandler";
import { GetExternalRequestHandler as MasterPlayer_GetExternalRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetExternalRequestHandler";
import { GetPlayersWithDisplayNameRequestHandler as MasterPlayer_GetPlayersWithDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPlayersWithDisplayNameRequestHandler";
import { GetEmailRequestHandler as MasterPlayer_GetEmailRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetEmailRequestHandler";
import { SetEmailRequestHandler as MasterPlayer_SetEmailRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/SetEmailRequestHandler";
import { GetCurrencyLeaderboardRequestHandler as MasterPlayer_GetCurrencyLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetCurrencyLeaderboardRequestHandler";
import { GetCreateLeaderboardRequestHandler as MasterPlayer_GetCreateLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetCreateLeaderboardRequestHandler";
import { GetLastLoginLeaderboardRequestHandler as MasterPlayer_GetLastLoginLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetLastLoginLeaderboardRequestHandler";
import { GetStatisticsLogRequestHandler as MasterPlayer_GetStatisticsLogRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetStatisticsLogRequestHandler";
import { GetCurrencyLogRequestHandler as MasterPlayer_GetCurrencyLogRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetCurrencyLogRequestHandler";
import { SendSocketOperationEventRequestHandler as MasterPlayer_SendSocketOperationEventRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/SendSocketOperationEventRequestHandler";
import { SendEmailRequestHandler as MasterPlayer_SendEmailRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/SendEmailRequestHandler";
import { SendPushNotificationRequestHandler as MasterPlayer_SendPushNotificationRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/SendPushNotificationRequestHandler";
import { AddPushNotificationRequestHandler as MasterPlayer_AddPushNotificationRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/AddPushNotificationRequestHandler";
import { RemovePushNotificationRequestHandler as MasterPlayer_RemovePushNotificationRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/RemovePushNotificationRequestHandler";
import { GetPushNotificationRequestHandler as MasterPlayer_GetPushNotificationRequestHandler } from "./GN-app-api/handler/controller/handler/masterPlayer/GetPushNotificationRequestHandler";

import { AddSegmentRequestHandler as CharacterPlayer_AddSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/AddSegmentRequestHandler";
import { RemoveSegmentRequestHandler as CharacterPlayer_RemoveSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/RemoveSegmentRequestHandler";
import { GetSegmentRequestHandler as CharacterPlayer_GetSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetSegmentRequestHandler";
import { SetTagRequestHandler as CharacterPlayer_SetTagRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/SetTagRequestHandler";
import { RemoveTagRequestHandler as CharacterPlayer_RemoveTagRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/RemoveTagRequestHandler";
import { GetTagRequestHandler as CharacterPlayer_GetTagRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetTagRequestHandler";
import { GetDisplayNameRequestHandler as CharacterPlayer_GetDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetDisplayNameRequestHandler";
import { SetDisplayNameRequestHandler as CharacterPlayer_SetDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/SetDisplayNameRequestHandler";
import { GetTsCreateRequestHandler as CharacterPlayer_GetTsCreateRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetTsCreateRequestHandler";
import { GetIpAddressCreateRequestHandler as CharacterPlayer_GetIpAddressCreateRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetIpAddressCreateRequestHandler";
import { GetTsLastLoginRequestHandler as CharacterPlayer_GetTsLastLoginRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetTsLastLoginRequestHandler";
import { SetPlayerBanRequestHandler as CharacterPlayer_SetPlayerBanRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/SetPlayerBanRequestHandler";
import { GetPlayerBanRequestHandler as CharacterPlayer_GetPlayerBanRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetPlayerBanRequestHandler";
import { SetCountryCodeRequestHandler as CharacterPlayer_SetCountryCodeRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/SetCountryCodeRequestHandler";
import { GetCountryCodeRequestHandler as CharacterPlayer_GetCountryCodeRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetCountryCodeRequestHandler";
import { SetAvatarRequestHandler as CharacterPlayer_SetAvatarRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/SetAvatarRequestHandler";
import { GetAvatarRequestHandler as CharacterPlayer_GetAvatarRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetAvatarRequestHandler";
import { SetPlayerCurrencyRequestHandler as CharacterPlayer_SetPlayerCurrencyRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/SetPlayerCurrencyRequestHandler";
import { GetPlayerCurrencyRequestHandler as CharacterPlayer_GetPlayerCurrencyRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetPlayerCurrencyRequestHandler";
import { SetPlayerStatisticsRequestHandler as CharacterPlayer_SetPlayerStatisticsRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/SetPlayerStatisticsRequestHandler";
import { GetPlayerStatisticsRequestHandler as CharacterPlayer_GetPlayerStatisticsRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetPlayerStatisticsRequestHandler";
import { GetStatisticsLeaderboardRequestHandler as CharacterPlayer_GetStatisticsLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetStatisticsLeaderboardRequestHandler";
import { GetStatisticsLeaderboardAroundPlayerRequestHandler as CharacterPlayer_GetStatisticsLeaderboardAroundPlayerRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetStatisticsLeaderboardAroundPlayerRequestHandler";
import { GetCustomDataRequestHandler as CharacterPlayer_GetCustomDataRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetCustomDataRequestHandler";
import { SetCustomDataRequestHandler as CharacterPlayer_SetCustomDataRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/SetCustomDataRequestHandler";
import { SetPlayerDataRequestHandler as CharacterPlayer_SetPlayerDataRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/SetPlayerDataRequestHandler";
import { GetPlayerDataRequestHandler as CharacterPlayer_GetPlayerDataRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetPlayerDataRequestHandler";
import { GetPlayerInformationRequestHandler as CharacterPlayer_GetPlayerInformationRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetPlayerInformationRequestHandler";
import { GetPlayersWithSegmentRequestHandler as CharacterPlayer_GetPlayersWithSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetPlayersWithSegmentRequestHandler";
import { GetPlayersWithTagRequestHandler as CharacterPlayer_GetPlayersWithTagRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetPlayersWithTagRequestHandler";
import { GetCatalogIdRequestHandler as CharacterPlayer_GetCatalogIdRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetCatalogIdRequestHandler";
import { GetOwnerRequestHandler as CharacterPlayer_GetOwnerRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetOwnerRequestHandler";
import { GetRemoveStatusRequestHandler as CharacterPlayer_GetRemoveStatusRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetRemoveStatusRequestHandler";
import { GetPlayerFriendRequestHandler as CharacterPlayer_GetPlayerFriendRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetPlayerFriendRequestHandler";
import { GetPlayerGroupRequestHandler as CharacterPlayer_GetPlayerGroupRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetPlayerGroupRequestHandler";
import { GetPlayerInventoryRequestHandler as CharacterPlayer_GetPlayerInventoryRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetPlayerInventoryRequestHandler";
import { RemovePlayerItemRequestHandler as CharacterPlayer_RemovePlayerItemRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/RemovePlayerItemRequestHandler";
import { CreatePlayerItemRequestHandler as CharacterPlayer_CreatePlayerItemRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/CreatePlayerItemRequestHandler";
import { CreateGroupRequestHandler as CharacterPlayer_CreateGroupRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/CreateGroupRequestHandler";
import { JoinGroupRequestHandler as CharacterPlayer_JoinGroupRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/JoinGroupRequestHandler";
import { LeaveGroupRequestHandler as CharacterPlayer_LeaveGroupRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/LeaveGroupRequestHandler";
import { SetOwnerRequestHandler as CharacterPlayer_SetOwnerRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/SetOwnerRequestHandler";
import { AddPlayerFriendRequestHandler as CharacterPlayer_AddPlayerFriendRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/AddPlayerFriendRequestHandler";
import { RemovePlayerFriendRequestHandler as CharacterPlayer_RemovePlayerFriendRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/RemovePlayerFriendRequestHandler";
import { GetPlayersWithDisplayNameRequestHandler as CharacterPlayer_GetPlayersWithDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetPlayersWithDisplayNameRequestHandler";
import { SetRemoveStatusRequestHandler as CharacterPlayer_SetRemoveStatusRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/SetRemoveStatusRequestHandler";
import { GetFriendStatisticsLeaderboardAroundPlayerRequestHandler as CharacterPlayer_GetFriendStatisticsLeaderboardAroundPlayerRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetFriendStatisticsLeaderboardAroundPlayerRequestHandler";
import { GetFriendStatisticsLeaderboardRequestHandler as CharacterPlayer_GetFriendStatisticsLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetFriendStatisticsLeaderboardRequestHandler";
import { GetCurrencyLeaderboardRequestHandler as CharacterPlayer_GetCurrencyLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetCurrencyLeaderboardRequestHandler";
import { GetCreateLeaderboardRequestHandler as CharacterPlayer_GetCreateLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetCreateLeaderboardRequestHandler";
import { GetLastLoginLeaderboardRequestHandler as CharacterPlayer_GetLastLoginLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetLastLoginLeaderboardRequestHandler";
import { GetStatisticsLogRequestHandler as CharacterPlayer_GetStatisticsLogRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetStatisticsLogRequestHandler";
import { GetCurrencyLogRequestHandler as CharacterPlayer_GetCurrencyLogRequestHandler } from "./GN-app-api/handler/controller/handler/characterPlayer/GetCurrencyLogRequestHandler";

import { AddSegmentRequestHandler as GamePlayer_AddSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/AddSegmentRequestHandler";
import { RemoveSegmentRequestHandler as GamePlayer_RemoveSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/RemoveSegmentRequestHandler";
import { GetSegmentRequestHandler as GamePlayer_GetSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetSegmentRequestHandler";
import { SetTagRequestHandler as GamePlayer_SetTagRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/SetTagRequestHandler";
import { RemoveTagRequestHandler as GamePlayer_RemoveTagRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/RemoveTagRequestHandler";
import { GetTagRequestHandler as GamePlayer_GetTagRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetTagRequestHandler";
import { GetDisplayNameRequestHandler as GamePlayer_GetDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetDisplayNameRequestHandler";
import { SetDisplayNameRequestHandler as GamePlayer_SetDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/SetDisplayNameRequestHandler";
import { GetTsCreateRequestHandler as GamePlayer_GetTsCreateRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetTsCreateRequestHandler";
import { GetIpAddressCreateRequestHandler as GamePlayer_GetIpAddressCreateRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetIpAddressCreateRequestHandler";
import { GetTsLastLoginRequestHandler as GamePlayer_GetTsLastLoginRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetTsLastLoginRequestHandler";
import { SetPlayerBanRequestHandler as GamePlayer_SetPlayerBanRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/SetPlayerBanRequestHandler";
import { GetPlayerBanRequestHandler as GamePlayer_GetPlayerBanRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetPlayerBanRequestHandler";
import { SetCountryCodeRequestHandler as GamePlayer_SetCountryCodeRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/SetCountryCodeRequestHandler";
import { GetCountryCodeRequestHandler as GamePlayer_GetCountryCodeRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetCountryCodeRequestHandler";
import { SetAvatarRequestHandler as GamePlayer_SetAvatarRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/SetAvatarRequestHandler";
import { GetAvatarRequestHandler as GamePlayer_GetAvatarRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetAvatarRequestHandler";
import { SetPlayerCurrencyRequestHandler as GamePlayer_SetPlayerCurrencyRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/SetPlayerCurrencyRequestHandler";
import { GetPlayerCurrencyRequestHandler as GamePlayer_GetPlayerCurrencyRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetPlayerCurrencyRequestHandler";
import { SetPlayerStatisticsRequestHandler as GamePlayer_SetPlayerStatisticsRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/SetPlayerStatisticsRequestHandler";
import { GetPlayerStatisticsRequestHandler as GamePlayer_GetPlayerStatisticsRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetPlayerStatisticsRequestHandler";
import { GetStatisticsLeaderboardRequestHandler as GamePlayer_GetStatisticsLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetStatisticsLeaderboardRequestHandler";
import { GetStatisticsLeaderboardAroundPlayerRequestHandler as GamePlayer_GetStatisticsLeaderboardAroundPlayerRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetStatisticsLeaderboardAroundPlayerRequestHandler";
import { GetCustomDataRequestHandler as GamePlayer_GetCustomDataRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetCustomDataRequestHandler";
import { SetCustomDataRequestHandler as GamePlayer_SetCustomDataRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/SetCustomDataRequestHandler";
import { SetPlayerDataRequestHandler as GamePlayer_SetPlayerDataRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/SetPlayerDataRequestHandler";
import { GetPlayerDataRequestHandler as GamePlayer_GetPlayerDataRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetPlayerDataRequestHandler";
import { GetPlayerInformationRequestHandler as GamePlayer_GetPlayerInformationRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetPlayerInformationRequestHandler";
import { GetPlayersWithSegmentRequestHandler as GamePlayer_GetPlayersWithSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetPlayersWithSegmentRequestHandler";
import { GetPlayersWithTagRequestHandler as GamePlayer_GetPlayersWithTagRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetPlayersWithTagRequestHandler";
import { GetPlayerCharacterRequestHandler as GamePlayer_GetPlayerCharacterRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetPlayerCharacterRequestHandler";
import { GetPlayerInventoryRequestHandler as GamePlayer_GetPlayerInventoryRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetPlayerInventoryRequestHandler";
import { GetPlayerGroupRequestHandler as GamePlayer_GetPlayerGroupRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetPlayerGroupRequestHandler";
import { GetPlayerFriendRequestHandler as GamePlayer_GetPlayerFriendRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetPlayerFriendRequestHandler";
import { RemovePlayerItemRequestHandler as GamePlayer_RemovePlayerItemRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/RemovePlayerItemRequestHandler";
import { GetOnlineStatusRequestHandler as GamePlayer_GetOnlineStatusRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetOnlineStatusRequestHandler";
import { CreateGroupRequestHandler as GamePlayer_CreateGroupRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/CreateGroupRequestHandler";
import { CreatePlayerItemRequestHandler as GamePlayer_CreatePlayerItemRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/CreatePlayerItemRequestHandler";
import { CreatePlayerCharacterRequestHandler as GamePlayer_CreatePlayerCharacterRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/CreatePlayerCharacterRequestHandler";
import { AddPlayerFriendRequestHandler as GamePlayer_AddPlayerFriendRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/AddPlayerFriendRequestHandler";
import { RemovePlayerFriendRequestHandler as GamePlayer_RemovePlayerFriendRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/RemovePlayerFriendRequestHandler";
import { RemovePlayerCharacterRequestHandler as GamePlayer_RemovePlayerCharacterRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/RemovePlayerCharacterRequestHandler";
import { JoinGroupRequestHandler as GamePlayer_JoinGroupRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/JoinGroupRequestHandler";
import { LeaveGroupRequestHandler as GamePlayer_LeaveGroupRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/LeaveGroupRequestHandler";
import { GetPlayersWithDisplayNameRequestHandler as GamePlayer_GetPlayersWithDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetPlayersWithDisplayNameRequestHandler";
import { GetFriendStatisticsLeaderboardAroundPlayerRequestHandler as GamePlayer_GetFriendStatisticsLeaderboardAroundPlayerRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetFriendStatisticsLeaderboardAroundPlayerRequestHandler";
import { GetFriendStatisticsLeaderboardRequestHandler as GamePlayer_GetFriendStatisticsLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetFriendStatisticsLeaderboardRequestHandler";
import { GetCurrencyLeaderboardRequestHandler as GamePlayer_GetCurrencyLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetCurrencyLeaderboardRequestHandler";
import { GetLastLoginLeaderboardRequestHandler as GamePlayer_GetLastLoginLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetLastLoginLeaderboardRequestHandler";
import { GetCreateLeaderboardRequestHandler as GamePlayer_GetCreateLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetCreateLeaderboardRequestHandler";
import { GetStatisticsLogRequestHandler as GamePlayer_GetStatisticsLogRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetStatisticsLogRequestHandler";
import { GetCurrencyLogRequestHandler as GamePlayer_GetCurrencyLogRequestHandler } from "./GN-app-api/handler/controller/handler/gamePlayer/GetCurrencyLogRequestHandler";

import { GetContentDataRequestHandler as Content_GetContentDataRequestHandler } from "./GN-app-api/handler/controller/handler/content/GetContentDataRequestHandler";
import { SetContentDataRequestHandler as Content_SetContentDataRequestHandler } from "./GN-app-api/handler/controller/handler/content/SetContentDataRequestHandler";
import { CreateNewFileUploadInfoRequestHandler as Content_CreateNewFileUploadInfoRequestHandler } from "./GN-app-api/handler/controller/handler/content/CreateNewFileUploadInfoRequestHandler";
import { GetFileUploadInfoListRequestHandler as Content_GetFileUploadInfoListRequestHandler } from "./GN-app-api/handler/controller/handler/content/GetFileUploadInfoListRequestHandler";
import { GetFileUploadInfoRequestHandler as Content_GetFileUploadInfoRequestHandler } from "./GN-app-api/handler/controller/handler/content/GetFileUploadInfoRequestHandler";
import { RemoveFileUploadInfoRequestHandler as Content_RemoveFileUploadInfoRequestHandler } from "./GN-app-api/handler/controller/handler/content/RemoveFileUploadInfoRequestHandler";
import { RequestDownloadFileUploadInfoRequestHandler as Content_RequestDownloadFileUploadInfoRequestHandler } from "./GN-app-api/handler/controller/handler/content/RequestDownloadFileUploadInfoRequestHandler";

import { AddSegmentRequestHandler as Group_AddSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/group/AddSegmentRequestHandler";
import { RemoveSegmentRequestHandler as Group_RemoveSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/group/RemoveSegmentRequestHandler";
import { GetSegmentRequestHandler as Group_GetSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetSegmentRequestHandler";
import { SetTagRequestHandler as Group_SetTagRequestHandler } from "./GN-app-api/handler/controller/handler/group/SetTagRequestHandler";
import { RemoveTagRequestHandler as Group_RemoveTagRequestHandler } from "./GN-app-api/handler/controller/handler/group/RemoveTagRequestHandler";
import { GetTagRequestHandler as Group_GetTagRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetTagRequestHandler";
import { GetDisplayNameRequestHandler as Group_GetDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetDisplayNameRequestHandler";
import { SetDisplayNameRequestHandler as Group_SetDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/group/SetDisplayNameRequestHandler";
import { GetTsCreateRequestHandler as Group_GetTsCreateRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetTsCreateRequestHandler";
import { SetAvatarRequestHandler as Group_SetAvatarRequestHandler } from "./GN-app-api/handler/controller/handler/group/SetAvatarRequestHandler";
import { GetAvatarRequestHandler as Group_GetAvatarRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetAvatarRequestHandler";
import { SetGroupCurrencyRequestHandler as Group_SetGroupCurrencyRequestHandler } from "./GN-app-api/handler/controller/handler/group/SetGroupCurrencyRequestHandler";
import { GetGroupCurrencyRequestHandler as Group_GetGroupCurrencyRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetGroupCurrencyRequestHandler";
import { SetGroupStatisticsRequestHandler as Group_SetGroupStatisticsRequestHandler } from "./GN-app-api/handler/controller/handler/group/SetGroupStatisticsRequestHandler";
import { GetGroupStatisticsRequestHandler as Group_GetGroupStatisticsRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetGroupStatisticsRequestHandler";
import { GetStatisticsLeaderboardRequestHandler as Group_GetStatisticsLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetStatisticsLeaderboardRequestHandler";
import { GetStatisticsLeaderboardAroundGroupRequestHandler as Group_GetStatisticsLeaderboardAroundGroupRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetStatisticsLeaderboardAroundGroupRequestHandler";
import { GetCustomDataRequestHandler as Group_GetCustomDataRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetCustomDataRequestHandler";
import { SetCustomDataRequestHandler as Group_SetCustomDataRequestHandler } from "./GN-app-api/handler/controller/handler/group/SetCustomDataRequestHandler";
import { SetGroupDataRequestHandler as Group_SetGroupDataRequestHandler } from "./GN-app-api/handler/controller/handler/group/SetGroupDataRequestHandler";
import { GetGroupDataRequestHandler as Group_GetGroupDataRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetGroupDataRequestHandler";
import { GetGroupInformationRequestHandler as Group_GetGroupInformationRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetGroupInformationRequestHandler";
import { GetGroupsWithSegmentRequestHandler as Group_GetGroupsWithSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetGroupsWithSegmentRequestHandler";
import { GetGroupsWithTagRequestHandler as Group_GetGroupsWithTagRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetGroupsWithTagRequestHandler";
import { GetCatalogIdRequestHandler as Group_GetCatalogIdRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetCatalogIdRequestHandler";
import { GetRemoveStatusRequestHandler as Group_GetRemoveStatusRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetRemoveStatusRequestHandler";
import { GetGroupInventoryRequestHandler as Group_GetGroupInventoryRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetGroupInventoryRequestHandler";
import { RemoveGroupItemRequestHandler as Group_RemoveGroupItemRequestHandler } from "./GN-app-api/handler/controller/handler/group/RemoveGroupItemRequestHandler";
import { CreateGroupItemRequestHandler as Group_CreateGroupItemRequestHandler } from "./GN-app-api/handler/controller/handler/group/CreateGroupItemRequestHandler";
import { GetMembersRequestHandler as Group_GetMembersRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetMembersRequestHandler";
import { AddMemberRequestHandler as Group_AddMemberRequestHandler } from "./GN-app-api/handler/controller/handler/group/AddMemberRequestHandler";
import { RemoveMemberRequestHandler as Group_RemoveMemberRequestHandler } from "./GN-app-api/handler/controller/handler/group/RemoveMemberRequestHandler";
import { SendGroupMessageRequestHandler as Group_SendGroupMessageRequestHandler } from "./GN-app-api/handler/controller/handler/group/SendGroupMessageRequestHandler";
import { GetGroupMessageRequestHandler as Group_GetGroupMessageRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetGroupMessageRequestHandler";
import { SetRemoveStatusRequestHandler as Group_SetRemoveStatusRequestHandler } from "./GN-app-api/handler/controller/handler/group/SetRemoveStatusRequestHandler";
import { GetGroupsWithDisplayNameRequestHandler as Group_GetGroupsWithDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetGroupsWithDisplayNameRequestHandler";
import { GetCreateLeaderboardRequestHandler as Group_GetCreateLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetCreateLeaderboardRequestHandler";
import { GetStatisticsLogRequestHandler as Group_GetStatisticsLogRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetStatisticsLogRequestHandler";
import { GetCurrencyLogRequestHandler as Group_GetCurrencyLogRequestHandler } from "./GN-app-api/handler/controller/handler/group/GetCurrencyLogRequestHandler";

import { AddSegmentRequestHandler as Inventory_AddSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/AddSegmentRequestHandler";
import { RemoveSegmentRequestHandler as Inventory_RemoveSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/RemoveSegmentRequestHandler";
import { GetSegmentRequestHandler as Inventory_GetSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetSegmentRequestHandler";
import { SetTagRequestHandler as Inventory_SetTagRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/SetTagRequestHandler";
import { RemoveTagRequestHandler as Inventory_RemoveTagRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/RemoveTagRequestHandler";
import { GetTagRequestHandler as Inventory_GetTagRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetTagRequestHandler";
import { GetDisplayNameRequestHandler as Inventory_GetDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetDisplayNameRequestHandler";
import { SetDisplayNameRequestHandler as Inventory_SetDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/SetDisplayNameRequestHandler";
import { GetTsCreateRequestHandler as Inventory_GetTsCreateRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetTsCreateRequestHandler";
import { SetAvatarRequestHandler as Inventory_SetAvatarRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/SetAvatarRequestHandler";
import { GetAvatarRequestHandler as Inventory_GetAvatarRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetAvatarRequestHandler";
import { SetItemStatisticsRequestHandler as Inventory_SetItemStatisticsRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/SetItemStatisticsRequestHandler";
import { GetItemStatisticsRequestHandler as Inventory_GetItemStatisticsRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetItemStatisticsRequestHandler";
import { GetStatisticsLeaderboardRequestHandler as Inventory_GetStatisticsLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetStatisticsLeaderboardRequestHandler";
import { GetStatisticsLeaderboardAroundItemRequestHandler as Inventory_GetStatisticsLeaderboardAroundItemRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetStatisticsLeaderboardAroundItemRequestHandler";
import { GetCustomDataRequestHandler as Inventory_GetCustomDataRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetCustomDataRequestHandler";
import { SetCustomDataRequestHandler as Inventory_SetCustomDataRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/SetCustomDataRequestHandler";
import { SetItemDataRequestHandler as Inventory_SetItemDataRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/SetItemDataRequestHandler";
import { GetItemDataRequestHandler as Inventory_GetItemDataRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetItemDataRequestHandler";
import { GetItemInformationRequestHandler as Inventory_GetItemInformationRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetItemInformationRequestHandler";
import { GetItemsWithSegmentRequestHandler as Inventory_GetItemsWithSegmentRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetItemsWithSegmentRequestHandler";
import { GetItemsWithTagRequestHandler as Inventory_GetItemsWithTagRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetItemsWithTagRequestHandler";
import { GetCatalogIdRequestHandler as Inventory_GetCatalogIdRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetCatalogIdRequestHandler";
import { GetClassIdRequestHandler as Inventory_GetClassIdRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetClassIdRequestHandler";
import { GetItemTypeRequestHandler as Inventory_GetItemTypeRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetItemTypeRequestHandler";
import { GetAmountRequestHandler as Inventory_GetAmountRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetAmountRequestHandler";
import { GetOwnerRequestHandler as Inventory_GetOwnerRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetOwnerRequestHandler";
import { GetRemoveStatusRequestHandler as Inventory_GetRemoveStatusRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetRemoveStatusRequestHandler";
import { SetAmountRequestHandler as Inventory_SetAmountRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/SetAmountRequestHandler";
import { SetOwnerRequestHandler as Inventory_SetOwnerRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/SetOwnerRequestHandler";
import { SetRemoveStatusRequestHandler as Inventory_SetRemoveStatusRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/SetRemoveStatusRequestHandler";
import { GetItemsWithDisplayNameRequestHandler as Inventory_GetItemsWithDisplayNameRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetItemsWithDisplayNameRequestHandler";
import { GetCreateLeaderboardRequestHandler as Inventory_GetCreateLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetCreateLeaderboardRequestHandler";
import { GetStatisticsLogRequestHandler as Inventory_GetStatisticsLogRequestHandler } from "./GN-app-api/handler/controller/handler/inventory/GetStatisticsLogRequestHandler";

import { BuyStoreItemRequestHandler as StoreInventory_BuyStoreItemRequestHandler } from "./GN-app-api/handler/controller/handler/storeInventory/BuyStoreItemRequestHandler";
import { GetStoreItemInformationRequestHandler as StoreInventory_GetStoreItemInformationRequestHandler } from "./GN-app-api/handler/controller/handler/storeInventory/GetStoreItemInformationRequestHandler";
import { GetStoreItemsWithTagRequestHandler as StoreInventory_GetStoreItemsWithTagRequestHandler } from "./GN-app-api/handler/controller/handler/storeInventory/GetStoreItemsWithTagRequestHandler";
import { CreateStoreItemRequestHandler as StoreInventory_CreateStoreItemRequestHandler } from "./GN-app-api/handler/controller/handler/storeInventory/CreateStoreItemRequestHandler";
import { SetRemoveStatusRequestHandler as StoreInventory_SetRemoveStatusRequestHandler } from "./GN-app-api/handler/controller/handler/storeInventory/SetRemoveStatusRequestHandler";
import { SetStoreItemInformationRequestHandler as StoreInventory_SetStoreItemInformationRequestHandler } from "./GN-app-api/handler/controller/handler/storeInventory/SetStoreItemInformationRequestHandler";
import { ValidateAppleAppStoreReceiptRequestHandler as StoreInventory_ValidateAppleAppStoreReceiptRequestHandler } from "./GN-app-api/handler/controller/handler/storeInventory/ValidateAppleAppStoreReceiptRequestHandler";
import { ValidateGooglePlayStoreReceiptRequestHandler as StoreInventory_ValidateGooglePlayStoreReceiptRequestHandler } from "./GN-app-api/handler/controller/handler/storeInventory/ValidateGooglePlayStoreReceiptRequestHandler";
import { ValidateFacebookStoreReceiptRequestHandler as StoreInventory_ValidateFacebookStoreReceiptRequestHandler } from "./GN-app-api/handler/controller/handler/storeInventory/ValidateFacebookStoreReceiptRequestHandler";
import { GetCreateLeaderboardRequestHandler as StoreInventory_GetCreateLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/storeInventory/GetCreateLeaderboardRequestHandler";
import { PresentStoreItemRequestHandler as StoreInventory_PresentStoreItemRequestHandler } from "./GN-app-api/handler/controller/handler/storeInventory/PresentStoreItemRequestHandler";
import { GetStoreLogRequestHandler as StoreInventory_GetStoreLogRequestHandler } from "./GN-app-api/handler/controller/handler/storeInventory/GetStoreLogRequestHandler";
import { GetStoreUsedRequestHandler as StoreInventory_GetStoreUsedRequestHandler } from "./GN-app-api/handler/controller/handler/storeInventory/GetStoreUsedRequestHandler";
import { RemoveStoreUsedRequestHandler as StoreInventory_RemoveStoreUsedRequestHandler } from "./GN-app-api/handler/controller/handler/storeInventory/RemoveStoreUsedRequestHandler";

import { LoginByAdminAccountRequestHandler as Dashboard_LoginByAdminAccountRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/LoginByAdminAccountRequestHandler";
import { SetMasterGameSettingsRequestHandler as Dashboard_SetMasterGameSettingsRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/SetMasterGameSettingsRequestHandler";
import { CreateAdminAccountRequestHandler as Dashboard_CreateAdminAccountRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/CreateAdminAccountRequestHandler";
import { RemoveAdminAccountRequestHandler as Dashboard_RemoveAdminAccountRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/RemoveAdminAccountRequestHandler";
import { SetPasswordAdminAccountRequestHandler as Dashboard_SetPasswordAdminAccountRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/SetPasswordAdminAccountRequestHandler";
import { SetSecretKeyAdminAccountRequestHandler as Dashboard_SetSecretKeyAdminAccountRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/SetSecretKeyAdminAccountRequestHandler";
import { SetGameInformationRequestHandler as Dashboard_SetGameInformationRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/SetGameInformationRequestHandler";
import { CreateGameRequestHandler as Dashboard_CreateGameRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/CreateGameRequestHandler";
import { ChangePasswordAdminAccountRequestHandler as Dashboard_ChangePasswordAdminAccountRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/ChangePasswordAdminAccountRequestHandler";
import { GetAdminAccountListRequestHandler as Dashboard_GetAdminAccountListRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/GetAdminAccountListRequestHandler";
import { GetGameInformationRequestHandler as Dashboard_GetGameInformationRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/GetGameInformationRequestHandler";
import { GetGameListRequestHandler as Dashboard_GetGameListRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/GetGameListRequestHandler";
import { GetMasterGameSettingsRequestHandler as Dashboard_GetMasterGameSettingsRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/GetMasterGameSettingsRequestHandler";
import { GetServerLogRequestHandler as Dashboard_GetServerLogRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/GetServerLogRequestHandler";
import { GetSecretInfoInformationRequestHandler as Dashboard_GetSecretInfoInformationRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/GetSecretInfoInformationRequestHandler";
import { GetSecretInfoListRequestHandler as Dashboard_GetSecretInfoListRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/GetSecretInfoListRequestHandler";
import { CreateSecretInfoRequestHandler as Dashboard_CreateSecretInfoRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/CreateSecretInfoRequestHandler";
import { SetSecretInfoInformationRequestHandler as Dashboard_SetSecretInfoInformationRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/SetSecretInfoInformationRequestHandler";
import { GetUsernameAdminAccountRequestHandler as Dashboard_GetUsernameAdminAccountRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/GetUsernameAdminAccountRequestHandler";
import { GetAnalyticsRequestHandler as Dashboard_GetAnalyticsRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/GetAnalyticsRequestHandler";
import { GetEventCallbackCloudScriptRequestHandler as Dashboard_GetEventCallbackCloudScriptRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/GetEventCallbackCloudScriptRequestHandler";
import { SetEventCallbackCloudScriptRequestHandler as Dashboard_SetEventCallbackCloudScriptRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/SetEventCallbackCloudScriptRequestHandler";
import { ResetStatisticsLeaderboardRequestHandler as Dashboard_ResetStatisticsLeaderboardRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/ResetStatisticsLeaderboardRequestHandler";
import { GetBackupStatisticsLeaderboardVersionRequestHandler as Dashboard_GetBackupStatisticsLeaderboardVersionRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/GetBackupStatisticsLeaderboardVersionRequestHandler";
import { GetServerGameDataRequestHandler as Dashboard_GetServerGameDataRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/GetServerGameDataRequestHandler";
import { DeleteInDatabaseRequestHandler as Dashboard_DeleteInDatabaseRequestHandler } from "./GN-app-api/handler/controller/handler/dashboard/DeleteInDatabaseRequestHandler";

import { CancelAllMatchmakingTicketRequestHandler as Multiplayer_CancelAllMatchmakingTicketRequestHandler } from "./GN-app-api/handler/controller/handler/multiplayer/CancelAllMatchmakingTicketRequestHandler";
import { CancelMatchmakingTicketRequestHandler as Multiplayer_CancelMatchmakingTicketRequestHandler } from "./GN-app-api/handler/controller/handler/multiplayer/CancelMatchmakingTicketRequestHandler";
import { CreateMatchmakingTicketRequestHandler as Multiplayer_CreateMatchmakingTicketRequestHandler } from "./GN-app-api/handler/controller/handler/multiplayer/CreateMatchmakingTicketRequestHandler";
import { GetMatchmakingTicketRequestHandler as Multiplayer_GetMatchmakingTicketRequestHandler } from "./GN-app-api/handler/controller/handler/multiplayer/GetMatchmakingTicketRequestHandler";
import { GetMatchRequestHandler as Multiplayer_GetMatchRequestHandler } from "./GN-app-api/handler/controller/handler/multiplayer/GetMatchRequestHandler";
import { GetQueueStatisticsRequestHandler as Multiplayer_GetQueueStatisticsRequestHandler } from "./GN-app-api/handler/controller/handler/multiplayer/GetQueueStatisticsRequestHandler";
import { JoinMatchmakingTicketRequestHandler as Multiplayer_JoinMatchmakingTicketRequestHandler } from "./GN-app-api/handler/controller/handler/multiplayer/JoinMatchmakingTicketRequestHandler";
import { ListMatchmakingTicketsForPlayerRequestHandler as Multiplayer_ListMatchmakingTicketsForPlayerRequestHandler } from "./GN-app-api/handler/controller/handler/multiplayer/ListMatchmakingTicketsForPlayerRequestHandler";
import { GetAllMatchRequestHandler as Multiplayer_GetAllMatchRequestHandler } from "./GN-app-api/handler/controller/handler/multiplayer/GetAllMatchRequestHandler";
import { GetAllMatchmakingTicketRequestHandler as Multiplayer_GetAllMatchmakingTicketRequestHandler } from "./GN-app-api/handler/controller/handler/multiplayer/GetAllMatchmakingTicketRequestHandler";

import { AddFunctionRequestHandler as CloudScript_AddFunctionRequestHandler } from "./GN-app-api/handler/controller/handler/cloudScript/AddFunctionRequestHandler";
import { EditFunctionRequestHandler as CloudScript_EditFunctionRequestHandler } from "./GN-app-api/handler/controller/handler/cloudScript/EditFunctionRequestHandler";
import { ExecuteFunctionRequestHandler as CloudScript_ExecuteFunctionRequestHandler } from "./GN-app-api/handler/controller/handler/cloudScript/ExecuteFunctionRequestHandler";
import { GetFunctionRequestHandler as CloudScript_GetFunctionRequestHandler } from "./GN-app-api/handler/controller/handler/cloudScript/GetFunctionRequestHandler";
import { GetFunctionsRequestHandler as CloudScript_GetFunctionsRequestHandler } from "./GN-app-api/handler/controller/handler/cloudScript/GetFunctionsRequestHandler";

import { MatchmakingHandler, MatchmakingTicketCanMatch } from "./GN-app-api/handler/controller/handler/multiplayer/MatchmakingHandler";
import { xDatetime } from "./GN-library/xdatetime/lib/xDatetime";
import { IGameCenterService } from "./GN-app-api/service/IGameCenterService";
import { IGooglePlayGameService } from "./GN-app-api/service/IGooglePlayGameService";
import { GooglePlayGameService } from "./GN-app-api/service/GooglePlayGameService";
import { GameCenterService } from "./GN-app-api/service/GameCenterService";
import { ICountryIPDetailService } from "./GN-app-api/service/ICountryIPDetailService";
import { CountryIPDetailService } from "./GN-app-api/service/CountryIPDetailService";
import { MatchmakingTicketStatus } from "./GN-common/constant/enumType/MatchmakingTicketStatus";
import { ServerDetail } from "./GN-library/xdatabase/lib/entity/pro/ServerDetail";
import { Debug } from "./GN-library/xdebug/lib/xDebug";
import * as mongoDB from "mongodb";
import { GNHashtable } from "./GN-common/common/GNData";

interface CreateIndexesOptions {
	unique?: boolean;
	sparse?: boolean;
	expireAfterSeconds?: number;
}

export class GNServer {
	public static getServerVersion(): string {
		return GN_VERSION;
	}

	private socketApp: SocketApp;
	private httpApp: HttpApp;
	private apiMiddleware: ApiMiddleware;

	private requestController: RequestController;

	private idTypeCase: number;
	private xGNSettings: xGNSettings;
	private xDatabase: xDatabase;

	private facebookService: IFacebookService;
	private appleService: IAppleService;
	private googleService: IGoogleService;
	private googlePlayGameService: IGooglePlayGameService;
	private gameCenterService: IGameCenterService;
	private timerService: ITimerService;
	private requestConverterService: IRequestConverterService;
	private analyticsService: IAnalyticsService;
	private postEventCallbackService: IPostEventCallbackService;
	private preEventCallbackService: IPreEventCallbackService;
	private cloudScriptServiceDic: Map<string, ICloudScriptService>;
	private eventCallbackCloudScriptService: IEventCallbackCloudScriptService;
	private countryIPDetailService: ICountryIPDetailService;
	private pushNotificationService: IPushNotificationService;
	private emailService: IEmailService;
	private cacheServiceDic: Map<string, ICacheService>;
	private configServiceDic: Map<string, IConfigService>;

	private gameIds: string[];
	private matchmakingHandler: MatchmakingHandler;
	private waitingServerDetailDict: Map<string, NodeJS.Timeout>;
	private postEventCallbackCollection: mongoDB.Collection<mongoDB.Document>;

	constructor() {
		this.facebookService = new FacebookService();
		this.postEventCallbackService = new PostEventCallbackService();
		this.preEventCallbackService = new PreEventCallbackService();

		this.appleService = new AppleService();
		this.googleService = new GoogleService();

		this.googlePlayGameService = new GooglePlayGameService();
		this.gameCenterService = new GameCenterService();

		this.timerService = new TimerService();
		this.requestConverterService = new RequestConverterService();
		this.pushNotificationService = new PushNotificationService();
		this.emailService = new EmailService();

		this.idTypeCase = 0;
		this.configServiceDic = new Map();
		this.xGNSettings = new xGNSettings();
		this.xDatabase = new xDatabase();
		this.cacheServiceDic = new Map();

		this.requestController = new RequestController();
		this.requestController.setRequestConverterService(this.requestConverterService);

		(this.timerService as TimerService).run();

		this.gameIds = [];
		this.matchmakingHandler = new MatchmakingHandler();
		this.matchmakingHandler.setGNServer(this);
		this.waitingServerDetailDict = new Map();

		this.cloudScriptServiceDic = new Map();
		this.eventCallbackCloudScriptService = new EventCallbackCloudScriptService();

		this.countryIPDetailService = new CountryIPDetailService();

		CodeHelper.init();

		let thiz = this;
		this.timerService.subscriberEverySecond(() => {
			let currentDate = xDatetime.getCurrentDate();
			if (currentDate.getSeconds() % 10 == 0)
				thiz.handleMatchmaking();
		});

		this.timerService.subscriberEveryMinute(() => {
			let currentDate = xDatetime.getCurrentDate();
			if (currentDate.getMinutes() % 10 == 0)
				thiz.handleRemoveCacheInvalidData();
		});
	}

	public init(): void {
		{
			let requestTypeValue = <number>RequestType.Authenticate;

			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByAccountRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByAndroidDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByAppleRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByCustomDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByCustomIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByFacebookRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByGenericServiceRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByGoogleRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByGooglePlayGameServiceRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByGameCenterRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByiOSDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByWindowsPhoneDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_RegisterAccountRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByEditorDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByLinuxDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByMacOSDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_LoginByWindowsDeviceIdRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Authenticate_RefreshAuthTokenRequestHandler(this), true);
		}

		{
			let requestTypeValue = <number>RequestType.MasterPlayer;

			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkAccountRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkAndroidDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkAppleRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkCustomDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkCustomIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkEditorDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkFacebookRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkGenericServiceRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkGoogleRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkGooglePlayGameServiceRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkGameCenterRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkiOSDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkLinuxDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkMacOSDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkWindowsDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_LinkWindowsPhoneDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkAccountRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkAndroidDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkAppleRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkCustomDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkCustomIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkEditorDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkFacebookRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkGenericServiceRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkGoogleRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkGooglePlayGameServiceRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkGameCenterRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkiOSDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkLinuxDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkMacOSDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkWindowsDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_UnlinkWindowsPhoneDeviceIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_AddSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_RemoveSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_SetTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_RemoveTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_SetDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetTsCreateRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetIpAddressCreateRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_SetTsLastLoginRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetTsLastLoginRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_SetPlayerBanRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPlayerBanRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_SetCountryCodeRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetCountryCodeRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_ChangeAccountPasswordRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_ResetAccountPasswordRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_SetAvatarRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetAvatarRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_SetPlayerCurrencyRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPlayerCurrencyRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_SetPlayerStatisticsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPlayerStatisticsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetStatisticsLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetStatisticsLeaderboardAroundPlayerRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetCustomDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_SetCustomDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_SetPlayerDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPlayerDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPlayerInformationRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPlayersWithAppleRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPlayersWithFacebookRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPlayersWithGoogleRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPlayersWithGooglePlayGameServiceRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPlayersWithGameCenterRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPlayersWithGenericServiceRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPlayersWithSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPlayersWithTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetExternalRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPlayersWithDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetEmailRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_SetEmailRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetCurrencyLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetCreateLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetLastLoginLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetStatisticsLogRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetCurrencyLogRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_SendSocketOperationEventRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_SendEmailRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_SendPushNotificationRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_AddPushNotificationRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_RemovePushNotificationRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new MasterPlayer_GetPushNotificationRequestHandler(this), true);
		}

		{
			let requestTypeValue = <number>RequestType.CharacterPlayer;

			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_AddSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_RemoveSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_SetTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_RemoveTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_SetDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetTsCreateRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetIpAddressCreateRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetTsLastLoginRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_SetPlayerBanRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetPlayerBanRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_SetCountryCodeRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetCountryCodeRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_SetAvatarRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetAvatarRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_SetPlayerCurrencyRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetPlayerCurrencyRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_SetPlayerStatisticsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetPlayerStatisticsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetStatisticsLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetStatisticsLeaderboardAroundPlayerRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetCustomDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_SetCustomDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_SetPlayerDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetPlayerDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetPlayerInformationRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetPlayersWithSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetPlayersWithTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetCatalogIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetOwnerRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetRemoveStatusRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetPlayerFriendRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetPlayerGroupRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetPlayerInventoryRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_RemovePlayerItemRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_CreatePlayerItemRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_CreateGroupRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_JoinGroupRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_LeaveGroupRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_SetOwnerRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_AddPlayerFriendRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_RemovePlayerFriendRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetPlayersWithDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_SetRemoveStatusRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetFriendStatisticsLeaderboardAroundPlayerRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetFriendStatisticsLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetCurrencyLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetCreateLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetLastLoginLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetStatisticsLogRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CharacterPlayer_GetCurrencyLogRequestHandler(this), true);
		}

		{
			let requestTypeValue = <number>RequestType.GamePlayer;

			this.requestController.addHandler(requestTypeValue, new GamePlayer_AddSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_RemoveSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_SetTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_RemoveTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_SetDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetTsCreateRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetIpAddressCreateRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetTsLastLoginRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_SetPlayerBanRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetPlayerBanRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_SetCountryCodeRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetCountryCodeRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_SetAvatarRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetAvatarRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_SetPlayerCurrencyRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetPlayerCurrencyRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_SetPlayerStatisticsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetPlayerStatisticsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetStatisticsLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetStatisticsLeaderboardAroundPlayerRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetCustomDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_SetCustomDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_SetPlayerDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetPlayerDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetPlayerInformationRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetPlayersWithSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetPlayersWithTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetPlayerCharacterRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetPlayerInventoryRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetPlayerGroupRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetPlayerFriendRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_RemovePlayerItemRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetOnlineStatusRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_CreateGroupRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_CreatePlayerItemRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_CreatePlayerCharacterRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_AddPlayerFriendRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_RemovePlayerFriendRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_RemovePlayerCharacterRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_JoinGroupRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_LeaveGroupRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetPlayersWithDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetFriendStatisticsLeaderboardAroundPlayerRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetFriendStatisticsLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetCurrencyLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetLastLoginLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetCreateLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetStatisticsLogRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new GamePlayer_GetCurrencyLogRequestHandler(this), true);
		}

		{
			let requestTypeValue = <number>RequestType.Content;

			this.requestController.addHandler(requestTypeValue, new Content_GetContentDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Content_SetContentDataRequestHandler(this), true);

			this.requestController.addHandler(requestTypeValue, new Content_CreateNewFileUploadInfoRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Content_GetFileUploadInfoListRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Content_GetFileUploadInfoRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Content_RemoveFileUploadInfoRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Content_RequestDownloadFileUploadInfoRequestHandler(this), true);
		}

		{
			let requestTypeValue = <number>RequestType.Group;

			this.requestController.addHandler(requestTypeValue, new Group_AddSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_RemoveSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_SetTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_RemoveTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_SetDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetTsCreateRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_SetAvatarRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetAvatarRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_SetGroupCurrencyRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetGroupCurrencyRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_SetGroupStatisticsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetGroupStatisticsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetStatisticsLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetStatisticsLeaderboardAroundGroupRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetCustomDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_SetCustomDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_SetGroupDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetGroupDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetGroupInformationRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetGroupsWithSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetGroupsWithTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetCatalogIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetRemoveStatusRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetGroupInventoryRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_RemoveGroupItemRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_CreateGroupItemRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetMembersRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_AddMemberRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_RemoveMemberRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_SendGroupMessageRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetGroupMessageRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_SetRemoveStatusRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetGroupsWithDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetCreateLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetStatisticsLogRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Group_GetCurrencyLogRequestHandler(this), true);
		}

		{
			let requestTypeValue = <number>RequestType.Inventory;

			this.requestController.addHandler(requestTypeValue, new Inventory_AddSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_RemoveSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_SetTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_RemoveTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_SetDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetTsCreateRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_SetAvatarRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetAvatarRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_SetItemStatisticsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetItemStatisticsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetStatisticsLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetStatisticsLeaderboardAroundItemRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetCustomDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_SetCustomDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_SetItemDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetItemDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetItemInformationRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetItemsWithSegmentRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetItemsWithTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetCatalogIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetClassIdRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetItemTypeRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetAmountRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetOwnerRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetRemoveStatusRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_SetAmountRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_SetOwnerRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_SetRemoveStatusRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetItemsWithDisplayNameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetCreateLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Inventory_GetStatisticsLogRequestHandler(this), true);
		}

		{
			let requestTypeValue = <number>RequestType.StoreInventory;

			this.requestController.addHandler(requestTypeValue, new StoreInventory_BuyStoreItemRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new StoreInventory_GetStoreItemInformationRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new StoreInventory_GetStoreItemsWithTagRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new StoreInventory_CreateStoreItemRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new StoreInventory_SetRemoveStatusRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new StoreInventory_SetStoreItemInformationRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new StoreInventory_ValidateAppleAppStoreReceiptRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new StoreInventory_ValidateGooglePlayStoreReceiptRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new StoreInventory_ValidateFacebookStoreReceiptRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new StoreInventory_GetCreateLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new StoreInventory_PresentStoreItemRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new StoreInventory_GetStoreLogRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new StoreInventory_GetStoreUsedRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new StoreInventory_RemoveStoreUsedRequestHandler(this), true);
		}

		{
			let requestTypeValue = <number>RequestType.Dashboard;

			this.requestController.addHandler(requestTypeValue, new Dashboard_LoginByAdminAccountRequestHandler(this), false);
			this.requestController.addHandler(requestTypeValue, new Dashboard_SetMasterGameSettingsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_SetMasterGameSettingsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_CreateAdminAccountRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_RemoveAdminAccountRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_SetPasswordAdminAccountRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_SetSecretKeyAdminAccountRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_SetGameInformationRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_CreateGameRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_ChangePasswordAdminAccountRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_GetAdminAccountListRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_GetGameInformationRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_GetGameListRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_GetMasterGameSettingsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_GetServerLogRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_GetSecretInfoInformationRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_GetSecretInfoListRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_CreateSecretInfoRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_SetSecretInfoInformationRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_GetUsernameAdminAccountRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_GetAnalyticsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_GetEventCallbackCloudScriptRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_SetEventCallbackCloudScriptRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_ResetStatisticsLeaderboardRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_GetBackupStatisticsLeaderboardVersionRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_GetServerGameDataRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Dashboard_DeleteInDatabaseRequestHandler(this), true);
		}

		{
			let requestTypeValue = <number>RequestType.Multiplayer;

			this.requestController.addHandler(requestTypeValue, new Multiplayer_CancelAllMatchmakingTicketRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Multiplayer_CancelMatchmakingTicketRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Multiplayer_CreateMatchmakingTicketRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Multiplayer_GetMatchmakingTicketRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Multiplayer_GetMatchRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Multiplayer_JoinMatchmakingTicketRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Multiplayer_ListMatchmakingTicketsForPlayerRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Multiplayer_GetQueueStatisticsRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Multiplayer_GetAllMatchRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new Multiplayer_GetAllMatchmakingTicketRequestHandler(this), true);
		}

		{
			let requestTypeValue = <number>RequestType.CloudScript;

			this.requestController.addHandler(requestTypeValue, new CloudScript_AddFunctionRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CloudScript_EditFunctionRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CloudScript_ExecuteFunctionRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CloudScript_GetFunctionRequestHandler(this), true);
			this.requestController.addHandler(requestTypeValue, new CloudScript_GetFunctionsRequestHandler(this), true);
		}
	}

	public run(onRunSuccess?: OnRunSuccess) {
		this.httpApp.getHttpAppHandler().setOnHttpRequest((request: Request) => {
			return this.handleOnRequest(request);
		});

		this.socketApp.getSocketAppHandler().setOnSocketDisconnect((socket: Socket, data) => {
			this.handleSocketDisconnect(socket, data);
		});

		this.socketApp.getSocketAppHandler().setOnSocketRequest((request: Request) => {
			return this.handleOnRequest(request);
		});

		let tempAnalyticsService = new AnalyticsService();
		tempAnalyticsService.setGNServer(this);
		tempAnalyticsService.run();
		this.analyticsService = tempAnalyticsService;

		this.postEventCallbackCollection = this.xDatabase.logSystemCollection("EventCallback.PostLog");

		this.getHttpApp().getClusterHandler().onEvent("sendEventTo", data => {
			this.executeSendEventTo(data);
		});

		this.getHttpApp().getClusterHandler().onEvent("sendEventToRoom", data => {
			this.executeSendEventToRoom(data);
		});

		this.getHttpApp().getClusterHandler().onEvent("sendEventToMoreUser", data => {
			this.executeSendEventToMoreUser(data);
		});

		this.getHttpApp().getClusterHandler().onEvent("executeSendEventToAllPlayer", data => {
			this.executeSendEventToAllPlayer(data);
		});

		if (onRunSuccess != null) onRunSuccess();
	}

	public setSocketApp(socketApp: SocketApp): void {
		this.socketApp = socketApp;
	}

	public setHttpApp(httpApp: HttpApp): void {
		this.httpApp = httpApp;
	}

	public setApiMiddleware(apiMiddleware: ApiMiddleware) {
		this.apiMiddleware = apiMiddleware;
	}

	public getApiMiddleware(): ApiMiddleware {
		return this.apiMiddleware;
	}

	public getSocketApp(): SocketApp {
		return this.socketApp;
	}

	public getHttpApp(): HttpApp {
		return this.httpApp;
	}

	public getRequestController(): RequestController {
		return this.requestController;
	}

	public addCustomHandler(requestHandler: IRequestHandler, onlyAuthenticated: boolean = true): void {
		this.requestController.addHandler(RequestType.Custom, requestHandler, onlyAuthenticated);
	}

	public getCustomHandler(operationCode: string): IRequestHandler {
		return this.requestController.getHandler(RequestType.Custom, operationCode);
	}

	public removeCustomHandler(operationCode: string): void {
		return this.requestController.removeHandler(RequestType.Custom, operationCode);
	}

	public createIndex(collectionName: string, index: { [k: string]: any }, options?: CreateIndexesOptions) {
		this.xDatabase.createIndex(collectionName, index, options);
	}

	public logCreateIndex(collectionName: string, index: { [k: string]: any }, options?: CreateIndexesOptions) {
		this.xDatabase.logCreateIndex(collectionName, index, options);
	}

	public getConfigService(gameId: string): IConfigService {
		return this.configServiceDic.get(gameId);
	}

	public setConfigGame(gameId: string, configService: IConfigService) {
		this.configServiceDic.set(gameId, configService);
	}

	public setIdTypeCase(idTypeCase: number) {
		this.idTypeCase = idTypeCase;
	}

	public getIdTypeCase() {
		return this.idTypeCase;
	}

	public getGNSettings(): xGNSettings {
		return this.xGNSettings;
	}

	public getDatabase(): xDatabase {
		return this.xDatabase;
	}

	public getCacheService(gameId: string): ICacheService {
		return this.cacheServiceDic.get(gameId);
	}

	public setCacheService(gameId: string, cacheService: ICacheService) {
		this.cacheServiceDic.set(gameId, cacheService);
	}

	public getFacebookService(): IFacebookService {
		return this.facebookService;
	}

	public getPostEventCallbackService(): IPostEventCallbackService {
		return this.postEventCallbackService;
	}

	public getPreEventCallbackService(): IPreEventCallbackService {
		return this.preEventCallbackService;
	}

	public getEventCallbackCloudScriptService(): IEventCallbackCloudScriptService {
		return this.eventCallbackCloudScriptService;
	}

	public getCountryIPDetailService(): ICountryIPDetailService {
		return this.countryIPDetailService;
	}

	public getAppleService(): IAppleService {
		return this.appleService;
	}

	public getGoogleService(): IGoogleService {
		return this.googleService;
	}

	public getGooglePlayGameService(): IGooglePlayGameService {
		return this.googlePlayGameService;
	}

	public getGameCenterService(): IGameCenterService {
		return this.gameCenterService;
	}

	public getTimerService(): ITimerService {
		return this.timerService;
	}

	public getAnalyticsService(): IAnalyticsService {
		return this.analyticsService;
	}

	public getRequestConverterService(): IRequestConverterService {
		return this.requestConverterService;
	}

	public getEmailService(): IEmailService {
		return this.emailService;
	}

	public getPushNotificationService(): IPushNotificationService {
		return this.pushNotificationService;
	}

	public getCloudScriptService(gameId: string): ICloudScriptService {
		return this.cloudScriptServiceDic.get(gameId);
	}

	public setCloudScriptService(gameId: string, cloudScriptService: ICloudScriptService) {
		return this.cloudScriptServiceDic.set(gameId, cloudScriptService);
	}

	public async sendEventTo(userId: string, operationEvent: OperationEvent): Promise<void> {
		await this.eventCallbackCloudScriptService.executeEvent("system_SendEventTo", { userId: userId }, operationEvent);

		let operationEventToData = {
			eventCode: operationEvent.getEventCode(),
			parameters: operationEvent.getParameters()?.toData()
		};

		this.postEventCallbackCollection.insertOne({
			eventName: "system_SendEventTo",
			tsCreate: xDatetime.getCurrentMilliseconds(),
			request: {
				userId: userId
			},
			operationEvent: operationEventToData,
			responseSize: Buffer.byteLength(JSON.stringify(operationEventToData), "utf-8"),
		});

		this.getHttpApp().getClusterHandler().sendEvent("sendEventTo", {
			userId: userId,
			operationEvent: operationEventToData,
			useMsgPack: true,
		});
	}

	private executeSendEventTo(data: {
		userId: string,
		operationEvent: {
			eventCode: string,
			parameters: {}
		},
		useMsgPack: boolean
	}) {
		let operationEvent = new OperationEvent(data.operationEvent.eventCode, data.operationEvent.parameters != null ? GNHashtable.builder().addAll(data.operationEvent.parameters).build() : null);

		return this.socketApp.getSocketAppHandler().sendEventTo(data.userId, operationEvent, data.useMsgPack);
	}

	public async sendEventToRoom(roomId: string, operationEvent: OperationEvent): Promise<void> {
		await this.eventCallbackCloudScriptService.executeEvent("system_SendEventToRoom", { roomId: roomId }, operationEvent);

		let operationEventToData = {
			eventCode: operationEvent.getEventCode(),
			parameters: operationEvent.getParameters()?.toData()
		};

		this.postEventCallbackCollection.insertOne({
			eventName: "system_SendEventToRoom",
			tsCreate: xDatetime.getCurrentMilliseconds(),
			request: {
				roomId: roomId
			},
			operationEvent: operationEventToData,
			responseSize: Buffer.byteLength(JSON.stringify(operationEventToData), "utf-8"),
		});

		this.getHttpApp().getClusterHandler().sendEvent("sendEventToRoom", {
			roomId: roomId,
			operationEvent: operationEventToData,
			useMsgPack: true,
		});
	}

	private executeSendEventToRoom(data: {
		roomId: string,
		operationEvent: {
			eventCode: string,
			parameters: {}
		},
		useMsgPack: boolean
	}) {
		let operationEvent = new OperationEvent(data.operationEvent.eventCode, data.operationEvent.parameters != null ? GNHashtable.builder().addAll(data.operationEvent.parameters).build() : null);

		return this.socketApp.getSocketAppHandler().sendEventToRoom(data.roomId, operationEvent, data.useMsgPack);
	}

	public async sendEventToMoreUser(userIds: string[], operationEvent: OperationEvent): Promise<void> {
		await this.eventCallbackCloudScriptService.executeEvent("system_SendEventToMoreUser", { userIds: userIds }, operationEvent);

		let operationEventToData = {
			eventCode: operationEvent.getEventCode(),
			parameters: operationEvent.getParameters()?.toData()
		};

		this.postEventCallbackCollection.insertOne({
			eventName: "system_SendEventToMoreUser",
			tsCreate: xDatetime.getCurrentMilliseconds(),
			request: {
				userIds: userIds
			},
			operationEvent: operationEventToData,
			responseSize: Buffer.byteLength(JSON.stringify(operationEventToData), "utf-8") * userIds.length,
		});

		this.getHttpApp().getClusterHandler().sendEvent("sendEventToMoreUser", {
			userIds: userIds,
			operationEvent: operationEventToData,
			useMsgPack: true,
		});
	}

	private executeSendEventToMoreUser(data: {
		userIds: string[],
		operationEvent: {
			eventCode: string,
			parameters: {}
		},
		useMsgPack: boolean,
	}) {
		let operationEvent = new OperationEvent(data.operationEvent.eventCode, data.operationEvent.parameters != null ? GNHashtable.builder().addAll(data.operationEvent.parameters).build() : null);

		return this.socketApp.getSocketAppHandler().sendEventToMoreUser(data.userIds, operationEvent, data.useMsgPack);
	}

	public async sendEventToAllPlayer(operationEvent: OperationEvent): Promise<void> {
		await this.eventCallbackCloudScriptService.executeEvent("system_SendEventToAllPlayer", {}, operationEvent);

		let operationEventToData = {
			eventCode: operationEvent.getEventCode(),
			parameters: operationEvent.getParameters()?.toData()
		};

		this.postEventCallbackCollection.insertOne({
			eventName: "system_SendEventToAllPlayer",
			tsCreate: xDatetime.getCurrentMilliseconds(),
			request: {},
			operationEvent: operationEventToData,
			responseSize: Buffer.byteLength(JSON.stringify(operationEventToData), "utf-8"),
		});

		this.getHttpApp().getClusterHandler().sendEvent("sendEventToAllPlayer", {
			operationEvent: operationEventToData,
			useMsgPack: true,
		});
	}

	private executeSendEventToAllPlayer(data: {
		operationEvent: {
			eventCode: string,
			parameters: {}
		},
		useMsgPack: boolean,
	}) {
		let operationEvent = new OperationEvent(data.operationEvent.eventCode, data.operationEvent.parameters != null ? GNHashtable.builder().addAll(data.operationEvent.parameters).build() : null);

		return this.socketApp.getSocketAppHandler().sendEventToAllPlayer(operationEvent, data.useMsgPack);
	}

	// public async sendEventToNamespace(namespace: string, operationEvent: OperationEvent): Promise<void> {
	// 	return await this.socketApp.getSocketAppHandler().sendEventToNamespace(namespace, operationEvent);
	// }

	public joinRoom(userId: string, roomId: string): void {
		return this.socketApp.getSocketAppHandler().joinRoom(userId, roomId);
	}

	public leaveRoom(userId: string, roomId: string): void {
		return this.socketApp.getSocketAppHandler().leaveRoom(userId, roomId);
	}

	public async getRooms(userId: string): Promise<string[]> {
		return await this.socketApp.getSocketAppHandler().getRooms(userId);
	}

	private handleSocketDisconnect(socket: Socket, data: string) {
		if (socket.data.isAuthenticated) {
			socket.data.isAuthenticated = false;
			// let authInfo = socket.data.authInfo as AuthInfo;
			// authInfo.removeOtherData("SocketId");
		}

		if (socket.data.userId != null) {
			socket.leave(socket.data.userId);
		}
	}

	private handleOnRequest(request: Request): Promise<OperationResponse> {
		return this.requestController.handleRequest(request);
	}

	private handleMatchmaking() {
		for (let i = 0; i < this.gameIds.length; i++) {
			let gameId = this.gameIds[i];
			this.handleMatchmakingForGame(gameId);
		}
	}

	private handleRemoveCacheInvalidData() {
		for (let i = 0; i < this.gameIds.length; i++) {
			let gameId = this.gameIds[i];
			this.getCacheService(gameId).removeInvalidData();
		}
	}

	private async handleMatchmakingForGame(gameId: string) {
		let matchmakingTicketCanMatchs = await this.matchmakingHandler.handle(gameId);

		if (matchmakingTicketCanMatchs != null) {
			// o day can lam gi do
			for (let i = 0; i < matchmakingTicketCanMatchs.length; i++) {
				let matchmakingTicketCanMatch = matchmakingTicketCanMatchs[i];

				if (matchmakingTicketCanMatch.status == <number>MatchmakingTicketStatus.WaitingForServer) {
					this.requestMatchServerDetail(gameId, matchmakingTicketCanMatch);
					// this.eventCallbackCloudScriptService.executeSystem
					// Goi ham de tao server o day
				}
				else {
					// Da ok san roi khong can lam gi nua
				}
			}
		}
	}

	private async requestMatchServerDetail(gameId: string, matchmakingTicketCanMatch: MatchmakingTicketCanMatch): Promise<void> {
		let matchId = matchmakingTicketCanMatch.matchId;
		Debug.logInfo("[GearN] [Matchmaking] request match server detail for " + matchId + " to set serverDetail on gameId " + gameId);

		let thiz = this;
		let timeout = setTimeout(async () => {
			thiz.setMatchServerDetailFailed(gameId, matchId, matchmakingTicketCanMatch.ticketIds, "Timeout");
		}, 15 * 60 * 1000);

		this.waitingServerDetailDict.set(matchId, timeout);

		let response = await this.eventCallbackCloudScriptService.executeRequestServerDetailSystem(gameId, matchmakingTicketCanMatch);
		if (!response.success) {
			this.setMatchServerDetailFailed(gameId, matchId, matchmakingTicketCanMatch.ticketIds, "SystemEventCallback not have return success ok.");
		}
	}

	public setMatchServerDetail(gameId: string, matchId: string, serverDetail: ServerDetail, ticketIds: string[]) {
		let timeout = this.waitingServerDetailDict.get(matchId);
		if (timeout) {
			clearTimeout(timeout);
			this.waitingServerDetailDict.delete(matchId);
		}

		let matchCollection = this.getDatabase().systemGameCollection("Match", gameId);
		matchCollection.updateOne({ matchId: matchId }, { $set: { serverDetail: serverDetail } });

		let matchmakingTicketCollection = this.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);
		matchmakingTicketCollection.updateMany({ ticketId: { $in: ticketIds } }, { $set: { status: <number>MatchmakingTicketStatus.Matched } });
	}

	public setMatchServerDetailFailed(gameId: string, matchId: string, ticketIds: string[], reason: string) {
		let timeout = this.waitingServerDetailDict.get(matchId);
		if (timeout) {
			clearTimeout(timeout);
			this.waitingServerDetailDict.delete(matchId);
		}

		Debug.logInfo("[GearN] [Matchmaking] request match server detail for " + matchId + " failed on " + gameId + ", with reason " + reason);

		let matchCollection = this.getDatabase().systemGameCollection("Match", gameId);
		matchCollection.updateOne({ matchId: matchId }, { $set: {} });

		let matchmakingTicketCollection = this.getDatabase().runtimeGameCollection("MatchmakingTicket", gameId);
		matchmakingTicketCollection.updateMany({ ticketId: { $in: ticketIds } }, { $set: { status: <number>MatchmakingTicketStatus.Canceled } });
	}

	public getGameIds(): string[] {
		return this.gameIds;
	}

	public isPrimary(): boolean {
		return this.httpApp.getClusterHandler().getIsPrimary();
	}

}
