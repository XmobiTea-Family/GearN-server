# CLOUDSCRIPT DATABASE

## 1. Mục đích

File này chỉ tập trung vào `database` trong cloud script.

Nếu bạn đang cần tài liệu tổng quan cloud script, xem:

- [CLOUDSCRIPT_USAGE.md](../CLOUDSCRIPT_USAGE.md)

## 2. Khi nào dùng `database`

Dùng `database` khi:

- Bạn cần đọc hoặc ghi MongoDB nội bộ của GearN.
- Bạn cần query dữ liệu game theo đúng schema hiện tại.
- Bạn cần dùng helper có sẵn của `xDatabase` như `gamePlayerRepository.loadGamePlayerAsync`, `groupRepository.loadGroupAsync`, `gamePlayerRepository.insertGamePlayerStatisticsLogsAsync`.
- Bạn cần làm việc với runtime data, system data, meta data, hoặc log database.

Không nên dùng `database` khi:

- Bạn chỉ cần gọi API ngoài hệ thống. Trường hợp đó dùng `http`.
- Bạn chỉ cần gửi realtime event tới client. Trường hợp đó dùng `socket`.
- Bạn chỉ cần gửi email. Trường hợp đó dùng `mail`.

## 3. Reference source

Đọc theo thứ tự này:

1. [CloudScriptDatabase.ts](../src/GN-startup/cloudScript/CloudScriptDatabase.ts)
2. [xDatabase.ts](../src/GN-library/xdatabase/lib/xDatabase.ts)
3. [MongoObject.ts](../src/GN-library/xdatabase/lib/entity/pro/MongoObject.ts)
4. [DataObjectBase.ts](../src/GN-library/xdatabase/lib/entity/pro/DataObjectBase.ts)
5. [GamePlayer.ts](../src/GN-library/xdatabase/lib/entity/pro/GamePlayer.ts)
6. [GamePlayerBase.ts](../src/GN-library/xdatabase/lib/entity/pro/GamePlayerBase.ts)
7. [Group.ts](../src/GN-library/xdatabase/lib/entity/pro/Group.ts)
8. [StoreInventory.ts](../src/GN-library/xdatabase/lib/entity/pro/StoreInventory.ts)
9. [UploadFileInfo.ts](../src/GN-library/xdatabase/lib/entity/pro/UploadFileInfo.ts)

## 4. `database` thực chất là gì

Trong cloud script:

- `database` là instance của `CloudScriptDatabase`
- `CloudScriptDatabase` chỉ kế thừa `xDatabase`
- nghĩa là toàn bộ method public của `xDatabase` đều dùng được trong cloud script

## 5. Các nhóm method chính

### Raw collection

- `database.runtimeCollection(collectionName)`
- `database.metaCollection(collectionName)`
- `database.systemCollection(collectionName)`
- `database.runtimeGameCollection(collectionName, gameId)`
- `database.metaGameCollection(collectionName, gameId)`
- `database.systemGameCollection(collectionName, gameId)`
- `database.collection(fullCollectionName)`

Dùng khi bạn muốn thao tác MongoDB native collection trực tiếp.

### Log collection

- `database.logRuntimeCollection(collectionName)`
- `database.logMetaCollection(collectionName)`
- `database.logSystemCollection(collectionName)`
- `database.logRuntimeGameCollection(collectionName, gameId)`
- `database.logMetaGameCollection(collectionName, gameId)`
- `database.logSystemGameCollection(collectionName, gameId)`
- `database.logCollection(fullCollectionName)`

Dùng khi bạn muốn ghi hoặc đọc log từ log database.

### Collection/index management

- `database.createCollection(collectionName)`
- `database.createIndex(collectionName, index, options)`
- `database.logCreateCollection(collectionName)`
- `database.logCreateIndex(collectionName, index, options)`
- `database.getDb()`
- `database.getLogDb()`

Dùng khi bạn cần tạo collection hoặc tạo index.

### CloudScript execute log

- `log` là tham số thứ 3 của handler: `async (args, context, log) => { ... }`.
- Đây không phải global logger, không phải `console.log`, và không ghi trực tiếp vào log database.
- Không bắt buộc gọi `log` trong mỗi function. Chỉ dùng khi cần debug số liệu, trace luồng đi, hoặc kiểm tra payload tạm thời.
- Runtime chỉ capture khi gọi đúng tham số này: `log(value)`.
- Giá trị log được lưu bằng `JSON.stringify(value)` và trả về caller qua `functionLogs` dưới dạng mảng string.
- Chỉ log dữ liệu JSON-safe. Object vòng tham chiếu sẽ làm function lỗi.
- Nếu cần audit/business log bền vững, dùng `database.insert...LogAsync(...)` hoặc collection log phù hợp, không dựa vào `functionLogs`.

### Entity wrapper

Một số method không trả raw document mà trả object wrapper:

- `database.gamePlayerRepository.loadGamePlayerAsync(...)`
- `database.groupRepository.loadGroupAsync(...)`
- `database.loadInventoryAsync(...)`
- `database.storeInventoryRepository.loadStoreInventoryAsync(...)`
- `database.loadUploadFileInfoAsync(...)`

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
                tsUpdate: Date.now()
            }
        },
        { upsert: true }
    );

    const savedDocument = await sampleCollection.findOne(
        { key: key },
        { projection: { _id: 0 } }
    );

    return {
        gameId: gameId,
        savedDocument: savedDocument
    };
};
```

## 7. Ví dụ database nâng cao

Các handler dưới đây có thể append trực tiếp vào cùng bundle cloud script.

```ts
handlers["dbNamespaceOverview"] = async (args: any, context, log) => {
    const collectionName = typeof args?.collectionName === "string" && args.collectionName.length > 0 ? args.collectionName : "CloudScript.NamespaceDemo";

    const runtimeCollectionName = "Runtime." + collectionName;
    const metaCollectionName = "Meta." + collectionName;
    const systemCollectionName = "System." + collectionName;
    const runtimeGameCollectionName = "Runtime." + gameId + ".CloudScript.NamespaceDemo";
    const metaGameCollectionName = "Meta." + gameId + ".CloudScript.NamespaceDemo";
    const systemGameCollectionName = "System." + gameId + ".CloudScript.NamespaceDemo";

    await database.runtimeCollection(collectionName).updateOne(
        { key: "runtime" },
        {
            $set: {
                updatedByUserId: context.userId,
                tsUpdate: Date.now()
            }
        },
        { upsert: true }
    );

    await database.metaCollection(collectionName).updateOne(
        { key: "meta" },
        {
            $set: {
                updatedByUserId: context.userId,
                tsUpdate: Date.now()
            }
        },
        { upsert: true }
    );

    await database.systemCollection(collectionName).updateOne(
        { key: "system" },
        {
            $set: {
                updatedByUserId: context.userId,
                tsUpdate: Date.now()
            }
        },
        { upsert: true }
    );

    await database.runtimeGameCollection("CloudScript.NamespaceDemo", gameId).updateOne(
        { key: "runtimeGame" },
        {
            $set: {
                updatedByUserId: context.userId,
                tsUpdate: Date.now()
            }
        },
        { upsert: true }
    );

    await database.metaGameCollection("CloudScript.NamespaceDemo", gameId).updateOne(
        { key: "metaGame" },
        {
            $set: {
                updatedByUserId: context.userId,
                tsUpdate: Date.now()
            }
        },
        { upsert: true }
    );

    await database.systemGameCollection("CloudScript.NamespaceDemo", gameId).updateOne(
        { key: "systemGame" },
        {
            $set: {
                updatedByUserId: context.userId,
                tsUpdate: Date.now()
            }
        },
        { upsert: true }
    );

    return {
        runtimeCollectionName: runtimeCollectionName,
        metaCollectionName: metaCollectionName,
        systemCollectionName: systemCollectionName,
        runtimeGameCollectionName: runtimeGameCollectionName,
        metaGameCollectionName: metaGameCollectionName,
        systemGameCollectionName: systemGameCollectionName
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
        indexed: true
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
        hasSegment: gamePlayer.hasSegment(segment)
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
            tagValue: gamePlayer.getTag(tagKey)
        };
    });

    return {
        count: results.length,
        results: results
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
            tsLastUpdate: statistic?.tsLastUpdate ?? null
        };
    });

    return {
        statisticKey: statisticKey,
        results: results
    };
};

handlers["dbInsertGamePlayerLog"] = async (args: any, context, log) => {
    const userId = typeof args?.userId === "string" && args.userId.length > 0 ? args.userId : context.userId;
    const key = requireString(args?.key, "key");
    const amount = typeof args?.amount === "number" ? args.amount : 1;
    const startValue = typeof args?.startValue === "number" ? args.startValue : 0;
    const finalValue = typeof args?.finalValue === "number" ? args.finalValue : startValue + amount;
    const logMessage = typeof args?.logMessage === "string" && args.logMessage.length > 0 ? args.logMessage : "CloudScript statistic log";

    await database.gamePlayerRepository.insertGamePlayerStatisticsLogsAsync([{
        userId, key, amount, startValue, finalValue, log: logMessage, tsCreate: Date.now()
    }], gameId);
    await database.gamePlayerRepository.insertGamePlayerCurrencyLogsAsync([{
        userId, key, amount, startValue, finalValue, log: logMessage, tsCreate: Date.now()
    }], gameId);

    const statisticLogCursor = await database.loadGamePlayerStatisticsLogAsync({ userId: userId, key: key }, gameId, 5);
    const currencyLogCursor = await database.loadGamePlayerCurrencyLogAsync({ userId: userId, key: key }, gameId, 5);
    const statisticLogs = await statisticLogCursor.toArray();
    const currencyLogs = await currencyLogCursor.toArray();

    return {
        userId: userId,
        key: key,
        statisticLogs: statisticLogs,
        currencyLogs: currencyLogs
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
        messages: messages
    };
};

handlers["dbStoreInventoryUsageDemo"] = async (args: any, context, log) => {
    const storeId = requireString(args?.storeId, "storeId");
    const ownerId = typeof args?.ownerId === "string" && args.ownerId.length > 0 ? args.ownerId : context.userId;
    const ownerType = typeof args?.ownerType === "number" ? args.ownerType : OwnerType.GamePlayer;

    await database.insertStoreInventoryUsedAsync(storeId, gameId, ownerId, ownerType);

    const count = await database.storeInventoryRepository.getCountStoreInventoryUsedAsync(storeId, gameId, ownerId);
    const used = await database.storeInventoryRepository.getStoreInventoryUsedAsync(storeId, gameId);

    return {
        count: count,
        used: used
    };
};

handlers["dbUploadFileInfoDemo"] = async (args: any, context, log) => {
    const fileId = requireString(args?.fileId, "fileId");

    const uploadFileInfo = await database.loadUploadFileInfoAsync(fileId);
    if (uploadFileInfo == null) {
        throw new Error("uploadFileInfo not found");
    }

    return {
        fileId: uploadFileInfo.getFileId(),
        userId: uploadFileInfo.getUserId(),
        fileName: uploadFileInfo.getFileName(),
        tsUploadExpire: uploadFileInfo.getTsUploadExpire(),
        tsCreate: uploadFileInfo.getTsCreate()
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
