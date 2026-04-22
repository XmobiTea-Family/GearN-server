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
	// Defines the internal field key for group ID.
	private static readonly _groupId: string = "groupId";
	// Defines the internal field key for group type.
	private static readonly _groupType: string = "groupType";

	// Defines the internal field key for catalog ID.
	private static readonly _catalogId: string = "catalogId";
	// Defines the internal field key for members.
	private static readonly _members: string = "members";

	// Defines the internal field key for group datas.
	private static readonly _groupDatas: string = "groupDatas";
	// Defines the internal field key for group currencies.
	private static readonly _groupCurrencies: string = "groupCurrencies";
	// Defines the internal field key for group statistics.
	private static readonly _groupStatistics: string = "groupStatistics";
	// Defines the internal field key for group inventories.
	private static readonly _groupInventories: string = "groupInventories";

	// Defines the internal field key for remove status.
	private static readonly _removeStatus: string = "removeStatus";

	// Stores the group ID value used by this instance.
	private readonly groupId: string;
	// Stores the group type value used by this instance.
	private readonly groupType: number;
	// Stores the catalog ID value used by this instance.
	private readonly catalogId: string;

	// Stores the members value used by this instance.
	private members: Array<MemberItem>;

	// Stores the group currencies collection used by this instance.
	private groupCurrencies: Map<string, CurrencyItem>;
	// Stores the group statistics collection used by this instance.
	private groupStatistics: Map<string, StatisticsItem>;
	// Stores the group datas value used by this instance.
	private groupDatas: Array<DataItem>;
	// Stores the group inventories value used by this instance.
	private groupInventories: Array<InventoryItem>;

	// Stores the remove status value used by this instance.
	private removeStatus: RemoveStatusItem;

	/**
	 * Initializes a new group instance.
	 * @param result Provides the result value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 */
	constructor(result: mongoDB.WithId<mongoDB.Document>, collection: mongoDB.Collection<mongoDB.Document>) {
		super(result, collection);

		this.groupId = result[Group._groupId];
		this.groupType = result[Group._groupType];
		this.catalogId = result[Group._catalogId];

		this.setDocumentGroup(result);
	}

	/**
	 * Sets the document group.
	 * @param result Provides the result value used by this operation.
	 */
	private setDocumentGroup(result: mongoDB.WithId<mongoDB.Document>) {
		this.members = result[Group._members];
		this.groupDatas = result[Group._groupDatas];
		this.groupCurrencies = result[Group._groupCurrencies] != null ? new Map(Object.entries(result[Group._groupCurrencies])) : null;
		this.groupStatistics = result[Group._groupStatistics] != null ? new Map(Object.entries(result[Group._groupStatistics])) : null;
		this.groupInventories = result[Group._groupInventories];
		this.removeStatus = result[Group._removeStatus];
	}

	/**
	 * Returns the group ID.
	 * @returns Returns the group ID.
	 */
	public getGroupId(): string {
		return this.groupId;
	}

	/**
	 * Returns the group type.
	 * @returns Returns the group type.
	 */
	public getGroupType(): number {
		return this.groupType;
	}

	/**
	 * Returns the catalog ID.
	 * @returns Returns the catalog ID.
	 */
	public getCatalogId(): string {
		return this.catalogId;
	}

	/**
	 * Returns all members.
	 * @returns Returns all members.
	 */
	public getAllMembers(): Array<MemberItem> {
		return this.members;
	}

	/**
	 * Checks whether member exists.
	 * @param memberId Provides the member ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasMember(memberId: string): boolean {
		return this.getMember(memberId) != null;
	}

	/**
	 * Returns the member.
	 * @param memberId Provides the member ID value used by this operation.
	 * @returns Returns the member.
	 */
	public getMember(memberId: string): MemberItem {
		return this.members.find(x => x.memberId == memberId);
	}

	/**
	 * Sets the member.
	 * @param memberId Provides the member ID value used by this operation.
	 * @param status Provides the status value used by this operation.
	 */
	public setMember(memberId: string, status: number): void {
		// Stores the member item value used in the current execution flow.
		let memberItem = this.members.find(x => x.memberId == memberId);
		if (memberItem == null) {
			memberItem = {
				memberId: memberId,
				status: status,
			}

			this.members.push(memberItem);
		}
		else {
			memberItem.status = status;
		}

		this.set(Group._members, this.members);
	}

	/**
	 * Removes the member.
	 * @param memberId Provides the member ID value used by this operation.
	 */
	public removeMember(memberId: string): void {
		// Stores the member item value used in the current execution flow.
		let memberItem = this.members.find(x => x.memberId == memberId);
		if (memberItem != null) {
			// Stores the index of value used in the current execution flow.
			let indexOf = this.members.indexOf(memberItem);
			if (indexOf != -1) {
				this.members.splice(indexOf, 1);

				return this.set(Group._members, this.members);
			}
		}

		throw Error("can not found the member id to remove");
	}

	/**
	 * Returns all group currencies.
	 * @returns Returns all group currencies.
	 */
	public getAllGroupCurrencies(): Map<string, CurrencyItem> {
		return this.groupCurrencies;
	}

	/**
	 * Checks whether group currency exists.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasGroupCurrency(key: string): boolean {
		return this.groupCurrencies.has(key);
	}

	/**
	 * Returns the group currency.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the group currency.
	 */
	public getGroupCurrency(key: string): CurrencyItem {
		return this.groupCurrencies.get(key);
	}

	/**
	 * Changes the group currency.
	 * @param key Provides the key value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 */
	public changeGroupCurrency(key: string, amount: number): void {
		// Stores the this group currency value used in the current execution flow.
		const thisGroupCurrency = this.groupCurrencies.get(key);
		this.groupCurrencies.set(key, {
			value: thisGroupCurrency != null ? (thisGroupCurrency.value + amount) : amount
		});

		// Stores the field value used in the current execution flow.
		const field = Group._groupCurrencies + DataObjectBase.DOT + key;
		this.removeSet(field);
		this.inc(field + DataObjectBase.DOT + "value", amount);
	}

	/**
	 * Sets the group currency.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 */
	public setGroupCurrency(key: string, value: number): void {
		this.groupCurrencies.set(key, {
			value: value
		});

		// Stores the field value used in the current execution flow.
		const field = Group._groupCurrencies + DataObjectBase.DOT + key;
		this.removeInc(field + DataObjectBase.DOT + "value");
		this.set(field, {
			value: value
		});
	}

	/**
	 * Removes the group currency.
	 * @param key Provides the key value used by this operation.
	 */
	public removeGroupCurrency(key: string): void {
		if (this.groupCurrencies.has(key)) {
			this.groupCurrencies.delete(key);

			return this.unset(Group._groupCurrencies + DataObjectBase.DOT + key);
		}

		throw Error("can not found the key to remove");
	}

	/**
	 * Returns all group datas.
	 * @returns Returns all group datas.
	 */
	public getAllGroupDatas(): Array<DataItem> {
		return this.groupDatas;
	}

	/**
	 * Checks whether group data exists.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasGroupData(key: string): boolean {
		return this.getGroupData(key) != null;
	}

	/**
	 * Returns the group data.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the group data.
	 */
	public getGroupData(key: string): DataItem {
		return this.groupDatas.find(x => x.key == key);
	}

	/**
	 * Sets the group data.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 */
	public setGroupData(key: string, value: DataValueType): void {
		// Stores the group data item value used in the current execution flow.
		let groupDataItem = this.groupDatas.find(x => x.key == key);
		if (groupDataItem == null) {
			groupDataItem = {
				key: key,
				value: value,
			}

			this.groupDatas.push(groupDataItem);
		}
		else {
			groupDataItem.value = value;
		}

		this.set(Group._groupDatas, this.groupDatas);
	}

	/**
	 * Removes the group data.
	 * @param key Provides the key value used by this operation.
	 */
	public removeGroupData(key: string): void {
		// Stores the group data item value used in the current execution flow.
		let groupDataItem = this.groupDatas.find(x => x.key == key);
		if (groupDataItem != null) {
			// Stores the index of value used in the current execution flow.
			let indexOf = this.groupDatas.indexOf(groupDataItem);
			if (indexOf != -1) {
				this.groupDatas.splice(indexOf, 1);

				return this.set(Group._groupDatas, this.groupDatas);
			}
		}

		throw Error("can not found the key to remove");
	}

	/**
	 * Returns all group statistics.
	 * @returns Returns all group statistics.
	 */
	public getAllGroupStatistics(): Map<string, StatisticsItem> {
		return this.groupStatistics;
	}

	/**
	 * Checks whether group statistics exists.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasGroupStatistics(key: string): boolean {
		return this.groupStatistics.has(key);
	}

	/**
	 * Returns the group statistics.
	 * @param key Provides the key value used by this operation.
	 * @returns Returns the group statistics.
	 */
	public getGroupStatistics(key: string): StatisticsItem {
		return this.groupStatistics.get(key);
	}

	/**
	 * Changes the group statistics.
	 * @param key Provides the key value used by this operation.
	 * @param amount Provides the amount value used by this operation.
	 * @param tsLastUpdate Provides the timestamp last update value used by this operation.
	 */
	public changeGroupStatistics(key: string, amount: number, tsLastUpdate: number): void {
		// Stores the this group statistics value used in the current execution flow.
		const thisGroupStatistics = this.groupStatistics.get(key);
		this.groupStatistics.set(key, {
			value: thisGroupStatistics != null ? (thisGroupStatistics.value + amount) : amount,
			tsLastUpdate: tsLastUpdate,
		});

		// Stores the field value used in the current execution flow.
		const field = Group._groupStatistics + DataObjectBase.DOT + key;
		this.removeSet(field);
		this.inc(field + DataObjectBase.DOT + "value", amount);
		this.set(field + DataObjectBase.DOT + "tsLastUpdate", tsLastUpdate);
	}

	/**
	 * Sets the group statistics.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 * @param tsLastUpdate Provides the timestamp last update value used by this operation.
	 */
	public setGroupStatistics(key: string, value: number, tsLastUpdate: number): void {
		this.groupStatistics.set(key, {
			value: value,
			tsLastUpdate: tsLastUpdate,
		});

		// Stores the field value used in the current execution flow.
		const field = Group._groupStatistics + DataObjectBase.DOT + key;
		this.removeInc(field + DataObjectBase.DOT + "value");
		this.removeSet(field + DataObjectBase.DOT + "tsLastUpdate");
		this.set(field, {
			value: value,
			tsLastUpdate: tsLastUpdate,
		});
	}

	/**
	 * Removes the group statistics.
	 * @param key Provides the key value used by this operation.
	 */
	public removeGroupStatistics(key: string): void {
		if (this.groupStatistics.has(key)) {
			this.groupStatistics.delete(key);

			return this.unset(Group._groupStatistics + DataObjectBase.DOT + key);
		}

		throw Error("can not found the key to remove");
	}

	/**
	 * Returns all group inventories.
	 * @returns Returns all group inventories.
	 */
	public getAllGroupInventories(): Array<InventoryItem> {
		return this.groupInventories;
	}

	/**
	 * Checks whether group inventory exists.
	 * @param itemId Provides the item ID value used by this operation.
	 * @returns Returns the operation result.
	 */
	public hasGroupInventory(itemId: string): boolean {
		return this.groupInventories.find(x => x.itemId == itemId) != null;
	}

	/**
	 * Returns the group inventory.
	 * @param itemId Provides the item ID value used by this operation.
	 * @returns Returns the group inventory.
	 */
	public getGroupInventory(itemId: string): InventoryItem {
		return this.groupInventories.find(x => x.itemId == itemId);
	}

	/**
	 * Sets the group inventory.
	 * @param itemId Provides the item ID value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param classId Provides the class ID value used by this operation.
	 */
	public setGroupInventory(itemId: string, catalogId: string, classId: string): void {
		// Stores the group inventory item value used in the current execution flow.
		let groupInventoryItem = this.groupInventories.find(x => x.itemId == itemId);
		if (groupInventoryItem == null) {
			groupInventoryItem = {
				itemId: itemId,
				catalogId: catalogId,
				classId: classId,
			}

			this.groupInventories.push(groupInventoryItem);
		}
		else {
			groupInventoryItem.catalogId = catalogId;
			groupInventoryItem.classId = classId;
		}

		this.set(Group._groupInventories, this.groupInventories);
	}

	/**
	 * Removes the group inventory.
	 * @param itemId Provides the item ID value used by this operation.
	 */
	public removeGroupInventory(itemId: string): void {
		// Stores the group inventory item value used in the current execution flow.
		let groupInventoryItem = this.groupInventories.find(x => x.itemId == itemId);
		if (groupInventoryItem != null) {
			// Stores the index of value used in the current execution flow.
			let indexOf = this.groupInventories.indexOf(groupInventoryItem);
			if (indexOf != -1) {
				this.groupInventories.splice(indexOf, 1);

				return this.set(Group._groupInventories, this.groupInventories);
			}
		}

		throw Error("can not found the itemId to remove");
	}

	/**
	 * Returns the remove status.
	 * @returns Returns the remove status.
	 */
	public getRemoveStatus(): RemoveStatusItem {
		return this.removeStatus;
	}

	/**
	 * Sets the remove status.
	 * @param tsRemove Provides the timestamp remove value used by this operation.
	 * @param reason Provides the reason value used by this operation.
	 */
	public setRemoveStatus(tsRemove: number, reason?: string): void {
		this.removeStatus = {
			tsRemove: tsRemove,
			reason: reason,
		};

		this.set(Group._removeStatus, this.removeStatus);
	}
}
