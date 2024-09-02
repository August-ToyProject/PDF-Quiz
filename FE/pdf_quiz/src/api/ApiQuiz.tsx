import { apiRequest } from './ApiClient';
import { QuizItem } from '../pages/Answer';

// 폴더별 퀴즈 리스트 가져오기
export const fetchFolderQuizzes = async (folderId: number | null) => {
    return apiRequest(`/exam-info`);
};
// 마이페이지 퀴즈 리스트 가져오기
export const fetchQuizzes = async () => {
    return apiRequest(`/exams-main`);
};
// 퀴즈 삭제
export const deleteQuiz = async (quizId: number) => {
    return apiRequest(`/exams?examId=${quizId}`, {
        method: 'DELETE',
    });
};
// 퀴즈 폴더 이동
export const moveQuizToFolder = async (quizId: number, folderId: number) => {
    return apiRequest(`/exams?examId=${quizId}&folderId=${folderId}`, {
        method: 'PUT',
    });
};

// 퀴즈 데이터 저장
export const saveQuizData = async (quizData: QuizItem[], examId: string) => {
    return apiRequest(`/save/${examId}`, {
        method: 'POST',
        body: JSON.stringify({ quizzes: quizData }),
        headers: { 'Content-Type': 'application/json' }
    });
};

// 정답페이지 퀴즈 데이터 가져오기
export const fetchQuizData = async () => {
    return apiRequest(`/quiz`);
};
