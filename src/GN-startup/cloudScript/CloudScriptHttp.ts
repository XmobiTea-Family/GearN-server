import * as axios from "axios";

export class CloudScriptHttp {
	public async get<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.get<T, R, D>(url, config);
	}

	public async delete<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.delete<T, R, D>(url, config);
	}

	public async head<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.head<T, R, D>(url, config);
	}

	public async options<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.options<T, R, D>(url, config);
	}

	public async post<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, data?: any, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.post<T, R, D>(url, data, config);
	}

	public async put<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, data?: any, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.put<T, R, D>(url, data, config);
	}

	public async patch<T = any, R = axios.AxiosResponse<T>, D = any>(url: string, data?: any, config?: axios.AxiosRequestConfig<D>): Promise<R> {
		return await axios.default.patch<T, R, D>(url, data, config);
	}
}
