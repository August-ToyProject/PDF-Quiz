// import { useState} from 'react';
// import AnswerExit from '../Modal/answerExit'; 
// import AnswerSave from '../Modal/answerSave'; 

// export default function Answer() {

//     // 임시 데이터
//     const data = `
//         난이도: 보통  
//         문제: "Another Point of View"에서 강조하는 주요 주제는 무엇인가요?  
//         1) 기술의 발전  
//         2) 다양한 관점의 이해  
//         3) 인터넷의 역사  
//         4) 사이버 범죄  
//         5) 데이터 보호  
//         6) 스마트 기기의 사용  
//         정답: 2  
//         설명: 요약에서 언급된 대로, "Another Point of View"는 다양한 관점을 이해하는 것이 공감과 비판적 사고를 촉진하는 데 중요하다고 강조합니다.  

//         ---
        
//         난이도: 보통  
//         문제: 인터넷의 구조에 대한 설명으로 옳은 것은 무엇인가요?  
//         1) 인터넷은 단일 네트워크로 구성되어 있다.  
//         2) 인터넷은 상호 연결된 네트워크와 데이터 센터로 구성되어 있다.  
//         3) 인터넷은 오직 유선 통신만을 사용한다.  
//         4) 인터넷은 개인 기기만 연결된다.  
//         5) 인터넷은 주로 소셜 네트워크로만 구성된다.  
//         6) 인터넷은 전통 미디어와만 연결된다.  
//         정답: 2  
//         설명: 요약에서 설명된 바와 같이, 인터넷은 상호 연결된 네트워크와 데이터 센터로 구성되어 있어 다양한 기기와 서비스를 지원합니다.  

//         ---
        
//         난이도: 보통  
//         문제: 다음 중 "Another Point of View"에서 다루는 사례 연구의 목적은 무엇인가요?  
//         1) 기술의 발전을 보여주기 위해  
//         2) 다양한 관점을 통해 공감을 증진하기 위해  
//         3) 사이버 공격의 사례를 분석하기 위해  
//         4) 스마트 기기의 사용을 촉진하기 위해  
//         5) 데이터 보호 방법을 제시하기 위해  
//         6) 인터넷의 역사적 변화를 설명하기 위해  
//         정답: 2  
//         설명: 요약에서 언급된 대로, 사례 연구는 다양한 관점을 이해하고 공감을 증진하기 위해 사용됩니다.
//     `;

//     const [isExitModalOpen, setIsExitModalOpen] = useState(false);
//     const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

//     const handleExitClick = () => {
//         setIsExitModalOpen(true);
//     };

//     const handleSaveClick = () => {
//         setIsSaveModalOpen(true);
//     };

//     const closeExitModal = () => {
//         setIsExitModalOpen(false);
//     };

//     const closeSaveModal = () => {
//         setIsSaveModalOpen(false);
//     };

//     // 임시 title 데이터
//     const quizTitle = ["2024년 정처기 필기 요약본"];
//     // 임시 user_answer 데이터 
//     const userAnswerData = ["2", "4", "2"];

//     // 임시 updated_at 데이터 
//     const updatedAt = new Date();

//     // 시간과 분만 표시
//     const formattedTime = updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

//     const quizData = (dataString: string) => {
//         const quizBlocks = dataString.trim().split('---').map(block => block.trim());
//         return quizBlocks.map((quizBlock, index)=> {
//             const lines = quizBlock.split('\n').filter(line => line.trim() !== ''); 
//             const level = lines[0].split(': ')[1].trim();
//             const quiz = lines[1].split(': ')[1].trim();
//             const number = lines.slice(2, lines.length-2).map(option => option.trim());
//             const answer = lines[lines.length-2].split(': ')[1].trim();
//             const explanation = lines[lines.length-1].split(': ')[1].trim();
//             const user_answer = userAnswerData[index]; 

//             return {level, quiz, number, answer, explanation, user_answer}
//         })
//     }

//     const parseData = quizData(data)

//     const correctAnswers = parseData.filter(item => item.user_answer === item.answer).length;
//     const totalQuestions = parseData.length;

//     return (
//         <div className='w-screen h-screen flex flex-col bg-white'>
//             <div className='flex justify-center my-5 text-gray-400 font-bold text-xl'>
//                 {quizTitle}
//             </div>
//             <div className='flex justify-center h-full'>
//                 <div className='w-3/4 flex flex-col'>

//                     <div className='h-3/4 border-t-2 border-b-2 border-gray-300 overflow-y-auto'>
//                         {parseData.map((parseData, index) => (
//                             <div key={index}>
//                                 <div className='flex items-center h-10 bg-gray-50 border-t-2 border-b-2 border-gray-300'>
//                                     <div className={`flex items-center justify-center flex-grow-0 min-w-[5vw] h-full border-r-2 border-b-1 border-gray-300 font-bold text-gray-100
//                                         ${parseData.user_answer === parseData.answer ? 'bg-green-400' : 'bg-red-400'}`}>
//                                         문제 {index+1}
//                                     </div>
//                                     <div className='flex-grow ml-4 font-bold'>
//                                         {parseData.quiz}
//                                     </div>
//                                 </div>
//                                 <div className='ml-2 mt-2 font-bold flex justify-between'>
//                                     <div className='flex flex-col'>
//                                         {parseData.number.map((option, index) => (
//                                             <div key={index} className={`mt-2 ${parseData.user_answer === option.split(') ')[0] ? parseData.user_answer === parseData.answer 
//                                             ? 'text-green-600' : 'text-red-600': ''}`}>
//                                                 {option}
//                                             </div>
//                                         ))}
//                                     </div>
//                                     <div className='text-xs text-orange-400 mr-4 my-2'>
//                                         난이도 : {parseData.level}
//                                     </div>
//                                 </div>
//                                 <div className='flex justify-between'>
//                                     <div className='flex justify-start ml-2 mt-2 font-bold text-green-600'>
//                                         정답 : {parseData.answer}
//                                     </div>
//                                     {parseData.user_answer !== parseData.answer && (
//                                         <button className='bg-red-400 rounded-full text-white text-xs mr-2 font-bold p-2'>
//                                             오답노트 저장
//                                         </button>
//                                     )}
//                                 </div>
//                                 <div className='border border-yellow-200 rounded h-[8vh] bg-yellow-50 mt-2 mb-4'>
//                                     <div className='m-2 text-xs font-bold'>
//                                         설명 : {parseData.explanation}
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
                        
//                     </div>
//                     <div className='h-12 border-b-2 border-gray-300 flex justify-between items-center'>
//                         <div className='ml-4 font-bold'>
//                             정답 : {correctAnswers} / {totalQuestions}
//                         </div>
//                         <div className='mr-4 font-bold'>
//                             시간 : {formattedTime}
//                         </div>
//                     </div>
//                     <div className='flex justify-end mt-4'>
//                         <button className='bg-gray-100 border-2 border-blue-600 text-blue-600 text-m font-bold rounded-full py-2 px-7 mr-2' onClick={handleExitClick}>
//                             Exit
//                         </button>
//                         <button className='bg-blue-600 text-white text-m font-bold rounded-full py-2 px-6' onClick={handleSaveClick}>
//                             Save
//                         </button>
//                     </div>
//                     {isExitModalOpen && <AnswerExit onClose={closeExitModal} />}
//                     {isSaveModalOpen && <AnswerSave onClose={closeSaveModal} />}
//                 </div>
//             </div>          
//         </div>
//     )
// }
