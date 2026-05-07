import * as mongodb from "mongodb";

import { BanItem } from "./BanItem";
import { DataObjectBase } from "./DataObjectBase";
import { CurrencyItem } from "./CurrencyItem";
import { StatisticsItem } from "./StatisticsItem";
import { DataValueType } from "./type/DataValueType";

/**
 * Shared base for every kind of player (MasterPlayer, GamePlayerBase and their subclasses).
 * Adds player-specific information on top of DataObjectBase: ban, currencies, statistics, datas, ip/country, last-login timestamp.
 */
export class PlayerBase extends DataObjectBase {
	/** MongoDB field name for the player's active ban record. */
	private static readonly _playerBan: string = "playerBan";

	/** MongoDB field name for the player's currency map (gold, gem...). */
	private static readonly _playerCurrencies: string = "playerCurrencies";
	/** MongoDB field name for the player's statistics map. */
	private static readonly _playerStatistics: string = "playerStatistics";
	/** MongoDB field name for the player's custom data list (player-scoped key-value extensions). */
	private static readonly _playerDatas: string = "playerDatas";

	/** MongoDB field name for the IP recorded when the player account was created. */
	private static readonly _ipAddressCreate: string = "ipAddressCreate";
	/** MongoDB field name for the country code derived from the account-creation IP. */
	private static readonly _countryCode: string = "countryCode";

	/** MongoDB field name for the most recent login timestamp; used for DAU/MAU and inactive-account detection. */
	private static readonly _tsLastLogin: string = "tsLastLogin";

	/** Active ban record for the player; null/undefined means the player is not banned. */
	private playerBan: BanItem;

	/** Player currency map: key is the currency code, value is the current balance (see CurrencyItem). */
	private playerCurrencies: Map<string, CurrencyItem>;
	/** Player statistics map: key is the statistic name, value is StatisticsItem (value + last-update ts). */
	private playerStatistics: Map<string, StatisticsItem>;

	/** Player-scoped custom data list of key-value extensions (separate from DataObjectBase.customDatas). */
	private playerDatas: Map<string, DataValueType>;
	/** IP captured when the account was first created; immutable, used for audit/anti-fraud. */
	private ipAddressCreate: string;
	/** ISO country code derived from the account-creation IP; used to apply region-specific policy. */
	private countryCode: string;

	/** Epoch ms of the player's most recent login; updated on every successful login. */
	private tsLastLogin: number;

	/**
	 * Initializes a new player base instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
		super(result, collection);

		this.setDocumentPlayerBase(result);
	}

	/**
	 * Sets the document player base.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentPlayerBase(result: mongodb.WithId<mongodb.Document>): void {
		this.playerBan = result[PlayerBase._playerBan];

		this.playerCurrencies = result[PlayerBase._playerCurrencies] != null ? new Map(Object.entries(result[PlayerBase._playerCurrencies])) : null;
		this.playerStatistics = result[PlayerBase._playerStatistics] != null ? new Map(Object.entries(result[PlayerBase._playerStatistics])) : null;

		this.playerDatas = result[PlayerBase._playerDatas] != null ? new Map(Object.entries(result[PlayerBase._playerDatas])) : null;

		this.ipAddressCreate = result[PlayerBase._ipAddressCreate];
		this.countryCode = result[PlayerBase._countryCode];

		this.tsLastLogin = result[PlayerBase._tsLastLogin];
	}

	/**
	 * Returns the player ban.
	 * @returns Returns the player ban.
	 */
	public getPlayerBan(): BanItem {
		return this.playerBan;
	}

	/**
	 * Sets the player ban.
	 * @param tsExpire Provides the timestamp expire value used by this operation.
	 * @param reason Provides the reason value used by this operation.
	 */
	public setPlayerBan(tsExpire: number, reason: string): void {
		this.playerBan = {
			reason: reason,
			tsExpire: tsExpire
		}

		this.set(PlayerBase._playerBan, this.playerBan);
	}

	/**
	 * Returns all player datas.
	 * @returns Returns all player datas.
	 */
	public getAllPlayerDatas(): Map<string, DataValueType> {
		return this.playerDatas;
	}

	/**
	 * Checks whether player data exists.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasPlayerData(key: string): boolean {
		return this.playerDatas.has(key);
	}

	/**
	 * Returns the player data.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the player data.
	 */
	public getPlayerData(key: string): DataValueType {
		return this.playerDatas.get(key);
	}

	/**
	 * Sets the player data.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 */
	public setPlayerData(key: string, value: DataValueType): void {
		this.playerDatas.set(key, value);

		this.set(PlayerBase._playerDatas + DataObjectBase.DOT + key, value);
	}

	/**
	 * Removes the player data.
	 * @param key Provides the key value used by this operation.
	 */
	public removePlayerData(key: string): void {
		this.playerDatas.delete(key);

		this.unset(PlayerBase._playerDatas + DataObjectBase.DOT + key);
	}

	/**
	 * Returns all player currencies.
	 * @returns Returns all player currencies.
	 */
	public getAllPlayerCurrencies(): Map<string, CurrencyItem> {
		return this.playerCurrencies;
	}

	/**
	 * Checks whether player currency exists.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasPlayerCurrency(key: string): boolean {
		return this.playerCurrencies.has(key);
	}

	/**
	 * Returns the player currency.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the player currency.
	 */
	public getPlayerCurrency(key: string): CurrencyItem {
		return this.playerCurrencies.get(key);
	}

	/**
	 * Changes the player currency.
	 * @param key Provides the key value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 */
	public changePlayerCurrency(key: string, amount: number): void {
		// Stores the this player currency value used in the current execution flow.
		const thisPlayerCurrency = this.playerCurrencies.get(key);
		this.playerCurrencies.set(key, {
			value: thisPlayerCurrency != null ? (thisPlayerCurrency.value + amount) : amount,
		});

		// Stores the field value used in the current execution flow.
		const field = PlayerBase._playerCurrencies + DataObjectBase.DOT + key;
		this.removeSet(field);
		this.inc(field + DataObjectBase.DOT + "value", amount);
	}

	/**
	 * Sets the player currency.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 */
	public setPlayerCurrency(key: string, value: number): void {
		this.playerCurrencies.set(key, {
			value: value
		});

		// Stores the field value used in the current execution flow.
		const field = PlayerBase._playerCurrencies + DataObjectBase.DOT + key;
		this.removeInc(field + DataObjectBase.DOT + "value");
		this.set(field, {
			value: value
		});
	}

	/**
	 * Removes the player currency.
	 * @param key Provides the key value used by this operation.
	 */
	public removePlayerCurrency(key: string): void {
		if (this.playerCurrencies.has(key)) {
			this.playerCurrencies.delete(key);

			return this.unset(PlayerBase._playerCurrencies + DataObjectBase.DOT + key);
		}

		throw Error("can not found the key to remove");
	}

	/**
	 * Returns all player statistics.
	 * @returns Returns all player statistics.
	 */
	public getAllPlayerStatistics(): Map<string, StatisticsItem> {
		return this.playerStatistics;
	}

	/**
	 * Checks whether player statistics exists.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasPlayerStatistics(key: string): boolean {
		return this.playerStatistics.has(key);
	}

	/**
	 * Returns the player statistics.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the player statistics.
	 */
	public getPlayerStatistics(key: string): StatisticsItem {
		return this.playerStatistics.get(key);
	}

	/**
	 * Changes the player statistics.
	 * @param key Provides the key value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 * @param tsLastUpdate Provides the timestamp last update value used by this operation.
	 */
	public changePlayerStatistics(key: string, amount: number, tsLastUpdate: number): void {
		// Stores the this player statistics value used in the current execution flow.
		const thisPlayerStatistics = this.playerStatistics.get(key);
		this.playerStatistics.set(key, {
			value: thisPlayerStatistics != null ? (thisPlayerStatistics.value + amount) : amount,
			tsLastUpdate: tsLastUpdate,
		});

		// Stores the field value used in the current execution flow.
		const field = PlayerBase._playerStatistics + DataObjectBase.DOT + key;
		this.removeSet(field);
		this.inc(field + DataObjectBase.DOT + "value", amount);
		this.set(field + DataObjectBase.DOT + "tsLastUpdate", tsLastUpdate);
	}

	/**
	 * Sets the player statistics.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 * @param tsLastUpdate Provides the timestamp last update value used by this operation.
	 */
	public setPlayerStatistics(key: string, value: number, tsLastUpdate: number): void {
		this.playerStatistics.set(key, {
			value: value,
			tsLastUpdate: tsLastUpdate
		});

		// Stores the field value used in the current execution flow.
		const field = PlayerBase._playerStatistics + DataObjectBase.DOT + key;
		this.removeInc(field + DataObjectBase.DOT + "value");
		this.removeSet(field + DataObjectBase.DOT + "tsLastUpdate");
		this.set(field, {
			value: value,
			tsLastUpdate: tsLastUpdate
		});
	}

	/**
	 * Removes the player statistics.
	 * @param key Provides the key value used by this operation.
	 */
	public removePlayerStatistics(key: string): void {
		if (this.playerStatistics.has(key)) {
			this.playerStatistics.delete(key);

			return this.unset(PlayerBase._playerStatistics + DataObjectBase.DOT + key);
		}

		throw Error("can not found the key to remove");
	}

	/**
	 * Returns the IP address create.
	 * @returns Returns the IP address create.
	 */
	public getIpAddressCreate(): string {
		return this.ipAddressCreate;
	}

	/**
	 * Sets the IP address create.
	 * @param ipAddressCreate Provides the IP address create value used by this operation.
	 */
	public setIpAddressCreate(ipAddressCreate: string): void {
		this.ipAddressCreate = ipAddressCreate;

		this.set(PlayerBase._ipAddressCreate, this.ipAddressCreate);
	}

	/**
	 * Returns the country code.
	 * @returns Returns the country code.
	 */
	public getCountryCode(): string {
		return this.countryCode;
	}

	/**
	 * Sets the country code.
	 * @param countryCode Provides the country code value used by this operation.
	 */
	public setCountryCode(countryCode: string): void {
		this.countryCode = countryCode;

		this.set(PlayerBase._countryCode, this.countryCode);
	}

	/**
	 * Returns the timestamp last login.
	 * @returns Returns the timestamp last login.
	 */
	public getTsLastLogin(): number {
		return this.tsLastLogin;
	}

	/**
	 * Sets the timestamp last login.
	 * @param tsLastLogin Provides the timestamp last login value used by this operation.
	 */
	public setTsLastLogin(tsLastLogin: number): void {
		this.tsLastLogin = tsLastLogin;

		this.set(PlayerBase._tsLastLogin, this.tsLastLogin);
	}
}
