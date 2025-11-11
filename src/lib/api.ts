import { useAuth } from './auth';
import { API_BASE } from './config';

export function useApi() {
    const { getToken } = useAuth();

    const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
        const token = await getToken();
        const headers = new Headers(options.headers);
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const res = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers,
        });

        if (res.status === 401 || res.status === 403) {
            // Handle unauthorized (maybe redirect to login if not already handled by AuthProvider)
            console.error("Unauthorized access");
        }

        return res;
    };

    return { fetch: authenticatedFetch };
}
