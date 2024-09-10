import { useQuizContext } from "../context/QuizContext";

interface OMRProps {
  quizCount: number;
  optionCount: number;
  // answerList: number[][]; // props로 받아옴
  handleOptionClick: (problemIndex: number, optionIndex: number) => void; // props로 받아옴
}

const OMR = ({ quizCount, optionCount, handleOptionClick }: OMRProps) => {
  const choiceSymbols = ["①", "②", "③", "④", "⑤"];

  const { userAnswers = [] } = useQuizContext();

  //선택된 옵션에 대해서는 색을 칠한다.

  const OMRRendering = () => {
    return Array.from({ length: quizCount }).map((_, problemIndex) => (
      <div key={problemIndex} className="flex items-center mb-2">
        <div className="w-12 max-lg:w-8 text-center flex-shrink-0">
          <span className="text-lg max-lg:text-sm ml-2 ">
            Q{problemIndex + 1}
          </span>
        </div>
        <div className="flex flex-row items-center justify-center ml-2 ">
          {Array.from({ length: optionCount }).map((_, optionIndex) => (
            <button
              className={`w-10 h-10 mr-1/2 border-0 flex items-center justify-center rounded-full cursor-pointer max-lg:w-7 max-lg:h-8 ${
                userAnswers[problemIndex]?.length > 0 &&
                userAnswers[problemIndex].includes(optionIndex + 1)
                  ? "bg-green-400"
                  : "bg-white"
              }`}
              key={optionIndex}
              onClick={() => handleOptionClick(problemIndex, optionIndex + 1)}
            >
              <span style={{ fontSize: "25px" }}>
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
