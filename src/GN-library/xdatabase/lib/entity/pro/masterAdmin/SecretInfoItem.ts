import * as mongoDB from "mongodb";

import { MasterAdminMongoObject } from "./MasterAdminMongoObject";
import { SecretPermissionItem } from "./../../../../../../GN-common/entity/SecretInfo";

export class SecretInfoItem extends MasterAdminMongoObject {
    private static readonly _gameId: string = "gameId";
    private static readonly _secretKey: string = "secretKey";
    private static readonly _role: string = "role";
    private static readonly _remove: string = "remove";
    private static readonly _tsExpire: string = "tsExpire";
    private static readonly _permission: string = "permission";
    private static readonly _tsCreate: string = "tsCreate";
    private static readonly _description: string = "description";
    private static readonly _creatorId: string = "creatorId";

    private readonly gameId: string;
    private readonly secretKey: string;
    private readonly role: number;
    private readonly tsCreate: number;
    private readonly creatorId: string;

    private remove: boolean;
    private tsExpire: number;
    private description: string;
    private permission: SecretPermissionItem;

    constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
        super(result, collection);

        this.gameId = result[SecretInfoItem._gameId];
        this.secretKey = result[SecretInfoItem._secretKey];
        this.role = result[SecretInfoItem._role];
        this.tsCreate = result[SecretInfoItem._tsCreate];
        this.creatorId = result[SecretInfoItem._creatorId];

        this.setDocumentMasterSecretInfoItem(result);
    }

    private setDocumentMasterSecretInfoItem(result: mongoDB.WithId<mongoDB.Document>) {
        this.remove = result[SecretInfoItem._remove];
        this.tsExpire = result[SecretInfoItem._tsExpire];
        this.description = result[SecretInfoItem._description];
        this.permission = result[SecretInfoItem._permission];
    }

    public getGameId(): string {
        return this.gameId;
    }

    public getSecretKey(): string {
        return this.secretKey;
    }

    public getRole(): number {
        return this.role;
    }

    public getTsCreate(): number {
        return this.tsCreate;
    }

    public getCreatorId(): string {
        return this.creatorId;
    }

    public getRemove(): boolean {
        return this.remove;
    }

    public setRemove(isRemove: boolean): void {
        this.remove = isRemove;

        this.set(SecretInfoItem._remove, this.remove);
    }

    public getTsExpire(): number {
        return this.tsExpire;
    }

    public setTsExpire(tsExpire: number): void {
        this.tsExpire = tsExpire;

        this.set(SecretInfoItem._tsExpire, this.tsExpire);
    }

    public getDescription(): string {
        return this.description;
    }

    public setDescription(description: string): void {
        this.description = description;

        this.set(SecretInfoItem._description, this.description);
    }

    public getPermission(): SecretPermissionItem {
        return this.permission;
    }

    public setPermission(permission: SecretPermissionItem): void {
        this.permission = permission;

        this.set(SecretInfoItem._permission, this.permission);
    }
}
