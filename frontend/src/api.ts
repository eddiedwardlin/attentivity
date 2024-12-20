import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const apiURL = "seashell-app-57l2v.ondigitalocean.app";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : apiURL,
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);

        if (token && !config.url?.includes('/users/register') && !config.url?.includes('/users/login')) { // Append access token if not registering or logging in
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

export default api;