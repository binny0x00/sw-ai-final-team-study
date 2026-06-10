import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,

    // 쿠키를 주고받기 위해 필요
    withCredentials: true,
});