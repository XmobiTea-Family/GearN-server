# CLOUDSCRIPT DATABASE INVENTORY_REPOSITORY

## 1. Mục đích

File này chỉ tập trung vào `database.inventoryRepository` trong cloud script.

## 2. Các hàm

<!-- prettier-ignore -->
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
[InventoryRepository.d.ts](dist/GN-library/xdatabase/lib/InventoryRepository.d.ts)
