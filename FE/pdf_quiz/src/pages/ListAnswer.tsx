import { useState, useEffect } from "react";
import { quizListCheck } from "../api/ApiQuiz";
import { useLocation, useNavigate } from "react-router-dom";

export interface QuizItem {
    difficulty: string;
    question: string;
    options: { [key: string]: string };
    answer: { [key: string]: string };
    description: string;
    userAnswer?: { [key: string]: string };
}

interface LocationState {
    examId: number;
}

export default function ListAnswer() {
    const [quizData, setQuizData] = useState<QuizItem[]>([]); // 퀴즈 데이터를 저장할 상태
    const [quizTitle, setQuizTitle] = useState<string>(""); // 퀴즈 타이틀
    const [userAnswers, setUserAnswers] = useState<string[]>([]); // 유저가 선택한 답안들
    const [quizCount, setQuizCount] = useState<number>(0); // 퀴즈 개수
    const [setTime, setSetTime] = useState<number>(0); // 총 시간
    const [spentTime, setSpentTime] = useState<number>(0);
    const location = useLocation();
    const navigate = useNavigate();
    const { examId } = location.state as LocationState || {};

    useEffect(() => {
        if (examId) {
            const loadQuizData = async () => {
                try {
                    const data = await quizListCheck(examId);
                    const processedQuizResults = data.quizResults.map((quiz: any) => {
                        const parsedOptions = JSON.parse(quiz.options);
                        const parsedAnswer = JSON.parse(quiz.answer);
                        const parsedUserAnswer = quiz.userAnswer
                            ? JSON.parse(quiz.userAnswer)
                            : null;
                        return {
                            ...quiz,
                            options: parsedOptions,
                            answer: parsedAnswer,
                            userAnswer: parsedUserAnswer,
                        };
                    });

                    setQuizTitle(data.title);
                    setQuizData(processedQuizResults);
                    setQuizCount(processedQuizResults.length);
                    setUserAnswers(processedQuizResults.map((quiz: any) => quiz.userAnswer));
                    setSetTime(data.setTime);
                    setSpentTime(data.spentTime);

                    if (userAnswers.length === 0) console.log("User answers are empty");
                    if (setTime === 0) console.log("SetTime is empty");
                    console.log('User setTime:' , setTime)
                } catch (error) {
                    console.error("Failed to load quiz data:", error);
                }
            };

            loadQuizData();
        }
    }, [examId]);

    const handleExitClick = () => {navigate("/mypage");}

    const correctAnswersCount = quizData.reduce((cnt, item) => {
        const userAnswer = item.userAnswer ? Object.keys(item.userAnswer)[0] : null;
        const correctAnswerKey = Object.keys(item.answer)[0];
        if (correctAnswerKey && userAnswer === correctAnswerKey) {
            cnt++;
        }
        return cnt;
    }, 0);

    const formatTime = (timeInSeconds: number) => {
        const hours = Math.floor(timeInSeconds / 3600)
            .toString()
            .padStart(2, "0"); // 두 자리로 표시
        const minutes = Math.floor((timeInSeconds % 3600) / 60)
            .toString()
            .padStart(2, "0");
        const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
        return { hours, minutes, seconds };
    };
    const formattedSpentTime = formatTime(spentTime);

    return (
        <div className="w-screen h-screen flex flex-col bg-white">
            <div className="flex justify-center my-5 text-gray-400 font-bold text-xl">
                {quizTitle}
            </div>
            <div className="flex justify-center h-full">
                <div className="w-3/4 flex flex-col">
                    <div className="h-3/4 border-t-2 border-b-2 border-gray-300 overflow-y-auto">
                        {quizData.map((data, index) => {
                            const userAnswer = data.userAnswer;
                            const userAnswerKey = userAnswer ? Object.keys(userAnswer)[0] : null;
                            const correctAnswerKey = Object.keys(data.answer)[0];
                            const isCorrect = userAnswerKey === correctAnswerKey;
                            return (
                                <div key={index}>
                                    <div className="flex items-center h-10 bg-gray-50 border-t-2 border-b-2 border-gray-300">
                                    <div
                                        className={`flex items-center justify-center flex-grow-0 min-w-[5vw] h-full border-r-2 border-b-1 border-gray-300 font-bold text-gray-100
                                        ${isCorrect ? "bg-green-400" : "bg-red-400"}`}
                                    >
                                        문제 {index + 1}
                                    </div>
                                        <div className="flex-grow ml-4 font-bold">
                                            {data.question}
                                        </div>
                                    </div>
                                    <div className="ml-2 mt-2 font-bold flex justify-between">
                                        <div className="flex flex-col">
                                            {Object.entries(data.options).map(
                                                ([key, value], optionIndex) => {
                                                    const userAnswer = data.userAnswer;
                                                    const userAnswerKey = userAnswer ? Object.keys(userAnswer)[0] : null;
                                                    const correctAnswerKey = Object.keys(data.answer)[0];
                                                    const isUserAnswer = userAnswerKey === key;
                                                    const isCorrect = userAnswerKey === correctAnswerKey;
                                                    return (
                                                        <div
                                                            key={optionIndex}
                                                            className={`mt-2 ${
                                                                isUserAnswer
                                                                    ? isCorrect ? "text-green-600" : "text-red-600" : "text-black"
                                                            }`}
                                                        >
                                                            ({key}) {value}
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                        <div className="text-xs text-orange-400 mr-4 my-2">
                                            난이도 : {data.difficulty}
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="flex justify-start ml-2 mt-2 font-bold text-green-600">
                                            정답 : {correctAnswerKey}
                                        </div>
                                    </div>
                                    <div className="border border-yellow-200 rounded h-[8vh] bg-yellow-50 mt-2 mb-4">
                                        <div className="m-2 text-xs font-bold">
                                            설명 : {data.description}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="h-12 border-b-2 border-gray-300 flex justify-between items-center">
                        <div className="ml-4 font-bold">
                            정답 : {correctAnswersCount} / {quizCount}
                        </div>
                        <div className="mr-4 font-bold">
                            {formattedSpentTime.hours} : {formattedSpentTime.minutes} :{" "}
                            {formattedSpentTime.seconds}
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            className="bg-gray-100 border-2 border-blue-600 text-blue-600 text-m font-bold rounded-full py-2 px-7 mr-2"
                            onClick={handleExitClick}
                        >
                            Exit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
