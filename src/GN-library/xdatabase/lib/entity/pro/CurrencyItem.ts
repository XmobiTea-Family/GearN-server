/**
 * Single currency holding owned by a player/group/store.
 * Only the current balance lives here; the currency kind is identified by the key inside the surrounding `Map<string, CurrencyItem>`.
 */
export interface CurrencyItem {
    /** Current balance for this currency. Mutated through changeCurrency-style helpers. */
    value: number;
}
