import { apiRequest } from './ApiClient';

// 마이페이지 프로필 닉네임
export const fetchUserNickname = async () => {
    return apiRequest(`/api/user`);
};

// 로그아웃
export const logoutUser = async () => {
    return apiRequest(`/api/logout`, {
        method: 'POST',
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
    return apiRequest(`/api/signup`, {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {'Content-Type': 'application/json'},
    })
}