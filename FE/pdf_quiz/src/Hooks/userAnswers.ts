import { useState, useEffect } from 'react';

const UserAnswers = (problems:number) => {
    //
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(problems).fill(0));
    
    const handleOptionClick = (problemIndex: number, optionIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[problemIndex] = optionIndex;
        setSelectedAnswers(newAnswers);
    }

    useEffect(() => {
        const answersObject = selectedAnswers.reduce((acc, answer, index) => {
            if (index !== 0 && answer !== 0) {
                acc[index] = answer;
            }
            return acc;
        }, {} as { [key: number]: number });
        console.log(answersObject);

    },[selectedAnswers])

    return (
        {selectedAnswers: selectedAnswers.slice(1),
        handleOptionClick}
    )
}
export default UserAnswers;