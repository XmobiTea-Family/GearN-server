import * as mongoDB from "mongodb";

import { DataObjectBase } from "./DataObjectBase";
import { MemberItem } from "./MemberItem";
import { DataItem } from "./DataItem";
import { CurrencyItem } from "./CurrencyItem";
import { StatisticsItem } from "./StatisticsItem";
import { InventoryItem } from "./InventoryItem";
import { RemoveStatusItem } from "./RemoveStatusItem";
import { DataValueType } from "./type/DataValueType";

export class Group extends DataObjectBase {
	private static readonly _groupId: string = "groupId";

	private static readonly _maxMembers: string = "maxMembers";
	private static readonly _groupCatalogId: string = "groupCatalogId";
	private static readonly _members: string = "members";

	private static readonly _groupDatas: string = "groupDatas";
	private static readonly _groupCurrencies: string = "groupCurrencies";
	private static readonly _groupStatistics: string = "groupStatistics";
	private static readonly _groupInventories: string = "groupInventories";

	private static readonly _removeStatus: string = "removeStatus";

	private readonly groupId: string;
	private groupCatalogId: string;
	private maxMembers: number;
	private members: Array<MemberItem>;

	private groupCurrencies: Map<string, CurrencyItem>;
	private groupStatistics: Map<string, StatisticsItem>;
	private groupDatas: Array<DataItem>;
	private groupInventories: Array<InventoryItem>;

	private removeStatus: RemoveStatusItem;

	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);
		this.groupId = result[Group._groupId];

		this.setDocumentGroup(result);
	}

	private setDocumentGroup(result: mongoDB.WithId<mongoDB.Document>) {
		this.maxMembers = result[Group._maxMembers];
		this.groupCatalogId = result[Group._groupCatalogId];
		this.members = result[Group._members];
		this.groupDatas = result[Group._groupDatas];
		this.groupCurrencies = result[Group._groupCurrencies];
		this.groupStatistics = result[Group._groupStatistics];
		this.groupInventories = result[Group._groupInventories];
		this.removeStatus = result[Group._removeStatus];
	}

	public getGroupId(): string {
		return this.groupId;
	}

	public getGroupCatalogId(): string {
		return this.groupCatalogId;
	}

	public setGroupCatalogId(groupCatalogId: string): void {
		this.groupCatalogId = groupCatalogId;

		this.set(Group._groupCatalogId, this.groupCatalogId);
	}

	public getMaxMembers(): number {
		return this.maxMembers;
	}

	public setMaxMembers(maxMembers: number): void {
		this.maxMembers = maxMembers;

		this.set(Group._maxMembers, this.maxMembers);
	}

	public getAllMembers(): Array<MemberItem> {
		return this.members;
	}

	public hasMember(memberId: string): boolean {
		return this.getMember(memberId) != null;
	}

	public getMember(memberId: string): MemberItem {
		return this.members.find(x => x.memberId == memberId);
	}

	public setMember(memberId: string, memberType: number, role: number, status: number): void {
		let memberItem = this.members.find(x => x.memberId == memberId);
		if (memberItem == null) {
			memberItem = {
				memberId: memberId,
				memberType: memberType,
				role: role,
				status: status,
			}

			this.members.push(memberItem);
		}
		else {
			memberItem.memberType = memberType;
			memberItem.role = role;
			memberItem.status = status;
		}
		
		this.set(Group._members, this.members);
	}

	public removeMember(memberId: string): void {
		let memberItem = this.members.find(x => x.memberId == memberId);
		if (memberItem != null) {
			let indexOf = this.members.indexOf(memberItem);
			if (indexOf != -1) {
				this.members.splice(indexOf, 1);
		
				return this.set(Group._members, this.members);
			}
		}

		throw Error("can not found the member id to remove");
	}

	public getAllGroupCurrencies(): Map<string, CurrencyItem> {
        return this.groupCurrencies;
    }

    public hasGroupCurrency(key: string): boolean {
		return this.groupCurrencies.has(key);
	}

    public getGroupCurrency(key: string): CurrencyItem {
		return this.groupCurrencies.get(key);
	}

    public setGroupCurrency(key: string, value: number): void {
		this.groupCurrencies.set(key, {
			value: value
		});
		
		this.set(Group._groupCurrencies + DataObjectBase.DOT + key, {
			value: value
		});
	}

    public removeGroupCurrency(key: string): void {
		if (this.groupCurrencies.has(key)) {
			this.groupCurrencies.delete(key);

			return this.unset(Group._groupCurrencies + DataObjectBase.DOT + key);
		}

		throw Error("can not found the key to remove");
    }

    public getAllGroupDatas(): Array<DataItem> {
        return this.groupDatas;
    }

    public hasGroupData(key: string): boolean {
		return this.getGroupData(key) != null;
	}

    public getGroupData(key: string): DataItem {
		return this.groupDatas.find(x => x.key == key);
	}

    public setGroupData(key: string, value: DataValueType, permission: number): void {
        let groupDataItem = this.groupDatas.find(x => x.key == key);
		if (groupDataItem == null) {
			groupDataItem = {
				key: key,
				value: value,
				permission: permission,
			}

			this.groupDatas.push(groupDataItem);
		}
		else {
			groupDataItem.value = value;
			groupDataItem.permission = permission;
		}

		this.set(Group._groupDatas, this.groupDatas);
	}

    public removeItemData(key: string): void {
        let groupDataItem = this.groupDatas.find(x => x.key == key);
		if (groupDataItem != null) {
			let indexOf = this.groupDatas.indexOf(groupDataItem);
			if (indexOf != -1) {
				this.groupDatas.splice(indexOf, 1);
		
				return this.set(Group._groupDatas, this.groupDatas);
			}
		}

		throw Error("can not found the key to remove");
    }

	public getAllGroupStatistics(): Map<string, StatisticsItem> {
        return this.groupStatistics;
    }

    public hasGroupStatistics(key: string): boolean {
		return this.groupStatistics.has(key);
	}

    public getGroupStatistics(key: string): StatisticsItem {
		return this.groupStatistics.get(key);
	}

    public setGroupStatistics(key: string, value: number, tsLastUpdate: number): void {
		this.groupStatistics.set(key, {
			tsLastUpdate: tsLastUpdate,
			value: value
		});
		
		this.set(Group._groupStatistics + DataObjectBase.DOT + key, {
			tsLastUpdate: tsLastUpdate,
			value: value
		});
	}

    public removeGroupStatistics(key: string): void {
		if (this.groupStatistics.has(key)) {
			this.groupStatistics.delete(key);

			return this.unset(Group._groupStatistics + DataObjectBase.DOT + key);
		}

		throw Error("can not found the key to remove");
    }

	public getAllGroupInventories(): Array<InventoryItem> {
        return this.groupInventories;
    }

    public getGroupInventory(itemId: string): InventoryItem {
		return this.groupInventories.find(x => x.itemId == itemId);
	}

    public setGroupInventory(itemId: string, itemCatalogId: string): void {
        let groupInventoryItem = this.groupInventories.find(x => x.itemId == itemId);
		if (groupInventoryItem == null) {
			groupInventoryItem = {
				itemId: itemId,
				itemCatalogId: itemCatalogId,
			}

			this.groupInventories.push(groupInventoryItem);
		}
		else {
			groupInventoryItem.itemCatalogId = itemCatalogId;
		}
		
		this.set(Group._groupInventories, this.groupInventories);
	}

    public removeGroupInventory(itemId: string): void {
        let groupInventoryItem = this.groupInventories.find(x => x.itemId == itemId);
		if (groupInventoryItem != null) {
			let indexOf = this.groupInventories.indexOf(groupInventoryItem);
			if (indexOf != -1) {
				this.groupInventories.splice(indexOf, 1);
		
				return this.set(Group._groupInventories, this.groupInventories);
			}
		}

		throw Error("can not found the itemId to remove");
    }

	public getRemoveStatus(): RemoveStatusItem {
		return this.removeStatus;
	}

	public setRemoveStatus(tsRemove: number, reason?: string): void {
		this.removeStatus = {
			tsRemove: tsRemove,
			reason: reason,
		};

		this.set(Group._removeStatus, this.removeStatus);
	}
}
