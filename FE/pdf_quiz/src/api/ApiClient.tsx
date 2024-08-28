const apiUrl = import.meta.env.VITE_NGROK_URL;
console.log('API URL:', apiUrl);

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });
        const token = response.headers.get('Authorization')?.replace('Bearer ', '');
        if (token) {
            localStorage.setItem('accesstoken', token);
            console.log('Token received:', token);
        }

        if (!response.ok) {
            throw new Error(`HTTP 상태 에러 : ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        console.error("API 요청 중 오류 발생:", error);
        throw error;
    }
};
