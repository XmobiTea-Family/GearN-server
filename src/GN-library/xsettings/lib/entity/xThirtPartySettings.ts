export interface xThirtPartySettings {
	googleSettings?: {
		googleClientId: string;
		packageId: string;
		publicRSAKey: string;
	};
	appleSettings?: {
		appleClientId: string;
		sandboxEnable: boolean;
		issuerId: string;
		keyId: string;
		p8Content: string;
	};
	facebookSettings?: {
		facebookAppId: string;
		packageId: string;
		facebookInappSecret: string;
		facebookAppToken: string;
	},
	googlePlayGameSettings?: {
		applicationId: string,
		clientId: string,
		clientSecret: string,
		redirectUri: string,
	},
	gameCenterSettings?: {
		packageId: string,
	},
}
