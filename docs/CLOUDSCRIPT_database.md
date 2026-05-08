# CLOUDSCRIPT DATABASE

## 1. Mục đích

File này chỉ tập trung vào `database` trong cloud script.

Nếu bạn đang cần tài liệu tổng quan cloud script, xem:

- [CLOUDSCRIPT_USAGE.md](/CLOUDSCRIPT_USAGE.md)

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

| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `runtimeCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema>` | `database.runtimeCollection(collectionName)` |
| `systemCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema>` | `database.systemCollection(collectionName)` |
| `runtimeGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema>` | `database.runtimeGameCollection(collectionName, gameId)` |
| `systemGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema>` | `database.systemGameCollection(collectionName, gameId)` |
| `collection<TSchema extends mongodb.Document = mongodb.Document>(fullCollectionName: string): mongodb.Collection<TSchema>` | `database.collection(fullCollectionName)` |

### Log collection

Dùng khi bạn muốn ghi hoặc đọc log từ log database.

| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `logRuntimeCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema>` | `database.logRuntimeCollection(collectionName)` |
| `logSystemCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string): mongodb.Collection<TSchema>` | `database.logSystemCollection(collectionName)` |
| `logRuntimeGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema>` | `database.logRuntimeGameCollection(collectionName, gameId)` |
| `logSystemGameCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, gameId: string): mongodb.Collection<TSchema>` | `database.logSystemGameCollection(collectionName, gameId)` |
| `logCollection<TSchema extends mongodb.Document = mongodb.Document>(fullCollectionName: string): mongodb.Collection<TSchema>` | `database.logCollection(fullCollectionName)` |

### Collection/index management

Dùng khi bạn cần tạo collection hoặc tạo index.

| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `createCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, options?: mongodb.CreateCollectionOptions): Promise<mongodb.Collection<TSchema>>` | `database.createCollection(collectionName, options?)` |
| `createIndex<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, index: { [k: string]: any }, options?: { [k: string]: any })` | `database.createIndex(fullCollectionName)` |
| `logCreateCollection<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, options?: mongodb.CreateCollectionOptions): Promise<mongodb.Collection<TSchema>>` | `database.logCreateCollection(collectionName, options?)` |
| `logCreateIndex<TSchema extends mongodb.Document = mongodb.Document>(collectionName: string, index: { [k: string]: any }, options?: { [k: string]: any })` | `database.logCreateIndex(fullCollectionName)` |

### for MasterPlayer

| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `createMasterPlayerAsync(rawMasterPlayer: mongodb.WithId<mongodb.Document> & { userId: string; external: ExternalItem; segments: string[]; customDatas: Record<string, DataValueType>; displayName: string; displayNameNormalize: string; avatar: AvatarItem; tsCreate: number; tags: Record<string, string>; playerBan: BanItem; playerDatas: Record<string, DataValueType>; playerCurrencies: Record<string, CurrencyItem>; playerStatistics: Record<string, StatisticsItem>; tsLastLogin: number; ipAddressCreate: string; lastIPDetail: IPDetailItem; countryCode: string; email: string; pushNotifications: PushNotificationItem[];}): Promise<MasterPlayer>` | `database.masterPlayerRepository.createMasterPlayerAsync(rawMasterPlayer)` |
| `loadMasterPlayerAsync(userId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerAsync(userId, masterPlayerFindOptions?)` |
| `loadMasterPlayersWithGoogleAsync(googleIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>>` | `database.masterPlayerRepository.loadMasterPlayersWithGoogleAsync(googleIds, masterPlayerFindOptions?)` |
| `loadMasterPlayersWithGooglePlayGameServiceAsync(playerIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>>` | `database.masterPlayerRepository.loadMasterPlayersWithGooglePlayGameServiceAsync(playerIds, masterPlayerFindOptions?)` |
| `loadMasterPlayersWithGameCenterAsync(playerIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>>` | `database.masterPlayerRepository.loadMasterPlayersWithGameCenterAsync(playerIds, masterPlayerFindOptions?)` |
| `loadMasterPlayersWithFacebookAsync(facebookIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>>` | `database.masterPlayerRepository.loadMasterPlayersWithFacebookAsync(facebookIds, masterPlayerFindOptions?)` |
| `loadMasterPlayersWithAppleAsync(appleIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>>` | `database.masterPlayerRepository.loadMasterPlayersWithAppleAsync(appleIds, masterPlayerFindOptions?)` |
| `loadMasterPlayersWithGenericServiceAsync(genericService: string, genericIds: string[], masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>>` | `database.masterPlayerRepository.loadMasterPlayersWithGenericServiceAsync(genericService, genericIds, masterPlayerFindOptions?)` |
| `loadMasterPlayersWithSegmentAsync(segment: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>>` | `database.masterPlayerRepository.loadMasterPlayersWithSegmentAsync(segment, skip, limit, masterPlayerFindOptions?)` |
| `loadMasterPlayersWithTagAsync(key: string, value: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>>` | `database.masterPlayerRepository.loadMasterPlayersWithTagAsync(key, value, skip, limit, masterPlayerFindOptions?)` |
| `loadMasterPlayerWithDisplayNameAsync(displayName: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerWithDisplayNameAsync(displayName, masterPlayerFindOptions?)` |
| `loadMasterPlayersWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>>` | `database.masterPlayerRepository.loadMasterPlayersWithDisplayNameNormalizeRegexAsync(keyword, skip, limit, masterPlayerFindOptions?)` |
| `loadMasterPlayersLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, direction: -1 \| 1, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>>` | `database.masterPlayerRepository.loadMasterPlayersLeaderboardWithStatisticsAsync(key, skip, limit, direction, masterPlayerFindOptions?)` |
| `loadMasterPlayersLeaderboardWithStatisticsAllAsync(key: string, direction: -1 \| 1, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>>` | `database.masterPlayerRepository.loadMasterPlayersLeaderboardWithStatisticsAllAsync(key, direction, masterPlayerFindOptions?)` |
| `loadMasterPlayersLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>>` | `database.masterPlayerRepository.loadMasterPlayersLeaderboardWithCurrenciesAsync(key, skip, limit, masterPlayerFindOptions?)` |
| `loadMasterPlayersLeaderboardWithLastLoginAsync(skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>>` | `database.masterPlayerRepository.loadMasterPlayersLeaderboardWithLastLoginAsync(skip, limit, masterPlayerFindOptions?)` |
| `loadMasterPlayersLeaderboardWithCreateAsync(skip: number, limit: number, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<Array<MasterPlayer>>` | `database.masterPlayerRepository.loadMasterPlayersLeaderboardWithCreateAsync(skip, limit, masterPlayerFindOptions?)` |
| `loadPositionMasterPlayerLeaderboardWithStatisticsAsync(key: string, userId: string, initialValue: number, direction: -1 \| 1): Promise<number>` | `database.masterPlayerRepository.loadPositionMasterPlayerLeaderboardWithStatisticsAsync(key, userId, initialValue, direction)` |
| `loadMasterPlayerByCustomDeviceIdAsync(customDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByCustomDeviceIdAsync(customDeviceId, masterPlayerFindOptions?)` |
| `loadMasterPlayerByAndroidDeviceIdAsync(androidDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByAndroidDeviceIdAsync(androidDeviceId, masterPlayerFindOptions?)` |
| `loadMasterPlayerByiOSDeviceIdAsync(iOSDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByiOSDeviceIdAsync(iOSDeviceId, masterPlayerFindOptions?)` |
| `loadMasterPlayerByWindowsPhoneDeviceIdAsync(windowsPhoneDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByWindowsPhoneDeviceIdAsync(windowsPhoneDeviceId, masterPlayerFindOptions?)` |
| `loadMasterPlayerByWindowsDeviceIdAsync(windowsDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByWindowsDeviceIdAsync(windowsDeviceId, masterPlayerFindOptions?)` |
| `loadMasterPlayerByLinuxDeviceIdAsync(linuxDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByLinuxDeviceIdAsync(linuxDeviceId, masterPlayerFindOptions?)` |
| `loadMasterPlayerByMacOSDeviceIdAsync(macOSDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByMacOSDeviceIdAsync(macOSDeviceId, masterPlayerFindOptions?)` |
| `loadMasterPlayerByEditorDeviceIdAsync(editorDeviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByEditorDeviceIdAsync(editorDeviceId, masterPlayerFindOptions?)` |
| `loadMasterPlayerByAccountUsernameAsync(username: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByAccountUsernameAsync(username, masterPlayerFindOptions?)` |
| `loadMasterPlayerByCustomIdAsync(customId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByCustomIdAsync(customId, masterPlayerFindOptions?)` |
| `loadMasterPlayerByAppleAsync(appleId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByAppleAsync(appleId, masterPlayerFindOptions?)` |
| `loadMasterPlayerByGoogleAsync(googleId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByGoogleAsync(googleId, masterPlayerFindOptions?)` |
| `loadMasterPlayerByGooglePlayGameServiceAsync(playerId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByGooglePlayGameServiceAsync(playerId, masterPlayerFindOptions?)` |
| `loadMasterPlayerByGameCenterAsync(playerId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByGameCenterAsync(playerId, masterPlayerFindOptions?)` |
| `loadMasterPlayerByFacebookAsync(facebookId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByFacebookAsync(facebookId, masterPlayerFindOptions?)` |
| `loadMasterPlayerByGenericServiceAsync(serviceName: string, serviceId: string, masterPlayerFindOptions?: MasterPlayerFindOptions): Promise<MasterPlayer>` | `database.masterPlayerRepository.loadMasterPlayerByGenericServiceAsync(serviceName, serviceId, masterPlayerFindOptions?)` |
| `insertMasterPlayerCurrencyLogsAsync(requests: { userId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string;}[]): Promise<void>` | `database.masterPlayerRepository.insertMasterPlayerCurrencyLogsAsync(requests)` |
| `insertMasterPlayerStatisticsLogsAsync(requests: { userId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string;}[]): Promise<void>` | `database.masterPlayerRepository.insertMasterPlayerStatisticsLogsAsync(requests)` |
| `loadMasterPlayerStatisticsLogAsync(filter: {}, limit: number): Promise<mongodb.FindCursor<mongodb.WithId<mongodb.Document>>>` | `database.masterPlayerRepository.loadMasterPlayerStatisticsLogAsync(filter, limit)` |
| `loadMasterPlayerCurrencyLogAsync(filter: {}, limit: number): Promise<mongodb.FindCursor<mongodb.WithId<mongodb.Document>>>` | `database.masterPlayerRepository.loadMasterPlayerCurrencyLogAsync(filter, limit)` |

có thể tham khảo thêm
[MasterPlayerRepository.d.ts](/dist/GN-library/xdatabase/lib/MasterPlayerRepository.d.ts)

### for GamePlayer

| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `createGamePlayerAsync(rawGamePlayer: mongodb.WithId<mongodb.Document> & { userId: string; socketId: string; playerCharacters: CharacterItem[]; playerInventories: InventoryItem[]; playerGroups: GroupItem[]; playerFriends: FriendItem[]; segments: string[]; customDatas: Record<string, DataValueType>; displayName: string; displayNameNormalize: string; avatar: AvatarItem; tsCreate: number; tags: Record<string, string>; playerBan: BanItem; playerDatas: Record<string, DataValueType>; playerCurrencies: Record<string, CurrencyItem>; playerStatistics: Record<string, StatisticsItem>; tsLastLogin: number; ipAddressCreate: string; countryCode: string;}, gameId: string): Promise<GamePlayer>` | `database.gamePlayerRepository.createGamePlayerAsync(rawGamePlayer, gameId)` |
| `loadGamePlayerAsync(userId: string, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<GamePlayer>` | `database.gamePlayerRepository.loadGamePlayerAsync(userId, gameId, gamePlayerFindOptions?)` |
| `loadGamePlayersWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>>` | `database.gamePlayerRepository.loadGamePlayersWithSegmentAsync(segment, skip, limit, gameId, gamePlayerFindOptions?)` |
| `loadGamePlayersWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>>` | `database.gamePlayerRepository.loadGamePlayersWithTagAsync(key, value, skip, limit, gameId, gamePlayerFindOptions?)` |
| `loadGamePlayerWithDisplayNameAsync(displayName: string, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<GamePlayer>` | `database.gamePlayerRepository.loadGamePlayerWithDisplayNameAsync(displayName, gameId, gamePlayerFindOptions?)` |
| `loadGamePlayersWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>>` | `database.gamePlayerRepository.loadGamePlayersWithDisplayNameNormalizeRegexAsync(keyword, skip, limit, gameId, gamePlayerFindOptions?)` |
| `loadGamePlayersLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, gameId: string, direction: -1 \| 1, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>>` | `database.gamePlayerRepository.loadGamePlayersLeaderboardWithStatisticsAsync(key, skip, limit, gameId, direction, gamePlayerFindOptions?)` |
| `loadGamePlayersLeaderboardWithStatisticsAllAsync(key: string, gameId: string, direction: -1 \| 1, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>>` | `database.gamePlayerRepository.loadGamePlayersLeaderboardWithStatisticsAllAsync(key, gameId, direction, gamePlayerFindOptions?)` |
| `loadGamePlayersLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>>` | `database.gamePlayerRepository.loadGamePlayersLeaderboardWithCreateAsync(skip, limit, gameId, gamePlayerFindOptions?)` |
| `loadGamePlayersLeaderboardWithLastLoginAsync(skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>>` | `database.gamePlayerRepository.loadGamePlayersLeaderboardWithLastLoginAsync(skip, limit, gameId, gamePlayerFindOptions?)` |
| `loadFriendGamePlayersLeaderboardWithStatisticsAsync(friendIds: string[], gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>>` | `database.gamePlayerRepository.loadFriendGamePlayersLeaderboardWithStatisticsAsync(friendIds, gameId, gamePlayerFindOptions?)` |
| `loadGamePlayersLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, gameId: string, gamePlayerFindOptions?: GamePlayerFindOptions): Promise<Array<GamePlayer>>` | `database.gamePlayerRepository.loadGamePlayersLeaderboardWithCurrenciesAsync(key, skip, limit, gameId, gamePlayerFindOptions?)` |
| `loadPositionGamePlayerLeaderboardWithStatisticsAsync(key: string, userId: string, gameId: string, initialValue: number, direction: -1 \| 1): Promise<number>` | `database.gamePlayerRepository.loadPositionGamePlayerLeaderboardWithStatisticsAsync(key, userId, gameId, initialValue, direction)` |
| `removeGamePlayerSocketId(userId: string, gameId: string): Promise<void>` | `database.gamePlayerRepository.removeGamePlayerSocketId(userId, gameId)` |
| `insertGamePlayerStatisticsLogsAsync(requests: { userId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string;}[], gameId: string): Promise<void>` | `database.gamePlayerRepository.insertGamePlayerStatisticsLogsAsync(requests, gameId)` |
| `insertGamePlayerCurrencyLogsAsync(requests: { userId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string;}[], gameId: string): Promise<void>` | `database.gamePlayerRepository.insertGamePlayerCurrencyLogsAsync(requests, gameId)` |
| `loadGamePlayerStatisticsLogAsync(filter: {}, gameId: string, limit: number): Promise<mongodb.FindCursor<mongodb.WithId<mongodb.Document>>>` | `database.gamePlayerRepository.loadGamePlayerStatisticsLogAsync(filter, gameId, limit)` |
| `loadGamePlayerCurrencyLogAsync(filter: {}, gameId: string, limit: number): Promise<mongodb.FindCursor<mongodb.WithId<mongodb.Document>>>` | `database.gamePlayerRepository.loadGamePlayerCurrencyLogAsync(filter, gameId, limit)` |

có thể tham khảo thêm
[GamePlayerRepository.d.ts](/dist/GN-library/xdatabase/lib/GamePlayerRepository.d.ts)

### for CharacterPlayer

| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `createCharacterPlayerAsync(rawCharacterPlayer: mongodb.WithId<mongodb.Document> & { characterId: string; catalogId: string; owner: OwnerItem; playerCharacters: CharacterItem[]; removeStatus: RemoveStatusItem; playerInventories: InventoryItem[]; playerGroups: GroupItem[]; playerFriends: FriendItem[]; playerBan: BanItem; playerCurrencies: Record<string, CurrencyItem>; playerStatistics: Record<string, StatisticsItem>; playerDatas: Record<string, DataValueType>; ipAddressCreate: string; countryCode: string; tsLastLogin: number; segments: string[]; customDatas: Record<string, DataValueType>; tsCreate: number; displayName: string; displayNameNormalize: string; avatar: AvatarItem; tags: Record<string, string>;}, gameId: string, session?: mongodb.ClientSession): Promise<CharacterPlayer>` | `database.characterPlayerRepository.createCharacterPlayerAsync(rawCharacterPlayer, gameId, session?)` |
| `loadCharacterPlayerAsync(characterId: string, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<CharacterPlayer>` | `database.characterPlayerRepository.loadCharacterPlayerAsync(characterId, gameId, characterPlayerFindOptions?)` |
| `loadCharacterPlayersWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>>` | `database.characterPlayerRepository.loadCharacterPlayersWithSegmentAsync(segment, skip, limit, gameId, characterPlayerFindOptions?)` |
| `loadCharacterPlayersWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>>` | `database.characterPlayerRepository.loadCharacterPlayersWithTagAsync(key, value, skip, limit, gameId, characterPlayerFindOptions?)` |
| `loadCharacterPlayerWithDisplayNameAsync(displayName: string, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<CharacterPlayer>` | `database.characterPlayerRepository.loadCharacterPlayerWithDisplayNameAsync(displayName, gameId, characterPlayerFindOptions?)` |
| `loadCharacterPlayersWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>>` | `database.characterPlayerRepository.loadCharacterPlayersWithDisplayNameNormalizeRegexAsync(keyword, skip, limit, gameId, characterPlayerFindOptions?)` |
| `loadCharacterPlayersLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, direction: -1 \| 1, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>>` | `database.characterPlayerRepository.loadCharacterPlayersLeaderboardWithStatisticsAsync(key, skip, limit, catalogId, gameId, direction, characterPlayerFindOptions?)` |
| `loadCharacterPlayersLeaderboardWithStatisticsAllAsync(key: string, catalogId: string, gameId: string, direction: -1 \| 1, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>>` | `database.characterPlayerRepository.loadCharacterPlayersLeaderboardWithStatisticsAllAsync(key, catalogId, gameId, direction, characterPlayerFindOptions?)` |
| `loadCharacterPlayersLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>>` | `database.characterPlayerRepository.loadCharacterPlayersLeaderboardWithCreateAsync(skip, limit, gameId, characterPlayerFindOptions?)` |
| `loadCharacterPlayersLeaderboardWithLastLoginAsync(skip: number, limit: number, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>>` | `database.characterPlayerRepository.loadCharacterPlayersLeaderboardWithLastLoginAsync(skip, limit, gameId, characterPlayerFindOptions?)` |
| `loadCharacterPlayersLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>>` | `database.characterPlayerRepository.loadCharacterPlayersLeaderboardWithCurrenciesAsync(key, skip, limit, catalogId, gameId, characterPlayerFindOptions?)` |
| `loadPositionCharacterPlayerLeaderboardWithStatisticsAsync(key: string, characterId: string, catalogId: string, gameId: string, initialValue: number, direction: -1 \| 1): Promise<number>` | `database.characterPlayerRepository.loadPositionCharacterPlayerLeaderboardWithStatisticsAsync(key, characterId, catalogId, gameId, initialValue, direction)` |
| `loadFriendCharacterPlayersLeaderboardWithStatisticsAsync(friendIds: string[], gameId: string, characterPlayerFindOptions?: CharacterPlayerFindOptions): Promise<Array<CharacterPlayer>>` | `database.characterPlayerRepository.loadFriendCharacterPlayersLeaderboardWithStatisticsAsync(friendIds, gameId, characterPlayerFindOptions?)` |
| `insertCharacterPlayerStatisticsLogsAsync(requests: { characterId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string;}[], gameId: string): Promise<void>` | `database.characterPlayerRepository.insertCharacterPlayerStatisticsLogsAsync(requests, gameId)` |
| `insertCharacterPlayerCurrencyLogsAsync(requests: { characterId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string;}[], gameId: string): Promise<void>` | `database.characterPlayerRepository.insertCharacterPlayerCurrencyLogsAsync(requests, gameId)` |
| `loadCharacterPlayerStatisticsLogAsync(filter: {}, gameId: string, limit: number): Promise<mongodb.FindCursor<mongodb.WithId<mongodb.Document>>>` | `database.characterPlayerRepository.loadCharacterPlayerStatisticsLogAsync(filter, gameId, limit)` |
| `loadCharacterPlayerCurrencyLogAsync(filter: {}, gameId: string, limit: number): Promise<mongodb.FindCursor<mongodb.WithId<mongodb.Document>>>` | `database.characterPlayerRepository.loadCharacterPlayerCurrencyLogAsync(filter, gameId, limit)` |

có thể tham khảo thêm
[CharacterPlayerRepository.d.ts](/dist/GN-library/xdatabase/lib/CharacterPlayerRepository.d.ts)

### for Inventory

| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `createInventoryAsync(rawInventory: mongodb.WithId<mongodb.Document> & { itemId: string; catalogId: string; classId: string; amount: number; itemType: ItemType; owner: OwnerItem; itemDatas: Record<string, DataValueType>; itemStatistics: Record<string, StatisticsItem>; removeStatus: RemoveStatusItem; segments: string[]; customDatas: Record<string, DataValueType>; tsCreate: number; displayName: string; displayNameNormalize: string; avatar: AvatarItem; tags: Record<string, string>;}, gameId: string, session?: mongodb.ClientSession): Promise<Inventory>` | `database.inventoryRepository.createInventoryAsync(rawInventory, gameId, session?)` |
| `loadInventoryAsync(itemId: string, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Inventory>` | `database.inventoryRepository.loadInventoryAsync(itemId, gameId, inventoryFindOptions?)` |
| `loadInventoriesLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>>` | `database.inventoryRepository.loadInventoriesLeaderboardWithCreateAsync(skip, limit, gameId, inventoryFindOptions?)` |
| `loadInventoriesWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>>` | `database.inventoryRepository.loadInventoriesWithDisplayNameNormalizeRegexAsync(keyword, skip, limit, gameId, inventoryFindOptions?)` |
| `loadInventoriesLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, direction: -1 \| 1, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>>` | `database.inventoryRepository.loadInventoriesLeaderboardWithStatisticsAsync(key, skip, limit, catalogId, gameId, direction, inventoryFindOptions?)` |
| `loadInventoriesLeaderboardWithStatisticsAllAsync(key: string, catalogId: string, gameId: string, direction: -1 \| 1, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>>` | `database.inventoryRepository.loadInventoriesLeaderboardWithStatisticsAllAsync(key, catalogId, gameId, direction, inventoryFindOptions?)` |
| `loadPositionInventoryLeaderboardWithStatisticsAsync(key: string, itemId: string, catalogId: string, gameId: string, initialValue: number, direction: -1 \| 1): Promise<number>` | `database.inventoryRepository.loadPositionInventoryLeaderboardWithStatisticsAsync(key, itemId, catalogId, gameId, initialValue, direction)` |
| `loadInventoriesWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>>` | `database.inventoryRepository.loadInventoriesWithSegmentAsync(segment, skip, limit, gameId, inventoryFindOptions?)` |
| `loadInventoriesWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, inventoryFindOptions?: InventoryFindOptions): Promise<Array<Inventory>>` | `database.inventoryRepository.loadInventoriesWithTagAsync(key, value, skip, limit, gameId, inventoryFindOptions?)` |
| `insertInventoryStatisticsLogAsync(itemId: string, gameId: string, key: string, amount: number, startValue: number, finalValue: number, log: string): Promise<void>` | `database.inventoryRepository.insertInventoryStatisticsLogAsync(itemId, gameId, key, amount, startValue, finalValue, log)` |
| `insertInventoryStatisticsLogsAsync(requests: { itemId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string;}[], gameId: string): Promise<void>` | `database.inventoryRepository.insertInventoryStatisticsLogsAsync(requests, gameId)` |
| `loadInventoryStatisticsLogAsync(filter: {}, gameId: string, limit: number): Promise<mongodb.FindCursor<mongodb.WithId<mongodb.Document>>>` | `database.inventoryRepository.loadInventoryStatisticsLogAsync(filter, gameId, limit)` |

có thể tham khảo thêm
[InventoryRepository.d.ts](/dist/GN-library/xdatabase/lib/InventoryRepository.d.ts)

### for Group

| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `createGroupAsync(rawGroup: mongodb.WithId<mongodb.Document> & { groupId: string; groupType: OwnerType; catalogId: string; members: MemberItem[]; groupDatas: Record<string, DataValueType>; groupCurrencies: Record<string, CurrencyItem>; groupStatistics: Record<string, StatisticsItem>; groupInventories: InventoryItem[]; removeStatus: RemoveStatusItem; segments: string[]; customDatas: Record<string, DataValueType>; tsCreate: number; displayName: string; displayNameNormalize: string; avatar: AvatarItem; tags: Record<string, string>;}, gameId: string, session?: mongodb.ClientSession): Promise<Group>` | `database.groupRepository.createGroupAsync(rawGroup, gameId, session?)` |
| `loadGroupAsync(groupId: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Group>` | `database.groupRepository.loadGroupAsync(groupId, gameId, groupFindOptions?)` |
| `loadGroupsWithSegmentAsync(segment: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>>` | `database.groupRepository.loadGroupsWithSegmentAsync(segment, skip, limit, gameId, groupFindOptions?)` |
| `loadGroupsWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>>` | `database.groupRepository.loadGroupsWithTagAsync(key, value, skip, limit, gameId, groupFindOptions?)` |
| `loadGroupsWithDisplayNameNormalizeRegexAsync(keyword: string, skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>>` | `database.groupRepository.loadGroupsWithDisplayNameNormalizeRegexAsync(keyword, skip, limit, gameId, groupFindOptions?)` |
| `loadGroupsLeaderboardWithStatisticsAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, direction: -1 \| 1, groupFindOptions?: GroupFindOptions): Promise<Array<Group>>` | `database.groupRepository.loadGroupsLeaderboardWithStatisticsAsync(key, skip, limit, catalogId, gameId, direction, groupFindOptions?)` |
| `loadGroupsLeaderboardWithStatisticsAllAsync(key: string, catalogId: string, gameId: string, direction: -1 \| 1, groupFindOptions?: GroupFindOptions): Promise<Array<Group>>` | `database.groupRepository.loadGroupsLeaderboardWithStatisticsAllAsync(key, catalogId, gameId, direction, groupFindOptions?)` |
| `loadGroupsLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>>` | `database.groupRepository.loadGroupsLeaderboardWithCreateAsync(skip, limit, gameId, groupFindOptions?)` |
| `loadGroupsLeaderboardWithCurrenciesAsync(key: string, skip: number, limit: number, catalogId: string, gameId: string, groupFindOptions?: GroupFindOptions): Promise<Array<Group>>` | `database.groupRepository.loadGroupsLeaderboardWithCurrenciesAsync(key, skip, limit, catalogId, gameId, groupFindOptions?)` |
| `loadPositionGroupLeaderboardWithStatisticsAsync(key: string, groupId: string, catalogId: string, gameId: string, initialValue: number, direction: -1 \| 1): Promise<number>` | `database.groupRepository.loadPositionGroupLeaderboardWithStatisticsAsync(key, groupId, catalogId, gameId, initialValue, direction)` |
| `loadGroupMessagesAsync(groupId: string, gameId: string, skip: number, limit: number): Promise<mongodb.FindCursor<mongodb.WithId<mongodb.Document>>>` | `database.groupRepository.loadGroupMessagesAsync(groupId, gameId, skip, limit)` |
| `createGroupMessageAsync(groupId: string, gameId: string, senderId: string, senderType: number, message: string, tsCreate: number): Promise<mongodb.Document>` | `database.groupRepository.createGroupMessageAsync(groupId, gameId, senderId, senderType, message, tsCreate)` |
| `insertGroupStatisticsLogsAsync(requests: { groupId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string;}[], gameId: string): Promise<void>` | `database.groupRepository.insertGroupStatisticsLogsAsync(requests, gameId)` |
| `insertGroupCurrencyLogsAsync(requests: { groupId: string; key: string; amount: number; startValue: number; finalValue: number; tsCreate: number; log: string;}[], gameId: string): Promise<void>` | `database.groupRepository.insertGroupCurrencyLogsAsync(requests, gameId)` |
| `loadGroupStatisticsLogAsync(filter: {}, gameId: string, limit: number): Promise<mongodb.FindCursor<mongodb.WithId<mongodb.Document>>>` | `database.groupRepository.loadGroupStatisticsLogAsync(filter, gameId, limit)` |
| `loadGroupCurrencyLogAsync(filter: {}, gameId: string, limit: number): Promise<mongodb.FindCursor<mongodb.WithId<mongodb.Document>>>` | `database.groupRepository.loadGroupCurrencyLogAsync(filter, gameId, limit)` |

có thể tham khảo thêm
[GroupRepository.d.ts](/dist/GN-library/xdatabase/lib/GroupRepository.d.ts)

### for StoreInventory

| Hàm gốc | Code trong cloudScript như thế nào |
| --- | --- |
| `createStoreInventoryAsync(rawStoreInventory: mongodb.WithId<mongodb.Document> & { storeId: string; storeItems: { catalogId: string; classId: string; amount: number; }[]; storeItemType: StoreItemType; storeCurrencies: { key: string; value: number; }[]; priceCurrencies: { key: string; value: number; }[]; storeDatas: Record<string, DataValueType>; removeStatus: RemoveStatusItem; segments: string[]; customDatas: Record<string, DataValueType>; inAppPurchase: { appleAppStoreId: string; googlePlayStoreId: string; facebookStoreId: string; analyticsPrice: number; }; tsCreate: number; displayName: string; displayNameNormalize: string; avatar: AvatarItem; tags: Record<string, string>;}, gameId: string): Promise<StoreInventory>` | `database.storeInventoryRepository.createStoreInventoryAsync(rawStoreInventory, gameId)` |
| `loadStoreInventoryAsync(storeId: string, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<StoreInventory>` | `database.storeInventoryRepository.loadStoreInventoryAsync(storeId, gameId, storeInventoryFindOptions?)` |
| `getStoreInventoryUsedAsync(storeId: string, gameId: string): Promise<{ storeId: string; useIds: { id: string; type: number; tsCreate: number; }[];}>` | `database.storeInventoryRepository.getStoreInventoryUsedAsync(storeId, gameId)` |
| `insertStoreInventoryUsedAsync(storeId: string, gameId: string, ownerId: string, ownerType: number): Promise<void>` | `database.storeInventoryRepository.insertStoreInventoryUsedAsync(storeId, gameId, ownerId, ownerType)` |
| `removeStoreInventoryUsedAsync(storeId: string, gameId: string, ownerIds: string[]): Promise<void>` | `database.storeInventoryRepository.removeStoreInventoryUsedAsync(storeId, gameId, ownerIds)` |
| `getCountStoreInventoryUsedAsync(storeId: string, gameId: string, ownerId: string): Promise<number>` | `database.storeInventoryRepository.getCountStoreInventoryUsedAsync(storeId, gameId, ownerId)` |
| `loadStoreInventoryByFacebookStoreAsync(productId: string, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<StoreInventory>` | `database.storeInventoryRepository.loadStoreInventoryByFacebookStoreAsync(productId, gameId, storeInventoryFindOptions?)` |
| `loadStoreInventoryByAppleAppStoreAsync(productId: string, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<StoreInventory>` | `database.storeInventoryRepository.loadStoreInventoryByAppleAppStoreAsync(productId, gameId, storeInventoryFindOptions?)` |
| `loadStoreInventoryByGooglePlayStoreAsync(productId: string, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<StoreInventory>` | `database.storeInventoryRepository.loadStoreInventoryByGooglePlayStoreAsync(productId, gameId, storeInventoryFindOptions?)` |
| `loadStoreInventoriesLeaderboardWithCreateAsync(skip: number, limit: number, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<Array<StoreInventory>>` | `database.storeInventoryRepository.loadStoreInventoriesLeaderboardWithCreateAsync(skip, limit, gameId, storeInventoryFindOptions?)` |
| `loadStoreInventoriesWithTagAsync(key: string, value: string, skip: number, limit: number, gameId: string, storeInventoryFindOptions?: StoreInventoryFindOptions): Promise<Array<StoreInventory>>` | `database.storeInventoryRepository.loadStoreInventoriesWithTagAsync(key, value, skip, limit, gameId, storeInventoryFindOptions?)` |
| `insertStoreInventoryLogAsync(storeId: string, gameId: string, id: string, type: number, priceCurrencyStartValues: { key: string; value: number;}[], priceCurrencyAmountValues: { key: string; value: number;}[], priceCurrencyFinalValues: { key: string; value: number;}[], storeCurrencyStartValues: { key: string; value: number;}[], storeCurrencyAmountValues: { key: string; value: number;}[], storeCurrencyFinalValues: { key: string; value: number;}[], storeItemFinalValues: { catalogId: string; classId: string; itemId: string;}[], transactionId: string, storeReceiveType: number, log: string): Promise<void>` | `database.storeInventoryRepository.insertStoreInventoryLogAsync(storeId, gameId, id, type, priceCurrencyStartValues, priceCurrencyAmountValues, priceCurrencyFinalValues, storeCurrencyStartValues, storeCurrencyAmountValues, storeCurrencyFinalValues, storeItemFinalValues, transactionId, storeReceiveType, log)` |
| `getStoreInventoryLogAsync(filter: {}, gameId: string, limit: number): Promise<mongodb.FindCursor<mongodb.WithId<mongodb.Document>>>` | `database.storeInventoryRepository.getStoreInventoryLogAsync(filter, gameId, limit)` |

có thể tham khảo thêm
[StoreInventoryRepository.d.ts](/dist/GN-library/xdatabase/lib/StoreInventoryRepository.d.ts)

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

- Nếu cần audit/business log bền vững, dùng `database.insert...LogAsync(...)` hoặc collection log phù hợp, không dựa vào `functionLogs`.

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
