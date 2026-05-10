export interface xEmailSettings {
    // Stores the send from value used by this contract.
    sendFrom: string;
    // Indicates whether secure.
    secure: boolean;
    // Stores the host value used by this contract.
    host: string;
    // Stores the port value used by this contract.
    port: number;
    // Indicates whether rname should be used.
    username: string;
    // Stores the password value used by this contract.
    password: string;
}
