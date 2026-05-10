/**
 * Lightweight reference to a character owned by a player.
 * Stored in `playerCharacters` on GamePlayerBase so the player's character list can be inspected without querying the character collection.
 */
export interface CharacterItem {
    /** Globally unique character identifier; used to load the full CharacterPlayer entity when detailed access is needed. */
    characterId: string;
    /** Catalog id describing the character template/class (e.g. warrior, mage). Used to resolve the original character configuration. */
    catalogId: string;
}
