import { apiRequest } from './ApiClient';
const apiUrl = import.meta.env.VITE_NGROK_URL;

// 마이페이지 프로필 닉네임
export const fetchUserNickname = async () => {
    return apiRequest(`/info`, {
        method: 'GET',
    })
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

// 이메일 인증
export const emailAuth = async (requestData: {
    email: string;
}) => {
    return apiRequest(`/emails/verification-requests?email=${requestData.email}`, {
        method: 'POST',
        // body: JSON.stringify(requestData),
        // headers: {'Content-Type': 'application/json'},
    })
}

// 이메일 인증번호 확인
export const emailAuthCheck = async (requestData: {
    email: string;
    emailCheck: string;
}) => {
    return apiRequest(`/emails/verify-code?email=${requestData.email}&code=${requestData.emailCheck}`, {
        method: 'GET',
        // body: JSON.stringify(requestData),
        // headers: {'Content-Type': 'application/json'},
    })
}

// 아이디 중복 확인
export const idCheck = async () => {
    return apiRequest('', {
        
    })
}

// 내 정보 확인
export const infoUser = async () => {
    return apiRequest(`/info`, {
        method: 'GET',
    })
}

// 내 정보 수정
export const updateInfo = async (userData: {
    userId: string;
    email: string;
    username: string;
    nickname: string;
}) => {
    return apiRequest(`/info`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    })
}

// 비밀번호 수정
export const updatePassword = async (email: string, passwordData: {password: string; passwordConfirm: string}) => {
    const url = `/find-pwd?email=${encodeURIComponent(email)}`;

    const requestData = {
        password: passwordData.password,
        passwordConfirm: passwordData.passwordConfirm,
    };

    console.log('Request URL:', `${apiUrl}${url}`);
    console.log('Request Data:', requestData);

    return apiRequest(url, {
        method: 'PUT',
        body: JSON.stringify(requestData),
    });
}