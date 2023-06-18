import { OperationRequest } from "../../../../../GN-common/entity/operationRequest/OperationRequest";
import { OperationResponse } from "../../../../../GN-common/entity/operationResponse/OperationResponse";
import { OperationCode } from "../../../../../GN-common/constant/OperationCode";

import { AuthInfo } from "../../../../../GN-common/entity/AuthInfo";
import { ParameterCode } from "../../../../../GN-common/constant/parameterCode/ParameterCode";
import { ReturnCode } from "../../../../../GN-common/constant/ReturnCode";
import { DataMember, BooleanDataMember, NumberDataMember, StringDataMember, GNHashtableDataMember, GNArrayDataMember, } from "../../../../../GN-common/entity/DataMember";
import { CharacterPlayerParameterCode } from "../../../../../GN-common/constant/parameterCode/CharacterPlayerParameterCode";
import { GNArray, GNHashtable } from "../../../../../GN-common/common/GNData";
import { CharacterPlayerErrorCode } from "../../../../../GN-common/constant/errorCode/CharacterPlayerErrorCode";

import { CharacterPlayerFindOptions } from "../../../../../GN-library/xdatabase/lib/entity/pro/findOptions/CharacterPlayerFindOptions";
import { RequestHandler } from "../base/RequestHandler";
import { SecretInfo } from "../../../../../GN-common/entity/SecretInfo";
import { StatisticsItem } from "../../../../../GN-library/xdatabase/lib/entity/pro/StatisticsItem";
import { CharacterPlayer } from "../../../../../GN-library/xdatabase/lib/entity/pro/CharacterPlayer";
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

	protected convertToCharacterPlayerFindOptions(infoGetParameters: GNHashtable): CharacterPlayerFindOptions {
		if (infoGetParameters.count() == 0) return null;

		let answer: CharacterPlayerFindOptions = {};

        answer.characterId = true;

		let segments = infoGetParameters.getBoolean(CharacterPlayerParameterCode.Segments);
		let scriptData = infoGetParameters.getBoolean(CharacterPlayerParameterCode.ScriptData);
		let privateData = infoGetParameters.getBoolean(CharacterPlayerParameterCode.PrivateData);
		let displayName = infoGetParameters.getBoolean(CharacterPlayerParameterCode.DisplayName);
		let avatar = infoGetParameters.getBoolean(CharacterPlayerParameterCode.Avatar);
		let tsCreate = infoGetParameters.getBoolean(CharacterPlayerParameterCode.TsCreate);
		let tags = infoGetParameters.getBoolean(CharacterPlayerParameterCode.Tags);
		let playerBan = infoGetParameters.getBoolean(CharacterPlayerParameterCode.PlayerBan);
		let playerDatas = infoGetParameters.getBoolean(CharacterPlayerParameterCode.PlayerDatas);
		let playerCurrencies = infoGetParameters.getBoolean(CharacterPlayerParameterCode.PlayerCurrencies);
		let playerStatistics = infoGetParameters.getBoolean(CharacterPlayerParameterCode.PlayerStatistics);
		let tsLastLogin = infoGetParameters.getBoolean(CharacterPlayerParameterCode.TsLastLogin);
		let ipAddressCreate = infoGetParameters.getBoolean(CharacterPlayerParameterCode.IpAddressCreate);
		let countryCode = infoGetParameters.getBoolean(CharacterPlayerParameterCode.CountryCode);

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

	protected generateCharacterPlayerOperationResponse(characterPlayer: CharacterPlayer, characterPlayerFindOptions: CharacterPlayerFindOptions, infoGetParameters: GNHashtable, secretInfo: SecretInfo): GNHashtable {
		let answer = new GNHashtable();

        if ((characterPlayerFindOptions == null || characterPlayerFindOptions.segments) && secretInfo.getPermission().characterPlayer.getSegment.otherSelfEnable)
            answer.add(CharacterPlayerParameterCode.Segments, characterPlayer.getAllSegments());

        if ((characterPlayerFindOptions == null || characterPlayerFindOptions.scriptData) && secretInfo.getPermission().characterPlayer.getScriptData.otherSelfEnable)
            answer.add(CharacterPlayerParameterCode.ScriptData, characterPlayer.getAllScriptData());

        if ((characterPlayerFindOptions == null || characterPlayerFindOptions.privateData) && secretInfo.getPermission().characterPlayer.getPrivateData.otherSelfEnable)
            answer.add(CharacterPlayerParameterCode.PrivateData, characterPlayer.getAllPrivateData());

        if ((characterPlayerFindOptions == null || characterPlayerFindOptions.displayName) && secretInfo.getPermission().characterPlayer.getDisplayName.otherSelfEnable)
            answer.add(CharacterPlayerParameterCode.DisplayName, characterPlayer.getDisplayName());

        if ((characterPlayerFindOptions == null || characterPlayerFindOptions.avatar) && secretInfo.getPermission().characterPlayer.getAvatar.otherSelfEnable) {
            let avatar = characterPlayer.getAvatar();

            let gnAvatar = new GNHashtable();
            gnAvatar.add(CharacterPlayerParameterCode.Type, avatar.type);
            gnAvatar.add(CharacterPlayerParameterCode.Value, avatar.value);

            answer.add(CharacterPlayerParameterCode.Avatar, gnAvatar);
        }

        if ((characterPlayerFindOptions == null || characterPlayerFindOptions.tsCreate) && secretInfo.getPermission().characterPlayer.getTsCreate.otherSelfEnable)
            answer.add(CharacterPlayerParameterCode.TsCreate, characterPlayer.getTsCreate());

        if ((characterPlayerFindOptions == null || characterPlayerFindOptions.tags) && secretInfo.getPermission().characterPlayer.getTag.otherSelfEnable) {
            let tags = characterPlayer.getAllTags();
            let gnTags = new GNArray();
            tags.forEach((value: string | number | boolean, key: string) => {
                let gnTag = new GNHashtable();

                gnTag.add(CharacterPlayerParameterCode.Key, key);
                gnTag.add(CharacterPlayerParameterCode.Value, value);

                gnTags.add(gnTag);
            });
            answer.add(CharacterPlayerParameterCode.Tags, gnTags);
        }

        if ((characterPlayerFindOptions == null || characterPlayerFindOptions.playerBan) && secretInfo.getPermission().characterPlayer.getPlayerBan.otherSelfEnable) {
            let playerBan = characterPlayer.getPlayerBan();
            let gnPlayerBan = new GNHashtable();
            gnPlayerBan.add(CharacterPlayerParameterCode.TsExpire, playerBan.tsExpire);

            if (playerBan.reason != null) gnPlayerBan.add(CharacterPlayerParameterCode.Reason, playerBan.reason);
            answer.add(CharacterPlayerParameterCode.PlayerBan, gnPlayerBan);
        }

        if ((characterPlayerFindOptions == null || characterPlayerFindOptions.playerDatas) && secretInfo.getPermission().characterPlayer.getPlayerData.otherSelfEnable) {
            let playerDatas = characterPlayer.getAllPlayerDatas();
            let gnInfoGetParameterDataKey = infoGetParameters.getGNArray(CharacterPlayerParameterCode.DataKeys);
            let gnPlayerDatas = new GNArray();

            for (let i = 0; i < playerDatas.length; i++) {
                let playerData = playerDatas[i];

                if (gnInfoGetParameterDataKey == null || gnInfoGetParameterDataKey.indexOf(playerData.key) != -1) {
                    let gnPlayerData = new GNHashtable();

                    gnPlayerData.add(CharacterPlayerParameterCode.Key, playerData.key);
                    gnPlayerData.add(CharacterPlayerParameterCode.Value, playerData.value);
                    gnPlayerData.add(CharacterPlayerParameterCode.Permission, playerData.permission);

                    gnPlayerDatas.add(gnPlayerData);
                }
            }

            answer.add(CharacterPlayerParameterCode.PlayerDatas, gnPlayerDatas);
        }

        if ((characterPlayerFindOptions == null || characterPlayerFindOptions.playerCurrencies) && secretInfo.getPermission().characterPlayer.getPlayerCurrency.otherSelfEnable) {
            let playerCurrencies = characterPlayer.getAllPlayerCurrencies();
            let gnInfoGetParameterCurrencyKey = infoGetParameters.getGNArray(CharacterPlayerParameterCode.CurrencyKeys);

            let gnPlayerCurrencies = new GNArray();

            playerCurrencies.forEach((value: CurrencyItem, key: string) => {
                if (gnInfoGetParameterCurrencyKey == null || gnInfoGetParameterCurrencyKey.indexOf(key) != -1) {
                    let gnPlayerCurrency = new GNHashtable();

                    gnPlayerCurrency.add(CharacterPlayerParameterCode.Key, key);
                    gnPlayerCurrency.add(CharacterPlayerParameterCode.Value, value.value);

                    gnPlayerCurrencies.add(gnPlayerCurrency);
                }
            });

            answer.add(CharacterPlayerParameterCode.PlayerCurrencies, gnPlayerCurrencies);
        }

        if ((characterPlayerFindOptions == null || characterPlayerFindOptions.playerStatistics) && secretInfo.getPermission().characterPlayer.getPlayerStatistics.otherSelfEnable) {
            let playerStatistics = characterPlayer.getAllPlayerStatistics();
            let gnInfoGetParameterStatisticsKey = infoGetParameters.getGNArray(CharacterPlayerParameterCode.StatisticsKeys);

            let gnPlayerStatistics = new GNArray();

            playerStatistics.forEach((value: StatisticsItem, key: string) => {
                if (gnInfoGetParameterStatisticsKey == null || gnInfoGetParameterStatisticsKey.indexOf(key) != -1) {
                    let gnPlayerStatistic = new GNHashtable();

                    gnPlayerStatistic.add(CharacterPlayerParameterCode.Key, key);
                    gnPlayerStatistic.add(CharacterPlayerParameterCode.Value, value.value);

                    gnPlayerStatistics.add(gnPlayerStatistic);
                }
            });

            answer.add(CharacterPlayerParameterCode.PlayerStatistics, gnPlayerStatistics);
        }
        
        if ((characterPlayerFindOptions == null || characterPlayerFindOptions.tsLastLogin) && secretInfo.getPermission().characterPlayer.getTsLastLogin.otherSelfEnable)
            answer.add(CharacterPlayerParameterCode.TsLastLogin, characterPlayer.getTsLastLogin());

        if ((characterPlayerFindOptions == null || characterPlayerFindOptions.ipAddressCreate) && secretInfo.getPermission().characterPlayer.getIpAddressCreate.otherSelfEnable)
            answer.add(CharacterPlayerParameterCode.IpAddressCreate, characterPlayer.getIpAddressCreate());

        if ((characterPlayerFindOptions == null || characterPlayerFindOptions.countryCode) && secretInfo.getPermission().characterPlayer.getCountryCode.otherSelfEnable)
            answer.add(CharacterPlayerParameterCode.CountryCode, characterPlayer.getCountryCode());

		return answer;
	}
}
