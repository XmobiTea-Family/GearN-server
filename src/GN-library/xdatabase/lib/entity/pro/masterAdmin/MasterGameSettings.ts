import * as mongoDB from "mongodb";

import { MasterAdminMongoObject } from "./MasterAdminMongoObject";
import { xThirtPartySettings } from "./../../../../../xsettings/lib/entity/xThirtPartySettings";
import { xMasterPlayerSettings } from "./../../../../../xsettings/lib/entity/xMasterPlayerSettings";

export class MasterGameSettings extends MasterAdminMongoObject {
	private static readonly _thirtPartySettings: string = "thirtPartySettings";
	private static readonly _masterPlayerSettings: string = "masterPlayerSettings";

	private thirtPartySettings: xThirtPartySettings;
	private masterPlayerSettings: xMasterPlayerSettings;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.setDocumentMasterGameSettings(result);
	}

	private setDocumentMasterGameSettings(result: mongoDB.WithId<mongoDB.Document>) {
		this.thirtPartySettings = result[MasterGameSettings._thirtPartySettings];
		this.masterPlayerSettings = result[MasterGameSettings._masterPlayerSettings];
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
}
