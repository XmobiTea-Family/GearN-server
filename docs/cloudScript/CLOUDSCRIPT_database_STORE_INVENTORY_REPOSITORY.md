# CLOUDSCRIPT DATABASE STORE_INVENTORY_REPOSITORY

## 1. Mục đích

File này chỉ tập trung vào `database.storeInventoryRepository` trong cloud script.

## 2. Các hàm

<!-- prettier-ignore -->
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
[StoreInventoryRepository.d.ts](dist/GN-library/xdatabase/lib/StoreInventoryRepository.d.ts)
