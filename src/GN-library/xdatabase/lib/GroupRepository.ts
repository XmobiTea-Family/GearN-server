import * as mongoDB from "mongodb";

import { AbstractBaseRepository } from "./AbstractBaseRepository";
import { Group } from "./entity/pro/Group";
import { xDatetime } from "./../../xdatetime/lib/xDatetime";
import { GroupFindOptions } from "./entity/pro/findOptions/GroupFindOptions";

export class GroupRepository extends AbstractBaseRepository {
	/**
	 * Creates the group async.
	 * @param result Provides the result value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async createGroupAsync(result: any, gameId: string): Promise<Group> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		await collection.insertOne(result);
		return new Group(result, collection);
	}

	/**
	 * Loads the group async.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupAsync(groupId: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Group> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the result value used in the current execution flow.
		let result = await collection.findOne({ groupId: groupId }, {
			projection: this.getFindOptions(groupFindOptions)
		});

		if (result) {
			return new Group(result, collection);
		}

		return null;
	}

	/**
	 * Loads the groups with segment async.
	 * @param segment Provides the segment value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupsWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the results value used in the current execution flow.
		let results = await collection.find({ segments: segment }, {
			projection: this.getFindOptions(groupFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	/**
	 * Loads the groups with tag async.
	 * @param key Provides the key value used by this operation.
	 * @param value Provides the value value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupsWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;
		$filter["tags." + key] = value;

		// Stores the results value used in the current execution flow.
		let results = await collection.find($filter, {
			projection: this.getFindOptions(groupFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	/**
	 * Loads the groups with display name normalize regex async.
	 * @param keyword Provides the keyword value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupsWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the results value used in the current execution flow.
		let results = await collection.find({ displayNameNormalize: { $regex: keyword } }, {
			projection: this.getFindOptions(groupFindOptions),
			sort: {
				_id: -1
			}
		}).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	/**
	 * Loads the groups leaderboard with statistics async.
	 * @param key Provides the key value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param direction Provides the direction value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupsLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, direction: -1 | 1, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the sort value used in the current execution flow.
		let $sort = {} as any;
		$sort["groupStatistics." + key + ".value"] = direction;
		// $sort["groupStatistics." + key + ".tsLastUpdate"] = 1;

		let $filter = {} as any;
		if (catalogId) $filter["catalogId"] = catalogId;

		// Stores the results value used in the current execution flow.
		let results = await collection.find($filter, {
			projection: this.getFindOptions(groupFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	/**
	 * Loads the groups leaderboard with statistics all async.
	 * @param key Provides the key value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param direction Provides the direction value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupsLeaderboardWithStatisticsAllAsync(key: string, catalogId: string, gameId: string, direction: -1 | 1, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;
		$filter["groupStatistics." + key + ".value"] = { $ne: null };
		if (catalogId) $filter["catalogId"] = catalogId;

		// Stores the sort value used in the current execution flow.
		let $sort = {} as any;
		$sort["groupStatistics." + key + ".value"] = direction;
		// $sort["groupStatistics." + key + ".tsLastUpdate"] = 1;

		let results = await collection.find($filter, {
			projection: this.getFindOptions(groupFindOptions)
		}).sort($sort);
		return this.convertToGroups(results, collection);
	}

	/**
	 * Loads the groups leaderboard with create async.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupsLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the sort value used in the current execution flow.
		let $sort = {} as any;
		$sort["_id"] = -1;

		// Stores the results value used in the current execution flow.
		let results = await collection.find({}, {
			projection: this.getFindOptions(groupFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	/**
	 * Loads the groups leaderboard with currencies async.
	 * @param key Provides the key value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param groupFindOptions Provides the group find options value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupsLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the sort value used in the current execution flow.
		let $sort = {} as any;
		$sort["groupCurrencies." + key + ".value"] = -1;

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;
		if (catalogId) $filter["catalogId"] = catalogId;

		// Stores the results value used in the current execution flow.
		let results = await collection.find($filter, {
			projection: this.getFindOptions(groupFindOptions)
		}).sort($sort).skip(skip).limit(limit);
		return this.convertToGroups(results, collection);
	}

	/**
	 * Loads the position group leaderboard with statistics async.
	 * @param key Provides the key value used by this operation.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param catalogId Provides the catalog ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param initialValue Provides the initial value value used by this operation.
	 * @param direction Provides the direction value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadPositionGroupLeaderboardWithStatisticsAsync(key: string, groupId: string, catalogId: string, gameId: string, initialValue: number, direction: -1 | 1): Promise<number> {
		// Stores the collection value used in the current execution flow.
		let collection = this.systemGameCollection("Group", gameId);

		// Stores the group find options value used in the current execution flow.
		let groupFindOptions: GroupFindOptions = {
			groupStatistics: true,
			catalogId: true,
		};

		// Stores the this group value used in the current execution flow.
		let thisGroup = await this.loadGroupAsync(groupId, gameId, groupFindOptions);
		if (thisGroup == null) return -1;
		if (catalogId && thisGroup.getCatalogId() != catalogId) return -1;

		// Stores the score value used in the current execution flow.
		let score = initialValue;
		// Stores the timestamp last update value used in the current execution flow.
		let tsLastUpdate = xDatetime.getCurrentMilliseconds();

		// Stores the group statistics value used in the current execution flow.
		let groupStatistics = thisGroup.getGroupStatistics(key);
		if (groupStatistics != null) {
			score = groupStatistics.value;
			tsLastUpdate = groupStatistics.tsLastUpdate;
		}

		// Stores the filter value used in the current execution flow.
		let $filter = {} as any;
		if (catalogId) $filter["catalogId"] = catalogId;

		if (direction == -1) {
			// let condition1 = {} as any;
			// let condition2 = {} as any;

			$filter["groupStatistics." + key + ".value"] = { $gt: score };
			// condition2["groupStatistics." + key + ".value"] = score;
			// condition2["groupStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			// $filter.$or = [condition1, condition2];
		}
		else {
			// let condition1 = {} as any;
			// let condition2 = {} as any;

			$filter["groupStatistics." + key + ".value"] = { $lt: score };
			// condition2["groupStatistics." + key + ".value"] = score;
			// condition2["groupStatistics." + key + ".tsLastUpdate"] = { $lt: tsLastUpdate };

			// $filter.$or = [condition1, condition2];
		}

		return await collection.countDocuments($filter);
	}

	/**
	 * Loads the group messages async.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param skip Provides the skip value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async loadGroupMessagesAsync(groupId: string, gameId: string, skip: number, limit: number): Promise<mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>> {
		// Stores the collection value used in the current execution flow.
		let collection = this.runtimeGameCollection("Group.Message", gameId);

		return collection.find({
			groupId: groupId,
		}).sort({
			tsCreate: -1
		}).skip(skip).limit(limit);
	}

	/**
	 * Creates the group message async.
	 * @param groupId Provides the group ID value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param senderId Provides the sender ID value used by this operation.
	 * @param senderType Provides the sender type value used by this operation.
	 * @param message Provides the message value used by this operation.
	 * @param tsCreate Provides the timestamp create value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async createGroupMessageAsync(groupId: string, gameId: string, senderId: string, senderType: number, message: string, tsCreate: number): Promise<mongoDB.Document> {
		// Stores the collection value used in the current execution flow.
		let collection = this.runtimeGameCollection("Group.Message", gameId);

		return collection.insertOne({
			groupId: groupId,
			senderId: senderId,
			senderType: senderType,
			message: message,
			tsCreate: tsCreate,
		});
	}

	/**
	 * Executes the insert group statistics logs async workflow asynchronously.
	 * @param requests Provides the requests value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 */
	public async insertGroupStatisticsLogsAsync(requests: { groupId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[], gameId: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("Group.StatisticsLog", gameId);

		await collection.insertMany(requests);
	}

	/**
	 * Executes the insert group currency log async workflow asynchronously.
	 * @param requests Provides the requests value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 */
	public async insertGroupCurrencyLogsAsync(requests: { groupId: string, key: string, amount: number, startValue: number, finalValue: number, tsCreate: number, log: string }[], gameId: string): Promise<void> {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("Group.CurrencyLog", gameId);

		await collection.insertMany(requests);
	}

	/**
	 * Loads the group statistics log async.
	 * @param $filter Provides the filter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 */
	public async loadGroupStatisticsLogAsync($filter: {}, gameId: string, limit: number) {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("Group.StatisticsLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	/**
	 * Loads the group currency log async.
	 * @param $filter Provides the filter value used by this operation.
	 * @param gameId Provides the game ID value used by this operation.
	 * @param limit Provides the limit value used by this operation.
	 */
	public async loadGroupCurrencyLogAsync($filter: {}, gameId: string, limit: number) {
		// Stores the collection value used in the current execution flow.
		let collection = this.logRuntimeGameCollection("Group.CurrencyLog", gameId);

		return await collection.find($filter).sort({ "_id": -1 }).limit(limit);
	}

	/**
	 * Converts the to groups.
	 * @param results Provides the results value used by this operation.
	 * @param collection Provides the collection value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	private async convertToGroups(results: mongoDB.FindCursor<mongoDB.WithId<mongoDB.Document>>, collection: mongoDB.Collection<mongoDB.Document>): Promise<Array<Group>> {
		// Stores the answer value used in the current execution flow.
		let answer: Array<Group> = [];

		while (await results.hasNext()) {
			answer.push(new Group(await results.next(), collection));
		}

		return answer;
	}

	/**
	 * Returns the find options.
	 * @param findOptions Provides the find options value used by this operation.
	 * @returns Returns the find options.
	 */
	private getFindOptions(findOptions: GroupFindOptions): { [k: string]: boolean } {
		if (findOptions == null) return null;

		// Stores the answer value used in the current execution flow.
		let answer: { [k: string]: boolean } = {};

		if (findOptions.groupId) answer["groupId"] = true;
		if (findOptions.groupType) answer["groupType"] = true;
		if (findOptions.catalogId) answer["catalogId"] = true;
		if (findOptions.members) answer["members"] = true;
		if (findOptions.removeStatus) answer["removeStatus"] = true;
		if (findOptions.segments) answer["segments"] = true;
		if (findOptions.customDatas) answer["customDatas"] = true;
		if (findOptions.displayName) answer["displayName"] = true;
		if (findOptions.avatar) answer["avatar"] = true;
		if (findOptions.tsCreate) answer["tsCreate"] = true;
		if (findOptions.tags) answer["tags"] = true;
		if (findOptions.groupDatas) answer["groupDatas"] = true;
		if (findOptions.groupCurrencies) answer["groupCurrencies"] = true;
		if (findOptions.groupStatistics) answer["groupStatistics"] = true;
		if (findOptions.groupInventories) answer["groupInventories"] = true;

		return answer;
	}

}
