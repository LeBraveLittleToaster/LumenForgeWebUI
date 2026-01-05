import axios from "axios";
import { useAuthStore } from "~/auth/authStore";

export const getAxiosWithAuthInterceptor = (baseUrl:string) => {
    const authenticatedAxios = axios.create({
        baseURL: baseUrl
    });

    authenticatedAxios.interceptors.request.use(async (config) => {
        const { refreshToken } = useAuthStore.getState();
        await refreshToken(30).catch(() => false);

        const { token } = useAuthStore.getState();
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    });
    return authenticatedAxios;
};
