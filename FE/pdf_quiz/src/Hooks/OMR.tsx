import { useState } from "react";
import UserAnswers from "./userAnswers";

interface OMRProps {
  quizCount: number;
  optionCount: number;
}

const OMR = ({ quizCount, optionCount }: OMRProps) => {
  //OMR logic
  //사용자가 원하는 문제 수 (서버에서 받아올 값이 없어 초기값 5로 설정)
  const [problems, setProblems] = useState<number>(30);
  //사용자가 원하는 옵션 수 (서버에서 받아올 값이 없어 초기값 4로 설정)
  const [options, setOptions] = useState<number>(5);

  const choiceSymbols = ["①", "②", "③", "④", "⑤"];

  //선택된 옵션에 대해서는 색을 칠한다.
  const { selectedAnswers, handleOptionClick } = UserAnswers(quizCount);

  const OMRRendering = () => {
    return Array.from({ length: quizCount }).map((_, problemIndex) => (
      <div key={problemIndex} className="flex items-center mb-2">
        <div className="w-12 max-lg:w-8 text-center flex-shrink-0">
          <span className="text-lg max-lg:text-sm ">Q{problemIndex + 1}</span>
        </div>
        <div className="flex flex-row items-center justify-center">
          {Array.from({ length: optionCount }).map((_, optionIndex) => (
            <button
              className={`w-10 h-10 mr-1/2 border-0 flex items-center justify-center rounded-full cursor-pointer max-lg:w-7 max-lg:h-8 ${
                selectedAnswers[problemIndex] === optionIndex + 1
                  ? "bg-green-400"
                  : "bg-white"
              }`}
              key={optionIndex}
              onClick={() =>
                handleOptionClick(problemIndex + 1, optionIndex + 1)
              }
            >
              <span className="text-m">
                {choiceSymbols[optionIndex] || `(${optionIndex + 1})`}
              </span>
            </button>
          ))}
        </div>
      </div>
    ));
  };

  return <div className="max-lg:w-[25%] max-lg:text-sm">{OMRRendering()}</div>;
};
export default OMR;
