const apiUrl = process.env.REACT_APP_NGROK_URL;

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

        if (!response.ok) {
            throw new Error(`HTTP 상태 에러 : ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API 요청 중 오류 발생:", error);
        throw error;
    }
};
