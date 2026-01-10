import { AxiosRequestConfig } from 'axios';
declare class APIClient {
    private client;
    constructor();
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
}
export declare const apiClient: APIClient;
export default apiClient;
//# sourceMappingURL=client.d.ts.map