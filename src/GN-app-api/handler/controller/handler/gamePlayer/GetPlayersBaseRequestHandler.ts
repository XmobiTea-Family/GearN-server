import { OperationRequest } from "../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "../../../../../GN-common/entity/DataMember";
import { GamePlayerParameterCode } from "../../../../../GN-common/constant/parameterCode/GamePlayerParameterCode";
import { GNArray, GNHashtable } from "../../../../../GN-common/common/GNData";
import { GamePlayerErrorCode } from "../../../../../GN-common/constant/errorCode/GamePlayerErrorCode";

import { GamePlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/GamePlayerFindOptions";
import { RequestHandler } from "../base/RequestHandler";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";
import { StatisticsItem } from "../../../../../GN-library/xdatabase/lib/entity/pro/StatisticsItem";
import { GamePlayer } from "../../../../../GN-library/xdatabase/lib/entity/pro/GamePlayer";
import { CurrencyItem } from "../../../../../GN-library/xdatabase/lib/entity/pro/CurrencyItem";

class GetPlayersBaseOperationRequest extends OperationRequest {
	public isValidRequest() {
		if (!super.isValidRequest()) return false;

		return true;
	}
}

export class GetPlayersBaseRequestHandler extends RequestHandler {
	public override getCode() {
		return 0;
	}

	public override getCommonOperationRequest() {
		return GetPlayersBaseOperationRequest;
	}

	protected convertToGamePlayerFindOptions(infoGetParameters: GNHashtable): GamePlayerFindOptions {
		if (infoGetParameters.count() == 0) return null;

		let answer: GamePlayerFindOptions = {};

        answer.userId = true;

		let segments = infoGetParameters.getBoolean(GamePlayerParameterCode.Segments);
		let scriptData = infoGetParameters.getBoolean(GamePlayerParameterCode.ScriptData);
		let privateData = infoGetParameters.getBoolean(GamePlayerParameterCode.PrivateData);
		let displayName = infoGetParameters.getBoolean(GamePlayerParameterCode.DisplayName);
		let avatar = infoGetParameters.getBoolean(GamePlayerParameterCode.Avatar);
		let tsCreate = infoGetParameters.getBoolean(GamePlayerParameterCode.TsCreate);
		let tags = infoGetParameters.getBoolean(GamePlayerParameterCode.Tags);
		let playerBan = infoGetParameters.getBoolean(GamePlayerParameterCode.PlayerBan);
		let playerDatas = infoGetParameters.getBoolean(GamePlayerParameterCode.PlayerDatas);
		let playerCurrencies = infoGetParameters.getBoolean(GamePlayerParameterCode.PlayerCurrencies);
		let playerStatistics = infoGetParameters.getBoolean(GamePlayerParameterCode.PlayerStatistics);
		let tsLastLogin = infoGetParameters.getBoolean(GamePlayerParameterCode.TsLastLogin);
		let ipAddressCreate = infoGetParameters.getBoolean(GamePlayerParameterCode.IpAddressCreate);
		let countryCode = infoGetParameters.getBoolean(GamePlayerParameterCode.CountryCode);

		if (segments) answer.segments = true;
		if (scriptData) answer.scriptData = true;
		if (privateData) answer.privateData = true;
		if (displayName) answer.displayName = true;
		if (avatar) answer.avatar = true;
		if (tsCreate) answer.tsCreate = true;
		if (tags) answer.tags = true;
		if (playerBan) answer.playerBan = true;
		if (playerDatas) answer.playerDatas = true;
		if (playerCurrencies) answer.playerCurrencies = true;
		if (playerStatistics) answer.playerStatistics = true;
		if (tsLastLogin) answer.tsLastLogin = true;
		if (ipAddressCreate) answer.ipAddressCreate = true;
		if (countryCode) answer.countryCode = true;

		return answer;
	}

	protected generateGamePlayerOperationResponse(gamePlayer: GamePlayer, gamePlayerFindOptions: GamePlayerFindOptions, infoGetParameters: GNHashtable, secretInfo: SecretInfo): GNHashtable {
		let answer = new GNHashtable();


        if ((gamePlayerFindOptions == null || gamePlayerFindOptions.segments) && secretInfo.getPermission().gamePlayer.getSegment.otherSelfEnable)
            answer.add(GamePlayerParameterCode.Segments, gamePlayer.getAllSegments());

        if ((gamePlayerFindOptions == null || gamePlayerFindOptions.scriptData) && secretInfo.getPermission().gamePlayer.getScriptData.otherSelfEnable)
            answer.add(GamePlayerParameterCode.ScriptData, gamePlayer.getAllScriptData());

        if ((gamePlayerFindOptions == null || gamePlayerFindOptions.privateData) && secretInfo.getPermission().gamePlayer.getPrivateData.otherSelfEnable)
            answer.add(GamePlayerParameterCode.PrivateData, gamePlayer.getAllPrivateData());

        if ((gamePlayerFindOptions == null || gamePlayerFindOptions.displayName) && secretInfo.getPermission().gamePlayer.getDisplayName.otherSelfEnable)
            answer.add(GamePlayerParameterCode.DisplayName, gamePlayer.getDisplayName());

        if ((gamePlayerFindOptions == null || gamePlayerFindOptions.avatar) && secretInfo.getPermission().gamePlayer.getAvatar.otherSelfEnable) {
            let avatar = gamePlayer.getAvatar();

            let gnAvatar = new GNHashtable();
            gnAvatar.add(GamePlayerParameterCode.Type, avatar.type);
            gnAvatar.add(GamePlayerParameterCode.Value, avatar.value);

            answer.add(GamePlayerParameterCode.Avatar, gnAvatar);
        }

        if ((gamePlayerFindOptions == null || gamePlayerFindOptions.tsCreate) && secretInfo.getPermission().gamePlayer.getTsCreate.otherSelfEnable)
            answer.add(GamePlayerParameterCode.TsCreate, gamePlayer.getTsCreate());

        if ((gamePlayerFindOptions == null || gamePlayerFindOptions.tags) && secretInfo.getPermission().gamePlayer.getTag.otherSelfEnable) {
            let tags = gamePlayer.getAllTags();
            let gnTags = new GNArray();
            tags.forEach((value: string | number | boolean, key: string) => {
                let gnTag = new GNHashtable();

                gnTag.add(GamePlayerParameterCode.Key, key);
                gnTag.add(GamePlayerParameterCode.Value, value);

                gnTags.add(gnTag);
            });
            answer.add(GamePlayerParameterCode.Tags, gnTags);
        }

        if ((gamePlayerFindOptions == null || gamePlayerFindOptions.playerBan) && secretInfo.getPermission().gamePlayer.getPlayerBan.otherSelfEnable) {
            let playerBan = gamePlayer.getPlayerBan();
            let gnPlayerBan = new GNHashtable();
            gnPlayerBan.add(GamePlayerParameterCode.TsExpire, playerBan.tsExpire);

            if (playerBan.reason != null) gnPlayerBan.add(GamePlayerParameterCode.Reason, playerBan.reason);
            answer.add(GamePlayerParameterCode.PlayerBan, gnPlayerBan);
        }

        if ((gamePlayerFindOptions == null || gamePlayerFindOptions.playerDatas) && secretInfo.getPermission().gamePlayer.getPlayerData.otherSelfEnable) {
            let playerDatas = gamePlayer.getAllPlayerDatas();
            let gnInfoGetParameterDataKey = infoGetParameters.getGNArray(GamePlayerParameterCode.DataKeys);
            let gnPlayerDatas = new GNArray();

            for (let i = 0; i < playerDatas.length; i++) {
                let playerData = playerDatas[i];

                if (gnInfoGetParameterDataKey == null || gnInfoGetParameterDataKey.indexOf(playerData.key) != -1) {
                    let gnPlayerData = new GNHashtable();

                    gnPlayerData.add(GamePlayerParameterCode.Key, playerData.key);
                    gnPlayerData.add(GamePlayerParameterCode.Value, playerData.value);
                    gnPlayerData.add(GamePlayerParameterCode.Permission, playerData.permission);

                    gnPlayerDatas.add(gnPlayerData);
                }
            }

            answer.add(GamePlayerParameterCode.PlayerDatas, gnPlayerDatas);
        }

        if ((gamePlayerFindOptions == null || gamePlayerFindOptions.playerCurrencies) && secretInfo.getPermission().gamePlayer.getPlayerCurrency.otherSelfEnable) {
            let playerCurrencies = gamePlayer.getAllPlayerCurrencies();
            let gnInfoGetParameterCurrencyKey = infoGetParameters.getGNArray(GamePlayerParameterCode.CurrencyKeys);

            let gnPlayerCurrencies = new GNArray();

            playerCurrencies.forEach((value: CurrencyItem, key: string) => {
                if (gnInfoGetParameterCurrencyKey == null || gnInfoGetParameterCurrencyKey.indexOf(key) != -1) {
                    let gnPlayerCurrency = new GNHashtable();

                    gnPlayerCurrency.add(GamePlayerParameterCode.Key, key);
                    gnPlayerCurrency.add(GamePlayerParameterCode.Value, value.value);

                    gnPlayerCurrencies.add(gnPlayerCurrency);
                }
            });

            answer.add(GamePlayerParameterCode.PlayerCurrencies, gnPlayerCurrencies);
        }

        if ((gamePlayerFindOptions == null || gamePlayerFindOptions.playerStatistics) && secretInfo.getPermission().gamePlayer.getPlayerStatistics.otherSelfEnable) {
            let playerStatistics = gamePlayer.getAllPlayerStatistics();
            let gnInfoGetParameterStatisticsKey = infoGetParameters.getGNArray(GamePlayerParameterCode.StatisticsKeys);

            let gnPlayerStatistics = new GNArray();

            playerStatistics.forEach((value: StatisticsItem, key: string) => {
                if (gnInfoGetParameterStatisticsKey == null || gnInfoGetParameterStatisticsKey.indexOf(key) != -1) {
                    let gnPlayerStatistic = new GNHashtable();

                    gnPlayerStatistic.add(GamePlayerParameterCode.Key, key);
                    gnPlayerStatistic.add(GamePlayerParameterCode.Value, value.value);

                    gnPlayerStatistics.add(gnPlayerStatistic);
                }
            });

            answer.add(GamePlayerParameterCode.PlayerStatistics, gnPlayerStatistics);
        }
        
        if ((gamePlayerFindOptions == null || gamePlayerFindOptions.tsLastLogin) && secretInfo.getPermission().gamePlayer.getTsLastLogin.otherSelfEnable)
            answer.add(GamePlayerParameterCode.TsLastLogin, gamePlayer.getTsLastLogin());

        if ((gamePlayerFindOptions == null || gamePlayerFindOptions.ipAddressCreate) && secretInfo.getPermission().gamePlayer.getIpAddressCreate.otherSelfEnable)
            answer.add(GamePlayerParameterCode.IpAddressCreate, gamePlayer.getIpAddressCreate());

        if ((gamePlayerFindOptions == null || gamePlayerFindOptions.countryCode) && secretInfo.getPermission().gamePlayer.getCountryCode.otherSelfEnable)
            answer.add(GamePlayerParameterCode.CountryCode, gamePlayer.getCountryCode());

		return answer;
	}
}
