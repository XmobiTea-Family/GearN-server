import * as axios from "axios";

export class CloudScriptHttp {
	/**
	 * Executes the get workflow asynchronously.
	 * @param url Provides the URL value used by this operation.
	 * @param config Provides the configuration value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async get<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.get<T, R, D>(url, config);
	}

	/**
	 * Executes the delete workflow asynchronously.
	 * @param url Provides the URL value used by this operation.
	 * @param config Provides the configuration value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async delete<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.delete<T, R, D>(url, config);
	}

	/**
	 * Executes the head workflow asynchronously.
	 * @param url Provides the URL value used by this operation.
	 * @param config Provides the configuration value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async head<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.head<T, R, D>(url, config);
	}

	/**
	 * Executes the options workflow asynchronously.
	 * @param url Provides the URL value used by this operation.
	 * @param config Provides the configuration value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async options<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.options<T, R, D>(url, config);
	}

	/**
	 * Executes the post workflow asynchronously.
	 * @param url Provides the URL value used by this operation.
	 * @param data Provides the data value used by this operation.
	 * @param config Provides the configuration value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async post<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, data?: any, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.post<T, R, D>(url, data, config);
	}

	/**
	 * Executes the put workflow asynchronously.
	 * @param url Provides the URL value used by this operation.
	 * @param data Provides the data value used by this operation.
	 * @param config Provides the configuration value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async put<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, data?: any, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.put<T, R, D>(url, data, config);
	}

	/**
	 * Executes the patch workflow asynchronously.
	 * @param url Provides the URL value used by this operation.
	 * @param data Provides the data value used by this operation.
	 * @param config Provides the configuration value used by this operation.
	 * @returns Resolves with the operation result.
	 */
	public async patch<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, data?: any, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.patch<T, R, D>(url, data, config);
	}
}
