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
  const { title, quizCount, userAnswers, quizData, elapsedTime } = useQuizContext();
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [quizTitle] = useState(title);

  const handleSaveClick = async () => { setIsSaveModalOpen(true); };
  const closeSaveModal = () => setIsSaveModalOpen(false);
  const handleExitClick = () => setIsExitModalOpen(true);
  const closeExitModal = () => setIsExitModalOpen(false);

  const [selectedNotes, setSelectedNotes] = useState<boolean[]>([]); // 오답노트 선택 상태
  const [selectAll, setSelectAll] = useState<boolean>(false); // 전체 선택 상태

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
  
    // 전체 선택/해제에 따라 모든 오답노트 체크박스 업데이트
    setSelectedNotes(new Array(quizData.length).fill(newSelectAll));
  };
  

  const handleNoteSelect = (index: number) => {
    const updatedSelectedNotes = [...selectedNotes];
    updatedSelectedNotes[index] = !updatedSelectedNotes[index];
    setSelectedNotes(updatedSelectedNotes);
  
    // selectedNotes가 빈 배열이 아닌지 확인하고, 모든 체크박스가 선택된 경우에만 전체 선택을 true로 설정
    if (updatedSelectedNotes.length === quizData.length && updatedSelectedNotes.every((selected) => selected)) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  };

  const correctAnswersCount = quizData.reduce((cnt, item, index) => {
    const userAnswer = userAnswers[index]?.[0]; // 유저가 선택한 답안
    const correctAnswerKey = Object.keys(item.answer)[0]; // 정답을 찾는 방식 수정
    if (correctAnswerKey && userAnswer === parseInt(correctAnswerKey)) {
      cnt++; // 유저가 맞춘 경우 카운트 증가
    }
    return cnt;
  }, 0);

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((timeInSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timeInSeconds % 60).toString().padStart(2, "0");
    return { hours, minutes, seconds };
  };
  
  const formattedElapsedTime = formatTime(
    (elapsedTime?.hours || 0) * 3600 +
    (elapsedTime?.minutes || 0) * 60 +
    (elapsedTime?.seconds || 0)
  );

  return (
    <div className="w-screen h-screen flex flex-col bg-white">
      <div className="flex justify-center my-5 text-gray-400 font-bold text-xl">
        {quizTitle}
      </div>
      <div className="flex justify-center">
        <div className="flex items-center justify-end mb-2 w-3/4">
          <div className="text-sm text-gray-400 mr-2">
            전체선택
          </div>
          <input 
            type="checkbox" 
            className="form-checkbox h-4 w-4 text-blue-600 border-gray-200" 
            checked={selectAll}
            onChange={handleSelectAll}
        />
        </div>
      </div>
      <div className="flex justify-center h-full">
        <div className="w-3/4 flex flex-col">
          <div className="h-3/4 border-y-2 border-gray-300 overflow-y-auto">
            {quizData.map((data, index) => {
              const userAnswer = userAnswers[index]?.[0]; // 유저의 답안 가져오기
              const correctAnswerKey = Object.keys(data.answer)[0]; // 정답의 번호
              const isCorrect = userAnswer === parseInt(correctAnswerKey); // 유저의 답과 정답 비교
              return (
                <div key={index}>
                  <div className="flex items-stretch min-h-10 bg-gray-50 border-t-2 border-b-2 border-gray-300">
                    <div
                        className={`flex items-center justify-center min-w-[10vw] border-r-2 border-b-1 border-gray-300 font-bold text-gray-100 p-2 sm:min-w-[3vw]
                        ${isCorrect ? "bg-green-400" : "bg-red-400"}`}
                    >
                        {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-grow font-bold p-2 sm:ml-4">
                        {data.question}
                    </div>
                  </div>
                  <div className="ml-2 mt-2 font-bold flex flex-col sm:flex-row sm:justify-between">
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
                    <div className="text-xs text-orange-400 mr-6 mt-3 sm:my-2">
                      난이도 : {data.difficulty}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex justify-start ml-2 mt-2 font-bold text-green-600">
                      정답 : {correctAnswerKey}
                    </div>
                    <div className="flex items-center justify-end pr-4">
                        <div className="text-sm text-gray-400 mr-2">
                          오답노트
                        </div>
                        <input 
                          type="checkbox" 
                          className="form-checkbox h-4 w-4 text-blue-600 border-gray-200 sm:mr-2" 
                          checked={selectedNotes[index]}
                          onChange={() => handleNoteSelect(index)}
                      />
                    </div>
                  </div>
                  <div className="border border-yellow-200 rounded py-1 sm:py-2 bg-yellow-50 mt-2 mb-4">
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
              시간 : {formattedElapsedTime.hours}:{formattedElapsedTime.minutes}:{formattedElapsedTime.seconds}
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <button
              className="bg-blue-600 text-white text-m font-bold rounded-full py-2 px-6"
              onClick={handleSaveClick}
            >
              Save
            </button>
            <button
              className="bg-gray-100 border-2 border-blue-600 text-blue-600 text-m font-bold rounded-full py-2 px-7 sm:mr-2"
              onClick={handleExitClick}
            >
              Exit
            </button>
          </div>
          {isExitModalOpen && <AnswerExit onClose={closeExitModal} />}
          {isSaveModalOpen && <AnswerSave onClose={closeSaveModal} />}
        </div>
      </div>
    </div>
  );
}
