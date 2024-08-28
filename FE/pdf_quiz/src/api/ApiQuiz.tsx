import { apiRequest } from './ApiClient';
import { QuizItem } from '../pages/Answer';

// 마이페이지 퀴즈 리스트 가져오기
export const fetchQuizzes = async () => {
    return apiRequest(`/quizzes`);
};
// 퀴즈 삭제
export const deleteQuiz = async (quizId: number) => {
    return apiRequest(`/quizzes/${quizId}`, {
        method: 'DELETE',
    });
};
// 퀴즈 폴더 이동
export const moveQuizToFolder = async (quizId: number, folderId: number | null) => {
    return apiRequest(`/quizzes/${quizId}/move`, {
        method: 'POST',
        body: JSON.stringify({ folderId }),
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
