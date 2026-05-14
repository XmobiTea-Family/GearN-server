# CLOUDSCRIPT DATABASE GAME_PLAYER_REPOSITORY

## 1. Mục đích

File này chỉ tập trung vào `database.gamePlayerRepository` trong cloud script.

## 2. Các hàm

<!-- prettier-ignore -->
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
[GamePlayerRepository.d.ts](dist/GN-library/xdatabase/lib/GamePlayerRepository.d.ts)
