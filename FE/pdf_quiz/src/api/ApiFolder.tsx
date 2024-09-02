import { apiRequest } from './ApiClient';

// 폴더 목록 가져오기
export const fetchFolders = async () => {
    return apiRequest(`/folders`, {
        method: 'GET',
    });
};
// 폴더 데이터 가져오기
export const fetchFolderQuizzes = async (folderId: number | null) => {
    return apiRequest(`/folder-info?folderId=${folderId}`);
};
// 폴더 생성
export const createFolder = async (folderName: string) => {
    const response = await apiRequest(`/folders`, {
        method: 'POST',
        body: JSON.stringify({ folderName }),
    });

    console.log('Create folder name:', response.folderId, folderName);
    return {
        id: response.folderId,
        name: response.folderName || folderName,
        isEditing: false,
    };
};
// 폴더 이름 수정
export const updateFolderName = async (folderId: number, newName: string) => {
    return apiRequest(`/folders?folderId=${folderId}`, {
        method: 'PUT',
        body: JSON.stringify({ folderName: newName }),
    });
};
// 폴더 삭제
export const deleteFolder = async (folderId: number) => {
    return apiRequest(`/folders?folderId=${folderId}`, {
        method: 'DELETE',
    });
};