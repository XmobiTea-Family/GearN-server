import * as mongoDB from "mongodb";

import { MasterAdminMongoObject } from "./MasterAdminMongoObject";
import { xThirtPartySettings } from "./../../../../../xsettings/lib/entity/xThirtPartySettings";
import { xMasterPlayerSettings } from "./../../../../../xsettings/lib/entity/xMasterPlayerSettings";
import { xEmailSettings } from "./../../../../../xsettings/lib/entity/xEmailSettings";
import { xPushNotificationSettings } from "./../../../../../xsettings/lib/entity/xPushNotificationSettings";

export class MasterGameSettings extends MasterAdminMongoObject {
	private static readonly _thirtPartySettings: string = "thirtPartySettings";
	private static readonly _masterPlayerSettings: string = "masterPlayerSettings";
	private static readonly _emailSettings: string = "emailSettings";
	private static readonly _pushNotificationSettings: string = "pushNotificationSettings";

	private thirtPartySettings: xThirtPartySettings;
	private masterPlayerSettings: xMasterPlayerSettings;
	private emailSettings: xEmailSettings;
	private pushNotificationSettings: xPushNotificationSettings;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.setDocumentMasterGameSettings(result);
	}

	private setDocumentMasterGameSettings(result: mongoDB.WithId<mongoDB.Document>) {
		this.thirtPartySettings = result[MasterGameSettings._thirtPartySettings];
		this.masterPlayerSettings = result[MasterGameSettings._masterPlayerSettings];
		this.emailSettings = result[MasterGameSettings._emailSettings];
		this.pushNotificationSettings = result[MasterGameSettings._pushNotificationSettings];
	}

	public getThirtPartySettings(): xThirtPartySettings {
		return this.thirtPartySettings;
	}

	public setThirtPartySettings(thirtPartySettings: xThirtPartySettings) {
		this.thirtPartySettings = thirtPartySettings;

		this.set(MasterGameSettings._thirtPartySettings, this.thirtPartySettings);
	}

	public getMasterPlayerSettings(): xMasterPlayerSettings {
		return this.masterPlayerSettings;
	}

	public setMasterPlayerSettings(masterPlayerSettings: xMasterPlayerSettings) {
		this.masterPlayerSettings = masterPlayerSettings;

		this.set(MasterGameSettings._masterPlayerSettings, this.masterPlayerSettings);
	}

	public getEmailSettings(): xEmailSettings {
		return this.emailSettings;
	}

	public setEmailSettings(emailSettings: xEmailSettings) {
		this.emailSettings = emailSettings;

		this.set(MasterGameSettings._emailSettings, this.emailSettings);
	}

	public getPushNotificationSettings(): xPushNotificationSettings {
		return this.pushNotificationSettings;
	}

	public setPushNotificationSettings(pushNotificationSettings: xPushNotificationSettings) {
		this.pushNotificationSettings = pushNotificationSettings;

		this.set(MasterGameSettings._pushNotificationSettings, this.pushNotificationSettings);
	}

}
