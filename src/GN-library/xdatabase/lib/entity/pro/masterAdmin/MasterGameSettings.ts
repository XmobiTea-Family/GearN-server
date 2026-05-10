import * as mongodb from "mongodb";

import { MasterAdminMongoObject } from "./MasterAdminMongoObject";
import { xThirtPartySettings } from "./../../../../../xsettings/lib/entity/xThirtPartySettings";
import { xMasterPlayerSettings } from "./../../../../../xsettings/lib/entity/xMasterPlayerSettings";
import { xEmailSettings } from "./../../../../../xsettings/lib/entity/xEmailSettings";
import { xPushNotificationSettings } from "./../../../../../xsettings/lib/entity/xPushNotificationSettings";

/**
 * Global master-admin configuration applied across the whole system (not tied to a single game).
 * Includes third-party integrations, master player rules, email delivery, and push notification configuration.
 */
export class MasterGameSettings extends MasterAdminMongoObject {
    /** MongoDB field name for the third-party integration configuration (Google, Facebook, Apple...). */
    private static readonly _thirtPartySettings: string = "thirtPartySettings";
    /** MongoDB field name for the MasterPlayer configuration (signup rules, password policy...). */
    private static readonly _masterPlayerSettings: string = "masterPlayerSettings";
    /** MongoDB field name for the email-delivery configuration (SMTP, sender, templates). */
    private static readonly _emailSettings: string = "emailSettings";
    /** MongoDB field name for the push-notification configuration (FCM key, APNs cert). */
    private static readonly _pushNotificationSettings: string = "pushNotificationSettings";

    /** Configuration for system-wide external identity providers. */
    private thirtPartySettings: xThirtPartySettings;
    /** Configuration applied to MasterPlayer (signup, login, password policy). */
    private masterPlayerSettings: xMasterPlayerSettings;
    /** Email server configuration (SMTP, sender info) used by every system email. */
    private emailSettings: xEmailSettings;
    /** Push notification configuration (FCM/APNs credentials, default sender, retry policy...). */
    private pushNotificationSettings: xPushNotificationSettings;

    /**
     * Initializes a new master game settings instance.
     * @param result Provides the result value used by this operation.
     * @param collection Provides the collection value used by this operation.
     */
    constructor(result: mongodb.WithId<mongodb.Document>, collection: mongodb.Collection<mongodb.Document>) {
        super(result, collection);

        this.setDocumentMasterGameSettings(result);
    }

    /**
     * Sets the document master game settings.
     * @param result Provides the result value used by this operation.
     */
    private setDocumentMasterGameSettings(result: mongodb.WithId<mongodb.Document>) {
        this.thirtPartySettings = result[MasterGameSettings._thirtPartySettings];
        this.masterPlayerSettings = result[MasterGameSettings._masterPlayerSettings];
        this.emailSettings = result[MasterGameSettings._emailSettings];
        this.pushNotificationSettings = result[MasterGameSettings._pushNotificationSettings];
    }

    /**
     * Returns the thirt party settings.
     * @returns Returns the thirt party settings.
     */
    public getThirtPartySettings(): xThirtPartySettings {
        return this.thirtPartySettings;
    }

    /**
     * Sets the thirt party settings.
     * @param thirtPartySettings Provides the thirt party settings value used by this operation.
     */
    public setThirtPartySettings(thirtPartySettings: xThirtPartySettings) {
        this.thirtPartySettings = thirtPartySettings;

        this.set(MasterGameSettings._thirtPartySettings, this.thirtPartySettings);
    }

    /**
     * Returns the master player settings.
     * @returns Returns the master player settings.
     */
    public getMasterPlayerSettings(): xMasterPlayerSettings {
        return this.masterPlayerSettings;
    }

    /**
     * Sets the master player settings.
     * @param masterPlayerSettings Provides the master player settings value used by this operation.
     */
    public setMasterPlayerSettings(masterPlayerSettings: xMasterPlayerSettings) {
        this.masterPlayerSettings = masterPlayerSettings;

        this.set(MasterGameSettings._masterPlayerSettings, this.masterPlayerSettings);
    }

    /**
     * Returns the email settings.
     * @returns Returns the email settings.
     */
    public getEmailSettings(): xEmailSettings {
        return this.emailSettings;
    }

    /**
     * Sets the email settings.
     * @param emailSettings Provides the email settings value used by this operation.
     */
    public setEmailSettings(emailSettings: xEmailSettings) {
        this.emailSettings = emailSettings;

        this.set(MasterGameSettings._emailSettings, this.emailSettings);
    }

    /**
     * Returns the push notification settings.
     * @returns Returns the push notification settings.
     */
    public getPushNotificationSettings(): xPushNotificationSettings {
        return this.pushNotificationSettings;
    }

    /**
     * Sets the push notification settings.
     * @param pushNotificationSettings Provides the push notification settings value used by this operation.
     */
    public setPushNotificationSettings(pushNotificationSettings: xPushNotificationSettings) {
        this.pushNotificationSettings = pushNotificationSettings;

        this.set(MasterGameSettings._pushNotificationSettings, this.pushNotificationSettings);
    }
}
