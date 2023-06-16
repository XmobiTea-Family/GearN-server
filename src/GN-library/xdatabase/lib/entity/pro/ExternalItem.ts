export interface ExternalItem {
	device?: {
		customDeviceId?: string;
		androidDeviceId?: string;
		iOSDeviceId?: string;
		windowsPhoneDeviceId?: string;
		windowsDeviceId?: string;
		linuxDeviceId?: string;
		macOSDeviceId?: string;
		editorDeviceId?: string;
	};
	account?: {
		username: string;
		password: string;
	};
	custom?: {
		customId: string;
	}
	apple?: {
		appleId: string;
	};
	google?: {
		googleId: string;
	};
	facebook?: {
		facebookId: string;
	};
	genericService?: {
		genericServices: Map<string, {
			serviceId: string
		}>;
	};
}
