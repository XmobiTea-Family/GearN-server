# CloudScript Usage Guide

## What CloudScript Is In GearN

GearN CloudScript is versioned TypeScript code submitted through the CloudScript API and executed inside a forked worker process on the server.

From the API consumer perspective, the lifecycle is:

1. Submit a `script` with `addFunction`.
2. The server injects that script into `src/GN-startup/cloudScript/templateCloudScript.ts`.
3. The server compiles the injected file with `npx tsc`.
4. If compilation succeeds, the server stores a new immutable version.
5. Clients can call named handlers from that version with `executeFunction`.

This document is intentionally written so an AI agent can add, deploy, test, and roll out CloudScript functions without re-reading the server code every time.

## Public API Surface

TypeScript SDK scopes:

- `GNNetwork.cloudScript.*`
- `GNNetwork.cloudScript.server.*`
- `GNNetwork.cloudScript.admin.*`

Operations:

- `addFunction`: uploads script source and creates a new version.
- `editFunction`: changes only `canExecute` and `isLive` for an existing version.
- `getFunction`: returns the original script and flags for one version.
- `getFunctions`: lists all versions plus `latestVersion` and `liveLatestVersion`.
- `executeFunction`: calls one handler by name, optionally pinned to a specific version.

## Version Model

- Every `addFunction` call creates a new random 7-character version.
- A version should be treated as immutable.
- If the script body must change, call `addFunction` again.
- `editFunction` does not rebuild or replace the script text.
- `latestVersion` is the newest stored version.
- `liveLatestVersion` is the default version used when `executeFunction.version` is omitted.
- `canExecute` controls whether the version may run.
- `isLive` controls which version is used by default when no explicit version is provided.

Deployment rule:

- Do not set `isLive: true` while `canExecute: false`.
- A live version that cannot execute becomes the default target for version-less calls and can make them fail with `VersionInvalid`.

## Required Script Contract

The submitted `script` is not a standalone file. It is inserted into the server template, so your code should only declare handlers and local helper functions.

Minimal valid shape:

```ts
handlers["sumNumbers"] = async (args, context, log) => {
	const left = Number(args?.left ?? 0);
	const right = Number(args?.right ?? 0);
	const total = left + right;

	log({ userId: context.userId, left, right, total });

	return new GNHashtableBuilder()
		.add("total", total)
		.add("executedFor", context.userId)
		.build();
};
```

Handler contract:

- `args`: the value sent through `functionParameters`
- `context.userId`: the resolved target user id
- `context.customTags`: the request-level custom tags
- `log(value)`: appends one log entry to the execute response

Function name constraints:

- `functionName` must be 3 to 30 characters when executed through the API.
- `version` must be exactly 7 characters.

## What Is Already Available Inside CloudScript

The template already injects a working runtime with the symbols below. This section is the operational reference an AI agent should use instead of exploring the project.

### Selection Rule

- Prefer `admin` when the desired behavior already exists as an official GearN admin API.
- Prefer `database` only when the official API does not expose the behavior or when direct collection access is clearly required.
- Prefer `GNHashtableBuilder` or `GNArrayBuilder` for structured return values.
- Prefer `http`, `socket`, `mail`, and `pushNotification` only for external integration or delivery side effects.
- Do not try to use `GNNetwork` directly inside submitted scripts.

### `admin`

What it is:

- `admin` is a pre-created admin-scoped GearN TypeScript client facade.
- It is the CloudScript-safe replacement for `GNNetwork`.
- Internally it points to the same admin APIs the TypeScript client exposes at `GNNetwork.<domain>.admin`.

What it already exposes:

- `admin.characterPlayer`
- `admin.content`
- `admin.gamePlayer`
- `admin.group`
- `admin.inventory`
- `admin.masterPlayer`
- `admin.storeInventory`
- `admin.multiplayer`
- `admin.cloudScript`
- `admin.dashboard`
- `admin.send(...)`
- `admin.sendAsync(...)`

When to use it:

- Use `admin.*` when you want GearN business rules, permission flow, validation, and response models instead of raw Mongo writes.
- Use `admin.*` first for player data, inventory, groups, content, store inventory, dashboard operations, and matchmaking operations.

When not to use it:

- Do not use `admin.*` when the needed behavior does not exist in the public admin API and raw database access is simpler and intentional.
- Do not call `admin.cloudScript.addFunction` from normal business handlers unless self-modifying CloudScript is an explicit design choice.

Known `dashboard` operations already exposed through `admin.dashboard`:

- `getAdminAccountList`
- `getGameInformation`
- `getGameList`
- `getMasterGameSettings`
- `getSecretInfoInformation`
- `getSecretInfoList`
- `getServerLog`
- `setGameInformation`
- `getUsernameAdminAccount`
- `getAnalytics`
- `resetStatisticsLeaderboard`
- `getBackupStatisticsLeaderboardVersion`
- `getServerGameData`
- `deleteInDatabase`

Typical example:

```ts
handlers["getGameList"] = async (_args, _context, _log) => {
	const response = await admin.dashboard.getGameListAsync({});

	if (response.hasReturnCodeError() || response.errorCode !== ErrorCode.Ok) {
		throw new Error(response.debugMessage ?? "getGameList failed");
	}

	return response.responseData.results;
};
```

Low-level generic example:

```ts
handlers["rawAdminCall"] = async (_args, _context, _log) => {
	const response = await admin.sendAsync(
		RequestType.Dashboard,
		RequestRole.Admin,
		new DashboardRequestModels.GetGameListOperationRequest({}),
		undefined as any,
		undefined as any,
		undefined as any
	);

	return response.getParameters()?.toData() ?? null;
};
```

Use `admin.sendAsync(...)` only when a typed facade is missing but the transport contract already exists.

### `database`

What it is:

- `database` is an initialized `CloudScriptDatabase`.
- `CloudScriptDatabase` extends `xDatabase`.
- It already has the current runtime database connection and log database connection.

Raw Mongo access methods:

- `database.getDb()`
- `database.getLogDb()`
- `database.collection(name)`
- `database.logCollection(name)`
- `database.runtimeCollection(name)`
- `database.metaCollection(name)`
- `database.systemCollection(name)`
- `database.runtimeGameCollection(name, gameId)`
- `database.metaGameCollection(name, gameId)`
- `database.systemGameCollection(name, gameId)`
- `database.logRuntimeGameCollection(name, gameId)`
- `database.logMetaGameCollection(name, gameId)`
- `database.logSystemGameCollection(name, gameId)`

Database helper families already available:

- Master player helpers:
- load by `userId`
- load by device id
- load by external identity such as Google, Apple, Facebook, Game Center
- load by display name, tag, segment, leaderboard
- create master player

- Game player helpers:
- load by `userId`
- load by display name, tag, segment, leaderboard
- create game player
- write and read statistics or currency logs

- Character player helpers:
- load by `characterId`
- load by display name, tag, segment, leaderboard
- create character player
- write and read statistics or currency logs

- Group helpers:
- load by `groupId`
- load by display name, tag, segment, leaderboard
- create group
- load and create group messages
- write and read group statistics or currency logs

- Inventory helpers:
- load by `itemId`
- load by display name, tag, segment, leaderboard
- create inventory
- write and read inventory statistics logs

- Store inventory helpers:
- load by `storeId`
- load by Apple, Google, or Facebook store product id
- load by tag
- create store inventory
- track store usage and store logs

- Upload file helpers:
- load upload file info
- create upload file info

When to use raw collections:

- Use raw collections when the exact helper method does not exist.
- Use raw collections for aggregation pipelines, special filters, batched maintenance tasks, or one-off reporting queries.

When to use helper methods:

- Use helper methods when one already matches the needed read or create flow.
- Helper methods return domain objects such as `MasterPlayer`, `GamePlayer`, `Group`, or `Inventory`, which is safer than re-implementing the query shape every time.

Collection naming rule:

- `systemGameCollection("GamePlayer", gameId)` reads system data for one game.
- `runtimeGameCollection("Group.Message", gameId)` reads runtime data for one game.
- `logRuntimeGameCollection("Inventory.StatisticsLog", gameId)` reads runtime logs for one game.

Typical raw collection example:

```ts
handlers["countRecentGroupMessages"] = async (args, _context, _log) => {
	const groupId = String(args?.groupId ?? "");
	if (!groupId) {
		throw new Error("groupId is required");
	}

	const collection = database.runtimeGameCollection("Group.Message", gameId);
	const total = await collection.countDocuments({ groupId: groupId });

	return new GNHashtableBuilder()
		.add("groupId", groupId)
		.add("total", total)
		.build();
};
```

Typical helper example:

```ts
handlers["getGamePlayerProfile"] = async (args, _context, _log) => {
	const userId = String(args?.userId ?? "");
	if (!userId) {
		throw new Error("userId is required");
	}

	const gamePlayer = await database.loadGamePlayerAsync(userId, gameId);
	if (!gamePlayer) {
		throw new Error("GamePlayer not found");
	}

	return new GNHashtableBuilder()
		.add("userId", gamePlayer.getUserId())
		.add("displayName", gamePlayer.getDisplayName())
		.build();
};
```

Operational rule:

- If a workflow modifies gameplay state and an `admin.*` API exists for it, prefer `admin.*`.
- If you use raw Mongo writes, you are responsible for keeping invariants correct.

### `http`

What it is:

- `http` is a small wrapper around `axios`.
- It is intended for outbound webhook calls and third-party integrations.

Available methods:

- `http.get(url, config?)`
- `http.delete(url, config?)`
- `http.head(url, config?)`
- `http.options(url, config?)`
- `http.post(url, data?, config?)`
- `http.put(url, data?, config?)`
- `http.patch(url, data?, config?)`

Return value:

- Each method returns an Axios response object.
- Read `response.status`, `response.data`, and `response.headers` like normal Axios usage.

Example:

```ts
handlers["notifyWebhook"] = async (args, context, log) => {
	const response = await http.post(String(args?.url ?? ""), {
		userId: context.userId,
		payload: args?.payload ?? null,
	});

	log({ status: response.status });

	return new GNHashtableBuilder()
		.add("status", response.status)
		.add("data", response.data)
		.build();
};
```

### `socket`

What it is:

- `socket` sends realtime events or room operations back to the parent server process.
- It does not wait for client delivery acknowledgment.

Available methods:

- `socket.sendEventTo(userId, operationEvent)`
- `socket.sendEventToMoreUser(userIds, operationEvent)`
- `socket.sendEventToAllPlayer(operationEvent)`
- `socket.joinRoom(userId, roomId)`
- `socket.leaveRoom(userId, roomId)`
- `socket.sendEventToRoom(roomId, operationEvent)`

When to use it:

- Use it for realtime pushes to currently connected clients.
- Use it to place users into rooms or broadcast to a room.

What to pass:

- Build an `OperationEvent` and pass it to the socket helper.

Example:

```ts
handlers["pushMaintenanceNotice"] = async (args, _context, _log) => {
	const userId = String(args?.userId ?? "");
	const operationEvent = new OperationEvent(EventCode.ServerMessage)
		.setParameter("message", "Maintenance starts in 5 minutes");

	await socket.sendEventTo(userId, operationEvent);

	return true;
};
```

### `mail`

What it is:

- `mail` requests mail delivery through the parent process.

Available methods:

- `mail.send(email, subject, contentHtml)`
- `mail.sendToMore(emails, subject, contentHtml)`

Rules:

- `contentHtml` is HTML content.
- Delivery is a side effect request, not a transactionally confirmed business result.

Example:

```ts
handlers["sendWelcomeMail"] = async (args, _context, _log) => {
	await mail.send(
		String(args?.email ?? ""),
		"Welcome",
		"<h1>Welcome to GearN</h1><p>Your account is ready.</p>"
	);

	return true;
};
```

### `pushNotification`

What it is:

- `pushNotification` requests push delivery through the parent process.

Available methods:

- `pushNotification.send(token, title, body, badge?, sound?, icon?, data?)`
- `pushNotification.sendToMore(tokens, title, body, badge?, sound?, icon?, data?)`
- `pushNotification.sendToTopic(topic, title, body, badge?, sound?, icon?, data?)`
- `pushNotification.subscribeToTopic(tokens, topic)`
- `pushNotification.unsubscribeFromTopic(tokens, topic)`

When to use it:

- Use it for mobile or device push delivery.
- Use topics for fan-out targeting outside the live socket channel.

Example:

```ts
handlers["pushRewardNotice"] = async (args, _context, _log) => {
	await pushNotification.send(
		String(args?.token ?? ""),
		"Reward Ready",
		"Your reward can now be claimed.",
		1,
		"default",
		undefined,
		{ rewardId: args?.rewardId ?? null }
	);

	return true;
};
```

### `mongodb`

What it is:

- `mongodb` is the imported Node MongoDB package.

When to use it:

- Use it when raw collection operations need MongoDB-specific helpers, constants, types, or advanced pipeline syntax.

Example:

```ts
handlers["aggregateTopMessages"] = async (_args, _context, _log) => {
	const collection = database.runtimeGameCollection("Group.Message", gameId);
	const results = await collection.aggregate([
		{ $group: { _id: "$groupId", total: { $sum: 1 } } },
		{ $sort: { total: -1 } },
		{ $limit: 10 },
	]).toArray();

	return results;
};
```

### `axios`

What it is:

- `axios` is also imported directly.

When to use it:

- Prefer `http` for normal cases.
- Use raw `axios` only when you need a lower-level feature not exposed by the wrapper style you want to write.

### `gameId`

What it is:

- `gameId` is the current game id string injected into the CloudScript worker.

When to use it:

- Use it whenever a database helper or collection call requires a `gameId`.
- Use it when outbound payloads must include the current game.

### `GNHashtable`, `GNArray`, `GNHashtableBuilder`, `GNArrayBuilder`

What they are:

- These are GearN data containers and builders from `@xmobitea/gn-typescript-client`.

Why they matter:

- They are safe return types for CloudScript.
- They avoid the current plain-object falsy-value loss caveat.
- They are useful when constructing structured results or event payloads.

Preferred return rule:

- If the result is simple and only contains truthy values, plain JSON is acceptable.
- If the result must preserve `false`, `0`, `""`, or nested GearN data, use `GNHashtableBuilder` or `GNArrayBuilder`.

Example:

```ts
handlers["buildResultSafely"] = async (_args, _context, _log) => {
	return new GNHashtableBuilder()
		.add("ok", false)
		.add("count", 0)
		.add("message", "")
		.build();
};
```

### Useful Imported Types From `@xmobitea/gn-typescript-client`

These imports are already available and are usually enough for most CloudScript work:

- request and response models such as `DashboardRequestModels`, `CloudScriptModels`, `InventoryModels`, and others
- `OperationEvent` for socket pushes
- enums such as `ErrorCode`, `EventCode`, `RequestRole`, `RequestType`, `OwnerType`
- helpers such as `GNUtils`, `ConverterService`, `CodeHelper`

Practical rule:

- If the CloudScript needs an operation request class, an event class, a model type, or a GearN enum, first check whether the symbol is already among the imported GearN client exports.

### Task To Symbol Mapping

Use this mapping before writing any CloudScript:

- Read or mutate a feature that already exists as official GearN business logic:
- use `admin.<domain>`

- Run a low-level existing GearN transport contract that does not have a convenient typed facade:
- use `admin.sendAsync(...)`

- Read or write internal MongoDB collections directly:
- use `database`

- Query runtime game collections such as live messages or transient game-state records:
- use `database.runtimeGameCollection(...)`

- Query system game collections such as player, inventory, group, or store inventory documents:
- use `database.systemGameCollection(...)`

- Query operational logs:
- use `database.logRuntimeGameCollection(...)` or `database.getLogDb()`

- Call a webhook or third-party REST endpoint:
- use `http`

- Push data to online clients immediately:
- use `socket`

- Send email:
- use `mail`

- Send mobile push:
- use `pushNotification`

- Build structured return payloads safely:
- use `GNHashtableBuilder` or `GNArrayBuilder`

- Build advanced MongoDB pipelines or use Mongo-specific helpers:
- use `mongodb` with `database`

### Common AI Mistakes To Avoid

- Do not use raw Mongo writes for player, inventory, group, or store flows if an `admin.*` API already handles the business rule.
- Do not return plain objects when falsy values must be preserved.
- Do not assume socket delivery means persistence; socket is for realtime fan-out.
- Do not assume mail or push delivery is transactional.
- Do not import or reference `GNNetwork` in submitted script text.
- Do not invent collection names when `database` already exposes helper methods or naming patterns.

### Admin API Naming Convention

Inside CloudScript, prefer the async admin methods:

- `await admin.<domain>.<method>Async(requestData)`

Request-data naming rule:

- The request type almost always follows:
- `<Domain>Models.Admin<MethodName>RequestData`

Examples:

- `GamePlayerModels.AdminSetDisplayNameRequestData`
- `GroupModels.AdminSendGroupMessageRequestData`
- `StoreInventoryModels.AdminPresentStoreItemRequestData`
- `MultiplayerModels.AdminCreateMatchmakingTicketRequestData`

Practical rule:

- In CloudScript, ignore the callback-style overloads unless you are forced to interoperate with existing callback code.
- Prefer the `Async` variant for every admin API call.

### Admin Domain Inventory

The method groups below are the current public admin method families available through the preloaded `admin` object in CloudScript.

### `admin.characterPlayer`

Use this domain for character-scoped profile, stats, ownership, inventory, and social/group relations.

Read and profile methods:

- `getAvatar`
- `getCatalogId`
- `getCountryCode`
- `getCustomData`
- `getDisplayName`
- `getIpAddressCreate`
- `getOwner`
- `getPlayerBan`
- `getPlayerCurrency`
- `getPlayerData`
- `getPlayerFriend`
- `getPlayerGroup`
- `getPlayerInformation`
- `getPlayerInventory`
- `getPlayerStatistics`
- `getRemoveStatus`
- `getSegment`
- `getTag`
- `getTsCreate`
- `getTsLastLogin`

Search, leaderboard, and log methods:

- `getPlayersWithDisplayName`
- `getPlayersWithSegment`
- `getPlayersWithTag`
- `getStatisticsLeaderboard`
- `getStatisticsLeaderboardAroundPlayer`
- `getFriendStatisticsLeaderboard`
- `getFriendStatisticsLeaderboardAroundPlayer`
- `getCurrencyLeaderboard`
- `getCreateLeaderboard`
- `getLastLoginLeaderboard`
- `getStatisticsLog`
- `getCurrencyLog`

Mutation and relation methods:

- `addPlayerFriend`
- `removePlayerFriend`
- `createPlayerItem`
- `removePlayerItem`
- `createGroup`
- `joinGroup`
- `leaveGroup`
- `addSegment`
- `removeSegment`
- `removeTag`
- `setAvatar`
- `setCountryCode`
- `setCustomData`
- `setDisplayName`
- `setOwner`
- `setPlayerBan`
- `changePlayerCurrency`
- `setPlayerData`
- `changePlayerStatistics`
- `setRemoveStatus`
- `setTag`

### `admin.content`

Use this domain for content blobs and file-upload metadata flows.

Available methods:

- `createNewFileUploadInfo`
- `getContentData`
- `getFileUploadInfoList`
- `getFileUploadInfo`
- `removeFileUploadInfo`
- `requestDownloadFileUploadInfo`
- `setContentData`

### `admin.gamePlayer`

Use this domain for game-scoped player profile, progression, inventory links, group links, and character links.

Read and profile methods:

- `getAvatar`
- `getCountryCode`
- `getCustomData`
- `getDisplayName`
- `getIpAddressCreate`
- `getOnlineStatus`
- `getPlayerBan`
- `getPlayerCharacter`
- `getPlayerCurrency`
- `getPlayerData`
- `getPlayerFriend`
- `getPlayerGroup`
- `getPlayerInformation`
- `getPlayerInventory`
- `getPlayerStatistics`
- `getSegment`
- `getTag`
- `getTsCreate`
- `getTsLastLogin`

Search, leaderboard, and log methods:

- `getPlayersWithDisplayName`
- `getPlayersWithSegment`
- `getPlayersWithTag`
- `getStatisticsLeaderboard`
- `getStatisticsLeaderboardAroundPlayer`
- `getFriendStatisticsLeaderboard`
- `getFriendStatisticsLeaderboardAroundPlayer`
- `getCurrencyLeaderboard`
- `getCreateLeaderboard`
- `getLastLoginLeaderboard`
- `getStatisticsLog`
- `getCurrencyLog`

Mutation and relation methods:

- `addPlayerFriend`
- `removePlayerFriend`
- `createGroup`
- `createPlayerCharacter`
- `removePlayerCharacter`
- `createPlayerItem`
- `removePlayerItem`
- `joinGroup`
- `leaveGroup`
- `addSegment`
- `removeSegment`
- `removeTag`
- `setAvatar`
- `setCountryCode`
- `setCustomData`
- `setDisplayName`
- `setPlayerBan`
- `changePlayerCurrency`
- `setPlayerData`
- `changePlayerStatistics`
- `setTag`

### `admin.group`

Use this domain for guild/clan/group state, membership, group inventory, group chat, and group progression.

Read and profile methods:

- `getAvatar`
- `getCatalogId`
- `getCustomData`
- `getDisplayName`
- `getGroupCurrency`
- `getGroupData`
- `getGroupInformation`
- `getGroupInventory`
- `getGroupMessage`
- `getGroupStatistics`
- `getMembers`
- `getRemoveStatus`
- `getSegment`
- `getTag`
- `getTsCreate`

Search, leaderboard, and log methods:

- `getGroupsWithDisplayName`
- `getGroupsWithSegment`
- `getGroupsWithTag`
- `getStatisticsLeaderboard`
- `getStatisticsLeaderboardAroundGroup`
- `getCurrencyLeaderboard`
- `getCreateLeaderboard`
- `getStatisticsLog`
- `getCurrencyLog`

Mutation and delivery methods:

- `addMember`
- `removeMember`
- `createGroupItem`
- `removeGroupItem`
- `addSegment`
- `removeSegment`
- `removeTag`
- `sendGroupMessage`
- `setAvatar`
- `setCustomData`
- `setDisplayName`
- `changeGroupCurrency`
- `setGroupData`
- `changeGroupStatistics`
- `setRemoveStatus`
- `setTag`

### `admin.inventory`

Use this domain for item documents that already exist in inventory and need metadata, amount, ownership, or statistic changes.

Read and profile methods:

- `getAmount`
- `getAvatar`
- `getCatalogId`
- `getClassId`
- `getCustomData`
- `getDisplayName`
- `getItemData`
- `getItemInformation`
- `getItemStatistics`
- `getItemType`
- `getOwner`
- `getRemoveStatus`
- `getSegment`
- `getTag`
- `getTsCreate`

Search, leaderboard, and log methods:

- `getItemsWithDisplayName`
- `getItemsWithSegment`
- `getItemsWithTag`
- `getStatisticsLeaderboard`
- `getStatisticsLeaderboardAroundItem`
- `getCreateLeaderboard`
- `getStatisticsLog`

Mutation methods:

- `addSegment`
- `removeSegment`
- `removeTag`
- `setAmount`
- `setAvatar`
- `setCustomData`
- `setDisplayName`
- `setItemData`
- `changeItemStatistics`
- `setOwner`
- `setRemoveStatus`
- `setTag`

### `admin.masterPlayer`

Use this domain for account-level identity, external login bindings, master-level progression, and player communication tied to the master account.

Read and profile methods:

- `getAvatar`
- `getCountryCode`
- `getCustomData`
- `getDisplayName`
- `getEmail`
- `getExternal`
- `getIpAddressCreate`
- `getPlayerBan`
- `getPlayerCurrency`
- `getPlayerData`
- `getPlayerInformation`
- `getPlayerStatistics`
- `getSegment`
- `getTag`
- `getTsCreate`
- `getTsLastLogin`

Lookup and search methods:

- `getPlayersWithApple`
- `getPlayersWithDisplayName`
- `getPlayersWithFacebook`
- `getPlayersWithGenericService`
- `getPlayersWithGoogle`
- `getPlayersWithGooglePlayGameService`
- `getPlayersWithGameCenter`
- `getPlayersWithSegment`
- `getPlayersWithTag`

Identity link and unlink methods:

- `changeAccountPassword`
- `linkAccount`
- `linkAndroidDeviceId`
- `linkApple`
- `linkCustomDeviceId`
- `linkCustomId`
- `linkEditorDeviceId`
- `linkFacebook`
- `linkGenericService`
- `linkGoogle`
- `linkGooglePlayGameService`
- `linkGameCenter`
- `linkiOSDeviceId`
- `linkLinuxDeviceId`
- `linkMacOSDeviceId`
- `linkWindowsDeviceId`
- `linkWindowsPhoneDeviceId`
- `unlinkAccount`
- `unlinkAndroidDeviceId`
- `unlinkApple`
- `unlinkCustomDeviceId`
- `unlinkCustomId`
- `unlinkEditorDeviceId`
- `unlinkFacebook`
- `unlinkGenericService`
- `unlinkGoogle`
- `unlinkGooglePlayGameService`
- `unlinkGameCenter`
- `unlinkiOSDeviceId`
- `unlinkLinuxDeviceId`
- `unlinkMacOSDeviceId`
- `unlinkWindowsDeviceId`
- `unlinkWindowsPhoneDeviceId`

Mutation and communication methods:

- `addSegment`
- `removeSegment`
- `removeTag`
- `setAvatar`
- `setCountryCode`
- `setCustomData`
- `setDisplayName`
- `setEmail`
- `setPlayerBan`
- `changePlayerCurrency`
- `setPlayerData`
- `changePlayerStatistics`
- `setTag`
- `setTsLastLogin`
- `sendSocketOperationEvent`
- `sendEmail`
- `addPushNotification`
- `removePushNotification`
- `getPushNotification`
- `sendPushNotification`

Leaderboard and log methods:

- `getStatisticsLeaderboard`
- `getStatisticsLeaderboardAroundPlayer`
- `getCurrencyLeaderboard`
- `getCreateLeaderboard`
- `getLastLoginLeaderboard`
- `getStatisticsLog`
- `getCurrencyLog`

### `admin.storeInventory`

Use this domain for store-item definitions, purchase flows, gifting, receipt validation, and store audit data.

Commerce and catalog methods:

- `buyStoreItem`
- `createStoreItem`
- `presentStoreItem`
- `setStoreItemInformation`
- `setRemoveStatus`
- `getStoreItemInformation`
- `getStoreItemsWithTag`

Receipt-validation methods:

- `validateAppleAppStoreReceipt`
- `validateFacebookStoreReceipt`
- `validateGooglePlayStoreReceipt`

Audit and utility methods:

- `getCreateLeaderboard`
- `getStoreLog`
- `getStoreUsed`
- `removeStoreUsed`

### `admin.multiplayer`

Use this domain for matchmaking queues, tickets, and match lookup.

Ticket lifecycle methods:

- `createMatchmakingTicket`
- `joinMatchmakingTicket`
- `cancelMatchmakingTicket`
- `cancelAllMatchmakingTicket`
- `listMatchmakingTicketsForPlayer`
- `getMatchmakingTicket`
- `getAllMatchmakingTicket`

Match and queue inspection methods:

- `getMatch`
- `getAllMatch`
- `getQueueStatistics`

Operational rule:

- Use `admin.multiplayer` for matchmaking state queries and ticket operations.
- Use `socket` or CloudScript event callbacks separately if you need to push match results to clients in realtime.

### `admin.cloudScript`

Use this domain only for CloudScript version management and execution.

Available methods:

- `addFunction`
- `editFunction`
- `executeFunction`
- `getFunction`
- `getFunctions`

### Admin Domain Usage Rule

Choose the narrowest matching domain:

- player account identity and external links: `admin.masterPlayer`
- per-game player state: `admin.gamePlayer`
- per-character state: `admin.characterPlayer`
- guild/clan/group state: `admin.group`
- inventory item documents: `admin.inventory`
- store definitions and store transactions: `admin.storeInventory`
- matchmaking tickets and matches: `admin.multiplayer`
- file metadata and content blobs: `admin.content`
- CloudScript version lifecycle: `admin.cloudScript`

## Hard Constraints And Current Runtime Behavior

- The server rejects any submitted script containing the literal text `GNNetwork`.
- This is a simple string check, not an AST check.
- Do not include `GNNetwork` in code, comments, or string literals inside the submitted script.
- Use `admin` instead.

- The server compiles the injected script with `npx tsc`.
- Syntax errors and type errors in the injected file make `addFunction` fail.
- `addFunction` returns an error message from the build step when compilation fails.

- Supported return shapes are:
- `void`
- `null`
- `boolean`
- `number`
- `string`
- plain JSON object
- plain JSON array
- `GNHashtable`
- `GNArray`

- Do not return functions, class instances, sockets, Mongo cursors, or circular objects.
- Do not use top-level `await`. Keep async work inside handlers.
- `log(value)` uses `JSON.stringify(value)`.
- Only pass JSON-serializable values to `log`.

Important current caveat:

- Plain object results currently drop falsy properties during result conversion.
- Example: `{ ok: false, count: 0, message: "" }` can lose those fields.
- If you must preserve falsy values inside an object, return `GNHashtable` instead of a plain object.

Important current caveat:

- Client-scope `executeFunction` currently executes as the authenticated user even when a different `userId` is supplied.
- If you need to execute a function for another user, use server/admin scope or fix the server handler first.

Important current caveat:

- `getFunction` currently assumes the requested version exists.
- If an unknown version is requested, the current server handler does not return a clean not-found response.
- Call `getFunctions` first or use only versions you already know exist.

## Execute Status Values

- `1`: `Ok`
- `2`: `Exception`
- `3`: `FunctionNameNotFound`
- `4`: `VersionInvalid`
- `5`: `Timeout`

Interpretation:

- `ErrorCode.Ok` means the API call itself succeeded.
- `responseData.status` still must be checked to know whether the CloudScript handler actually ran successfully.

## Recommended Deployment Workflow

1. Write a handler-based script that uses only the symbols already available in the template.
2. Call `addFunction` with `canExecute: true` and `isLive: false`.
3. Save the returned `version`.
4. Test with `executeFunction` while pinning that exact `version`.
5. Check `status`, `functionResult`, and `functionLogs`.
6. If the version behaves correctly, promote it with `editFunction({ version, canExecute: true, isLive: true })`.
7. Keep the previous working version available until the rollout is stable.

Rollback rule:

- To roll back, mark an older executable version as `isLive: true`.

## TypeScript Example

Assumption:

- `GNNetwork` is already initialized.
- The current runtime context already has the right auth token and secret for the chosen scope.

Example script:

```ts
const script = `
handlers["sumNumbers"] = async (args, context, log) => {
	const left = Number(args?.left ?? 0);
	const right = Number(args?.right ?? 0);
	const total = left + right;

	log({ userId: context.userId, left, right, total });

	return new GNHashtableBuilder()
		.add("total", total)
		.add("executedFor", context.userId)
		.build();
};
`;
```

Create a new version:

```ts
import {
	CloudScriptModels,
	ErrorCode,
	ExecuteResponseStatus,
	GNNetwork,
} from "@xmobitea/gn-typescript-client";

const addRequest: CloudScriptModels.AdminAddFunctionRequestData = {
	script: script,
	canExecute: true,
	isLive: false,
};

const addResponse = await GNNetwork.cloudScript.admin.addFunctionAsync(addRequest);

if (addResponse.hasReturnCodeError() || addResponse.errorCode !== ErrorCode.Ok) {
	throw new Error(addResponse.responseData?.errorMessage ?? addResponse.debugMessage ?? "AddFunction failed");
}

const version = addResponse.responseData.version;
```

Execute the new version before promoting it:

```ts
const executeRequest: CloudScriptModels.AdminExecuteFunctionRequestData = {
	userId: "0123456789",
	functionName: "sumNumbers",
	functionParameters: { left: 7, right: 5 },
	version: version,
};

const executeResponse = await GNNetwork.cloudScript.admin.executeFunctionAsync(executeRequest);

if (executeResponse.hasReturnCodeError() || executeResponse.errorCode !== ErrorCode.Ok) {
	throw new Error(executeResponse.responseData?.errorMessage ?? executeResponse.debugMessage ?? "ExecuteFunction failed");
}

if (executeResponse.responseData.status !== ExecuteResponseStatus.Ok) {
	throw new Error(executeResponse.responseData.errorMessage ?? "CloudScript handler failed");
}

const result = executeResponse.responseData.functionResult;
const logs = executeResponse.responseData.functionLogs;
```

Promote the tested version to live:

```ts
const editRequest: CloudScriptModels.AdminEditFunctionRequestData = {
	version: version,
	canExecute: true,
	isLive: true,
};

const editResponse = await GNNetwork.cloudScript.admin.editFunctionAsync(editRequest);

if (editResponse.hasReturnCodeError() || editResponse.errorCode !== ErrorCode.Ok) {
	throw new Error(editResponse.responseData?.errorMessage ?? editResponse.debugMessage ?? "EditFunction failed");
}
```

List versions and inspect the live pointer:

```ts
const listResponse = await GNNetwork.cloudScript.admin.getFunctionsAsync({});

if (listResponse.hasReturnCodeError() || listResponse.errorCode !== ErrorCode.Ok) {
	throw new Error(listResponse.debugMessage ?? "GetFunctions failed");
}

const versions = listResponse.responseData.results;
const latestVersion = listResponse.responseData.latestVersion;
const liveLatestVersion = listResponse.responseData.liveLatestVersion;
```

Fetch one specific version:

```ts
const getResponse = await GNNetwork.cloudScript.admin.getFunctionAsync({ version: liveLatestVersion });

if (getResponse.hasReturnCodeError() || getResponse.errorCode !== ErrorCode.Ok) {
	throw new Error(getResponse.debugMessage ?? "GetFunction failed");
}

const scriptText = getResponse.responseData.script;
const canExecute = getResponse.responseData.canExecute;
const isLive = getResponse.responseData.isLive;
```

Passing custom tags:

```ts
import { GNHashtableBuilder } from "@xmobitea/gn-typescript-client";

const customTags = new GNHashtableBuilder()
	.add("traceId", "cloudscript-demo-01")
	.add("source", "integration-test")
	.build();

await GNNetwork.cloudScript.admin.executeFunctionAsync(
	{
		userId: "0123456789",
		functionName: "sumNumbers",
		functionParameters: { left: 1, right: 2 },
		version: version,
	},
	undefined,
	undefined,
	customTags
);
```

Inside the handler, those tags are available at `context.customTags`.

## Common Capability Patterns

Read directly from a game collection:

```ts
handlers["getRecentGroupMessages"] = async (args, context, log) => {
	const groupId = String(args?.groupId ?? "");
	if (!groupId) {
		throw new Error("groupId is required");
	}

	const collection = database.runtimeGameCollection("Group.Message", gameId);
	const documents = await collection
		.find({ groupId: groupId })
		.sort({ tsCreate: -1 })
		.limit(20)
		.toArray();

	log({ groupId, count: documents.length });

	return documents.map((document) => new GNHashtableBuilder()
		.add("senderId", document.senderId)
		.add("message", document.message)
		.add("tsCreate", document.tsCreate)
		.build());
};
```

Call an external webhook:

```ts
handlers["postWebhook"] = async (args, context, log) => {
	const url = String(args?.url ?? "");
	if (!url) {
		throw new Error("url is required");
	}

	const response = await http.post(url, {
		userId: context.userId,
		payload: args?.payload ?? null,
	});

	log({ url, status: response.status });

	return new GNHashtableBuilder()
		.add("status", response.status)
		.build();
};
```

## Unity Mapping

The Unity SDK mirrors the same scope structure:

- `GNNetwork.cloudScript`
- `GNNetwork.cloudScript.server`
- `GNNetwork.cloudScript.admin`

The operation set is the same:

- `addFunction`
- `editFunction`
- `executeFunction`
- `getFunctions`

Current Unity-specific caveats:

- The current Unity API exposes `getFuntionId` and `getFuntionAsync` instead of `getFunction` and `getFunctionAsync`.
- The current Unity `CloudScriptModels.AddFunctionRequestData` and `EditFunctionRequestData` declare `canExecute` and `isLive` as `string`, not `bool`.
- If an AI agent writes Unity usage code, it must read those current public types first instead of assuming the TypeScript signatures are identical.

## When CloudScript Is Enough

CloudScript is usually enough when the required feature can be composed from:

- existing GearN admin APIs through `admin.*`
- direct MongoDB access through `database.*`
- outbound HTTP through `http.*`
- socket pushes and room operations through `socket.*`
- mail sending through `mail.*`
- push sending through `pushNotification.*`
- request-time orchestration, validation, and lightweight business logic

## When CloudScript Is Not Enough

CloudScript alone is not the right tool when the feature needs:

- a new internal server service that is not exposed in the template
- a new transport contract or a new public API endpoint
- extra packages that are not already installed on the server
- filesystem or host-level capabilities outside the current worker contract
- long-running jobs that can exceed the CloudScript execute timeout

In those cases, the AI agent should stop trying to force the feature into CloudScript and should propose a server change instead.

## AI Checklist For Adding A New Function

1. Decide whether the feature can be solved with `admin`, `database`, `http`, `socket`, `mail`, or `pushNotification`.
2. Write only handler registrations and local helpers.
3. Never include the literal text `GNNetwork` in the submitted script.
4. Prefer `GNHashtable` when the returned object must preserve falsy fields.
5. Deploy the new script as a non-live executable version first.
6. Execute against the exact returned `version`.
7. Inspect `status`, `functionResult`, and `functionLogs`.
8. Promote to live only after the pinned test passes.
9. If the feature needs new runtime capability, stop and request a server change.

## Source Of Truth For This Guide

This guide was derived from the current runtime and SDK implementation in:

- `src/GN-app-api/handler/controller/handler/cloudScript/AddFunctionRequestHandler.ts`
- `src/GN-app-api/handler/controller/handler/cloudScript/EditFunctionRequestHandler.ts`
- `src/GN-app-api/handler/controller/handler/cloudScript/GetFunctionRequestHandler.ts`
- `src/GN-app-api/handler/controller/handler/cloudScript/GetFunctionsRequestHandler.ts`
- `src/GN-app-api/handler/controller/handler/cloudScript/ExecuteFunctionRequestHandler.ts`
- `src/GN-app-api/service/CloudScriptService.ts`
- `src/GN-app-api/service/ICloudScriptService.ts`
- `src/GN-startup/cloudScript/templateCloudScript.ts`
- `Runtime/GNNetworkCloudScriptApi.cs`
- `Runtime/Entity/Models/CloudScriptModels.cs`
