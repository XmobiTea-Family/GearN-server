export interface GameCenterAuth {
    // Stores the player ID value used by this contract.
    playerId: string;
    // Stores the name value used by this contract.
    name: string;
    // Stores the public key URL value used by this contract.
    publicKeyUrl: string;
    // Stores the signature value used by this contract.
    signature: string;
    // Stores the salt value used by this contract.
    salt: string;
    // Stores the timestamp value used by this contract.
    timestamp: number;
}

export interface IGameCenterService {
    /**
     * Executes the verify token workflow.
     * @param auth Provides the auth value used by this operation.
     * @returns Resolves with the operation result.
     */
    verifyToken(auth: GameCenterAuth): Promise<{ [k: string]: any }>;
}
