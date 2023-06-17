import { IBuilder } from "./../../GN-library/xbuilder/lib/IBuilder";

export enum SecretRole {
    Admin,
    Server,
    Player,
}

interface SecretAuthenticatePermissionItem {
	selfEnable: boolean;
}

interface SecretMasterPlayerPermissionItem {
	selfEnable: boolean;
	otherSelfEnable: boolean;
	adminSelfEnable: boolean;
	serverSelfEnable: boolean;
}

export interface SecretPermissionItem {
	authenticate: {
		loginByAccount: SecretAuthenticatePermissionItem,
		loginByAndroidDeviceId: SecretAuthenticatePermissionItem,
		loginByApple: SecretAuthenticatePermissionItem,
		loginByCustomDeviceId: SecretAuthenticatePermissionItem,
		loginByCustomId: SecretAuthenticatePermissionItem,
		loginByEditorDeviceId: SecretAuthenticatePermissionItem,
		loginByFacebook: SecretAuthenticatePermissionItem,
		loginByGenericService: SecretAuthenticatePermissionItem,
		loginByGoogle: SecretAuthenticatePermissionItem,
		loginByiOSDeviceId: SecretAuthenticatePermissionItem,
		loginByLinuxDeviceId: SecretAuthenticatePermissionItem,
		loginByMacOSDeviceId: SecretAuthenticatePermissionItem,
		loginByWindowsDeviceId: SecretAuthenticatePermissionItem,
		loginByWindowsPhoneDeviceId: SecretAuthenticatePermissionItem,
		registerAccount: SecretAuthenticatePermissionItem,

	},
	masterPlayer: {
		linkAccount: SecretMasterPlayerPermissionItem,
		linkAndroidDeviceId: SecretMasterPlayerPermissionItem,
		linkApple: SecretMasterPlayerPermissionItem,
		linkCustomDeviceId: SecretMasterPlayerPermissionItem,
		linkCustomId: SecretMasterPlayerPermissionItem,
		linkEditorDeviceId: SecretMasterPlayerPermissionItem,
		linkFacebook: SecretMasterPlayerPermissionItem,
		linkGenericService: SecretMasterPlayerPermissionItem,
		linkGoogle: SecretMasterPlayerPermissionItem,
		linkiOSDeviceId: SecretMasterPlayerPermissionItem,
		linkLinuxDeviceId: SecretMasterPlayerPermissionItem,
		linkMacOSDeviceId: SecretMasterPlayerPermissionItem,
		linkWindowsDeviceId: SecretMasterPlayerPermissionItem,
		linkWindowsPhoneDeviceId: SecretMasterPlayerPermissionItem,

		unlinkAccount: SecretMasterPlayerPermissionItem,
		unlinkAndroidDeviceId: SecretMasterPlayerPermissionItem,
		unlinkApple: SecretMasterPlayerPermissionItem,
		unlinkCustomDeviceId: SecretMasterPlayerPermissionItem,
		unlinkCustomId: SecretMasterPlayerPermissionItem,
		unlinkEditorDeviceId: SecretMasterPlayerPermissionItem,
		unlinkFacebook: SecretMasterPlayerPermissionItem,
		unlinkGenericService: SecretMasterPlayerPermissionItem,
		unlinkGoogle: SecretMasterPlayerPermissionItem,
		unlinkiOSDeviceId: SecretMasterPlayerPermissionItem,
		unlinkLinuxDeviceId: SecretMasterPlayerPermissionItem,
		unlinkMacOSDeviceId: SecretMasterPlayerPermissionItem,
		unlinkWindowsDeviceId: SecretMasterPlayerPermissionItem,
		unlinkWindowsPhoneDeviceId: SecretMasterPlayerPermissionItem,

		addSegment: SecretMasterPlayerPermissionItem,
		removeSegment: SecretMasterPlayerPermissionItem,
		getSegment: SecretMasterPlayerPermissionItem,

		setTag: SecretMasterPlayerPermissionItem,
		getTag: SecretMasterPlayerPermissionItem,

		getDisplayName: SecretMasterPlayerPermissionItem,
		setDisplayName: SecretMasterPlayerPermissionItem,

		getTsCreate: SecretMasterPlayerPermissionItem,
		getIpAddressCreate: SecretMasterPlayerPermissionItem,
		getTsLastLogin: SecretMasterPlayerPermissionItem,

		setPlayerBan: SecretMasterPlayerPermissionItem,
		getPlayerBan: SecretMasterPlayerPermissionItem,

		setCountryCode: SecretMasterPlayerPermissionItem,
		getCountryCode: SecretMasterPlayerPermissionItem,

		changeAccountPassword: SecretMasterPlayerPermissionItem,
		resetAccountPassword: SecretMasterPlayerPermissionItem,

		setAvatar: SecretMasterPlayerPermissionItem,
		getAvatar: SecretMasterPlayerPermissionItem,

		setPlayerCurrency: SecretMasterPlayerPermissionItem,
		getPlayerCurrency: SecretMasterPlayerPermissionItem,
		
		setPlayerStatistics: SecretMasterPlayerPermissionItem,
		getPlayerStatistics: SecretMasterPlayerPermissionItem,

		getStatisticsLeaderboard: SecretMasterPlayerPermissionItem,
		getStatisticsLeaderboardAroundPlayer: SecretMasterPlayerPermissionItem,

		getScriptData: SecretMasterPlayerPermissionItem,
		setScriptData: SecretMasterPlayerPermissionItem,

		setPrivateData: SecretMasterPlayerPermissionItem,
		getPrivateData: SecretMasterPlayerPermissionItem,

		setPlayerData: SecretMasterPlayerPermissionItem,
		getPlayerData: SecretMasterPlayerPermissionItem,

		getPlayerInformation: SecretMasterPlayerPermissionItem,

		getPlayersWithApple: SecretMasterPlayerPermissionItem,
		getPlayersWithFacebook: SecretMasterPlayerPermissionItem,
		getPlayersWithGoogle: SecretMasterPlayerPermissionItem,
		getPlayersWithGenericService: SecretMasterPlayerPermissionItem,
		getPlayersWithSegment: SecretMasterPlayerPermissionItem,
		getPlayersWithTag: SecretMasterPlayerPermissionItem,
		getExternal: SecretMasterPlayerPermissionItem,
	}
}

abstract class BuilderBase {
	protected secretKey: string;
    protected role: number;
	protected remove: boolean;
	protected tsExpire: number;
	protected permission: SecretPermissionItem;

	public getSecretKey(): string {
		return this.secretKey;
	}

	public getPermission(): SecretPermissionItem {
		return this.permission;
	}

	public getRole(): number {
		return this.role;
	}

	public isRemove(): boolean {
		return this.remove;
	}

	public getTsExpire(): number {
		return this.tsExpire;
	}

	public setSecretKey(secretKey: string): Builder {
		return this as Builder;
	}

	public setPermission(permission: SecretPermissionItem): Builder {
		return this as Builder;
	}

	public setRole(role: number): Builder {
		return this as Builder;
	}

	public setIsRemove(remove: boolean): Builder {
		this.remove = remove;
		return this as Builder;
	}

	public setTsExpire(tsExpire: number): Builder {
		//this.tsExpire = tsExpire;
		return this as Builder;
	}

	public build(): SecretInfo {
		return null;
	}

	constructor() {

	}

}

class Builder extends BuilderBase implements IBuilder<SecretInfo> {
	public setSecretKey(secretKey: string): Builder {
        this.secretKey = secretKey;
		return this;
	}

	public setRole(role: number): Builder {
		this.role = role;
		return this;
	}

	public setTsExpire(tsExpire: number): Builder {
		this.tsExpire = tsExpire;
		return this;
	}

	public setPermission(permission: SecretPermissionItem): Builder {
		this.permission = permission;
		return this;
	}

	public build(): SecretInfo {
		return new SecretInfo(this);
	}

	constructor() {
		super();
	}

}

export class SecretInfo extends BuilderBase {
	constructor(builder: Builder) {
		super();

		this.secretKey = builder.getSecretKey();
		this.role = builder.getRole();
		this.remove = builder.isRemove();
		this.tsExpire = builder.getTsExpire();
		this.permission = builder.getPermission();
	}

	public toDocumentData() {
		return {
			"secretKey": this.secretKey,
			"role": this.role,
			"isRemove": this.remove,
			"tsExpire": this.tsExpire,
			"permission": this.permission,
		}
	}

	public static Builder(): Builder {
		return new Builder();
	}

}
