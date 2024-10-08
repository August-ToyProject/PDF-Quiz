import { useQuizContext } from "../context/QuizContext";
import { useState, useEffect } from "react";

const UserAnswers = () => {
  const { quizCount, setUserAnswers } = useQuizContext();

  const [answerList, setAnswerList] = useState<number[][]>(
    new Array(quizCount).fill([]).map(() => [])
  );

  const handleOptionClick = (problemIndex: number, optionIndex: number) => {
    setAnswerList((prevAnswerList) => {
      const newAnswerList = [...prevAnswerList];
      if (!newAnswerList[problemIndex]) {
        newAnswerList[problemIndex] = [];
      }

      //답안이 없는 경우 답안 배열에 추가
      if (!newAnswerList[problemIndex].includes(optionIndex)) {
        newAnswerList[problemIndex] = [0];
      }
      //이미 답안이 있는 경우 새로운 답안으로 교체
      if (newAnswerList[problemIndex].length > 0) {
        newAnswerList[problemIndex] = [optionIndex];
      }
      return newAnswerList;
    });
  };

  useEffect(() => {
    setUserAnswers(answerList);
  }, [answerList, setUserAnswers]);

  const uncompletedCount = answerList.filter(
    (answers) => answers && answers.length === 0
  ).length;

  return { handleOptionClick, uncompletedCount };
};
export default UserAnswers;
