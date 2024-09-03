// src/context/QuizContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface QuizContextType {
  difficulty: string;
  quizCount: number;
  optionCount: number;
  timeLimitHour: string;
  timeLimitMinute: string;
  setDifficulty: React.Dispatch<React.SetStateAction<string>>;
  setQuizCount: React.Dispatch<React.SetStateAction<number>>;
  setOptionCount: React.Dispatch<React.SetStateAction<number>>;
  setTimeLimitHour: React.Dispatch<React.SetStateAction<string>>;
  setTimeLimitMinute: React.Dispatch<React.SetStateAction<string>>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [difficulty, setDifficulty] = useState<string>("쉬움");
  const [quizCount, setQuizCount] = useState<number>(5);
  const [optionCount, setOptionCount] = useState<number>(4);
  const [timeLimitHour, setTimeLimitHour] = useState<string>("0");
  const [timeLimitMinute, setTimeLimitMinute] = useState<string>("0");

  return (
    <QuizContext.Provider
      value={{
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
