/**
 * Avatar reference attached to an entity (player, group, store...).
 * Stores both the avatar source kind and its concrete value so the client can render the picture from the right source.
 */
export interface AvatarItem {
	/** Avatar source kind (e.g. 1 = uploaded image, 2 = preset avatar, 3 = external URL). The client uses this to pick the rendering strategy. */
	type: number;
	/** Avatar value matching `type` (image URL, preset avatar id, or stored file path). */
	value: string;
}
