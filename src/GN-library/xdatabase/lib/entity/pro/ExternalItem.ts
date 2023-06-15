interface ExternalDeviceItem {
	customDeviceId?: string;
	androidDeviceId?: string;
	iOSDeviceId?: string;
	windowsPhoneDeviceId?: string;
	windowsDeviceId?: string;
	linuxDeviceId?: string;
	macOSDeviceId?: string;
	editorDeviceId?: string;
}

interface ExternalAccountItem {
	username: string;
	password: string;
}

interface ExternalCustomItem {
	customId: string;
}

interface ExternalAppleItem {
	appleId: string;
}

interface ExternalGoogleItem {
	googleId: string;
}

interface ExternalFacebookItem {
	facebookId: string;
}

interface GenericServiceIdItem {
	userId: string;
}

interface ExternalGenericServiceItem {
	genericServices: Map<string, GenericServiceIdItem>;
}

export interface ExternalItem {
	device?: ExternalDeviceItem;
	account?: ExternalAccountItem;
	custom?: ExternalCustomItem;
	apple?: ExternalAppleItem;
	google?: ExternalGoogleItem;
	facebook?: ExternalFacebookItem;
	genericService?: ExternalGenericServiceItem;
}
