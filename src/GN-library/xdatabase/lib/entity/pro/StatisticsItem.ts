/**
 * Single numeric statistic (kill count, win count, score...) attached to a player/group/item.
 * The statistic key lives in the surrounding `Map<string, StatisticsItem>`; this entry only holds the value and last-update timestamp.
 */
export interface StatisticsItem {
	/** Current value of the statistic; mutated through changeStatistics-style helpers. */
	value: number;
	/** Epoch ms of the last update; used by periodic leaderboards and recent-change filtering. */
	tsLastUpdate: number
}
