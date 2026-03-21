export interface ExternalItem {
	// Stores the device value used by this contract.
	device?: {
		// Stores the custom device ID value used by this contract.
		customDeviceId?: string;
		// Stores the android device ID value used by this contract.
		androidDeviceId?: string;
		// Stores the i OS device ID value used by this contract.
		iOSDeviceId?: string;
		// Stores the windows phone device ID value used by this contract.
		windowsPhoneDeviceId?: string;
		// Stores the windows device ID value used by this contract.
		windowsDeviceId?: string;
		// Stores the linux device ID value used by this contract.
		linuxDeviceId?: string;
		// Stores the mac OS device ID value used by this contract.
		macOSDeviceId?: string;
		// Stores the editor device ID value used by this contract.
		editorDeviceId?: string;
	};
	// Stores the account value used by this contract.
	account?: {
		// Indicates whether rname should be used.
		username: string;
		// Stores the password value used by this contract.
		password: string;
	};
	// Stores the custom value used by this contract.
	custom?: {
		// Stores the custom ID value used by this contract.
		customId: string;
	}
	// Stores the apple value used by this contract.
	apple?: {
		// Stores the apple ID value used by this contract.
		appleId: string;
		// Stores the email value used by this contract.
		email: string;
	};
	// Stores the google value used by this contract.
	google?: {
		// Stores the google ID value used by this contract.
		googleId: string;
		// Stores the display name value used by this contract.
		displayName: string;
		// Stores the email value used by this contract.
		email: string;
	};
	// Stores the facebook value used by this contract.
	facebook?: {
		// Stores the facebook ID value used by this contract.
		facebookId: string;
		// Stores the display name value used by this contract.
		displayName: string;
		// Stores the email value used by this contract.
		email: string;
	};
	// Stores the generic service value used by this contract.
	genericService?: {
		// Stores the generic services collection used by this contract.
		genericServices: Map<string, {
			// Stores the service ID value used by this contract.
			serviceId: string
		}>;
	};
	// Stores the google play game service value used by this contract.
	googlePlayGameService?: {
		// Stores the player ID value used by this contract.
		playerId: string,
		// Stores the email value used by this contract.
		email: string,
		// Stores the display name value used by this contract.
		displayName: string,
	};
	// Stores the game center value used by this contract.
	gameCenter?: {
		// Stores the player ID value used by this contract.
		playerId: string,
		// Stores the email value used by this contract.
		email: string,
		// Stores the display name value used by this contract.
		displayName: string,
	};
}
