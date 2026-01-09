import axios from "axios";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { useAuthStore } from "~/auth/authStore";

export const getAxiosWithAuthInterceptor = (baseUrl: string) => {
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

export const getStompAuthenticated = (accessToken: string) : Client => {
    const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:1324/ws'),
        connectHeaders: {
            Authorization: `Bearer ${accessToken}`
        },
        debug: (str) => {
            console.log(str);
        },
        onConnect: () => {
            console.log("STOMP connected");
        },

    });
    client.activate();
    return client;
};