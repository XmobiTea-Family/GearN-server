export enum ExecuteResponseStatus {
	Ok = 1,
	Exception = 2,
	FunctionNameNotFound = 3,
	VersionInvalid = 4,
	Timeout = 5,

}

export interface ExecuteResult {
	stats: {
		memoryUsedInBytes: number,
		executeTimeInMs: number,
	},
	response: {
		status: ExecuteResponseStatus,
		result: any,
		errorMessage: string,
	},
	logs: string[],
}

export interface ICloudScriptService {
	executeCloudScriptFunction(userId: string, functionName: string, functionParameters: any, version: string, customTags: { [k: string]: any }): Promise<ExecuteResult>;
	addCloudScriptFunction(script: string, isLive: boolean, canExecute: boolean): Promise<{ success: boolean, errorMessage?: string, version?: string }>;
	editCloudScriptFunction(version: string, isLive: boolean, canExecute: boolean): Promise<{ success: boolean, errorMessage?: string }>;
	getCloudScriptFunction(version: string): Promise<{
		script: string,
		canExecute: boolean,
		isLive: boolean,
		tsCreate: number
	}>;
	getCloudScriptFunctions(): Array<{ version: string, canExecute: boolean }>;

	getLatestVersion(): string;
	getLiveLatestVersion(): string;
}
