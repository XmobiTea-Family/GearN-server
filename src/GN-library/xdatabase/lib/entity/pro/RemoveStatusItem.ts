/**
 * Soft-delete marker attached to an entity.
 * When present, the entity is treated as deleted (excluded from business queries) but kept in the database for audit/recovery.
 */
export interface RemoveStatusItem {
	/** Epoch ms at which the entity was marked as removed; serves as the anchor for any later hard-delete sweep. */
	tsRemove: number;
	/** Why the entity was removed (user action, admin action, policy violation...). Optional. */
	reason?: string;
}
