import { apiRequest } from './ApiClient';

// 폴더별 퀴즈 리스트 가져오기
export const fetchFolderQuizzes = async (folderId: number | null) => {
    //👇 타입스크립트 에러 방지용 추후 해당 변수가 필요 여부에 따라 삭제 또는 수정해주세요
    console.log(folderId)
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
export const saveQuizData = async (quizTitle: string, setTime: number, spentTime: number, exams: { quizId: number, answer: string, correct: boolean }[]) => {
    const dataToSend = {
        title: quizTitle,
        setTime: setTime,
        spentTime: spentTime,
        exam: exams
    };

    return apiRequest(`/exams`, {
        method: 'POST',
        body: JSON.stringify(dataToSend),
    });
};

// 정답페이지 퀴즈 데이터 가져오기
export const fetchQuizData = async () => {
    return apiRequest(`/quiz`);
};
