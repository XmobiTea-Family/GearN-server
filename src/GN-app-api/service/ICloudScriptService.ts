export enum ExecuteResponseStatus {
    Ok = 1,
    Exception = 2,
    FunctionNameNotFound = 3,
    VersionInvalid = 4,
    Timeout = 5,
}

export interface ExecuteResult {
    // Stores the stats value used by this contract.
    stats: {
        // Stores the memory used in bytes value used by this contract.
        memoryUsedInBytes: number;
        // Stores the execute time in milliseconds value used by this contract.
        executeTimeInMs: number;
    };
    // Stores the response value used by this contract.
    response: {
        // Stores the status value used by this contract.
        status: ExecuteResponseStatus;
        // Stores the result value used by this contract.
        result: any;
        // Stores the error message value used by this contract.
        errorMessage: string;
    };
    // Stores the logs list used by this contract.
    logs: string[];
}

export interface ICloudScriptService {
    /**
     * Executes the cloud script function.
     * @param userId Indicates whether r ID should be used.
     * @param functionName Provides the function name value used by this operation.
     * @param functionParameters Provides the function parameters value used by this operation.
     * @param version Provides the version value used by this operation.
     * @param customTags Provides the custom tags value used by this operation.
     * @returns Resolves with the operation result.
     */
    executeCloudScriptFunction(userId: string, functionName: string, functionParameters: any, version: string, customTags: { [k: string]: any }): Promise<ExecuteResult>;
    /**
     * Adds the cloud script function.
     * @param script Provides the script value used by this operation.
     * @param isLive Indicates whether live.
     * @param canExecute Indicates whether execute can be performed.
     * @returns Resolves with the operation result.
     */
    addCloudScriptFunction(script: string, isLive: boolean, canExecute: boolean): Promise<{ success: boolean; errorMessage?: string; version?: string }>;
    /**
     * Executes the edit cloud script function workflow.
     * @param version Provides the version value used by this operation.
     * @param isLive Indicates whether live.
     * @param canExecute Indicates whether execute can be performed.
     * @returns Resolves with the operation result.
     */
    editCloudScriptFunction(version: string, isLive: boolean, canExecute: boolean): Promise<{ success: boolean; errorMessage?: string }>;
    /**
     * Returns the cloud script function.
     * @param version Provides the version value used by this operation.
     * @returns Returns the cloud script function.
     */
    getCloudScriptFunction(version: string): Promise<{
        // Stores the script value used by this contract.
        script: string;
        // Indicates whether execute can be performed.
        canExecute: boolean;
        // Indicates whether live.
        isLive: boolean;
        // Stores the timestamp create value used by this contract.
        tsCreate: number;
    }>;
    /**
     * Returns the cloud script functions.
     * @returns Returns the cloud script functions.
     */
    getCloudScriptFunctions(): Array<{ version: string; canExecute: boolean }>;

    /**
     * Returns the latest version.
     * @returns Returns the latest version.
     */
    getLatestVersion(): string;
    /**
     * Returns the live latest version.
     * @returns Returns the live latest version.
     */
    getLiveLatestVersion(): string;
}
