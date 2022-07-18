const Username = "Username";
const Password = "Password";
const Fullname = "Fullname";
const UserExternal = "UserExternal";
const UserEmail = "UserEmail";
const UserNumberPhone = "UserNumberPhone";
const UserAddress = "UserAddress";
const UserPassport = "UserPassport";
const TsBirthday = "TsBirthday";
const IPAddressCreate = "IPAddressCreate";

const Value = "Value";
const IsConfirm = "IsConfirm";
const PinCode = "PinCode";
const TsExpire = "TsExpire";

const DOT = ".";

import * as mongoDB from "mongodb";
import { xPlayerBase } from "./xPlayerBase";

export class xSparkPlayer extends xPlayerBase {
	private username: string;
	private password: string;
	private fullname: string;
	private userExternal: { [k: string]: number | string };

	private userEmail: { [key: string]: boolean | string | number };
	private userNumberPhone: { [key: string]: boolean | string | number };
	private userAddress: {};
	private userPassport: {};

	private tsBirthday: number;

	private ipAddressCreate: string;

	constructor(result: any, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);
		this.setDocument(result);
	}

	private setDocument(result: mongoDB.WithId<mongoDB.Document>) {
		this.username = result[Username];
		this.password = result[Password];
		this.fullname = result[Fullname];
		this.userExternal = result[UserExternal];
		this.userEmail = result[UserEmail];
		this.userNumberPhone = result[UserNumberPhone];
		this.userAddress = result[UserAddress];
		this.userPassport = result[UserPassport];
		this.tsBirthday = result[TsBirthday];

		this.ipAddressCreate = result[IPAddressCreate];
	}

	public getUsername(): string {
		return this.username;
	}

	public setUsername(username: string) {
		this.username = username;

		this.collection.updateOne(
			{ _id: this._id },
			{
				$set: {
					Username: username,
				},
			}
		);
	}

	public getPassword(): string {
		return this.password;
	}

	public setPassword(password: string) {
		this.password = password;

		this.collection.updateOne(
			{ _id: this._id },
			{
				$set: {
					Password: password,
				},
			}
		);
	}

	public getFullname(): string {
		return this.fullname;
	}

	public setFullname(fullname: string) {
		this.fullname = fullname;

		this.collection.updateOne(
			{ _id: this._id },
			{
				$set: {
					Fullname: fullname,
				},
			}
		);
	}

	public getUserExternal(key: string): number | string {
		return this.userExternal[key];
	}

	public setUserExternal(key: string, value: number | string) {
		this.userExternal[key] = value;

		let updateQuery: { [k: string]: any } = {};
		updateQuery[UserExternal + DOT + key] = value;

		this.collection.updateOne(
			{ _id: this._id },
			{
				$set: updateQuery,
			}
		);
	}

	public getUserEmail() {
		return this.userEmail;
	}

	public setUserEmail(value: string, isConfirm: boolean) {
		this.userEmail[Value] = value;
		this.userEmail[IsConfirm] = isConfirm;

		let updateQuery: { [k: string]: any } = {};
		updateQuery[UserEmail + DOT + Value] = value;
		updateQuery[UserEmail + DOT + IsConfirm] = isConfirm;

		this.collection.updateOne(
			{ _id: this._id },
			{
				$set: updateQuery,
			}
		);
	}

	public setPinCodeUserMail(pinCode: string, tsExpire: number) {
		if (!pinCode) {
			delete this.userEmail[PinCode];
			delete this.userEmail[TsExpire];

			let updateQuery: { [k: string]: any } = {};
			updateQuery[UserEmail + DOT + PinCode] = pinCode;
			updateQuery[UserEmail + DOT + TsExpire] = tsExpire;

			this.collection.updateOne(
				{ _id: this._id },
				{
					$unset: updateQuery,
				}
			);
		} else {
			this.userEmail[PinCode] = pinCode;
			this.userEmail[TsExpire] = tsExpire;

			let updateQuery: { [k: string]: any } = {};
			updateQuery[UserEmail + DOT + PinCode] = pinCode;
			updateQuery[UserEmail + DOT + TsExpire] = tsExpire;

			this.collection.updateOne(
				{ _id: this._id },
				{
					$set: updateQuery,
				}
			);
		}
	}

	public getUserNumberPhone() {
		return this.userNumberPhone;
	}

	public setUserNumberPhone(value: string, isConfirm: boolean) {
		this.userNumberPhone[Value] = value;
		this.userNumberPhone[IsConfirm] = isConfirm;

		let updateQuery: { [k: string]: any } = {};
		updateQuery[UserNumberPhone + DOT + Value] = value;
		updateQuery[UserNumberPhone + DOT + IsConfirm] = isConfirm;

		this.collection.updateOne(
			{ _id: this._id },
			{
				$set: updateQuery,
			}
		);
	}

	public getUserAddress() {
		return this.userAddress;
	}

	public setUserAddress() {}

	public getUserPassport() {
		return this.userPassport;
	}

	public setUserPassport() {}

	public getTsBirthday() {}

	public setTsBirthday() {
		return this.tsBirthday;
	}

	public getIPAddressCreate() {
		return this.ipAddressCreate;
	}
}
