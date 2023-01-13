export interface IWeb3Service {
    getPublicAddress(message: string, signature: string): string;
    isMatch(message: string): boolean;
    getRandomMessage(): string;

}
