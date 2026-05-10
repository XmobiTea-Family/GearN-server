export interface xThirtPartySettings {
    // Stores the google settings value used by this contract.
    googleSettings?: {
        // Stores the google client ID value used by this contract.
        googleClientId: string;
        // Stores the package ID value used by this contract.
        packageId: string;
        // Stores the public RSA key value used by this contract.
        publicRSAKey: string;
    };
    // Stores the apple settings value used by this contract.
    appleSettings?: {
        // Stores the apple client ID value used by this contract.
        appleClientId: string;
        // Indicates whether sandbox enable.
        sandboxEnable: boolean;
        // Indicates whether suer ID.
        issuerId: string;
        // Stores the key ID value used by this contract.
        keyId: string;
        // Stores the p 8 content value used by this contract.
        p8Content: string;
    };
    // Stores the facebook settings value used by this contract.
    facebookSettings?: {
        // Stores the facebook app ID value used by this contract.
        facebookAppId: string;
        // Stores the package ID value used by this contract.
        packageId: string;
        // Stores the facebook inapp secret value used by this contract.
        facebookInappSecret: string;
        // Stores the facebook app token value used by this contract.
        facebookAppToken: string;
    };
    // Stores the google play game settings value used by this contract.
    googlePlayGameSettings?: {
        // Stores the application ID value used by this contract.
        applicationId: string;
        // Stores the client ID value used by this contract.
        clientId: string;
        // Stores the client secret value used by this contract.
        clientSecret: string;
        // Stores the redirect URI value used by this contract.
        redirectUri: string;
    };
    // Stores the game center settings value used by this contract.
    gameCenterSettings?: {
        // Stores the package ID value used by this contract.
        packageId: string;
    };
}
