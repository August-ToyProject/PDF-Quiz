import {useEffect, useState} from 'react';
import AnswerExit from '../Modal/answerExit'; 
import AnswerSave from '../Modal/answerSave'; 
import { fetchQuizData, saveQuizData } from '../api/ApiQuiz';

export interface QuizItem {
    difficulty: string;
    question: string;
    options: string[];
    answer: string;
    explanation: string;
    user_answer?: string;
}

export default function Answer() {

    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [quizTitle, setQuizTitle] = useState('');
    const [userAnswerData, setUserAnswerData] = useState<string[]>([]);
    const [updatedAt, setUpdatedAt] = useState(new Date);
    const [quizData, setQuizData] = useState<QuizItem[]>([]);
    const [examId, setExamId] = useState<string | null>(null);


    const handleSaveClick = async () => {
        if (examId) {
            try {
                await saveQuizData(quizData, examId);
                console.log("퀴즈 데이터가 성공적으로 저장되었습니다.");
            } catch (error) {
                console.error("퀴즈 데이터를 저장하는 중 오류 발생:", error);
            }
        }
        setIsSaveModalOpen(true);
    };
    const closeSaveModal = () => setIsSaveModalOpen(false);
    const handleExitClick = () => setIsExitModalOpen(true);
    const closeExitModal = () => setIsExitModalOpen(false);

    useEffect(() => {
        fetchQuizData()
            .then(data => {
                setQuizTitle(data.title);
                setUserAnswerData(data.submitted_answer);
                
                //👇 타입스크립트 에러 방지용 추후 해당 변수가 필요 여부에 따라 삭제 또는 수정해주세요
                console.log(userAnswerData)
                setUpdatedAt(new Date(data.updated_at));
                setExamId(data.exam_id);

                const quizzes: QuizItem[] = data.quizzes.map((quiz:any, index:number) => ({
                    difficulty: quiz.difficulty,
                    question: quiz.question,
                    options: Object.entries(quiz.options).map(([key, value]) => `${key}) ${value}`),
                    answer: quiz.answer,
                    explanation: quiz.explanation,
                    user_answer: data.submitted_answer[index],
                }));
                setQuizData(quizzes);
            })
            .catch(error => console.error("데이터를 가져오지 못했습니다.", error));
    }, []);

    const formattedTime = updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const correctAnswers = quizData.filter(item => item.user_answer === item.answer).length;
    const totalQuestions = quizData.length;

    return (
        <div className='w-screen h-screen flex flex-col bg-white'>
            <div className='flex justify-center my-5 text-gray-400 font-bold text-xl'>
                {quizTitle}
            </div>
            <div className='flex justify-center h-full'>
                <div className='w-3/4 flex flex-col'>
                    <div className='h-3/4 border-t-2 border-b-2 border-gray-300 overflow-y-auto'>
                        {quizData.map((data, index) => (
                            <div key={index}>
                                <div className='flex items-center h-10 bg-gray-50 border-t-2 border-b-2 border-gray-300'>
                                    <div className={`flex items-center justify-center flex-grow-0 min-w-[5vw] h-full border-r-2 border-b-1 border-gray-300 font-bold text-gray-100
                                        ${data.user_answer === data.answer ? 'bg-green-400' : 'bg-red-400'}`}>
                                        문제 {index+1}
                                    </div>
                                    <div className='flex-grow ml-4 font-bold'>
                                        {data.question}
                                    </div>
                                </div>
                                <div className='ml-2 mt-2 font-bold flex justify-between'>
                                    <div className='flex flex-col'>
                                        {data.options.map((option, index) => (
                                            <div key={index} className={`mt-2 ${data.user_answer === option.split(') ')[0] ? data.user_answer === data.answer 
                                            ? 'text-green-600' : 'text-red-600': ''}`}>
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                    <div className='text-xs text-orange-400 mr-4 my-2'>
                                        난이도 : {data.difficulty}
                                    </div>
                                </div>
                                <div className='flex justify-between'>
                                    <div className='flex justify-start ml-2 mt-2 font-bold text-green-600'>
                                        정답 : {data.answer}
                                    </div>
                                    {data.user_answer !== data.answer && (
                                        <button className='bg-red-400 rounded-full text-white text-xs mr-2 font-bold p-2'>
                                            오답노트 저장
                                        </button>
                                    )}
                                </div>
                                <div className='border border-yellow-200 rounded h-[8vh] bg-yellow-50 mt-2 mb-4'>
                                    <div className='m-2 text-xs font-bold'>
                                        설명 : {data.explanation}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                    </div>
                    <div className='h-12 border-b-2 border-gray-300 flex justify-between items-center'>
                        <div className='ml-4 font-bold'>
                            정답 : {correctAnswers} / {totalQuestions}
                        </div>
                        <div className='mr-4 font-bold'>
                            시간 : {formattedTime}
                        </div>
                    </div>
                    <div className='flex justify-end mt-4'>
                        <button className='bg-gray-100 border-2 border-blue-600 text-blue-600 text-m font-bold rounded-full py-2 px-7 mr-2' onClick={handleExitClick}>
                            Exit
                        </button>
                        <button className='bg-blue-600 text-white text-m font-bold rounded-full py-2 px-6' onClick={handleSaveClick}>
                            Save
                        </button>
                    </div>
                    {isExitModalOpen && <AnswerExit onClose={closeExitModal} />}
                    {isSaveModalOpen && <AnswerSave onClose={closeSaveModal} />}
                </div>
            </div>          
        </div>
    )
}
