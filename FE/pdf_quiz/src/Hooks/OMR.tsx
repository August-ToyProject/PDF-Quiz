import { useEffect, useState } from "react";


const OMR = () => {
    //OMR logic
    //사용자가 원하는 문제 수 (서버에서 받아올 값이 없어 초기값 5로 설정)
    const [problems, setProblems] = useState<number>(10);
    //사용자가 원하는 옵션 수 (서버에서 받아올 값이 없어 초기값 4로 설정)
    const [options, setOptions] = useState<number>(4);

    const choiceSymbols = ['①', '②', '③', '④', '⑤'];

    //Todo: DB에서 사용자가 설정한 문제 수와 옵션 수를 가져온다.

    useEffect(() => {
        const fetchQuizSettings = async () => {
            const fetchedProblems = 5;
            const fetchedOptions = 4;

            setProblems(fetchedProblems);
            setOptions(fetchedOptions);

        }})

    const OMRRendering = () => {

        return Array.from({ length: problems }).map((_, problemIndex) => (
            <div key={problemIndex} style={{ marginBottom: '10px' }}>
              <div style={{width: '3rem', display:'inline-block'}}>
                <span style={{ marginRight: '10px', marginLeft:'10px' }}>Q{problemIndex + 1}</span>
              </div>
              {Array.from({ length: options }).map((_, optionIndex) => (
                <span key={optionIndex} style={{ marginRight: '10px' }}>
                  {choiceSymbols[optionIndex] || `(${optionIndex + 1})`}
                </span>
              ))}
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