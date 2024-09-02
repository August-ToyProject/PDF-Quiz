// import { useState, useEffect } from 'react';
// import Upload from '../Modal/Upload';
// import { useNavigate } from 'react-router-dom';
// import FolderList from '../components/folderList';

// interface ListQuiz {
//     id: number;
//     title: string;
//     date: string;
//     folderId: number | null;
// }

// interface User {
//     nickname : string;
// }

// const months = [
//     { name: 'Jan', days: 31 },
//     { name: 'Feb', days: 28 },
//     { name: 'Mar', days: 31 },
//     { name: 'Apr', days: 30 },
//     { name: 'May', days: 31 },
//     { name: 'Jun', days: 30 },
//     { name: 'Jul', days: 31 },
//     { name: 'Aug', days: 31 },
//     { name: 'Sep', days: 30 },
//     { name: 'Oct', days: 31 },
//     { name: 'Nov', days: 30 },
//     { name: 'Dec', days: 31 },
// ];

// export default function MyPage() {
//     const [showModal, setShowModal] = useState(false); 
//     const [quiz, setQuiz] = useState<ListQuiz[]>([]);
//     const [searchTerm, setSearchTerm] = useState(''); 
//     const [selectedMonth, setSelectedMonth] = useState<number | null>(null);  
//     const [folders, setFolders] = useState<{id:number; name:string; isEditing:boolean}[]>([]);
//     const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
//     const [showFolderModal, setShowFolderModal] = useState(false);
//     const [user, setUser] = useState<User | null>(null);
//     const openModal = () => setShowModal(true);
//     const closeModal = () => setShowModal(false);

//     const navigate = useNavigate();
//     const ngrokUrl = "https://";

//     // useEffect(() => {
//     //     const fetchData = async() => {
//     //         try{
//     //             // 유저 정보
//     //             const userInfoResponse = await fetch(`${ngrokUrl}/api`, {
//     //                 method: 'GET',
//     //                 credentials: 'include',
//     //             });
//     //             const userInfo = await userInfoResponse.json();
//     //             setUser(userInfo);

//     //             // 퀴즈 데이터
//     //             const quizResponse = await fetch(`${ngrokUrl}/api`, {
//     //                 method: 'GET',
//     //                 credentials: 'include',
//     //             });
//     //             const quizData: ListQuiz[] = await quizResponse.json();
//     //             setQuiz(quizData);
//     //             // 폴더 데이터
//     //             // const folderResponse = await fetch(`${ngrokUrl}/api`,{
//     //             //     method: 'GET',
//     //             //     credentials: 'include',
//     //             // });
//     //             // const folderData = await folderResponse.json();
//     //             // setFolders(folderData);

//     //         }catch(error){
//     //             console.log("데이터를 가져오는데 실패했습니다.", error);
//     //         };
//     //     }
//     //     fetchData();
//     // }, []);

//     // 리스트 하드코딩
//     useEffect(() => {
//         const fetchData = async () => {
//             const data : ListQuiz[] = [
//                 { id: 1, title: 'PDF퀴즈 제목 1', date: '2023-08-01', folderId: null },
//                 { id: 2, title: 'PDF퀴즈 제목 2', date: '2023-08-02', folderId: null },
//                 { id: 3, title: 'PDF퀴즈 제목 3', date: '2023-08-03', folderId: null },
//                 { id: 4, title: 'PDF퀴즈 제목 4', date: '2023-08-04', folderId: null },
//                 { id: 5, title: 'PDF퀴즈 제목 5', date: '2023-08-05', folderId: null },
//                 { id: 6, title: 'PDF퀴즈 제목 6', date: '2023-08-06', folderId: null },
//                 { id: 7, title: 'PDF퀴즈 제목 7', date: '2023-08-07', folderId: null },
//                 { id: 8, title: 'PDF퀴즈 제목 8', date: '2023-08-08', folderId: null },
//                 { id: 9, title: 'PDF퀴즈 제목 9', date: '2023-08-09', folderId: null },
//                 { id: 10, title: 'PDF퀴즈 제목 10', date: '2023-08-10', folderId: null },
//                 { id: 11, title: 'PDF퀴즈 제목 11', date: '2023-08-11', folderId: null },
//             ];
//             setQuiz(data);
//         };

//         fetchData();
//     }, []);

//     // 로그아웃
//     const handleLogout = async () => {
//         try {
//             const response = await fetch(`${ngrokUrl}/api`, {
//                 method: 'POST',
//                 credentials: 'include',
//             });
//             if(response.ok){
//                 localStorage.removeItem('token');
//                 navigate('/');
//             }
//         }catch(error){
//             console.log('로그아웃 중 오류가 발생했습니다.', error);
//         }
//     }  

//     // 캘린더
//     const createCalendarSquares = (days: number) => {
//         const squares = [];
//         for (let i = 1; i <= days; i++) {
//             squares.push(
//                 <div key={i} className="w-7 h-7 m-1 bg-white border border-gray-400 rounded-lg flex items-center justify-center text-gray-300">
//                     {i}
//                 </div>
//             );
//         }
//         return squares;
//     };

//     return (
//         <div className="h-screen w-screen flex flex-col items-center bg-white overflow-x-hidden min-w-[600px]">
//             <div className="w-full ">
//                 <div className="text-blue-600 text-xl mt-4 mx-4 font-bold">
//                     PDF Quiz
//                 </div>
//                 <div className="h-[2px] bg-gray-300 mt-1 mx-4"></div>
//             </div>
            
//             <div className="flex flex-col lg:flex-row w-full mt-10 mx-4 lg:space-x-6 space-y-6 lg:space-y-0">
//                 {/* 좌측 옵션 */}
//                 <div className="hidden lg:flex flex-col flex-none w-56 ml-6">
//                     <div className="text-blue-600 text-xs font-black">마이프로필</div>
//                     <div className="mt-2 p-4 border border-gray-300 rounded-lg h-24">
//                         <div className='text-center'>{user?.nickname || '닉네임'}</div>
//                         <div className="flex justify-center space-x-4 mt-4">
//                             <button className="px-2 py-1 bg-gray-50 border border-gray-300 text-xs text-gray-500 rounded-lg">내 정보</button>
//                             <button 
//                                 className="px-2 py-1 bg-gray-50 border border-gray-300 text-xs text-gray-500 rounded-lg"
//                                 onClick={handleLogout}>
//                                 로그아웃
//                             </button>
//                         </div>
//                     </div>
//                     <button className='bg-blue-600 mt-4 text-white font-bold p-2 rounded-lg' onClick={openModal}>PDF Upload</button>
//                     <div className="mt-4 p-4 flex justify-center text-xs border border-gray-300 rounded-lg h-full bg-white">오 답 노 트</div>
//                 </div>
//                 {/* 퀴즈 리스트 */}
//                 <div className="flex-grow h-full max-w-xl w-full lg:max-w-2xl mx-auto min-w-[300px]">
//                     <div className="text-blue-600 text-xs mb-2 font-black">퀴즈 리스트</div>
//                     <FolderList 
//                         folders={folders}
//                         setFolders={setFolders}
//                         quiz={quiz} // 전달된 퀴즈 데이터
//                         setQuiz={setQuiz} // 퀴즈 업데이트 함수
//                         selectedFolderId={selectedFolderId}
//                         setSelectedFolderId={setSelectedFolderId}
//                         searchTerm={searchTerm}
//                         setSearchTerm={setSearchTerm}
//                     />                 
//                 </div>                
//                 {/* 캘린더 */}
//                 <div className="flex-grow max-w-2xl lg:flex-none lg:w-98 overflow-hidden mx-auto">
//                     <div className="text-blue-600 text-xs mb-2 font-black">캘린더</div>
//                     <div className="bg-blue-600 rounded-lg p-2 border border-gray-300 w-full mb-28" style={{ height: '12rem' }}>
//                         <div className="flex justify-between mb-2">
//                             {months.map((month, index) => (
//                                 <button
//                                     key={index}
//                                     className={`px-1 py-1 text-xs rounded font-bold ${selectedMonth === index ? 'bg-white text-blue-600 rounded-lg' : 'bg-transparent text-white'}`}
//                                     onClick={() => setSelectedMonth(index)}
//                                 >
//                                     {month.name}
//                                 </button>
//                             ))}
//                         </div>
//                         <div className="grid grid-cols-8 mb-2 ml-3 justify-center">
//                             {selectedMonth !== null && createCalendarSquares(months[selectedMonth].days)}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <Upload showModal={showModal} closeModal={closeModal} />
//         </div>
//     )
// }