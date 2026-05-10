/**
 * Endpoint information of the game server allocated to a Match.
 * Returned to clients after matchmaking succeeds so they can connect directly to the match server.
 */
export interface ServerDetail {
    /** Public IPv4 address the client uses to reach the game server. */
    ipV4Address: string;
    /** Ports exposed by the game server for client connections (each port may serve a distinct purpose). */
    ports: {
        /** Port name used by the client to pick the right channel (e.g. "game", "voice", "telemetry"). */
        name: string;
        /** Public-facing port the client connects to (NAT/port-forwarded from `privatePort`). */
        publicPort: number;
        /** Internal port on the host, kept for system configuration and debugging. */
        privatePort: number;
        /** Port protocol: 1 = TCP (reliable, ordered), 2 = UDP (low latency, no delivery guarantee). */
        protocol: 1 | 2; // 1 = TCP, 2 = UDP
    }[];
}
