const apiUrl = import.meta.env.VITE_NGROK_URL;
console.log('API URL:', apiUrl);

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('accesstoken');
    // console.log('Using token:', token);

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const headers = {
        ...defaultHeaders,
        ...options.headers
    };

    try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
            credentials: 'include',
            headers: headers,
            ...options,
        });

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
