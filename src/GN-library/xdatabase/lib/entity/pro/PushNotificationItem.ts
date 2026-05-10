/**
 * Device registration for push notifications belonging to a player.
 * A player may register multiple devices; the server fans push messages out to every active `token` when delivering.
 */
export interface PushNotificationItem {
    /** Internal id for this device registration; used to update or remove the registration later. */
    pushId: string;
    /** Provider-issued device token (FCM/APNs...) — the actual value used to deliver pushes to the device. */
    token: string;
    /** Platform kind (1 = Android/FCM, 2 = iOS/APNs, ...) used to choose the correct push provider when sending. */
    platformType: number;
}
