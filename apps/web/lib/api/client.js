"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const react_1 = require("next-auth/react");
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
class APIClient {
    client;
    constructor() {
        this.client = axios_1.default.create({
            baseURL: `${API_URL}/api/v1`,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.client.interceptors.request.use(async (config) => {
            const session = await (0, react_1.getSession)();
            if (session?.accessToken) {
                config.headers.Authorization = `Bearer ${session.accessToken}`;
            }
            return config;
        }, (error) => Promise.reject(error));
        this.client.interceptors.response.use((response) => response, async (error) => {
            if (error.response?.status === 401) {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        });
    }
    async get(url, config) {
        const response = await this.client.get(url, config);
        return response.data;
    }
    async post(url, data, config) {
        const response = await this.client.post(url, data, config);
        return response.data;
    }
    async put(url, data, config) {
        const response = await this.client.put(url, data, config);
        return response.data;
    }
    async patch(url, data, config) {
        const response = await this.client.patch(url, data, config);
        return response.data;
    }
    async delete(url, config) {
        const response = await this.client.delete(url, config);
        return response.data;
    }
}
exports.apiClient = new APIClient();
exports.default = exports.apiClient;
//# sourceMappingURL=client.js.map