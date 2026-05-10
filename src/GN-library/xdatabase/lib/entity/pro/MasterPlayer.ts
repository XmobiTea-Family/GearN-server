import * as mongodb from "mongodb";

import { ExternalItem } from "./ExternalItem";
import { PlayerBase } from "./PlayerBase";
import { IPDetailItem } from "./IPDetailItem";
import { PushNotificationItem } from "./PushNotificationItem";

/**
 * System-wide player (master account) that exists independently of any specific game.
 * Holds authentication info (external providers), contact email, the most recent login IP, and registered push-notification devices.
 */
export class MasterPlayer extends PlayerBase {
    /** MongoDB field name for the linked authentication sources (device, account, social). */
    private static readonly _external: string = "external";
    /** MongoDB field name for the master userId — the system-wide player identifier. */
    private static readonly _userId: string = "userId";
    /** MongoDB field name for the primary contact email. */
    private static readonly _email: string = "email";
    /** MongoDB field name for the IP/region details of the most recent login. */
    private static readonly _lastIPDetail: string = "lastIPDetail";
    /** MongoDB field name for the list of push-notification device registrations. */
    private static readonly _pushNotifications: string = "pushNotifications";

    /** Master id of the player; used as the foreign key by every GamePlayer that belongs to the same user. */
    private readonly userId: string;
    /** Set of authentication methods the player has linked (device id, account, Google, Facebook, Apple...). */
    private external: ExternalItem;
    /** Player's contact email; used for password recovery and notifications. */
    private email: string;
    /** IP and geographical region of the most recent login; refreshed on every login. */
    private lastIPDetail: IPDetailItem;
    /** Devices (token + platform) registered to receive push notifications for the player. */
    private pushNotifications: Array<PushNotificationItem>;

    /**
     * Initializes a new master player instance.
     * @param result Provides the result value used by this operation.
     * @param collection Provides the collection value used by this operation.
     */
    constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
        super(result, collection);
        this.userId = result[MasterPlayer._userId];

        this.setDocumentMasterPlayer(result);
    }

    /**
     * Sets the document master player.
     * @param result Provides the result value used by this operation.
     */
    private setDocumentMasterPlayer(result: mongodb.WithId<mongodb.Document>) {
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

    /**
     * Returns whether r ID should be used.
     * @returns Returns whether r ID should be used.
     */
    public getUserId(): string {
        return this.userId;
    }

    /**
     * Returns the password.
     * @returns Returns the password.
     */
    public getPassword(): string {
        return this.external.account.password;
    }

    /**
     * Returns the external.
     * @returns Returns the external.
     */
    public getExternal(): ExternalItem {
        return this.external;
    }

    /**
     * Sets the external.
     * @param externalItem Provides the external item value used by this operation.
     */
    public setExternal(externalItem: ExternalItem): void {
        this.external = externalItem;

        this.set(MasterPlayer._external, this.external);
    }

    /**
     * Returns the email.
     * @returns Returns the email.
     */
    public getEmail(): string {
        return this.email;
    }

    /**
     * Sets the email.
     * @param email Provides the email value used by this operation.
     */
    public setEmail(email: string): void {
        this.email = email;

        this.set(MasterPlayer._email, this.email);
    }

    /**
     * Returns the last IP detail.
     * @returns Returns the last IP detail.
     */
    public getLastIPDetail(): IPDetailItem {
        return this.lastIPDetail;
    }

    /**
     * Sets the last IP detail.
     * @param ipDetail Provides the IP detail value used by this operation.
     */
    public setLastIPDetail(ipDetail: IPDetailItem): void {
        this.lastIPDetail = ipDetail;

        this.set(MasterPlayer._lastIPDetail, this.lastIPDetail);
    }

    /**
     * Returns all push notifications.
     * @returns Returns all push notifications.
     */
    public getAllPushNotifications(): Array<PushNotificationItem> {
        return this.pushNotifications;
    }

    /**
     * Checks whether push notification exists.
     * @param pushId Provides the push ID value used by this operation.
     * @returns Returns the operation result.
     */
    public hasPushNotification(pushId: string): boolean {
        return this.pushNotifications.find((x) => x.pushId == pushId) != null;
    }

    /**
     * Returns the push notification.
     * @param pushId Provides the push ID value used by this operation.
     * @returns Returns the push notification.
     */
    public getPushNotification(pushId: string): PushNotificationItem {
        return this.pushNotifications.find((x) => x.pushId == pushId);
    }

    /**
     * Sets the push notification.
     * @param pushId Provides the push ID value used by this operation.
     * @param value Provides the value value used by this operation.
     */
    public setPushNotification(pushId: string, value: PushNotificationItem): void {
        // Stores the push notification item value used in the current execution flow.
        let pushNotificationItem = this.pushNotifications.find((x) => x.pushId == pushId);
        if (pushNotificationItem == null) {
            pushNotificationItem = value;
            this.pushNotifications.push(pushNotificationItem);
        } else {
            pushNotificationItem.platformType = value.platformType;
            pushNotificationItem.token = value.token;
        }

        this.set(MasterPlayer._pushNotifications, this.pushNotifications);
    }

    /**
     * Removes the push notification.
     * @param pushId Provides the push ID value used by this operation.
     */
    public removePushNotification(pushId: string): void {
        // Stores the push notification item value used in the current execution flow.
        let pushNotificationItem = this.pushNotifications.find((x) => x.pushId == pushId);
        if (pushNotificationItem != null) {
            // Stores the index of value used in the current execution flow.
            let indexOf = this.pushNotifications.indexOf(pushNotificationItem);
            if (indexOf != -1) {
                this.pushNotifications.splice(indexOf, 1);

                return this.set(MasterPlayer._pushNotifications, this.pushNotifications);
            }
        }

        throw Error("can not found the push id to remove");
    }
}
