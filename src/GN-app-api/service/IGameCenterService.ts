export interface GameCenterAuth {
    playerId: string;
    name: string;
    publicKeyUrl: string;
    signature: string;
    salt: string;
    timestamp: number;
}

export interface IGameCenterService {
    verifyToken(auth: GameCenterAuth): Promise<{ [k: string]: any }>;
}
