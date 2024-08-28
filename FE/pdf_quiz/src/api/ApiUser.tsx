import { apiRequest } from './ApiClient';

// 마이페이지 프로필 닉네임
export const fetchUserNickname = async () => {
    return apiRequest(`/user`);
};

// 로그아웃
export const logoutUser = async () => {
    const token = localStorage.getItem('accesstoken');
    return apiRequest(`/logout`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
}

// 회원가입
export const signupUser = async (requestData: {
    userId: string;
    email: string;
    username: string;
    nickname: string;
    password: string;
    passwordConfirm: string;
}) => {
    return apiRequest(`/sign-up`, {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {'Content-Type': 'application/json'},
    })
}