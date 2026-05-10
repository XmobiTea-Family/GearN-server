export interface TokenPayload {
    // Indicates whether r ID should be used.
    userId: string;
    // Stores the secret key value used by this contract.
    secretKey: string;
    // Stores the GearN token value used by this contract.
    gnToken: string;
}
