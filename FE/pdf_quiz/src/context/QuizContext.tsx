// src/context/QuizContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface ElapsedTime {
  hours: number;
  minutes: number;
  seconds: number;
}

interface QuizItem {
  quizId: string;
  difficulty: string;
  question: string;
  options: { [key: string]: string };
  answer: { [key: string]: string };
  description: string;
  user_answer?: string;
}

interface QuizContextType {
  title: string;
  difficulty: string;
  quizCount: number;
  optionCount: number;
  timeLimitHour: number;
  timeLimitMinute: number;
  userAnswers: number[][];
  quizData: QuizItem[];
  elapsedTime: ElapsedTime | null;
  setTime: number;
  isQuizDataComplete: boolean;
  isTimerStarted: boolean;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setUserAnswers: React.Dispatch<React.SetStateAction<number[][]>>;
  setQuizData: React.Dispatch<React.SetStateAction<QuizItem[]>>;
  setElapsedTime: React.Dispatch<React.SetStateAction<ElapsedTime | null>>;
  setDifficulty: React.Dispatch<React.SetStateAction<string>>;
  setQuizCount: React.Dispatch<React.SetStateAction<number>>;
  setOptionCount: React.Dispatch<React.SetStateAction<number>>;
  setTimeLimitHour: React.Dispatch<React.SetStateAction<number>>;
  setTimeLimitMinute: React.Dispatch<React.SetStateAction<number>>;
  setIsQuizDataComplete: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTimerStarted: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ElapsedTime {
  hours: number;
  minutes: number;
  seconds: number;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [title, setTitle] = useState<string>("퀴즈 제목");
  const [difficulty, setDifficulty] = useState<string>("쉬움");
  const [quizCount, setQuizCount] = useState<number>(10);
  const [optionCount, setOptionCount] = useState<number>(5);
  const [timeLimitHour, setTimeLimitHour] = useState<number>(1);
  const [timeLimitMinute, setTimeLimitMinute] = useState<number>(0);
  const [quizData, setQuizData] = useState<QuizItem[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[][]>([]);
  const [isQuizDataComplete, setIsQuizDataComplete] = useState(false);
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState<ElapsedTime | null>(null);
  const [setTime] = useState<number>(3600);

  return (
    <QuizContext.Provider
      value={{
        title,
        setTitle,
        difficulty,
        setDifficulty,
        quizCount,
        setQuizCount,
        optionCount,
        setOptionCount,
        timeLimitHour,
        setTimeLimitHour,
        timeLimitMinute,
        setTimeLimitMinute,
        quizData,
        setQuizData,
        userAnswers,
        setUserAnswers,
        elapsedTime,
        setElapsedTime,
        setTime,
        isQuizDataComplete,
        setIsQuizDataComplete,
        isTimerStarted,
        setIsTimerStarted,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuizContext must be used within a QuizProvider");
  }
  return context;
};
