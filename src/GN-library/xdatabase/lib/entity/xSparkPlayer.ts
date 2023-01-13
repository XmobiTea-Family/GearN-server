import * as mongoDB from "mongodb";
import { xPlayerBase } from "./xPlayerBase";

export class xSparkPlayer extends xPlayerBase {
	private static readonly Username: string = "Username";
	private static readonly Password: string = "Password";
	private static readonly Fullname: string = "Fullname";
	private static readonly UserExternal: string = "UserExternal";
	private static readonly UserEmail: string = "UserEmail";
	private static readonly UserNumberPhone: string = "UserNumberPhone";
	private static readonly UserAddress: string = "UserAddress";
	private static readonly UserPassport: string = "UserPassport";
	private static readonly TsBirthday: string = "TsBirthday";
	private static readonly IPAddressCreate: string = "IPAddressCreate";

	private static readonly Value: string = "Value";
	private static readonly IsConfirm: string = "IsConfirm";
	private static readonly PinCode: string = "PinCode";
	private static readonly TsExpire: string = "TsExpire";

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
		this.username = result[xSparkPlayer.Username];
		this.password = result[xSparkPlayer.Password];
		this.fullname = result[xSparkPlayer.Fullname];
		this.userExternal = result[xSparkPlayer.UserExternal];
		this.userEmail = result[xSparkPlayer.UserEmail];
		this.userNumberPhone = result[xSparkPlayer.UserNumberPhone];
		this.userAddress = result[xSparkPlayer.UserAddress];
		this.userPassport = result[xSparkPlayer.UserPassport];
		this.tsBirthday = result[xSparkPlayer.TsBirthday];

		this.ipAddressCreate = result[xSparkPlayer.IPAddressCreate];
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
		updateQuery[xSparkPlayer.UserExternal + xSparkPlayer.DOT + key] = value;

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
		this.userEmail[xSparkPlayer.Value] = value;
		this.userEmail[xSparkPlayer.IsConfirm] = isConfirm;

		let updateQuery: { [k: string]: any } = {};
		updateQuery[xSparkPlayer.UserEmail + xSparkPlayer.DOT + xSparkPlayer.Value] = value;
		updateQuery[xSparkPlayer.UserEmail + xSparkPlayer.DOT + xSparkPlayer.IsConfirm] = isConfirm;

		this.collection.updateOne(
			{ _id: this._id },
			{
				$set: updateQuery,
			}
		);
	}

	public setPinCodeUserMail(pinCode: string, tsExpire: number) {
		if (!pinCode) {
			delete this.userEmail[xSparkPlayer.PinCode];
			delete this.userEmail[xSparkPlayer.TsExpire];

			let updateQuery: { [k: string]: any } = {};
			updateQuery[xSparkPlayer.UserEmail + xSparkPlayer.DOT + xSparkPlayer.PinCode] = pinCode;
			updateQuery[xSparkPlayer.UserEmail + xSparkPlayer.DOT + xSparkPlayer.TsExpire] = tsExpire;

			this.collection.updateOne(
				{ _id: this._id },
				{
					$unset: updateQuery,
				}
			);
		} else {
			this.userEmail[xSparkPlayer.PinCode] = pinCode;
			this.userEmail[xSparkPlayer.TsExpire] = tsExpire;

			let updateQuery: { [k: string]: any } = {};
			updateQuery[xSparkPlayer.UserEmail + xSparkPlayer.DOT + xSparkPlayer.PinCode] = pinCode;
			updateQuery[xSparkPlayer.UserEmail + xSparkPlayer.DOT + xSparkPlayer.TsExpire] = tsExpire;

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
		this.userNumberPhone[xSparkPlayer.Value] = value;
		this.userNumberPhone[xSparkPlayer.IsConfirm] = isConfirm;

		let updateQuery: { [k: string]: any } = {};
		updateQuery[xSparkPlayer.UserNumberPhone + xSparkPlayer.DOT + xSparkPlayer.Value] = value;
		updateQuery[xSparkPlayer.UserNumberPhone + xSparkPlayer.DOT + xSparkPlayer.IsConfirm] = isConfirm;

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

	public setUserAddress() { }

	public getUserPassport() {
		return this.userPassport;
	}

	public setUserPassport() { }

	public getTsBirthday() { }

	public setTsBirthday() {
		return this.tsBirthday;
	}

	public getIPAddressCreate() {
		return this.ipAddressCreate;
	}

}
