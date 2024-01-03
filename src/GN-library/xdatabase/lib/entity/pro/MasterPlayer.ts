import * as mongoDB from "mongodb";

import { ExternalItem } from "./ExternalItem";
import { PlayerBase } from "./PlayerBase";
import { IPDetailItem } from "./IPDetailItem";
import { PushNotificationItem } from "./PushNotificationItem";

export class MasterPlayer extends PlayerBase {
	private static readonly _external: string = "external";
	private static readonly _userId: string = "userId";
	private static readonly _email: string = "email";
	private static readonly _lastIPDetail: string = "lastIPDetail";
	private static readonly _pushNotifications: string = "pushNotifications";

	private readonly userId: string;
	private external: ExternalItem;
	private email: string;
	private lastIPDetail: IPDetailItem;
	private pushNotifications: Array<PushNotificationItem>;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);
		this.userId = result[MasterPlayer._userId];

		this.setDocumentMasterPlayer(result);
	}

	private setDocumentMasterPlayer(result: mongoDB.WithId<mongoDB.Document>) {
		this.external = result[MasterPlayer._external];

		if (result[MasterPlayer._external] != null) {
			if (result[MasterPlayer._external]["genericService"] != null) {
				if (result[MasterPlayer._external]["genericService"]["genericServices"] != null) {
					this.external.genericService.genericServices = new Map(Object.entries(result[MasterPlayer._external]["genericService"]["genericServices"]));
				}
			}
		}

		this.email = result[MasterPlayer._email];
		this.lastIPDetail = result[MasterPlayer._lastIPDetail];
		this.pushNotifications = result[MasterPlayer._pushNotifications];
	}

	public getUserId(): string {
		return this.userId;
	}

	public getExternal(): ExternalItem {
		return this.external;
	}

	public setExternal(externalItem: ExternalItem): void {
		this.external = externalItem;

		this.set(MasterPlayer._external, this.external);
	}

	public getEmail(): string {
		return this.email;
	}

	public setEmail(email: string): void {
		this.email = email;

		this.set(MasterPlayer._email, this.email);
	}

	public getLastIPDetail(): IPDetailItem {
		return this.lastIPDetail;
	}

	public setLastIPDetail(ipDetail: IPDetailItem): void {
		this.lastIPDetail = ipDetail;

		this.set(MasterPlayer._lastIPDetail, this.lastIPDetail);
	}

	public getAllPushNotifications(): Array<PushNotificationItem> {
		return this.pushNotifications;
	}

	public hasPushNotification(pushId: string): boolean {
		return this.pushNotifications.find(x => x.pushId == pushId) != null;
	}

	public getPushNotification(pushId: string): PushNotificationItem {
		return this.pushNotifications.find(x => x.pushId == pushId);
	}

	public setPushNotification(pushId: string, value: PushNotificationItem): void {
		let pushNotificationItem = this.pushNotifications.find(x => x.pushId == pushId);
		if (pushNotificationItem == null) {
			pushNotificationItem = value;
			this.pushNotifications.push(pushNotificationItem);
		}
		else {
			pushNotificationItem.platformType = value.platformType;
			pushNotificationItem.token = value.token;
		}

		this.set(MasterPlayer._pushNotifications, this.pushNotifications);
	}

	public removePushNotification(pushId: string): void {
		let pushNotificationItem = this.pushNotifications.find(x => x.pushId == pushId);
		if (pushNotificationItem != null) {
			let indexOf = this.pushNotifications.indexOf(pushNotificationItem);
			if (indexOf != -1) {
				this.pushNotifications.splice(indexOf, 1);

				return this.set(MasterPlayer._pushNotifications, this.pushNotifications);
			}
		}

		throw Error("can not found the push id to remove");
	}

}
