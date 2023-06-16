import * as mongoDB from "mongodb";

import { BanItem } from "./BanItem";
import { DataItem } from "./DataItem";
import { DataObjectBase } from "./DataObjectBase";
import { CurrencyItem } from "./CurrencyItem";
import { StatisticsItem } from "./StatisticsItem";
import { DataValueType } from "./type/DataValueType";

export class PlayerBase extends DataObjectBase {
	private static readonly _playerBan: string = "playerBan";

	private static readonly _playerCurrencies: string = "playerCurrencies";
	private static readonly _playerStatistics: string = "playerStatistics";
	private static readonly _playerDatas: string = "playerDatas";

	private static readonly _ipAddressCreate: string = "ipAddressCreate";
	private static readonly _countryCode: string = "countryCode";

	private static readonly _tsLastLogin: string = "tsLastLogin";
	
	private playerBan: BanItem;

	private playerCurrencies: Map<string, CurrencyItem>;
	private playerStatistics: Map<string, StatisticsItem>;

	private playerDatas: Array<DataItem>;
	private ipAddressCreate: string;
	private countryCode: number;

	private tsLastLogin: number;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.setDocumentPlayerBase(result);
	}

	private setDocumentPlayerBase(result: mongoDB.WithId<mongoDB.Document>): void {
		this.playerBan = result[PlayerBase._playerBan];

		this.playerCurrencies = result[PlayerBase._playerCurrencies];
		this.playerStatistics = result[PlayerBase._playerStatistics];

		this.playerDatas = result[PlayerBase._playerDatas];

		this.ipAddressCreate = result[PlayerBase._ipAddressCreate];
		this.countryCode = result[PlayerBase._countryCode];

		this.tsLastLogin = result[PlayerBase._tsLastLogin];
	}

    public getPlayerBan(): BanItem {
        return this.playerBan;
    }

    public setPlayerBan(tsExpire: number, reason: string): void {
        this.playerBan = {
			reason: reason,
			tsExpire: tsExpire
		}

		this.set(PlayerBase._playerBan, this.playerBan);
    }

    public getAllPlayerDatas(): Array<DataItem> {
        return this.playerDatas;
    }

    public hasPlayerData(key: string): boolean {
		return this.playerDatas.find(x => x.key == key) != null;
	}

    public getPlayerData(key: string): DataItem {
		return this.playerDatas.find(x => x.key == key);
	}

    public setPlayerData(key: string, value: DataValueType, permission: number): void {
        let playerDataItem = this.playerDatas.find(x => x.key == key);
		if (playerDataItem == null) {
			playerDataItem = {
				key: key,
				value: value,
				permission: permission,
			}

			this.playerDatas.push(playerDataItem);
		}
		else {
			playerDataItem.value = value;
			playerDataItem.permission = permission;
		}
		
		this.set(PlayerBase._playerDatas, this.playerDatas);
	}

    public removePlayerData(key: string): void {
        let playerDataItem = this.playerDatas.find(x => x.key == key);
		if (playerDataItem != null) {
			let indexOf = this.playerDatas.indexOf(playerDataItem);
			if (indexOf != -1) {
				this.playerDatas.splice(indexOf, 1);

				return this.set(PlayerBase._playerDatas, this.playerDatas);
			}
		}

		throw Error("can not found the key to remove");
    }

	public getAllPlayerCurrencies(): Map<string, CurrencyItem> {
        return this.playerCurrencies;
    }

    public hasPlayerCurrency(key: string): boolean {
		return this.playerCurrencies.has(key);
	}

    public getPlayerCurrency(key: string): CurrencyItem {
		return this.playerCurrencies.get(key);
	}

    public setPlayerCurrency(key: string, value: number): void {
		this.playerCurrencies.set(key, {
			value: value
		});
		
		this.set(PlayerBase._playerCurrencies + DataObjectBase.DOT + key, {
			value: value
		});
	}

    public removePlayerCurrency(key: string): void {
		if (this.playerCurrencies.has(key)) {
			this.playerCurrencies.delete(key);
			
			return this.unset(PlayerBase._playerCurrencies + DataObjectBase.DOT + key);
		}

		throw Error("can not found the key to remove");
    }

	public getAllPlayerStatistics(): Map<string, StatisticsItem> {
        return this.playerStatistics;
    }

    public hasPlayerStatistics(key: string): boolean {
		return this.playerStatistics.has(key);
	}

    public getPlayerStatistics(key: string): StatisticsItem {
		return this.playerStatistics.get(key);
	}

    public setPlayerStatistics(key: string, value: number, tsLastUpdate: number): void {
        this.playerStatistics.set(key, {
			value: value,
			tsLastUpdate: tsLastUpdate
		});
		
		this.set(PlayerBase._playerStatistics + DataObjectBase.DOT + key, {
			value: value,
			tsLastUpdate: tsLastUpdate
		});
	}

    public removePlayerStatistics(key: string): void {
		if (this.playerStatistics.has(key)) {
			this.playerStatistics.delete(key);

			return this.unset(PlayerBase._playerStatistics + DataObjectBase.DOT + key);
		}

		throw Error("can not found the key to remove");
    }

	public getIpAddressCreate(): string {
		return this.ipAddressCreate;
	}

	public setIpAddressCreate(ipAddressCreate: string): void {
		this.ipAddressCreate = ipAddressCreate;

		this.set(PlayerBase._ipAddressCreate, this.ipAddressCreate);
	}

	public getCountryCode(): number {
		return this.countryCode;
	}

	public setCountryCode(countryCode: number): void {
		this.countryCode = countryCode;

		this.set(PlayerBase._countryCode, this.countryCode);
	}

	public getTsLastLogin(): number {
		return this.tsLastLogin;
	}

	public setTsLastLogin(tsLastLogin: number): void {
		this.tsLastLogin = tsLastLogin;

		this.set(PlayerBase._tsLastLogin, this.tsLastLogin);
	}
}
