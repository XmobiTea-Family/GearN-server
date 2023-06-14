import * as mongoDB from "mongodb";

import { PlayerBase } from "./PlayerBase";

export class MasterPlayerBase extends PlayerBase {
	private ipAddressCreate: string;
	private countryCode: number;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.setDocument(result);
	}

	private setDocument(result: mongoDB.WithId<mongoDB.Document>) {
		this.ipAddressCreate = result[PlayerBase._ipAddressCreate];
		this.countryCode = result[PlayerBase._countryCode];
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
}










