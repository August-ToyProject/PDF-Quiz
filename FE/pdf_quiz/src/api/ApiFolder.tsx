import { apiRequest } from './ApiClient';

// 폴더 목록 가져오기
export const fetchFolders = async () => {
    return apiRequest(`/folders`);
};
// 폴더 데이터 가져오기
export const fetchFolderQuizzes = async (folderId: number | null) => {
    return apiRequest(`/folders/${folderId}/quizzes`);
};
// 폴더 생성
export const createFolder = async (name: string) => {
    return apiRequest(`/folders`, {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
};
// 폴더 이름 수정
export const updateFolderName = async (folderId: number, newName: string) => {
    return apiRequest(`/folders/${folderId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: newName }),
    });
};
// 폴더 삭제
export const deleteFolder = async (folderId: number) => {
    return apiRequest(`/folders/${folderId}`, {
        method: 'DELETE',
    });
};

// 폴더로 이동
export const moveQuizToFolder = async (quizId: number, folderId: number) => {
    return apiRequest(`/`, {
        method: 'POST',
        body: JSON.stringify({folderId}),
        headers: {'Content-Type': 'application/json'},
    });
};