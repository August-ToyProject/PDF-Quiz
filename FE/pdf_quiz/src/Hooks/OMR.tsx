import { useEffect, useState } from "react";
import UserAnswers from "./userAnswers";


const OMR = () => {
    //OMR logic
    //사용자가 원하는 문제 수 (서버에서 받아올 값이 없어 초기값 5로 설정)
    const [problems, setProblems] = useState<number>(10);
    //사용자가 원하는 옵션 수 (서버에서 받아올 값이 없어 초기값 4로 설정)
    const [options, setOptions] = useState<number>(4);

    const choiceSymbols = ['①', '②', '③', '④', '⑤'];



    //선택된 옵션에 대해서는 색을 칠한다.
    const {selectedAnswers, handleOptionClick} = UserAnswers(problems)

    //Todo: DB에서 사용자가 설정한 문제 수와 옵션 수를 가져온다.

    useEffect(() => {
        // 이 부분은 실제 DB와 연결 시 사용할 부분
        // const fetchQuizSettings = async () => {
        //     const fetchedProblems = 5;
        //     const fetchedOptions = 4;
        //     setProblems(fetchedProblems);
        //     setOptions(fetchedOptions);

        // } fetchQuizSettings();
      },[])

    const OMRRendering = () => {

        return Array.from({ length: problems }).map((_, problemIndex) => (
            <div key={problemIndex} className="flex items-center mb-2">
              <div className="w-12 text-center">
                <span className="text-lg">Q{problemIndex + 1}</span>
              </div>
              <div className="flex flex-row">
                {Array.from({ length: options }).map((_, optionIndex) => (
                    <button className={`w-10 h-10 mr-1/2 border-0 flex items-center justify-center rounded-full cursor-pointer ${selectedAnswers[problemIndex] === optionIndex+1 ? 'bg-green-400' : 'bg-white'}`}
                    key={optionIndex} 
                    onClick={()=> handleOptionClick(problemIndex + 1, optionIndex + 1)}>
                      <span className="text-m">{choiceSymbols[optionIndex] || `(${optionIndex + 1})`}</span>
                    </button>

                ))}
              </div>
            </div>
          ));
        };



    return (
        <div>
            {OMRRendering()}

        </div>
    )


}
export default OMR;