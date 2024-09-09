import { useState } from "react";
import AnswerExit from "../Modal/answerExit";
import AnswerSave from "../Modal/answerSave";
import { useQuizContext } from "../context/QuizContext";

export interface QuizItem {
  difficulty: string;
  question: string;
  options: { [key: string]: string };
  answer: { [key: string]: string };
  description: string;
  user_answer?: string;
}

export default function Answer() {
  const { title, quizCount, userAnswers, quizData, elapsedTime } =
    useQuizContext();
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [quizTitle] = useState(title);

  const handleSaveClick = async () => {
    setIsSaveModalOpen(true);
  };
  const closeSaveModal = () => setIsSaveModalOpen(false);
  const handleExitClick = () => setIsExitModalOpen(true);
  const closeExitModal = () => setIsExitModalOpen(false);

  const correctAnswersCount = quizData.reduce((cnt, item, index) => {
    const userAnswer = userAnswers[index]?.[0]; // 유저가 선택한 답안
    const correctAnswerKey = Object.keys(item.answer)[0]; // 정답을 찾는 방식 수정
    if (correctAnswerKey && userAnswer === parseInt(correctAnswerKey)) {
      cnt++; // 유저가 맞춘 경우 카운트 증가
    }
    return cnt;
  }, 0);

  return (
    <div className="w-screen h-screen flex flex-col bg-white">
      <div className="flex justify-center my-5 text-gray-400 font-bold text-xl">
        {quizTitle}
      </div>
      <div className="flex justify-center h-full">
        <div className="w-3/4 flex flex-col">
          <div className="h-3/4 border-t-2 border-b-2 border-gray-300 overflow-y-auto">
            {quizData.map((data, index) => {
              const userAnswer = userAnswers[index]?.[0]; // 유저의 답안 가져오기
              const correctAnswerKey = Object.keys(data.answer)[0]; // 정답의 번호
              const isCorrect = userAnswer === parseInt(correctAnswerKey); // 유저의 답과 정답 비교
              return (
                <div key={index}>
                  <div className="flex items-center h-10 bg-gray-50 border-t-2 border-b-2 border-gray-300">
                    <div
                      className={`flex items-center justify-center flex-grow-0 min-w-[5vw] h-full border-r-2 border-b-1 border-gray-300 font-bold text-gray-100
                        ${ isCorrect ? "bg-green-400" : "bg-red-400" }`}
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
                        ([key, value], optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`mt-2 ${
                              userAnswer === parseInt(key) ? isCorrect ? "text-green-600" : "text-red-600" : ""
                            }`}
                          >
                            ({key}) {value}
                          </div>
                        )
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
              시간 : {elapsedTime?.hours || "00"}:{elapsedTime?.minutes || "00"}
              :{elapsedTime?.seconds || "00"}
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              className="bg-gray-100 border-2 border-blue-600 text-blue-600 text-m font-bold rounded-full py-2 px-7 mr-2"
              onClick={handleExitClick}
            >
              Exit
            </button>
            <button
              className="bg-blue-600 text-white text-m font-bold rounded-full py-2 px-6"
              onClick={handleSaveClick}
            >
              Save
            </button>
          </div>
          {isExitModalOpen && <AnswerExit onClose={closeExitModal} />}
          {isSaveModalOpen && <AnswerSave onClose={closeSaveModal} />}
        </div>
      </div>
    </div>
  );
}
