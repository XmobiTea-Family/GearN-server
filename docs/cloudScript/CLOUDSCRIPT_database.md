# CLOUDSCRIPT DATABASE

## 1. Mục đích

File này chỉ tập trung vào `database` trong cloud script.

Nếu bạn đang cần tài liệu tổng quan cloud script, xem:

- [docs/cloudScript/CLOUDSCRIPT_USAGE.md](/docs/cloudScript/CLOUDSCRIPT_USAGE.md)

## 2. Khi nào dùng `database`

Dùng `database` khi:

- Bạn cần đọc hoặc ghi MongoDB nội bộ của GearN.
- Bạn cần query dữ liệu game theo đúng schema hiện tại.
- Bạn cần dùng helper có sẵn của `xDatabase` như `gamePlayerRepository.loadGamePlayerAsync`, `groupRepository.loadGroupAsync`, `gamePlayerRepository.insertGamePlayerStatisticsLogsAsync`.
- Bạn cần làm việc với runtime data, system data, hoặc log database.

Không nên dùng `database` khi:

- Bạn chỉ cần gọi API ngoài hệ thống. Trường hợp đó dùng `http`.
- Bạn chỉ cần gửi realtime event tới client. Trường hợp đó dùng `socket`.
- Bạn chỉ cần gửi email. Trường hợp đó dùng `mail`.

## 3. Reference source

Đọc theo thứ tự này:

1. [CloudScriptDatabase.ts](/dist/GN-startup/cloudScript/CloudScriptDatabase.ts)
2. [xDatabase.d.ts](/dist/GN-library/xdatabase/lib/xDatabase.d.ts)

## 4. `database` thực chất là gì

Trong cloud script:

- `database` là instance của `CloudScriptDatabase`
- `CloudScriptDatabase` chỉ kế thừa `xDatabase`
- nghĩa là toàn bộ method public của `xDatabase` đều dùng được trong cloud script

Wrapper `database` đang expose các method:

### Raw collection

Dùng khi bạn muốn thao tác MongoDB native collection trực tiếp.

<!-- prettier-ignore -->
| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `runtimeCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema>` | `database.runtimeCollection(collectionName)` |
| `systemCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema>` | `database.systemCollection(collectionName)` |
| `runtimeGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema>` | `database.runtimeGameCollection(collectionName, gameId)` |
| `systemGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema>` | `database.systemGameCollection(collectionName, gameId)` |
| `collection<TSchema extends mongodb.Document = mongodb.Document>(fullCollectionName: string): mongodb.Collection<TSchema>` | `database.collection(fullCollectionName)` |

### Log collection

Dùng khi bạn muốn ghi hoặc đọc log từ log database.

<!-- prettier-ignore -->
| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `logRuntimeCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema>` | `database.logRuntimeCollection(collectionName)` |
| `logSystemCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema>` | `database.logSystemCollection(collectionName)` |
| `logRuntimeGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema>` | `database.logRuntimeGameCollection(collectionName, gameId)` |
| `logSystemGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema>` | `database.logSystemGameCollection(collectionName, gameId)` |
| `logCollection<TSchema extends mongodb.Document = mongodb.Document>(fullCollectionName: string): mongodb.Collection<TSchema>` | `database.logCollection(fullCollectionName)` |

### Collection/index management

Dùng khi bạn cần tạo collection hoặc tạo index.

<!-- prettier-ignore -->
| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `createCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, options?: mongodb.CreateCollectionOptions): Promise<mongodb.Collection<TSchema>>` | `database.createCollection(collectionName, options?)` |
| `createIndex<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, index: { [k: string]: any }, options?: { [k: string]: any })` | `database.createIndex(collectionName, index, options?)` |
| `logCreateCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, options?: mongodb.CreateCollectionOptions): Promise<mongodb.Collection<TSchema>>` | `database.logCreateCollection(collectionName, options?)` |
| `logCreateIndex<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, index: { [k: string]: any }, options?: { [k: string]: any })` | `database.logCreateIndex(collectionName, index, options?)` |

### Naming collection khi tạo index

Các helper đọc/ghi như `runtimeGameCollection(collectionName, gameId)` nhận **tên ngắn** của collection. Các helper quản lý collection/index như `createCollection(...)` và `createIndex(...)` nhận **full collection name**.

Quy ước nhanh:

<!-- prettier-ignore -->
| Khi đọc/ghi data | Full collection name tương ứng khi create/index |
| --- | --- |
| `database.runtimeCollection("MyCollection")` | `"Runtime.MyCollection"` |
| `database.systemCollection("MyCollection")` | `"System.MyCollection"` |
| `database.runtimeGameCollection("MyCollection", gameId)` | `"Runtime." + gameId + ".MyCollection"` |
| `database.systemGameCollection("MyCollection", gameId)` | `"System." + gameId + ".MyCollection"` |
| `database.logRuntimeCollection("MyCollection")` | `"Runtime.MyCollection"` trong log DB, dùng `logCreateIndex(...)` |
| `database.logSystemCollection("MyCollection")` | `"System.MyCollection"` trong log DB, dùng `logCreateIndex(...)` |
| `database.logRuntimeGameCollection("MyCollection", gameId)` | `"Runtime." + gameId + ".MyCollection"` trong log DB, dùng `logCreateIndex(...)` |
| `database.logSystemGameCollection("MyCollection", gameId)` | `"System." + gameId + ".MyCollection"` trong log DB, dùng `logCreateIndex(...)` |

Ví dụ nếu code ghi data bằng:

```ts
const messages = database.runtimeGameCollection("DirectChat.Messages", gameId);
```

thì khi tạo index cho cùng collection, truyền full name:

```ts
const messagesName = "Runtime." + gameId + ".DirectChat.Messages";
await database.createIndex(messagesName, { chatId: 1, tsCreate: -1 });
```

Với `database.collection(fullCollectionName)` hoặc `database.logCollection(fullCollectionName)`, caller đã tự truyền full name từ đầu nên dùng lại đúng string đó khi tạo index.

### Some Repository

- nếu cần cloudScript gọi hàm tương tác với `MasterPlayer`, đọc [CLOUDSCRIPT_database_MASTER_PLAYER_REPOSITORY.md](/docs/cloudScript/CLOUDSCRIPT_database_MASTER_PLAYER_REPOSITORY.md)
- nếu cần cloudScript gọi hàm tương tác với `GamePlayer`, đọc [CLOUDSCRIPT_database_GAME_PLAYER_REPOSITORY.md](/docs/cloudScript/CLOUDSCRIPT_database_GAME_PLAYER_REPOSITORY.md)
- nếu cần cloudScript gọi hàm tương tác với `CharacterPlayer`, đọc [CLOUDSCRIPT_database_CHARACTER_PLAYER_REPOSITORY.md](/docs/cloudScript/CLOUDSCRIPT_database_CHARACTER_PLAYER_REPOSITORY.md)
- nếu cần cloudScript gọi hàm tương tác với `Inventory`, đọc [CLOUDSCRIPT_database_INVENTORY_REPOSITORY.md](/docs/cloudScript/CLOUDSCRIPT_database_INVENTORY_REPOSITORY.md)
- nếu cần cloudScript gọi hàm tương tác với `Group`, đọc [CLOUDSCRIPT_database_GROUP_REPOSITORY.md](/docs/cloudScript/CLOUDSCRIPT_database_GROUP_REPOSITORY.md)
- nếu cần cloudScript gọi hàm tương tác với `StoreInventory`, đọc [CLOUDSCRIPT_database_STORE_INVENTORY_REPOSITORY.md](/docs/cloudScript/CLOUDSCRIPT_database_STORE_INVENTORY_REPOSITORY.md)

### Entity wrapper

Một số method không trả raw document mà trả object wrapper:

- `database.masterPlayerRepository.loadMasterPlayerAsync(...)`
- `database.gamePlayerRepository.loadGamePlayerAsync(...)`
- `database.characterPlayerRepository.loadCharacterPlayerAsync(...)`
- `database.groupRepository.loadGroupAsync(...)`
- `database.inventoryRepository.loadInventoryAsync(...)`
- `database.storeInventoryRepository.loadStoreInventoryAsync(...)`

Các object này có getter/setter và hỗ trợ `saveAsync()`.

### Query helper

Ví dụ:

- `database.gamePlayerRepository.loadGamePlayersWithTagAsync(...)`
- `database.gamePlayerRepository.loadGamePlayersWithSegmentAsync(...)`
- `database.gamePlayerRepository.loadGamePlayersLeaderboardWithStatisticsAsync(...)`
- `database.groupRepository.loadGroupsWithTagAsync(...)`
- `database.inventoryRepository.loadInventoriesWithDisplayNameNormalizeRegexAsync(...)`

### Business helper

Ví dụ:

- `database.gamePlayerRepository.insertGamePlayerStatisticsLogsAsync(...)`
- `database.gamePlayerRepository.insertGamePlayerCurrencyLogsAsync(...)`
- `database.groupRepository.createGroupMessageAsync(...)`
- `database.groupRepository.loadGroupMessagesAsync(...)`
- `database.storeInventoryRepository.getStoreInventoryUsedAsync(...)`
- `database.storeInventoryRepository.insertStoreInventoryUsedAsync(...)`

## 5. Lưu ý thực tế

- Nếu cần audit/business log bền vững, dùng `database...insert...LogAsync(...)` hoặc collection log phù hợp, không dựa vào `functionLogs`.

## 6. Raw collection dùng khi nào

Dùng raw collection khi:

- Bạn đang thao tác dữ liệu custom của riêng bạn.
- Bạn không cần wrapper object của GearN.
- Bạn cần dùng API MongoDB chuẩn như `findOne`, `updateOne`, `aggregate`, `bulkWrite`.

Ví dụ tối thiểu:

```ts
const requireString = (value: unknown, fieldName: string): string => {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(fieldName + " is required");
    }

    return value.trim();
};

handlers["dbSaveSample"] = async (args: any, context, log) => {
    const key = requireString(args?.key, "key");
    const value = args?.value ?? null;

    const sampleCollection = database.runtimeGameCollection("CloudScript.Sample", gameId);

    await sampleCollection.updateOne(
        { key: key },
        {
            $set: {
                key: key,
                value: value,
                updatedByUserId: context.userId,
                tsUpdate: Date.now(),
            },
        },
        { upsert: true },
    );

    const savedDocument = await sampleCollection.findOne({ key: key }, { projection: { _id: 0 } });

    return {
        gameId: gameId,
        savedDocument: savedDocument,
    };
};
```

## 7. Ví dụ database nâng cao

Các handler dưới đây có thể append trực tiếp vào cùng bundle cloud script.

```ts
handlers["dbNamespaceOverview"] = async (args: any, context, log) => {
    const collectionName = typeof args?.collectionName === "string" && args.collectionName.length > 0 ? args.collectionName : "CloudScript.NamespaceDemo";

    const runtimeCollectionName = "Runtime." + collectionName;
    const systemCollectionName = "System." + collectionName;
    const runtimeGameCollectionName = "Runtime." + gameId + ".CloudScript.NamespaceDemo";
    const systemGameCollectionName = "System." + gameId + ".CloudScript.NamespaceDemo";

    await database.runtimeCollection(collectionName).updateOne(
        { key: "runtime" },
        {
            $set: {
                updatedByUserId: context.userId,
                tsUpdate: Date.now(),
            },
        },
        { upsert: true },
    );

    await database.systemCollection(collectionName).updateOne(
        { key: "system" },
        {
            $set: {
                updatedByUserId: context.userId,
                tsUpdate: Date.now(),
            },
        },
        { upsert: true },
    );

    await database.runtimeGameCollection("CloudScript.NamespaceDemo", gameId).updateOne(
        { key: "runtimeGame" },
        {
            $set: {
                updatedByUserId: context.userId,
                tsUpdate: Date.now(),
            },
        },
        { upsert: true },
    );

    await database.systemGameCollection("CloudScript.NamespaceDemo", gameId).updateOne(
        { key: "systemGame" },
        {
            $set: {
                updatedByUserId: context.userId,
                tsUpdate: Date.now(),
            },
        },
        { upsert: true },
    );

    return {
        runtimeCollectionName: runtimeCollectionName,
        systemCollectionName: systemCollectionName,
        runtimeGameCollectionName: runtimeGameCollectionName,
        systemGameCollectionName: systemGameCollectionName,
    };
};

handlers["dbCreateCollectionAndIndex"] = async (args: any, context, log) => {
    const collectionName = typeof args?.collectionName === "string" && args.collectionName.length > 0 ? args.collectionName : "Runtime." + gameId + ".CloudScript.IndexDemo";
    const logCollectionName = typeof args?.logCollectionName === "string" && args.logCollectionName.length > 0 ? args.logCollectionName : "Runtime." + gameId + ".CloudScript.IndexDemoLog";

    const normalCollectionExists = await database.getDb().listCollections({ name: collectionName }).hasNext();
    if (!normalCollectionExists) {
        await database.createCollection(collectionName);
    }

    const logCollectionExists = await database.getLogDb().listCollections({ name: logCollectionName }).hasNext();
    if (!logCollectionExists) {
        await database.logCreateCollection(logCollectionName);
    }

    database.createIndex(collectionName, { key: 1 }, { unique: true });
    database.createIndex(collectionName, { tsExpire: 1 }, { expireAfterSeconds: 60 });
    database.logCreateIndex(logCollectionName, { tsCreate: -1 });

    return {
        collectionName: collectionName,
        logCollectionName: logCollectionName,
        indexed: true,
    };
};

handlers["dbLoadAndMutateGamePlayer"] = async (args: any, context, log) => {
    const userId = typeof args?.userId === "string" && args.userId.length > 0 ? args.userId : context.userId;
    const tagKey = typeof args?.tagKey === "string" && args.tagKey.length > 0 ? args.tagKey : "cloudScriptLastEditor";
    const tagValue = typeof args?.tagValue === "string" && args.tagValue.length > 0 ? args.tagValue : context.userId;
    const dataKey = typeof args?.dataKey === "string" && args.dataKey.length > 0 ? args.dataKey : "cloudScriptLastUpdateTs";
    const segment = typeof args?.segment === "string" && args.segment.length > 0 ? args.segment : "cloud-script-demo";

    const gamePlayer = await database.gamePlayerRepository.loadGamePlayerAsync(userId, gameId);
    if (gamePlayer == null) {
        throw new Error("gamePlayer not found");
    }

    if (!gamePlayer.hasSegment(segment)) {
        gamePlayer.addSegment(segment);
    }

    gamePlayer.setTag(tagKey, tagValue);
    gamePlayer.setCustomData(dataKey, Date.now());

    await gamePlayer.saveAsync();

    return {
        userId: gamePlayer.getUserId(),
        displayName: gamePlayer.getDisplayName(),
        tagValue: gamePlayer.getTag(tagKey),
        customData: gamePlayer.getCustomData(dataKey),
        hasSegment: gamePlayer.hasSegment(segment),
    };
};

handlers["dbFindGamePlayersByTag"] = async (args: any, context, log) => {
    const tagKey = requireString(args?.tagKey, "tagKey");
    const tagValue = requireString(args?.tagValue, "tagValue");
    const skip = typeof args?.skip === "number" ? args.skip : 0;
    const limit = typeof args?.limit === "number" ? args.limit : 10;

    const gamePlayers = await database.gamePlayerRepository.loadGamePlayersWithTagAsync(tagKey, tagValue, skip, limit, gameId);

    const results = gamePlayers.map((gamePlayer) => {
        return {
            userId: gamePlayer.getUserId(),
            displayName: gamePlayer.getDisplayName(),
            tsCreate: gamePlayer.getTsCreate(),
            tagValue: gamePlayer.getTag(tagKey),
        };
    });

    return {
        count: results.length,
        results: results,
    };
};

handlers["dbGamePlayerLeaderboard"] = async (args: any, context, log) => {
    const statisticKey = requireString(args?.statisticKey, "statisticKey");
    const skip = typeof args?.skip === "number" ? args.skip : 0;
    const limit = typeof args?.limit === "number" ? args.limit : 10;
    const direction = args?.direction === 1 ? 1 : -1;

    const gamePlayers = await database.gamePlayerRepository.loadGamePlayersLeaderboardWithStatisticsAsync(statisticKey, skip, limit, gameId, direction);

    const results = gamePlayers.map((gamePlayer) => {
        const statistic = gamePlayer.getPlayerStatistics(statisticKey);

        return {
            userId: gamePlayer.getUserId(),
            displayName: gamePlayer.getDisplayName(),
            value: statistic?.value ?? 0,
            tsLastUpdate: statistic?.tsLastUpdate ?? null,
        };
    });

    return {
        statisticKey: statisticKey,
        results: results,
    };
};

handlers["dbInsertGamePlayerLog"] = async (args: any, context, log) => {
    const userId = typeof args?.userId === "string" && args.userId.length > 0 ? args.userId : context.userId;
    const key = requireString(args?.key, "key");
    const amount = typeof args?.amount === "number" ? args.amount : 1;
    const startValue = typeof args?.startValue === "number" ? args.startValue : 0;
    const finalValue = typeof args?.finalValue === "number" ? args.finalValue : startValue + amount;
    const logMessage = typeof args?.logMessage === "string" && args.logMessage.length > 0 ? args.logMessage : "CloudScript statistic log";

    await database.gamePlayerRepository.insertGamePlayerStatisticsLogsAsync(
        [
            {
                userId,
                key,
                amount,
                startValue,
                finalValue,
                log: logMessage,
                tsCreate: Date.now(),
            },
        ],
        gameId,
    );
    await database.gamePlayerRepository.insertGamePlayerCurrencyLogsAsync(
        [
            {
                userId,
                key,
                amount,
                startValue,
                finalValue,
                log: logMessage,
                tsCreate: Date.now(),
            },
        ],
        gameId,
    );

    const statisticLogCursor = await database.gamePlayerRepository.loadGamePlayerStatisticsLogAsync({ userId: userId, key: key }, gameId, 5);
    const currencyLogCursor = await database.gamePlayerRepository.loadGamePlayerCurrencyLogAsync({ userId: userId, key: key }, gameId, 5);
    const statisticLogs = await statisticLogCursor.toArray();
    const currencyLogs = await currencyLogCursor.toArray();

    return {
        userId: userId,
        key: key,
        statisticLogs: statisticLogs,
        currencyLogs: currencyLogs,
    };
};

handlers["dbGroupMessageDemo"] = async (args: any, context, log) => {
    const groupId = requireString(args?.groupId, "groupId");
    const senderId = typeof args?.senderId === "string" && args.senderId.length > 0 ? args.senderId : context.userId;
    const senderType = typeof args?.senderType === "number" ? args.senderType : 1;
    const message = typeof args?.message === "string" && args.message.length > 0 ? args.message : "Hello from cloud script";

    await database.groupRepository.createGroupMessageAsync(groupId, gameId, senderId, senderType, message, Date.now());

    const cursor = await database.groupRepository.loadGroupMessagesAsync(groupId, gameId, 0, 10);
    const messages = await cursor.toArray();

    return {
        groupId: groupId,
        messages: messages,
    };
};

handlers["dbStoreInventoryUsageDemo"] = async (args: any, context, log) => {
    const storeId = requireString(args?.storeId, "storeId");
    const ownerId = typeof args?.ownerId === "string" && args.ownerId.length > 0 ? args.ownerId : context.userId;
    const ownerType = typeof args?.ownerType === "number" ? args.ownerType : OwnerType.GamePlayer;

    await database.storeInventoryRepository.insertStoreInventoryUsedAsync(storeId, gameId, ownerId, ownerType);

    const count = await database.storeInventoryRepository.getCountStoreInventoryUsedAsync(storeId, gameId, ownerId);
    const used = await database.storeInventoryRepository.getStoreInventoryUsedAsync(storeId, gameId);

    return {
        count: count,
        used: used,
    };
};
```

## 8. Các dạng đang được cover trong file này

- Raw namespace collection
- Full collection name
- Create collection và create index
- Log database riêng
- Load entity wrapper rồi `saveAsync()`
- Query theo tag
- Leaderboard theo statistics
- Ghi statistics log và currency log
- Group message runtime data
- Store inventory usage
- Upload file info

## 9. Kết luận ngắn

Nếu bạn chưa chắc nên dùng kiểu nào, chọn theo thứ tự:

1. Dữ liệu custom riêng của bạn: dùng raw collection.
2. Dữ liệu domain của GearN: ưu tiên helper `load...Async(...)` của `xDatabase`.
3. Cần sửa object đã load: dùng setter của wrapper rồi `saveAsync()`.
4. Cần log nghiệp vụ: ưu tiên `insert...LogAsync(...)`.
